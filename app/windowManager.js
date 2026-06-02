/**
 * Electron main window module dependencies.
 * Handles BrowserWindow lifecycle and application UI shell.
 */

const { BrowserWindow, app } = require("electron");
const path = require("path");
const { logger } = require("../server/logger");
const { configFeatures } = require("../config");
const config = require("../config");

/**
 * Singleton reference to the main Electron BrowserWindow instance.
 * Ensures only one application window exists at runtime.
 */
let mainWindow = null;

/**
 * Creates and initializes the main Electron application window.
 *
 * Responsibilities:
 * - Ensures singleton window instance (prevents duplicates)
 * - Configures window options (size, icon, preload, security settings)
 * - Loads frontend application from local dev server
 * - Handles lifecycle events (close, errors)
 *
 * @returns {Promise<BrowserWindow>} The created or existing window instance
 */
async function createMainWindow() {

  /**
   * Prevents multiple instances of the main window.
   * Returns existing instance if already created.
   */
  if (mainWindow) {
    logger.warn("Window already exists, no new creation!");
    return mainWindow;
  }

  /**
   * Resolves application icon path depending on runtime mode:
   * - Development: local build folder
   * - Production: packaged Electron resources
   */
  const iconPath = config.devMode
    ? path.join(__dirname, "../build/app-icon.ico")
    : path.join(process.resourcesPath, "build/app-icon.ico");

  /**
   * Electron BrowserWindow configuration object.
   * Defines UI behavior, security settings, and preload bridge.
   */
  const windowOptions = {
    title: `Freedom Loader ${config.version}`,
    icon: iconPath,
    width: 750,
    height: 800,
    minWidth: 750,
    minHeight: 800,
    frame: !configFeatures.customTopBar,
    devTools: !app.isPackaged,
    show: false, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload.js"),
    },
  };

  mainWindow = new BrowserWindow(windowOptions);

  /**
   * Loads the frontend application served by the local dev server.
   * In production, this could be replaced with a file:// build.
   */
  try {
    await mainWindow.loadURL(`http://localhost:${config.applicationPort}`);
    logger.info("Window loaded");
  } catch (err) {
    logger.error("Window loading error:", err);
    throw err;
  }

  /**
   * Cleans up window reference when the main window is closed.
   * Prevents memory leaks and allows recreation if needed.
   */
  mainWindow.on("closed", () => {
    logger.info("Main window closed");
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Returns the current main window instance.
 *
 * Useful for IPC handlers and background services
 * needing access to the renderer process.
 *
 * @returns {BrowserWindow | null}
 */
function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };