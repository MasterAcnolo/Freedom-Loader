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
const { dialog } = require("electron");
const { logger } = require("../server/logger");

/**
 * Configures autoUpdater behavior:
 * - disables automatic download
 * - disables automatic install on quit
 * (manual user-controlled update flow)
 */
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

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

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message: `Version ${info.version} is available.`,
      detail: "Would you like to download and install it now?",
      buttons: ["Install Update", "Maybe Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    } else {
      mainWindow?.webContents.executeJavaScript(
        `window.showUpdateBadge && window.showUpdateBadge("${info.version}")`
      );
    }
  });

  /**
   * Streams update download progress to renderer process.
   * Used to update UI progress bar and status indicators.
   */
  autoUpdater.on("download-progress", (progress) => {
    logger.info(`Download progress: ${Math.round(progress.percent)}%`);
    mainWindow?.webContents.send("update-progress", {
      percent: Math.round(progress.percent),
      speed: progress.bytesPerSecond,
    });
  });

  /**
   * Triggered when update has been fully downloaded.
   * Prompts user to restart application and install update.
   */
  autoUpdater.on("update-downloaded", async (info) => {
    logger.info(`Update downloaded: ${info.version}`);

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: `Version ${info.version} has been downloaded.`,
      detail: "The application will restart to apply the update.",
      buttons: ["Install Now", "Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) autoUpdater.quitAndInstall();
  });

  /**
   * Handles update system errors.
   * Logs failure and displays an error dialog to user.
   */
  autoUpdater.on("error", (err) => {
    logger.error("Auto update error:", err.message);
    dialog.showErrorBox("Update Error", err.message);
  });

  checkForUpdates();
}

/**
 * Manually triggers update check on startup.
 * Separated from init for reusability and testability.
 */
async function checkForUpdates() {
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

module.exports = { initAutoUpdater, downloadUpdate, installUpdate };