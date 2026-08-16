# Freedom Loader - Development Guide

Welcome to the Developer Guide! This document explains how to set up your local environment, project architecture, Git workflow, and the release process.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v22 or higher recommended)
- **npm** (comes with Node.js)
- **Git**
- **yt-dlp binaries**: Freedom Loader requires native binaries to function. Read [BINARIES.md](./BINARIES.md) for download instructions and placement in `resources/binaries/`.

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/MasterAcnolo/Freedom-Loader.git
cd Freedom-Loader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install the Binaries

Follow the instructions in `BINARIES.md` to place `yt-dlp`, `ffmpeg`, `ffprobe`, and `deno` in the correct `resources/binaries/` folder for your OS.

### 4. Run in Development Mode

```bash
npm start
```

**Note**: Development mode automatically enables detailed colored logs and the DevTron extension for debugging.

---

## Available Scripts

### Development

- `npm start` — Start the app in development mode (no warnings)
- `npm run start:warn` — Start with deprecation warnings visible
- `npm run start:debug` — Start with full debug logging (Wayland, Electron logging, stack dumps)
- `npm run dev` — Start with auto-reload on file changes (watches server/, app/, main.js, config.js)
- `npm run dev:warn` — Dev mode with warnings
- `npm run dev:debug` — Dev mode with full debug output and auto-reload

### Building

- `npm run build:linux` — Build Linux packages (AppImage, deb, snap)
- `npm run build:win` — Build Windows installer (.exe)
- `npm run build:rpm` — Build RPM and SRPM for COPR (Fedora)
- `npm run build:all` — Build both Windows and Linux (not recommended — see below)

### Testing

- `npm test` — Run all tests (unit + integration)
- `npm run test:unit` — Run unit tests only

### Release Pipeline

- `npm run release` — Build all packages and create a draft GitHub release (no store publishing)
- `npm run release:publish` — Build all packages and publish to Snap Store + COPR
- `npm run release:dry-run` — Simulate the full release pipeline without publishing anything

### Maintenance

- `npm update` — Update npm dependencies

---

## Project Architecture

Freedom Loader is built with **Electron** (frontend) and **Node.js + Express** (backend), using a modular structure:

---

## Git & Branching Workflow

I use **Trunk-Based Development** (GitHub Flow):

### Core Principles

- **`main` is always deployable**: The `main` branch contains the latest stable code and must never be broken.
- **No long-lived branches**: I no longer maintain version branches like `v1.6` or `v1.7`.
- **Pull Requests for review**: All code changes go through PR review before merging to `main`.

### How to Contribute

#### 1. Create a feature branch

```bash
git checkout -b feat/add-new-button
# or for fixes:
git checkout -b fix/ui-bug
```

**Branch naming convention**:
- `feat/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code cleanup (no behavior change)
- `docs/` — Documentation updates
- `chore/` — Dependency updates, build config, etc.

#### 2. Make commits

```bash
# Make changes
git add .
git commit -m "Brief, imperative description of the change"
```

**Commit message tips**:
- Use imperative mood: "Add theme caching" not "Added theme caching"
- Keep commits logical and focused (one feature per commit if possible)
- Link to issues if relevant: "Fix crash on download (fixes #42)"

#### 3. Push and open a PR

```bash
git push origin feat/add-new-button
```

Then open a PR on GitHub against `main`.

#### 4. Review and merge

- Address feedback in new commits (don't rebase — easier to review)
- Once approved, merge via GitHub (use "Squash and merge" for clean history if many small commits and you find it relevant)

---

## Release Process

**Note**: Only project maintainers release to production. This section documents the process for transparency and for future maintainers.

Releases are fully automated via the `release.sh` script. The process handles building, packaging, and publishing to **all distribution channels**:
- **GitHub Releases** (Windows .exe, Linux packages)
- **Fedora COPR** (automatic RPM builds for Fedora 43+)
- **Snap Store** (universal Linux)

### Before You Release

1. **Ensure `main` is green**: All tests pass, features are stable.
2. **Update `package.json` version**:

```json
   "version": "1.6.1"
```
3. **Commit the version bump**: `git add package.json && git commit -m "chore: v1.6.1"`
4. **Push to `main`**: `git push origin main`

### Step 1: Local Build & Draft Release

```bash
npm run release
```

This:
1. Builds Linux packages (AppImage, deb, snap)
2. Builds RPM and SRPM for COPR
3. Builds Windows installer
4. Creates a draft GitHub release

### Step 2: Edit & Publish on GitHub

1. Go to https://github.com/MasterAcnolo/Freedom-Loader/releases
2. Edit the draft release — fill in changelog
3. Click **"Publish"** to make it live

### Step 3: Publish to Distribution Channels

```bash
npm run release:publish
```

This automatically:
- **Uploads to Snap Store**: Makes the app available via `snap install freedom-loader`
- **Submits to Fedora COPR**: Builds and publishes RPMs for Fedora 43+ (users can `dnf install freedom-loader` from the COPR repo)

Both happen in parallel — users across all platforms get the release simultaneously.

---

## Linux Development Considerations

### Cross-Distribution Compatibility

Freedom Loader targets **Debian-based** (Ubuntu, Debian) and **Fedora-based** (Fedora, RHEL, openSUSE) distributions. When developing features, keep this in mind:

#### What to test

- **Feature works on Fedora 44+** (primary Linux development environment)
- **Feature works on Ubuntu/Debian** (via deb package or AppImage)
- **Feature doesn't break Snap confinement** (Snap has restricted filesystem/IPC access)
- **Feature gracefully degrades on missing system dependencies**

#### Desktop Environment (DE) Compatibility

Test on at least **GNOME** and **KDE** (the most common DEs). Common pain points:

- **Themes**: May render differently on KDE vs GNOME — test both if possible
- **File dialogs**: Some DEs use native file pickers, others fall back to Electron's
- **Notifications**: System notification APIs vary (D-Bus, libnotify)
- **Tray icons**: May not work identically across DEs

#### How to check locally

```bash
# Test on Fedora (if available)
npm run build:linux
sudo dnf install dist/freedom-loader-*.x86_64.rpm
freedom-loader

# Test AppImage (works on any distro)
chmod +x dist/Freedom\ Loader-*.AppImage
./dist/Freedom\ Loader-*.AppImage
```

### CI/CD Gap

**Currently**: No automated testing across distros or DEs. Releases rely on manual testing before publish.

**Future improvement**: Automated tests via GitHub Actions (Ubuntu) + local testing on Fedora would catch cross-distro issues early. This is planned but not yet implemented.

For now, if you fix a Linux-specific bug or add a DE-dependent feature, **please mention it in your PR description** so reviewers can test extra carefully.

---

## Testing

### Unit Tests

Test individual functions in isolation (no Electron required).

```bash
npm run test:unit
```

Covered:

(Tests will come soon)

### End-to-End Tests (Playwright)

Test the actual Electron app launching and basic UI interactions.

```bash
npm run test
```

Covered:

(Tests will come soon)


### Running All Tests

```bash
npm test
```

Or include tests before release:

```bash
npm test && npm run release
```

---

## Common Tasks

### Add a new feature

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes, commit: `git add . && git commit -m "feat: my feature"`
3. Push: `git push origin feat/my-feature`
4. Open a PR on GitHub
5. Once approved, merge to `main`
6. (Later) Cut a release when ready: `npm run release`

### Fix a bug

Same as above, but use `fix/bug-name` branch and `git commit -m "fix: description"`.

### Test the app before releasing

```bash
npm run dev        # Auto-reload on file changes
# Make changes, test in the UI
npm test           # Run all tests
npm run release:dry-run   # Simulate release (builds but doesn't publish)
```

### Update dependencies

```bash
npm update
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push origin main
```

### Rebuild only Linux (after quick fixes)

```bash
npm run build:linux
# Or just the RPM:
npm run build:rpm
```

### Publish to stores manually

If `npm run release:publish` fails partway:

```bash
# Just Snap:
snapcraft upload dist/freedom-loader_*.snap --release=stable

# Just COPR:
copr-cli build freedom-loader srpm-out/*.src.rpm
```

---

## Troubleshooting

### App won't start in dev mode

```bash
npm run start:debug
```

Check the debug output for errors. Most common:
- Missing binaries in `resources/binaries/`
- Port 8787 already in use
- A dead instance is still running — open Task Manager and kill the "Freedom Loader" process

### (Linux) Binaries in the right place but app still won't launch

You probably forgot to make them executable:

```bash
chmod +x resources/binaries/linux/*
```

The app will fail silently if binaries lack execute permissions.

### Build fails with "permission denied"

Make sure you have write access to `dist/` and `srpm-out/`:

```bash
chmod -R u+w dist srpm-out
npm run build:linux
```

### Tests fail

Check for:
- Missing test files in `tests/unit/`
- Node modules out of sync: `rm -rf node_modules && npm install`

### GitHub release publish fails

Verify `gh` CLI is installed and authenticated:

```bash
gh auth login
gh release list
```

---

## Questions?

For more info:
- **Electron docs**: https://www.electronjs.org/docs
- **electron-builder**: https://www.electron.build/
- **This repo**: https://github.com/MasterAcnolo/Freedom-Loader

Happy coding! 🎉