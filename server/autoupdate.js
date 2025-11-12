const { autoUpdater } = require("electron-updater");
const { dialog, app } = require("electron");
const { logger } = require("./logger");

function initAutoUpdater(mainWindow) {
  autoUpdater.on("update-available", (info) => {
    logger.info(`Nouvelle version disponible : ${info.version}`);
    if (mainWindow) {
      mainWindow.webContents.send("update-available", info.version);
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    logger.info(`Mise à jour téléchargée : ${info.version}`);
    if (mainWindow) {
      mainWindow.webContents.send("update-downloaded", info.version);
    }

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  autoUpdater.on("error", (err) => {
    logger.error("Erreur auto-update :", err.message);
  });

  app.whenReady().then(() => {
    try {
      autoUpdater.checkForUpdatesAndNotify();
      logger.info("Vérification des mises à jour effectuée");
    } catch (err) {
      logger.error("Erreur lors du check update :", err.message);
    }
  });
}

module.exports = { initAutoUpdater };
