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
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
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