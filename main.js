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
app.disableHardwareAcceleration(); // Désactive l'accélération GPU pour éviter les erreurs GPU sur certains systèmes
const path = require("path");
const os = require("os");
const { logger, logSessionStart, logSessionEnd, logDir } = require("./server/logger");

let mainWindow;
// Utilise le vrai dossier de logs défini dans logger.js
const logsFolderPath = logDir;
app.setAppUserModelId("com.masteracnolo.freedomloader"); /* Pour la notif */
/*
  Fonction principale qui crée la fenêtre principale de l'application.
  Elle évite la création multiple et configure les dimensions et options de la fenêtre.
  Charge l'URL locale du serveur Express et gère les erreurs éventuelles.
*/
async function createWindow() {
  logger.info("Création de la fenêtre...");

  if (mainWindow) {
    logger.warn("La fenêtre existe déjà, pas de nouvelle création");
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
      preload: path.join(__dirname, "preload.js"), // Chargement du preload script sécurisé
    },
    // titleBarStyle: 'hidden', // Option possible pour une barre de titre personnalisée
  });

  try {
    await mainWindow.loadURL("http://localhost:8080");
    logger.info("Fenêtre chargée");
  } catch (err) {
    logger.error("Erreur chargement fenêtre:", err);
  }

  // Événement déclenché à la fermeture de la fenêtre principale
  mainWindow.on("closed", () => {
    logger.info("Fenêtre principale fermée");
    mainWindow = null;
  });
}

/*
  Définition du chemin par défaut pour les téléchargements.
  Ici, on utilise le dossier 'Downloads' de l'utilisateur avec un sous-dossier spécifique à l'application.
*/
const defaultDownloadPath = path.join(os.homedir(), "Downloads", "Freedom Loader");

/*
  Gestionnaire IPC qui permet au renderer de demander à l'utilisateur
  de sélectionner un dossier via une boîte de dialogue native.
  On retourne le chemin sélectionné ou null si annulation.
*/
ipcMain.handle("select-download-folder", async () => {
  logger.info("Demande de sélection d'un dossier reçue depuis le renderer");
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
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

/*
  Gestionnaire IPC pour exposer au renderer le chemin par défaut de téléchargement
  afin qu'il puisse l'afficher ou l'utiliser comme valeur initiale.
*/
ipcMain.handle("get-default-download-path", () => {
  return defaultDownloadPath;
});

/*
  Événement déclenché quand l'application est prête.
  On démarre le serveur Express, puis on crée la fenêtre principale.
  En cas d'erreur, on log et on quitte l'application proprement.
*/
app.whenReady().then(async () => {
  logSessionStart();
  logger.info("App prête, démarrage du serveur Express...");
  const expressServer = require("./server/server.js");
  try {
    await expressServer.startServer();
    logger.info("Serveur Express démarré");
    await createWindow();

    // Ajout du menu personnalisé
    const menuTemplate = [
      // ... Menu standard Electron ...
      {
        label: "Logs",
        submenu: [
          {
            label: "Ouvrir les logs",
            click: () => {
              shell.openPath(logsFolderPath);
            }
          }
        ]
      }
    ];

    // Fusionner avec le menu par défaut
    const defaultMenu = Menu.getApplicationMenu();
    let template = menuTemplate;
    if (defaultMenu) {
      template = [...Menu.getApplicationMenu().items.map(item => item), ...menuTemplate];
    }
    const finalMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(finalMenu);

  } catch (error) {
    logger.error("Erreur serveur ou fenêtre :", error);
    app.quit();
  }
});

/*
  Quitte l'application lorsque toutes les fenêtres sont fermées,
  sauf sous macOS où il est habituel de garder l'application active.
*/
app.on("window-all-closed", () => {
  logger.info("Toutes fenêtres fermées, quitte l'app");
  if (process.platform !== "darwin") app.quit();
});

/*
  Avant de quitter l'application, on log la fin de session pour traçabilité.
*/
app.on("before-quit", () => {
  logSessionEnd();
});
