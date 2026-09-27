/**
 * Electron auto-update system using electron-updater.
 *
 * Handles:
 * - update detection
 * - user confirmation dialogs
 * - download progress streaming to renderer
 * - application restart and installation
 */

const { autoUpdater } = require("electron-updater");
const { logger } = require("../server/logger");

/**
 * Configures autoUpdater behavior:
 * - disables automatic download
 * - disables automatic installation on quit
 * (manual user-controlled update flow)
 */
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

let updateAvailable = false;

/**
 * Determines how the update should be handled based on the platform
 * @returns {"auto" | "snap" | "flatpak" | "linux-native"}
 */
function getUpdateEnvironment() {
  if (
    process.env.APPIMAGE ||
    process.platform === "win32" ||
    process.platform === "darwin"
  ) {
    return "auto";
  }
  if (process.env.SNAP) return "snap";
  if (process.env.FLATPAK_ID) return "flatpak";

  return "linux-native";
}

/**
 * Initializes application auto-update lifecycle.
 *
 * Registers update event listeners and binds them to:
 * - UI dialogs (Electron dialog)
 * - renderer communication (webContents)
 * - download/install flow control
 *
 * @param {BrowserWindow} mainWindow - main Electron window instance
 */
function initAutoUpdater(mainWindow) {
  /**
   * Triggered when a new version is detected.
   * Prompts user to install or defer update.
   */
  autoUpdater.on("update-available", async (info) => {
    logger.info(`Update available: ${info.version}`);

    mainWindow?.webContents.send("update-available", {
      version: info.version,
      environment: getUpdateEnvironment(),
    });
    updateAvailable = true;

  });

  /**
   * Streams update download progress to renderer process.
   * Used to update UI progress bar and status indicators.
   */
  autoUpdater.on("download-progress", (progress) => {
    logger.info(`Download progress: ${Math.round(progress.percent)}%`);
    mainWindow?.webContents.send("update-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  /**
   * Triggered when update has been fully downloaded.
   * Prompts user to restart application and install update.
   */
  autoUpdater.on("update-downloaded", async (info) => {
    logger.info(`Update downloaded: ${info.version}`);

    mainWindow?.webContents.send("update-downloaded", info);


  });

  /**
   * Handles update system errors.
   * Logs failure and displays an error dialog to user.
   */
  autoUpdater.on("error", (err) => {
    const msg = err?.message || "";

    /**
     * If no update is available, I put this because there is no Linux version before 1.6.0
     * @type {boolean}
     */
    const isNoUpdateAvailable =
      /404/.test(msg) || /Cannot find latest.*\.yml/i.test(msg);

    if (isNoUpdateAvailable) {
      logger.warn("Auto update: no update metadata found (probably no previous release), ignoring", msg);
      return;
    }

    logger.error("Auto update error:", err);
  });

  checkForUpdates();
}

/**
 * Manually triggers update check on startup.
 * Separated from init for reusability and testability.
 */
async function checkForUpdates() {
  if (process.env.SNAP || process.env.FLATPAK_ID) return;
  if (!require("electron").app.isPackaged) return;

  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    logger.error("Update check failed:", err.message);
  }
}

/**
 * Manually triggers update download.
 * Used when user accepts update prompt.
 */
async function downloadUpdate() {
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    logger.error("Download failed:", err.message);
  }
}

/**
 * Immediately quits application and installs downloaded update.
 */
function installUpdate() {
  autoUpdater.quitAndInstall();
}

function isUpdateAvailable() {
  return updateAvailable;
}

module.exports = {
  initAutoUpdater,
  downloadUpdate,
  installUpdate,
  isUpdateAvailable,
};
