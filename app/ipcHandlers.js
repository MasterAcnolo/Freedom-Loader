/**
 * Electron IPC main process registry.
 *
 * Centralizes all IPC channels exposed to renderer process:
 * - Application info (version, features)
 * - Window controls (topbar actions)
 * - File system interactions (theme, config, download paths)
 * - UI state synchronization (progress bar)
 *
 * Acts as the bridge between renderer and privileged Node/Electron APIs.
 */

const { ipcMain, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { logger, logDir } = require("../server/logger");
const { configFeatures, featuresPath } = require("../config");
const { getThemes, reloadThemes } = require("./themeManager");
const config = require("../config");
const { validateDownloadPath, getDefaultDownloadPath } = require("./pathValidator");
const { userThemesPath } = require("../server/helpers/path.helpers");

/**
 * Security whitelist for feature flags that can be modified at runtime.
 *
 * Prevents unauthorized or unexpected configuration keys from being persisted.
 * Acts as a basic validation layer for IPC "set-feature".
 */
const FEATURE_WHITELIST = new Set([
  "autoUpdate",
  "discordRPC",
  "customTopBar",
  "autoCheckInfo",
  "addThumbnail",
  "addMetadata",
  "verboseLogs",
  "autoDownloadPlaylist",
  "customCodec",
  "theme",
  "createPlaylistFolders",
  "notifySystem"
]);

/**
 * Absolute path to the configuration file storing feature flags.
 */
const configFolderPath = featuresPath;

/**
 * Directory containing user-installed themes.
 */
const themeFolderPath = userThemesPath;

/**
 * Registers all IPC handlers and event listeners for Electron main process.
 *
 * This function wires renderer → main communication channels:
 * - synchronous queries (handle)
 * - fire-and-forget events (on)
 *
 * @param {Function} getMainWindow - Function returning current BrowserWindow instance
 */
function registerIpcHandlers(getMainWindow) {
    
  /**
   * Returns application version from config.
   */
  ipcMain.handle("version", () => config.version);

  /**
   * Returns runtime feature configuration object.
   */
  ipcMain.handle("features", () => configFeatures);

  /**
   * Opens native folder selection dialog and validates selected path.
   *
   * Ensures:
   * - user cancellation is handled safely
   * - selected path is validated against security rules
   * - unsafe directories are rejected
   */
  ipcMain.handle("select-download-folder", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled) {
      logger.info("Folder selection cancelled by user");
      return null;
    }
    try {
      const validated = validateDownloadPath(result.filePaths[0]);
      logger.info(`Folder selected and validated: ${validated}`);
      return validated;
    } catch (err) {
      logger.warn(`Unsafe or invalid folder rejected: ${err.message}`);
      throw err;
    }
  });

  ipcMain.handle("validate-download-path", (_, userPath) => validateDownloadPath(userPath));
  ipcMain.handle("get-default-download-path", () => getDefaultDownloadPath());

  /**
   * Updates Windows/macOS taskbar progress indicator.
   *
   * @param {number} percent - Progress value (0–100)
   */
  ipcMain.on("set-progress", (_, percent) => {
    getMainWindow()?.setProgressBar(percent / 100);
  });

  /**
   * Window minimize request from renderer.
   */
  ipcMain.on("window-minimize", () => getMainWindow()?.minimize());

  /**
   * Toggles maximize/unmaximize state of main window.
   */
  ipcMain.on("window-maximize", () => {
    const win = getMainWindow();
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  /**
   * Closes the main application window.
   */
  ipcMain.on("window-close", () => getMainWindow()?.close());


  /**
   * Opens Chromium DevTools in detached mode.
   */
  ipcMain.on("open-devtools", () =>
    getMainWindow()?.webContents.openDevTools({ mode: "detach" })
  );

  /**
   * Opens application logs directory in system file explorer.
   */
  ipcMain.on("open-logs",    () => logDir && shell.openPath(logDir));

  /**
   * Opens external website in default browser.
   */
  ipcMain.on("open-website", () =>
    shell.openExternal("https://masteracnolo.github.io/Freedom-Loader-Site/")
  );

  /**
   * Opens official wiki page in external browser.
   */
  ipcMain.on("open-wiki", () =>
    shell.openExternal("https://masteracnolo.github.io/Freedom-Loader-Site/wiki")
  );

  /**
   * Opens workshop page in external browser.
   */
  ipcMain.on("open-workshop", () =>
    shell.openExternal("https://masteracnolo.github.io/Freedom-Loader-Workshop")
  );

  /**
   * Opens configuration folder in system file explorer.
   */
  ipcMain.on("open-config", () => shell.openPath(configFolderPath));

  
  
  /**
   * Retrieves available themes from filesystem.
   */
  ipcMain.handle("get-themes", () => getThemes());

  /**
   * Opens theme directory in file explorer.
   */
  ipcMain.on("open-theme", () => shell.openPath(themeFolderPath));

  /**
   * Reloads themes from disk dynamically.
   */
  ipcMain.handle("reload-themes", async () => {
    return await reloadThemes();
  });

  /**
   * Updates a runtime feature flag and persists it to disk.
   *
   * Flow:
   * - Validates key against whitelist
   * - Prevents unnecessary writes if value is unchanged
   * - Updates in-memory config object
   * - Persists to configuration file
   *
   * Security note:
   * Only whitelisted keys can be modified via IPC to prevent config injection.
   *
   * @param {Electron.IpcMainEvent} event
   * @param {{key: string, value: any}} payload
   * @returns {boolean} success state
   */
  ipcMain.handle("set-feature", (event, { key, value }) => {
        try {
          if (!FEATURE_WHITELIST.has(key)) {
            logger.warn(`Rejected feature (not whitelisted): ${key}`);
            return false;
          }

          if (configFeatures[key] === value) {
            return true;
          }

          configFeatures[key] = value;

          fs.writeFileSync(
            configFolderPath,
            JSON.stringify(configFeatures, null, 2),
            "utf-8"
          );

          logger.info(`Feature updated: ${key} = ${value}`);
          return true;

        } catch (err) {
          logger.error(`set-feature failed (${key}): ${err.message}`);
          return false;
        }
    });
}

module.exports = { registerIpcHandlers };