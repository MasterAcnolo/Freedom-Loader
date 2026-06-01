/**
 * Handle crash application and avoid ghost instance
 */
const { app } = require("electron");

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  app.quit();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  app.quit();
});


/**
 * True if this is the primary instance (lock acquired successfully)
 */
const isPrimaryInstance = app.requestSingleInstanceLock();

/**
 * If we are on a second instance
 */
if (!isPrimaryInstance) {
  app.quit();
  process.exit(0);
}

/**
 * Set App Name and AppID 
 */
app.setName("Freedom Loader");
app.setAppUserModelId("com.masteracnolo.freedomloader");


/**
 * Load the app dependencies for hardware choice
 */
const { logger, logSessionStart, logSessionEnd } = require("./server/logger");
const { configFeatures } = require("./config");

/**
 * On start, enable or disable hardWareAcceleration
 */
if (!configFeatures.enableHardwareAcceleration){
  app.disableHardwareAcceleration();
  logger.info("Disabled Hardware Acceleration")
} else {
  logger.info("Enable Hardware Acceleration")
}

/**
 * In-memory snapshot of application feature flags.
 *
 * Note: Changes to the config file are not automatically reflected.
 * A restart could be required.
 */
const config = require("./config");

if(config.devMode){
  /**
   * Start devTron extensions - @see https://github.com/electron/devtron
   */
  const { devtron } = require('@electron/devtron');
  devtron.install(); 
  logger.info("Loaded DevTron Extension")
}

/**
 * Load the app dependencies 
 */
const { initThemes } = require("./app/themeManager");

const { initAutoUpdater } = require("./app/autoUpdater");
const { startRPC, stopRPC } = require("./app/discordRPC");
const { checkNativeDependencies } = require("./app/dependencyCheck");
const { updateYtDlp } = require("./app/ytDlpUpdater");
const { createMainWindow, getMainWindow } = require("./app/windowManager");
const { registerIpcHandlers } = require("./app/ipcHandlers");
const { createSplashWindow, closeSplashWindow, setSplashProgress } = require("./app/splashManager");
const { userThemesPath, initUserThemes } = require("./server/helpers/path.helpers");


/**
 * If another instance want to run
 */
app.on("second-instance", () => {
  logger.info("Second instance detected");

  const mainWindow = require("./app/windowManager").getMainWindow();

  if (!mainWindow) return;

  if (mainWindow.isMinimized()) mainWindow.restore();

  mainWindow.show();
  mainWindow.focus();
});

app.whenReady().then(async () => {
  logSessionStart();

  createSplashWindow();

  if (!config.devMode && !checkNativeDependencies()) return;

  const { userYtDlp } = require("./server/helpers/path.helpers");
  updateYtDlp(userYtDlp);

  try {
    setSplashProgress(0); // Checking dependencies
    await require("./server/server").startServer();

    setSplashProgress(1); // Starting server
    registerIpcHandlers(getMainWindow);

    setSplashProgress(2); // Loading themes
    initUserThemes();
    await initThemes(userThemesPath); 

    setSplashProgress(3); // Almost ready
    await createMainWindow();
    
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