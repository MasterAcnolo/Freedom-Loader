#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
RPM_OUT="$ROOT_DIR/dist/freedom-loader-${VERSION}.x86_64.rpm"

# Check that linux-unpacked exists
if [ ! -d "$ROOT_DIR/dist/linux-unpacked" ]; then
    echo "Error: dist/linux-unpacked not found. Run 'npm run build:linux' first."
    exit 1
fi

# Step 1 — Build .rpm from linux-unpacked via fpm
echo "Building RPM..."
fpm -s dir -t rpm --force \
    --name freedom-loader \
    --version "$VERSION" \
    --architecture x86_64 \
    --description "Free and open-source GUI for yt-dlp" \
    --url "https://masteracnolo.github.io/Freedom-Loader-Site/" \
    --maintainer "MasterAcnolo <MasterAcnolo@users.noreply.github.com>" \
    --license "GPL-3.0-only" \
    --depends gtk3 \
    --depends nss \
    --depends libXScrnSaver \
    --depends at-spi2-core \
    --package "$RPM_OUT" \
    "$ROOT_DIR/dist/linux-unpacked/=/opt/freedom-loader" \
    "$ROOT_DIR/build/app-icon.png=/usr/share/icons/hicolor/512x512/apps/freedom-loader.png" \
    "$ROOT_DIR/package/com.masteracnolo.freedomloader.metainfo.xml=/usr/share/metainfo/com.masteracnolo.freedomloader.metainfo.xml"

echo "RPM built: $RPM_OUT"

# Step 2 — Build SRPM for COPR (wraps the .rpm above)
echo "Building SRPM for COPR..."
mkdir -p "$ROOT_DIR/srpm-out"

TMP_DIR="$ROOT_DIR/.copr-build-tmp"
mkdir -p "$TMP_DIR"
TMP_SPEC="$TMP_DIR/freedom-loader.spec"
sed "s/__VERSION__/$VERSION/g" "$ROOT_DIR/package/freedom-loader.spec" > "$TMP_SPEC"

rpmbuild -bs "$TMP_SPEC" \
    --define "_sourcedir $ROOT_DIR/dist" \
    --define "_srcrpmdir $ROOT_DIR/srpm-out"

rm -rf "$TMP_DIR"
echo "SRPM built: $ROOT_DIR/srpm-out/freedom-loader-$VERSION-1*.src.rpm"