### Features
- **In-App Feedback**: Added a built-in feedback form allowing users to send feedback, bug reports, and daily logs directly to the development team.
- **Community Contributions**: GitHub issues are now better maintained on the repository. If you want to contribute to the project, feel free to drop by and check out the `good first issue` tags!

### Improvements
- **Bundle Size**: Optimized assets and dependencies, reducing the overall application bundle size by approximately 50% on specific version.
- **Updater UI**: Reworked the update notification for better clarity. Windows and AppImage users can download updates seamlessly in-app, while unsupported Linux package users are gracefully redirected to the manual download page. Flatpak (.rpm) and Snap (.snap) users are not informed, because that updates are handled by their respective package managers.
- **Toast Notifications**: Refactored the style and overall UX of toast alerts.
- **Code Quality**: Implemented a linter to enforce coding standards.

### Bug Fixes
- **Auto-Updater**: Fixed a major issue causing 404 Not Found errors when attempting to download updates for `.AppImage` releases.
- **Linux Updates**: Fixed update crashes on `.rpm` and `.snap` packages. In-app update flows are now disabled for these formats to let the OS natively handle the process.
- **Windows Logs**: Fixed a file naming issue with the log transport system on Windows.
- **Desktop Entry Name**: Fixed the desktop entry name for Linux users, ensuring it displays correctly in application menus.

### Chores
- **Dependencies**: Removed `dotenv` from the project.
- **URL**: A new URL for the website is now available ! [freedomloader.acnolo.fr](https://freedomloader.acnolo.fr)
- **Dev**: Add new npm script. To check linux file quality
    