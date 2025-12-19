const { autoUpdater } = require("electron-updater");
const { app, Notification } = require("electron");
const { logger } = require("./logger");

function AutoUpdater() {

  autoUpdater.on("update-available", (info) => {
    logger.info(`New Version Available : ${info.version}`);
    new Notification({
      title: "Freedom Loader",
      body: `New Version Available : ${info.version}. Application will restart`
    }).show();
  });

  autoUpdater.on("update-downloaded", (info) => {
    logger.info(`Update Downloaded : ${info.version}`);
    new Notification({
      title: "Freedom Loader",
      body: `Update ${info.version} downloaded.`
    }).on("click", () =>
      shell.openExternal("https://github.com/MasterAcnolo/Freedom-Loader/releases/latest")
    ).show();

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  autoUpdater.on("error", (err) => {
    logger.error("Auto Update Error :", err.message);
    new Notification({
      title: "Freedom Loader - Update Error",
      body: err.message
    }).show();
  });

  app.whenReady().then(async () => {
    try {
      await autoUpdater.checkForUpdates();
      logger.info("Update check completed");
    } catch (err) {
      logger.error("Error during update check :", err.message);
    }
  });
}

module.exports = { AutoUpdater };
