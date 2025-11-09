/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require("electron");
const path = require("path");
const os = require("os");
const { logger, logSessionStart, logSessionEnd, logDir } = require("./server/logger");

app.disableHardwareAcceleration(); // safe sur GPU old / soucis Electron

let mainWindow;
const logsFolderPath = logDir;
const defaultDownloadPath = path.join(os.homedir(), "Downloads", "Freedom Loader");

app.setAppUserModelId("com.masteracnolo.freedomloader"); // pour notifications Windows

// ---------- FENÊTRE ---------- //
async function createWindow() {
  if (mainWindow) {
    logger.warn("La fenêtre existe déjà, pas de nouvelle création");
    return;
  }

  mainWindow = new BrowserWindow({
    title: "Freedom Loader 1.3.0",
    width: 750,
    height: 800,
    minWidth: 750,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  try {
    await mainWindow.loadURL(`http://localhost:8787`);
    logger.info("Fenêtre chargée");
  } catch (err) {
    logger.error("Erreur chargement fenêtre:", err);
  }

  mainWindow.on("closed", () => {
    logger.info("Fenêtre principale fermée");
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
    logger.error(`Erreur lors de la sélection de dossier : ${err.message}`);
    return null;
  }
});

ipcMain.handle("get-default-download-path", () => defaultDownloadPath);

function setupMenu() {
  const menuTemplate = [
    {
      label: "Logs",
      submenu: [
        {
          label: "Ouvrir les logs",
          click: () => shell.openPath(logsFolderPath),
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

app.whenReady().then(async () => {
  logSessionStart();
  logger.info("App prête, démarrage du serveur Express...");

  const expressServer = require("./server/server.js");
  try {
    await expressServer.startServer();
    logger.info("Serveur Express démarré");
    await createWindow();
    setupMenu();
  } catch (err) {
    logger.error("Erreur serveur ou fenêtre :", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  logger.info("Toutes fenêtres fermées, quitte l'app");
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => logSessionEnd());
