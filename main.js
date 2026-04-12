process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  app.quit();
});

const { app } = require("electron");
const { createSplashWindow, closeSplashWindow, setSplashProgress } = require("./app/splashManager");
const path = require("path");

const { logger, logSessionStart, logSessionEnd } = require("./server/logger");
const { initAutoUpdater } = require("./app/autoUpdater");
const { startRPC, stopRPC } = require("./app/discordRPC");

const { configFeatures } = require("./config");
const config = require("./config");
const { initThemes } = require("./app/themeManager");

const { checkNativeDependencies } = require("./app/dependencyCheck");
const { updateYtDlp } = require("./app/ytDlpUpdater");
const { createMainWindow, getMainWindow } = require("./app/windowManager");
const { registerIpcHandlers } = require("./app/ipcHandlers");

app.setName("Freedom Loader");
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

  createSplashWindow();

  if (!config.localMode && !checkNativeDependencies()) return;

  const { userYtDlp } = require("./server/helpers/path.helpers");
  updateYtDlp(userYtDlp);

  try {
    setSplashProgress(0); // Checking dependencies
    await require("./server/server").startServer();

    setSplashProgress(1); // Starting server
    registerIpcHandlers(getMainWindow);

    const themeFolderPath = config.localMode
      ? path.join(__dirname, "theme")
      : path.join(process.resourcesPath, "theme");

    setSplashProgress(2); // Loading themes
    await initThemes(themeFolderPath); 


    setSplashProgress(3); // Almost ready
    await createMainWindow();

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    closeSplashWindow();
    getMainWindow().show();
    if (configFeatures.discordRPC) startRPC();

    if (configFeatures.autoUpdate) initAutoUpdater(getMainWindow());

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