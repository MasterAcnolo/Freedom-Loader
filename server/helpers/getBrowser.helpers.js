const fs = require("fs");
const os = require("os");
const notify = require("./notify.helpers");
const { logger } = require("../logger");

/**
 * Detects the first supported browser installed on the system.
 *
 * The detected browser is used by yt-dlp to import authentication
 * cookies when required by certain platforms.
 *
 * Currently, Firefox is the only browser officially supported
 * by the application.
 *
 * If no supported browser is found:
 * - A warning is logged
 * - A notification is displayed to the user
 * - "firefox" is returned as a fallback to allow yt-dlp to
 *   handle the error gracefully without crashing the application
 *
 * @returns {string} The detected browser identifier.
 */
function getUserBrowser() {
  const platform = process.platform;
  let isFirefoxHere = false;

  if (platform === "win32") {
    const paths = [
      "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
      "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
      `${process.env.LOCALAPPDATA}\\Mozilla Firefox\\firefox.exe`,
    ];

    isFirefoxHere = paths.some(p => fs.existsSync(p));
  }

  if (platform === "linux") {
    const paths = [
      "/usr/bin/firefox",
      "/usr/bin/firefox-esr",
      "/usr/local/bin/firefox",
      "/snap/bin/firefox",
      "/var/lib/flatpak/exports/bin/org.mozilla.firefox",
      `${os.homedir()}/.local/share/flatpak/exports/bin/org.mozilla.firefox`,
    ];
    isFirefoxHere = paths.some(p => fs.existsSync(p));
  }

  if (!isFirefoxHere) {
    // If you somehow managed to live without Firefox and need help installing it. - Don't applied to my Linux chad
    // No supported browser found => Notify User
    logger.warn("No supported browser found on the system");
    notify.notifyFirefoxBrowserMissing();
  } else {
    logger.info("Browser found: firefox");
  }

  // Fallback to Firefox and let yt-dlp handle the error gracefully.
  // This prevents the application from crashing
  return "firefox";
}

module.exports = {getUserBrowser};