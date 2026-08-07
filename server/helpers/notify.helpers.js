const { Notification, shell } = require("electron");
const { iconPaths } = require("./path.helpers");
const { logger } = require("../logger");

/**
 * Set that is holding all notifications. Used to avoid Race Condition and notification crash
 * @type {Set<any>}
 */
const activeNotifications = new Set();

/**
 * Displays a system notification when a download completes successfully.
 *
 * If enabled, clicking the notification opens the download folder
 * using the system file explorer.
 *
 * @param {string} folder - Path to the completed download folder.
 * @param {boolean} notifyEnabled - Whether notifications are enabled in config.
 */
function notifyDownloadFinished(folder, notifyEnabled = true) {
  if (!notifyEnabled) return;
  if (!folder) return;

  const notif = new Notification({
    title: "Freedom Loader",
    body: "Your download is complete, click here to open it.",
    icon: iconPaths.confirm,
  });

  // Protect notification to garbage collection and race condition, by adding a 150ms timeout before trying to open the folder
  activeNotifications.add(notif);

  notif.on("click", () => {
    activeNotifications.delete(notif);

    setTimeout(() => {
      shell.openPath(folder).then((errorMessage) => {
        if (errorMessage) {
          logger.error(`Impossible d'ouvrir le dossier : ${errorMessage}`);
        }
      }).catch(err => {
        logger.error(`Erreur inattendue de shell.openPath : ${err}`);
      });
    }, 150);
  });

  notif.on("close", () => {
    activeNotifications.delete(notif);
  });

  notif.show();
}

/**
 * Displays a notification when browser cookies cannot be extracted.
 *
 * This usually indicates:
 * - User is not logged in to the browser
 * - Browser profile is inaccessible
 *
 * Clicking the notification opens a tutorial link.
 */
function notifyCookiesBrowserError(){
  const notif = new Notification({
    title: "Cookies Error",
    body: "Unable to retrieve cookies. Please log in to your browser and click here to view the tutorial.",
    icon: iconPaths.error,
  });

  activeNotifications.add(notif);

  notif.on("click", () => {
    shell.openExternal("https://www.firefox.com/en-US/download/");
    activeNotifications.delete(notif);
  });

  notif.on("close", () => {
    activeNotifications.delete(notif);
  });

  notif.show();
}

/**
 * Displays a notification when Firefox is not detected
 * on the user system.
 *
 * This is required for cookie extraction via yt-dlp.
 *
 * Clicking the notification opens an installation guide.
 */
function notifyFirefoxBrowserMissing() {
  const notif = new Notification({
    title: "Firefox Missing",
    body: "Firefox was not found on your system. Click here to follow the installation guide",
    icon: iconPaths.error,
  });

  activeNotifications.add(notif);

  notif.on("click", () => {
    shell.openExternal("https://www.firefox.com/en-US/download/");
    activeNotifications.delete(notif);
  });

  notif.on("close", () => {
    activeNotifications.delete(notif);
  });

  notif.show();
}

module.exports = {
  notifyDownloadFinished,
  notifyCookiesBrowserError,
  notifyFirefoxBrowserMissing,
};