#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")

f [[ "$VERSION" == *"-preview"* ]]; then
    echo "Error: The current version ($VERSION) is a 'preview"
    echo "Unable to launch release pipeline. Please update the package.json with a stable version.."
    exit 1
fi

TAG="$VERSION"

# Parse arguments
PUBLISH_SNAP=false
PUBLISH_COPR=false
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --snap)    PUBLISH_SNAP=true ;;
        --copr)    PUBLISH_COPR=true ;;
        --publish) PUBLISH_SNAP=true; PUBLISH_COPR=true ;;
        --dry-run) DRY_RUN=true ;;
        *) echo "Unknown Argument : $arg" ; exit 1 ;;
    esac
done

echo ""
echo "============================================"
echo "  Freedom Loader - Release Pipeline"
echo "  Version  : $VERSION"
echo "  Tag      : $TAG"
echo "  Snap     : $PUBLISH_SNAP"
echo "  COPR     : $PUBLISH_COPR"
echo "  Dry run  : $DRY_RUN"
echo "============================================"
echo ""

# ------------------------------------------------------------
# Step 0.1 - Check Dependencies
# ------------------------------------------------------------
echo "[0/5] Checking dependencies..."

command -v gh >/dev/null 2>&1 || { echo "'gh' CLI missing, need to be installed (https://cli.github.com/)."; exit 1; }

if [ "$PUBLISH_SNAP" = true ] && [ "$DRY_RUN" = false ]; then
    command -v snapcraft >/dev/null 2>&1 || { echo "'snapcraft' missing, need to be installed."; exit 1; }
fi

if [ "$PUBLISH_COPR" = true ] && [ "$DRY_RUN" = false ]; then
    command -v copr-cli >/dev/null 2>&1 || { echo "'copr-cli' missing, need to be installed."; exit 1; }
fi

echo "All dependencies found"

# ------------------------------------------------------------
# Step 0.2 - Clean Workspace
# ------------------------------------------------------------
echo "[0/5] Cleaning workspace..."
# On supprime les dossiers générés lors des builds précédents
rm -rf "$ROOT_DIR/dist" "$ROOT_DIR/srpm-out"
echo "Workspace cleaned (dist/ and srpm-out/ removed)"

# ------------------------------------------------------------
# Step 1 - Build Linux packages (AppImage, deb, snap)
# ------------------------------------------------------------
echo "[1/5] Building Linux packages..."
cd "$ROOT_DIR"
npm run build:linux
echo "Linux packages built"

# ------------------------------------------------------------
# Step 2 - Build RPM binary + SRPM for COPR
# Uses the create-copr-package.sh script which handles:
# - fpm binary resolution from electron-builder cache
# - .rpm generation from linux-unpacked
# - .src.rpm generation for COPR submission
# ------------------------------------------------------------
echo "[2/5] Building RPM and SRPM..."
bash "$ROOT_DIR/scripts/create-copr-package.sh"
echo "RPM and SRPM built"

# ------------------------------------------------------------
# Step 3 - Build Windows installer
# Note: requires Windows binaries to be present locally under
# resources/binaries/win-32/ (not committed to the repo)
# ------------------------------------------------------------
echo "[3/5] Building Windows installer..."
npm run build:win
echo " Windows installer built"

# ------------------------------------------------------------
# Step 4 - Create a draft release on GitHub
# Release notes are pre-filled with the standard template.
# Edit and publish manually from the GitHub web interface.
# Requires gh CLI to be installed and authenticated.
# ------------------------------------------------------------
echo "[4/5] Creating GitHub draft release $TAG..."

# Utilise une méthode un peu plus robuste pour trouver l'ancien tag (ignore le HEAD actuel s'il est déjà tagué)
PREV_TAG=$(git rev-list --tags --skip=1 --max-count=1 | xargs git describe --tags 2>/dev/null || echo "previous")

RELEASE_NOTES="# Freedom Loader - $VERSION

## Found a bug or issue?
Please report it in the [GitHub Issues](https://github.com/MasterAcnolo/Freedom-Loader/issues) section.

## Next Release (non-exhaustive roadmap)
- More format options
- Subtitle support
- Improved UI / UX
- Language selection
- Download specific parts of videos
- File renaming options
- Parallel downloads
- Skip sponsored parts automatically

**Full Changelog**: https://github.com/MasterAcnolo/Freedom-Loader/compare/${PREV_TAG}...${TAG}"

if [ "$DRY_RUN" = false ]; then
    gh release create "$TAG" \
        --title "$TAG" \
        --notes "$RELEASE_NOTES" \
        --draft \
        "$ROOT_DIR/dist/Freedom-Loader-Setup-${VERSION}.exe" \
        "$ROOT_DIR/dist/Freedom-Loader-Setup-${VERSION}.exe.blockmap" \
        "$ROOT_DIR/dist/freedom-loader-${VERSION}.x86_64.rpm" \
        "$ROOT_DIR/dist/freedom-loader_${VERSION}_amd64.deb" \
        "$ROOT_DIR/dist/Freedom Loader-${VERSION}.AppImage" \
        "$ROOT_DIR/dist/freedom-loader_${VERSION}_amd64.snap" \
        "$ROOT_DIR/dist/latest.yml" \
        "$ROOT_DIR/dist/latest-linux.yml"
    echo "Draft release created: https://github.com/MasterAcnolo/Freedom-Loader/releases"
else
    echo "  [DRY RUN] gh release create $TAG (skipped)"
fi

# ------------------------------------------------------------
# Step 5 - Publish to package stores
# Snap and COPR are opt-in via --snap, --copr, or --publish.
# Without these flags, this step is skipped entirely.
# Run after the GitHub release is published (not the draft),
# so store users always get the same version as GitHub users.
# ------------------------------------------------------------
echo "[5/5] Publishing to package stores..."

if [ "$PUBLISH_SNAP" = true ]; then
    echo "  Publishing to Snap Store..."
    if [ "$DRY_RUN" = false ]; then
        export PATH=$PATH:/var/lib/snapd/snap/bin
        snapcraft upload \
            "$ROOT_DIR/dist/freedom-loader_${VERSION}_amd64.snap" \
            --release=stable
        echo " Snap published"
    else
        echo "  [DRY RUN] snapcraft upload (skipped)"
    fi
else
    echo "  Snap: skipped (use --snap or --publish to enable)"
fi

if [ "$PUBLISH_COPR" = true ]; then
    echo "  Publishing to COPR..."
    if [ "$DRY_RUN" = false ]; then
        copr-cli build freedom-loader \
            "$ROOT_DIR/srpm-out/freedom-loader-${VERSION}-1"*.src.rpm
        echo "COPR build triggered"
    else
        echo "  [DRY RUN] copr-cli build (skipped)"
    fi
else
    echo "  COPR: skipped (use --copr or --publish to enable)"
fi

# ------------------------------------------------------------
# Done - Summary
# ------------------------------------------------------------
echo ""
echo "============================================"
echo "  Release pipeline complete."
echo ""
echo "  Next steps:"
echo "  1. Fill in the release notes on GitHub"
echo "  2. Publish the draft release"
if [ "$PUBLISH_SNAP" = false ] || [ "$PUBLISH_COPR" = false ]; then
echo ""
echo "  Store publishing (not done yet):"
[ "$PUBLISH_SNAP" = false ] && echo "  - Snap  : bash scripts/release.sh --snap"
[ "$PUBLISH_COPR" = false ] && echo "  - COPR  : bash scripts/release.sh --copr"
fi
echo "============================================"