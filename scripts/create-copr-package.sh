#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
RPM_OUT="$ROOT_DIR/dist/freedom-loader-${VERSION}.x86_64.rpm"

# ------------------------------------------------------------
# Resolve fpm from electron-builder cache
# Excludes Ruby gem wrappers, targets standalone binaries only
# Prefers fpm@2.x over legacy fpm-1.9.x
# ------------------------------------------------------------
FPM=$(find ~/.cache/electron-builder -name "fpm" -type f 2>/dev/null \
    | grep -v "/gems/bin/fpm" \
    | grep -v "/gems/gems/" \
    | grep -v "/lib/app/bin/fpm" \
    | grep "fpm@" \
    | head -1)

# Fallback to legacy fpm-1.9.x if fpm@2.x not found
if [ -z "$FPM" ]; then
    FPM=$(find ~/.cache/electron-builder -name "fpm" -type f 2>/dev/null \
        | grep -v "/gems/" \
        | grep -v "/lib/app/bin/fpm" \
        | head -1)
fi

if [ -z "$FPM" ]; then
    echo "Error: fpm not found in electron-builder cache. Run 'npm run build:linux' once first to download it."
    exit 1
fi

echo "Using fpm: $FPM"

# Check that linux-unpacked exists
if [ ! -d "$ROOT_DIR/dist/linux-unpacked" ]; then
    echo "Error: dist/linux-unpacked not found. Run 'npm run build:linux' first."
    exit 1
fi

# ------------------------------------------------------------
# Prepare staging files
# fpm requires exact file-to-destination mappings to avoid
# scanning system directories (which causes permission errors)
# ------------------------------------------------------------

# Shell wrapper for /usr/bin/freedom-loader
TMP_WRAPPER="$ROOT_DIR/.rpm-pkg-tmp-wrapper"
mkdir -p "$TMP_WRAPPER"
cat > "$TMP_WRAPPER/freedom-loader" << 'EOF'
#!/bin/sh
exec /opt/freedom-loader/freedom-loader "$@"
EOF
chmod +x "$TMP_WRAPPER/freedom-loader"

# Desktop entry file
TMP_DESKTOP="$ROOT_DIR/.rpm-pkg-tmp-desktop"
mkdir -p "$TMP_DESKTOP"
cat > "$TMP_DESKTOP/freedom-loader.desktop" << 'EOF'
[Desktop Entry]
Name=Freedom Loader
Exec=/opt/freedom-loader/freedom-loader %U
Icon=freedom-loader
Type=Application
Categories=AudioVideo;Utility;Network;
Comment=Free and open-source GUI for yt-dlp
StartupWMClass=Freedom Loader
EOF

# ------------------------------------------------------------
# Step 1 - Build .rpm from linux-unpacked via fpm
# ------------------------------------------------------------
echo "Building RPM..."
"$FPM" -s dir -t rpm --force \
    --rpm-use-file-permissions \
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
    --rpm-attr "4755,root,root:/opt/freedom-loader/chrome-sandbox" \
    --package "$RPM_OUT" \
    "$ROOT_DIR/dist/linux-unpacked/=/opt/freedom-loader" \
    "$TMP_WRAPPER/freedom-loader=/usr/bin/freedom-loader" \
    "$TMP_DESKTOP/freedom-loader.desktop=/usr/share/applications/freedom-loader.desktop" \
    "$ROOT_DIR/build/app-icon.png=/usr/share/icons/hicolor/512x512/apps/freedom-loader.png" \
    "$ROOT_DIR/package/com.masteracnolo.freedomloader.metainfo.xml=/usr/share/metainfo/com.masteracnolo.freedomloader.metainfo.xml"

rm -rf "$TMP_WRAPPER" "$TMP_DESKTOP"
echo "RPM built: $RPM_OUT"

# ------------------------------------------------------------
# Step 2 - Build SRPM for COPR
# Wraps the .rpm above into a source RPM for COPR submission
# ------------------------------------------------------------
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