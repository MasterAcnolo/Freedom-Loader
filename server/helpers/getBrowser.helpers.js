const fs = require("fs");
const os = require("os");
const path = require("path");
const notify = require("./notify.helpers")
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
  //const userProfile = os.homedir();
  const firefoxPath = getFirefoxProfilePath();

  /**
   * Browsers supported by yt-dlp cookie extraction.
   *
   * Only Firefox is currently enabled and tested.
   * Additional browsers can be enabled in the future
   * once compatibility has been verified.
   */
  const browsers = [
    { name: "firefox", path: firefoxPath },
    // { name: "chrome", path: path.join(userProfile, "AppData", "Local", "Google", "Chrome", "User Data", "Default") },
    // { name: "brave", path: path.join(userProfile, "AppData", "Local", "BraveSoftware", "Brave-Browser", "User Data", "Default") },
    // { name: "edge", path: path.join(userProfile, "AppData", "Local", "Microsoft", "Edge", "User Data", "Default") },
    // { name: "opera", path: path.join(userProfile, "AppData", "Roaming", "Opera Software", "Opera Stable") },
    // { name: "vivaldi", path: path.join(userProfile, "AppData", "Local", "Vivaldi", "User Data", "Default") },
    // { name: "safari", path: path.join(userProfile, "AppData", "Local", "Apple Computer", "Safari") },
    // { name: "whale", path: path.join(userProfile, "AppData", "Local", "Naver", "Naver Whale", "User Data", "Default") }
  ];

  // Search for the first available browser profile.
  for (const browser of browsers) {
    if (browser.path && fs.existsSync(browser.path)) {
      logger.info(`Browser found: ${browser.name}`);
      return browser.name;
    }
  }

  // No supported browser found => Notify User
  logger.warn("No supported browser found on the system");

  // If you somehow managed to live without Firefox and need help installing it. - Don't applied to my Linux chad
  if (process.platform === "win32") {
    notify.notifyFirefoxBrowserMissing();
  }

  // Fallback to Firefox and let yt-dlp handle the error gracefully.
  // This prevents the application from crashing
  return "firefox";
}

function getFirefoxProfilePath() {
  const home = os.homedir();

  if (process.platform === "win32") {
    return path.join(
      home,
      "AppData",
      "Roaming",
      "Mozilla",
      "Firefox",
      "Profiles"
    );
  }

  if (process.platform === "linux") {
    return path.join(
      "usr",
      "bin",
      "firefox"
    );
  }

  if (process.platform === "darwin") {
    return path.join(
      home,
      "Library",
      "Application Support",
      "Firefox",
      "Profiles"
    );
  }

  return null;
}

module.exports = getUserBrowser