const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const { logger } = require("../server/logger");

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function initAutoUpdater(mainWindow) {
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

  autoUpdater.on("download-progress", (progress) => {
    logger.info(`Download progress: ${Math.round(progress.percent)}%`);
    mainWindow?.webContents.send("update-progress", {
      percent: Math.round(progress.percent),
      speed: progress.bytesPerSecond,
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    logger.info(`Update downloaded: ${info.version}`);

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: `Version ${info.version} has been downloaded.`,
      detail: "The application will restart to apply the update.",
      buttons: ["Restart & Install", "Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (err) => {
    logger.error("Auto update error:", err.message);
    dialog.showErrorBox("Update Error", err.message);
  });

  checkForUpdates();
}

async function checkForUpdates() {
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    logger.error("Update check failed:", err.message);
  }
}

async function downloadUpdate() {
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    logger.error("Download failed:", err.message);
  }
}

function installUpdate() {
  autoUpdater.quitAndInstall();
}

module.exports = { initAutoUpdater, downloadUpdate, installUpdate };