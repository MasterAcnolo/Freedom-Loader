const config = require("./config.js");
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { logger, logSessionStart, logSessionEnd, logDir } = require("./server/logger");
const { AutoUpdater } = require("./server/update.js");

let mainWindow;
const logsFolderPath = logDir;
const defaultDownloadPath = path.join(os.homedir(), "Downloads", "Freedom Loader");

app.setAppUserModelId("com.masteracnolo.freedomloader"); // pour notifications Windows
app.disableHardwareAcceleration();


// Gestion single instance
const gotLock = app.requestSingleInstanceLock();

// Native dependencies check (yt-dlp.exe, ffmpeg.exe, ffprobe.exe, Deno)
function checkNativeDependencies() {
  const deps = [
    { name: "yt-dlp.exe", path: path.join(process.resourcesPath, "yt-dlp.exe") },
    { name: "ffmpeg.exe", path: path.join(process.resourcesPath, "ffmpeg.exe") },
    { name: "ffprobe.exe", path: path.join(process.resourcesPath, "ffprobe.exe") },
    { name: "deno.exe", path: path.join(process.resourcesPath, "deno.exe") },
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
    frame:false,
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

// IPC
ipcMain.handle("select-download-folder", async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!result.canceled && result.filePaths.length > 0) {
      logger.info(`Dossier sélectionné : ${result.filePaths[0]}`);
      return result.filePaths[0];
    }
    return null;
  } catch (err) {
    logger.error(`Error when creating Output Folder : ${err.message}`);
    return null;
  }
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

// Menu
function setupMenu() {
  const menuTemplate = [
    {
      label: "Logs",
      submenu: [
        {
          label: "Open Logs",
          click: () => shell.openPath(logsFolderPath),
        },
      ],
    },
    {
      label: "Website",
      submenu: [
        {
          label: "Go to Website",
          click: () => shell.openExternal("https://masteracnolo.github.io/FreedomLoader/"),
        },
      ],
    },
    {
      label: "Documentation",
      submenu: [
        {
          label: "Go to Wiki",
          click: () => shell.openExternal("https://masteracnolo.github.io/FreedomLoader/pages/wiki.html"),
        },
      ],
    },
    
  ];

  const defaultMenu = Menu.getApplicationMenu();
  const mergedTemplate = defaultMenu
    ? [...defaultMenu.items.map(item => item), ...menuTemplate]
    : menuTemplate;

  Menu.setApplicationMenu(Menu.buildFromTemplate(mergedTemplate));
}

// App ready
app.whenReady().then(async () => {
  logSessionStart();
  logger.info("App Ready, Server Express starting...");

  const serverPath = path.join(__dirname, "server", "server.js");
  const expressServer = require(serverPath);

  try {
    await expressServer.startServer();
    logger.info("Express Server Started");

    const { startRPC } = require("./server/discordRPC");
    startRPC();

    await createMainWindow();
    AutoUpdater(mainWindow);
    setupMenu();
  } catch (err) {
    logger.error("Window or Server error :", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  logger.info("All Window Closed, shuting down app");
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => logSessionEnd());
