const { BrowserWindow, app } = require("electron");
const path = require("path");
const { logger } = require("../server/logger");
const { configFeatures } = require("../config");
const config = require("../config");

let mainWindow = null;

async function createMainWindow() {
  if (mainWindow) {
    logger.warn("Window already exists, no new creation!");
    return mainWindow;
  }

  const iconPath = config.localMode
    ? path.join(__dirname, "../build/app-icon.ico")
    : path.join(process.resourcesPath, "build/app-icon.ico");

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

  try {
    await mainWindow.loadURL(`http://localhost:${config.applicationPort}`);
    logger.info("Window loaded");
  } catch (err) {
    logger.error("Window loading error:", err);
    throw err;
  }

  mainWindow.on("closed", () => {
    logger.info("Main window closed");
    mainWindow = null;
  });

  return mainWindow;
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };