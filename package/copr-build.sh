#!/bin/sh -xe
git clone --depth 1 https://github.com/MasterAcnolo/Freedom-Loader.git src
cd src
npm ci
npx electron-builder --linux dir

VERSION=$(node -p "require('./package.json').version")
tar czf "$resultdir/freedom-loader-$VERSION.tar.gz" -C dist linux-unpacked
sed "s/__VERSION__/$VERSION/" package/freedom-loader.spec > "$resultdir/freedom-loader.spec"