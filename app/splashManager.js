const { BrowserWindow, app } = require("electron");
const path = require("path");

let splashWindow = null;

function createSplashWindow() {

const splashOptions = {
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
  };

  splashWindow = new BrowserWindow(splashOptions);

  const splashPath = path.join(__dirname, "../public/splash.html");
  splashWindow.loadFile(splashPath);

  // Inject banner path for both dev and packaged app
  splashWindow.webContents.on('did-finish-load', () => {
    let bannerPath;
    
    // Check if app is packaged
    if (app.isPackaged) {
      bannerPath = path.join(process.resourcesPath, 'banner.png');
    } else {
      // In dev, use build folder
      bannerPath = path.join(__dirname, '../build/banner.png');
    }
    
    splashWindow.webContents.executeJavaScript(`
      document.querySelector('img[alt="Freedom Loader"]').src = 'file:///${bannerPath.replace(/\\/g, '/')}';
    `);
  });
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