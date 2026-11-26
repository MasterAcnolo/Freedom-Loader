# Security Policy

## Supported versions

Security fixes are developed for the latest stable release. Older releases are not routinely maintained or guaranteed to receive backports. Upgrade to the latest version available from an official distribution channel.

| Version | Support |
|---|---|
| Latest stable release | Supported |
| Older releases | Not supported |

Updates are delivered according to the installation method. Packaged Windows and AppImage builds use the application updater; Snap and other Linux package installations may receive updates through their package manager.

## Reporting a vulnerability

Do not report security vulnerabilities in public issues, discussions, or pull requests. Send a private report to **master@acnolo.fr** with the subject **`[SECURITY] Vulnerability Report`**. If GitHub's private vulnerability reporting is enabled for this repository, you can use the repository's **Security → Advisories → Report a vulnerability** option instead.

Include, where possible:

- The affected Freedom Loader version, operating system, and installation method.
- A concise description of the security impact and conditions required.
- Steps to reproduce or a minimal proof of concept that does not access real user data or damage systems.
- Any relevant logs or screenshots, after removing credentials, cookies, tokens, private URLs, and other personal data.
- How you would like to be credited, or whether you prefer to remain anonymous.

Please allow the maintainers a reasonable opportunity to investigate and prepare a fix before publicly disclosing details. The project will acknowledge reports and provide updates when practical, but cannot guarantee a particular response or remediation timeline.

For non-security bugs and feature requests, use the [GitHub issue tracker](https://github.com/MasterAcnolo/Freedom-Loader/issues).

## Security and privacy notes

Freedom Loader is a desktop application that performs downloads on the user's device, but some features communicate with external services:

- **Media lookup and downloads:** yt-dlp accesses the URL supplied by the user. When Firefox cookie use is needed, yt-dlp reads cookies locally and may send the relevant authentication cookies to the media provider as part of its request. They are not sent to Freedom Loader's bug-report service by the download feature.
- **Bug reports:** The in-app report form sends the title and description to `https://freedom-loader-report.acnolo.fr`. If the user opts to include logs, the current day's log file is attached. Logs may contain URLs, local paths, or other sensitive context; review them before sharing.
- **Application updates:** Packaged builds may check GitHub release metadata and download an update when the user chooses to do so. Snap and Flatpak installations are not updated by this updater.
- **yt-dlp updates:** When enabled in settings, the app runs yt-dlp's update command at startup. This behavior can be disabled with the `autoUpdateYtDlp` setting.
- **Discord Rich Presence:** When enabled, Freedom Loader connects to the local Discord client and shares the application's configured presence, including its name/version and project status.

The local Express server binds to `127.0.0.1:8787`, not to all network interfaces. This limits direct access from other machines but does not prevent other software running on the same device from making local requests.

The Electron window disables Node.js integration and enables context isolation. Renderer features use the APIs explicitly exposed through the preload bridge.

## Third-party components

Freedom Loader depends on Electron, yt-dlp, FFmpeg, FFprobe, Deno, and npm packages. Their security and update practices are maintained by their respective projects. If a third-party issue affects Freedom Loader's use or packaging of a component, report the impact through the private channels above; reporting it upstream as well may help coordinate a fix.

Obtain Freedom Loader releases from the [official GitHub releases](https://github.com/MasterAcnolo/Freedom-Loader/releases) or the distribution channel linked from the [project website](https://freedomloader.acnolo.fr/). Obtain development binaries from the upstream projects documented in the developer setup instructions. The project does not claim that every binary or dependency is independently audited.
