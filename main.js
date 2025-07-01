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

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { logger, logSessionStart, logSessionEnd } = require("./server/logger");

let mainWindow;

async function createWindow() {
  logger.info("Creation de la fenetre...");
  
  if (mainWindow) {
    logger.warn("La fenetre existe deja, pas de nouvelle creation");
    return;
  }
  mainWindow = new BrowserWindow({
    title: "Freedom Loader",
    width: 750,
    height: 800,
    minWidth: 750,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // titleBarStyle: 'hidden',
  });

  try {
    await mainWindow.loadURL("http://localhost:8080");
    logger.info("Fenetre chargee");
  } catch (err) {
    logger.error("Erreur chargement fenetre:", err);
  }

  mainWindow.on("closed", () => {
    logger.info("Fenetre principale fermee");
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  logSessionStart(); 
  logger.info("App prete, demarrage du serveur Express...");
  const expressServer = require("./server/server.js");
  try {
    await expressServer.startServer();
    logger.info("Serveur Express demarre");
    await createWindow();
  } catch (error) {
    logger.error("Erreur serveur ou fenetre :", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  logger.info("Toutes fenetres fermees, quitte l'app");
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  logSessionEnd();  
});
