process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  app.quit();
});

const { app } = require("electron");
const path = require("path");

const { logger, logSessionStart, logSessionEnd } = require("./server/logger");
const { AutoUpdater } = require("./app/autoUpdater");
const { startRPC, stopRPC } = require("./app/discordRPC");

const { configFeatures } = require("./config");
const config = require("./config");
const { initThemes } = require("./app/themeManager");

const { checkNativeDependencies } = require("./app/dependencyCheck");
const { updateYtDlp } = require("./app/ytDlpUpdater");
const { createMainWindow, getMainWindow } = require("./app/windowManager");
const { registerIpcHandlers } = require("./app/ipcHandlers");

app.setAppUserModelId("com.masteracnolo.freedomloader");
app.disableHardwareAcceleration();

if (!config.localMode) {
  const gotLock = app.requestSingleInstanceLock();
  if (gotLock) {
    app.on("second-instance", () => {
      logger.info("New instance detected, closing older...");
      getMainWindow()?.destroy();
    });
  }
}

app.whenReady().then(async () => {
  logSessionStart();

  if (!config.localMode && !checkNativeDependencies()) return;

  const { userYtDlp } = require("./server/helpers/path.helpers");
  updateYtDlp(userYtDlp);

  try {
    await require("./server/server").startServer();

    registerIpcHandlers(getMainWindow);

    const themeFolderPath = config.localMode
      ? path.join(__dirname, "theme")
      : path.join(process.resourcesPath, "theme");

    await initThemes(themeFolderPath); 

    await createMainWindow();

    if (configFeatures.discordRPC) startRPC();

    if (configFeatures.autoUpdate) AutoUpdater(getMainWindow());

  } catch (err) {
    logger.error("Boot error:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  logger.info("Shutting down...");
  app.quit();
});

app.on("before-quit", async () => {
  await stopRPC();
  logger.info("All services stopped. Have a nice day!");
  logSessionEnd();
});