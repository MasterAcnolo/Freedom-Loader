const { BrowserWindow } = require("electron");
const path = require("path");

let splashWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, "../public/splash.html"));
}

function closeSplashWindow() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

function setSplashProgress(step) {
  if (splashWindow) {
    splashWindow.webContents.executeJavaScript(`window.setProgress(${step})`);
  }
}

module.exports = { createSplashWindow, closeSplashWindow, setSplashProgress };