const { autoUpdater } = require("electron-updater");
const { app, Notification } = require("electron");
const { logger } = require("./logger");

function AutoUpdater() {

  autoUpdater.on("update-available", (info) => {
    logger.info(`Nouvelle version disponible : ${info.version}`);
    new Notification({
      title: "Freedom Loader",
      body: `Nouvelle version disponible : ${info.version}. L'application va redémarrer`
    }).show();
  });

  autoUpdater.on("update-downloaded", (info) => {
    logger.info(`Mise à jour téléchargée : ${info.version}`);
    new Notification({
      title: "Freedom Loader",
      body: `Mise à jour ${info.version} téléchargée.`
    }).show();

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  autoUpdater.on("error", (err) => {
    logger.error("Erreur auto-update :", err.message);
    new Notification({
      title: "Freedom Loader - Erreur de mise à jour",
      body: err.message
    }).show();
  });

  app.whenReady().then(async () => {
    try {
      await autoUpdater.checkForUpdates();
      logger.info("Vérification des mises à jour effectuée");
    } catch (err) {
      logger.error("Erreur lors du check update :", err.message);
    }
  });
}

module.exports = { AutoUpdater };
