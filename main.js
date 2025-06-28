const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Charge ton frontend côté serveur Express
  win.loadURL("http://localhost:8080");  // Express tournera comme d’habitude
}

app.whenReady().then(() => {
  // lancer Express avant d’ouvrir Electron
  const expressServer = require("./server/server.js");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
