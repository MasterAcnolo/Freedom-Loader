const { ipcMain, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { logger, logDir } = require("../server/logger");
const { configFeatures, featuresPath } = require("../config");
const { getThemes, reloadThemes } = require("./themeManager");
const config = require("../config");
const { validateDownloadPath, getDefaultDownloadPath } = require("./pathValidator");

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
  "createPlaylistFolders"
]);

const configFolderPath = featuresPath;

const themeFolderPath = config.localMode
  ? path.join(__dirname, "..", "theme")
  : path.join(process.resourcesPath, "theme");

function registerIpcHandlers(getMainWindow) {
    
  // Infos générales
  ipcMain.handle("version",  () => config.version);
  ipcMain.handle("features", () => configFeatures);

  // Sélection et validation de dossier
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

  // Progression dans la taskbar
  ipcMain.on("set-progress", (_, percent) => {
    getMainWindow()?.setProgressBar(percent / 100);
  });

  // TOPBAR ACTION
  ipcMain.on("window-minimize", () => getMainWindow()?.minimize());
  ipcMain.on("window-maximize", () => {
    const win = getMainWindow();
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on("window-close", () => getMainWindow()?.close());


  ipcMain.on("open-devtools", () =>
    getMainWindow()?.webContents.openDevTools({ mode: "detach" })
  );
  ipcMain.on("open-logs",    () => logDir && shell.openPath(logDir));
  ipcMain.on("open-website", () =>
    shell.openExternal("https://masteracnolo.github.io/FreedomLoader/")
  );
  ipcMain.on("open-wiki", () =>
    shell.openExternal("https://masteracnolo.github.io/FreedomLoader/wiki")
  );
  ipcMain.on("open-workshop", () =>
    shell.openExternal("https://masteracnolo.github.io/Freedom-Loader-Workshop")
  );
  ipcMain.on("open-config", () => shell.openPath(configFolderPath));

  
  
  // THEME
  ipcMain.handle("get-themes", () => getThemes());

  ipcMain.on("open-theme", () => shell.openPath(themeFolderPath));

  ipcMain.handle("reload-themes", async () => {
    return await reloadThemes();
  });

  // Modification des features
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