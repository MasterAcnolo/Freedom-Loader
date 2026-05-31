const { BrowserWindow, app } = require("electron");
const path = require("path");

/**
 * Reference to the splash screen BrowserWindow instance.
 * Used during application startup before main window is ready.
 */
let splashWindow = null;

/**
 * Creates and displays the splash screen window.
 *
 * Responsibilities:
 * - Initializes a frameless, always-on-top splash window
 * - Loads splash HTML UI
 * - Dynamically injects banner image depending on dev/production mode
 * - Acts as startup visual feedback before main window loads
 */
function createSplashWindow() {

  /**
   * Configuration for splash screen BrowserWindow.
   * Optimized for minimal UI and fast startup display.
   */
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

  /**
   * Instantiates the splash screen window.
   */
  splashWindow = new BrowserWindow(splashOptions);

  /**
   * Absolute path to splash HTML file used as initial UI.
   * Loaded locally from application bundle or project folder.
   */
  const splashPath = path.join(__dirname, "../public/splash.html");
  splashWindow.loadFile(splashPath);

  /**
   * Executes once splash HTML is fully loaded.
   * Used here to inject dynamic assets (banner image path).
   */
  splashWindow.webContents.on('did-finish-load', () => {

    /**
     * Resolves splash banner image path depending on runtime mode:
     * - Production: bundled resources directory
     * - Development: local build directory
     */
    let bannerPath;
    
    // Check if app is packaged
    if (app.isPackaged) {
      bannerPath = path.join(process.resourcesPath, 'banner.png');
    } else {
      // In dev, use build folder
      bannerPath = path.join(__dirname, '../build/banner.png');
    }
    
    /**
     * Injects runtime image source into splash DOM.
     * Uses file:// protocol to load local image safely in Electron context.
     */
    splashWindow.webContents.executeJavaScript(`
      document.querySelector('img[alt="Freedom Loader"]').src = 'file:///${bannerPath.replace(/\\/g, '/')}';
    `);
  });
}

/**
 * Closes and cleans up the splash screen window.
 *
 * Should be called once main window is ready to display.
 */
function closeSplashWindow() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

/**
 * Updates splash screen progress indicator from main process.
 *
 * Sends a step value to renderer via injected JS function.
 *
 * @param {number} step - Current initialization step or progress value
 */
function setSplashProgress(step) {
  if (splashWindow) {
    splashWindow.webContents.executeJavaScript(`window.setProgress(${step})`);
  }
}

module.exports = { createSplashWindow, closeSplashWindow, setSplashProgress };