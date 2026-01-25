const config = require("./config.js");
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

const { logger, logSessionStart, logSessionEnd, logDir } = require("./server/logger");
const { AutoUpdater } = require("./server/update.js");
const { configFeatures } = require("./config.js");
const { startRPC, stopRPC} = require("./server/discordRPC");

let mainWindow;
const logsFolderPath = logDir;

const basePath = config.localMode
  ? path.join(__dirname )
  : path.join(path.dirname(process.execPath), "resources");

const configFolderPath = path.join(basePath, "config" ,"config.json");

const defaultDownloadPath = path.join(os.homedir(), "Downloads", "Freedom Loader");

app.setAppUserModelId("com.masteracnolo.freedomloader"); // pour notifications Windows
app.disableHardwareAcceleration();

ipcMain.handle("version", () => config.version);

// Gestion single instance
const gotLock = app.requestSingleInstanceLock();

// Native dependencies check (yt-dlp.exe, ffmpeg.exe, ffprobe.exe, Deno)
function checkNativeDependencies() {
  const deps = [
    { name: "yt-dlp.exe", path: path.join(process.resourcesPath, "binaries","yt-dlp.exe") },
    { name: "ffmpeg.exe", path: path.join(process.resourcesPath, "binaries", "ffmpeg.exe") },
    { name: "ffprobe.exe", path: path.join(process.resourcesPath, "binaries", "ffprobe.exe") },
    { name: "deno.exe", path: path.join(process.resourcesPath, "binaries", "deno.exe") },
  ];
  const missing = deps.filter(dep => !fs.existsSync(dep.path));
  let errorMsg = "";
  if (missing.length > 0) {
    const missingList = missing.map(dep => dep.name).join(", ");
    logger.error(`Missing dependencies: ${missingList}`);
    errorMsg += `The following files are missing in the 'ressources' folder:\n${missingList}`;
  }
  if (errorMsg) {
    app.whenReady().then(() => {
      dialog.showErrorBox(
        "Missing dependencies",
        `${errorMsg}\n\nThe application will now exit. Try to reinstall`
      );
      app.quit();
    });
    return false;
  }
  return true;
}

if(!config.localMode){
  if (!gotLock) {
    // Une instance existe déjà -> fermer l'ancienne et continuer la nouvelle
    // Ici la nouvelle instance continue normalement
  } else {
    if (!checkNativeDependencies()) {
      // Arrêt déjà géré dans la fonction
    } else {
      app.on("second-instance", () => {
        // La vieille instance se ferme
        if (mainWindow) {
          logger.info("New Instance Detected, closing the older...");
          mainWindow.destroy();
          mainWindow = null;
        }
      });
    }
  }
}
// Création fenêtre principale
async function createMainWindow() {
  if (mainWindow) {
    logger.warn("Window already exists, no new creation!");
    return;
  }

  mainWindow = new BrowserWindow({
    title: `Freedom Loader ${config.version}`,
    width: 750,
    height: 800,
    minWidth: 750,
    minHeight: 800,
    frame: !configFeatures.customTopBar,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  try {
    await mainWindow.loadURL(`http://localhost:${config.applicationPort}`);
    logger.info("Window Loaded");
  } catch (err) {
    logger.error("Window Loading Error:", err);
  }

  mainWindow.on("closed", () => {
    logger.info("Main Window Closed");
    mainWindow = null;
  });
}

function validateDownloadPath(userPath) {
  const userHome = os.homedir(); // C:\Users\<User>

  if (!userPath) return path.join(userHome, "Downloads", "Freedom Loader");

  // Résolution canonique et suivi des symlinks
  const resolved = fs.realpathSync(path.resolve(userPath));
  const normalizedHome = path.resolve(userHome) + path.sep;

  if (!resolved.startsWith(normalizedHome)) {
    throw new Error("Chemin non autorisé : uniquement les sous-dossiers du dossier utilisateur sont permis !");
  }

  return resolved;
}


// IPC
ipcMain.handle("select-download-folder", async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!result.canceled && result.filePaths.length > 0) {
      const validatedPath = validateDownloadPath(result.filePaths[0]);
      logger.info(`Folder Checked and Valid : ${validatedPath}`);
      return validatedPath;
    }
    return null;
  } catch (err) {
    logger.error(`An Error Occured when validating folder : ${err.message}`);
    return null;
  }
});

ipcMain.handle("validate-download-path", (event, userPath) => {
  return validateDownloadPath(userPath);
});


ipcMain.handle("get-default-download-path", () => defaultDownloadPath);

ipcMain.on("set-progress", (event, percent) => {
  if (mainWindow) mainWindow.setProgressBar(percent / 100); // Electron attend 0 → 1
});

// Topbar window controls
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});

// Topbar custom actions
ipcMain.on("open-devtools", () => {
  if (mainWindow) mainWindow.webContents.openDevTools({ mode: 'detach' });
});
ipcMain.on("open-logs", () => {
  if (logsFolderPath) shell.openPath(logsFolderPath);
});
ipcMain.on("open-website", () => {
  shell.openExternal("https://masteracnolo.github.io/FreedomLoader/index.html");
});
ipcMain.on("open-wiki", () => {
  shell.openExternal("https://masteracnolo.github.io/FreedomLoader/pages/wiki.html");
});
ipcMain.on("open-config", () => {
  if (configFolderPath) shell.openPath(configFolderPath);
});


// App ready
app.whenReady().then(async () => {
  logSessionStart();
  logger.info("App Ready, Server Express starting...");

  const serverPath = path.join(__dirname, "server", "server.js")

  const expressServer = require(serverPath);

  try {
    await expressServer.startServer();
    logger.info("Express Server Started");

    ipcMain.handle("features", () => {
        return configFeatures;
    });

    const featureWhitelist = new Set([
        "autoUpdate",
        "discordRPC",
        "customTopBar",
        "autoCheckInfo",
        "addThumbnail",
        "addMetadata",
        "verboseLogs",
        "autoDownloadPlaylist",
        "customCodec"
      ]);

    
    ipcMain.handle("set-feature", (event, { key, value }) => {
        try {
          if (!featureWhitelist.has(key)) {
            logger.warn(`Rejected feature (not whitelisted): ${key}`);
            return false;
          }

          // optionnel mais propre
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


    configFeatures.discordRPC ? startRPC() : "";

    await createMainWindow();
    configFeatures.autoUpdate ? AutoUpdater(mainWindow) : ""; // Auto Update 

  } catch (err) {
    logger.error("Window or Server error :", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  logger.info("All Window Closed, shuting down app");
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  logSessionEnd() 
  stopRPC()
});
