#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
mkdir -p "$ROOT_DIR/srpm-out"

TMP_DIR="$ROOT_DIR/.copr-build-tmp"
mkdir -p "$TMP_DIR"
TMP_SPEC="$TMP_DIR/freedom-loader.spec"
sed "s/__VERSION__/$VERSION/g" "$ROOT_DIR/package/freedom-loader.spec" > "$TMP_SPEC"

rpmbuild -bs "$TMP_SPEC" \
  --define "_sourcedir $ROOT_DIR/dist" \
  --define "_srcrpmdir $ROOT_DIR/srpm-out"

rm -rf "$TMP_DIR"
echo "SRPM généré : $ROOT_DIR/srpm-out/freedom-loader-$VERSION-1*.src.rpm"