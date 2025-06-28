const { app, BrowserWindow } = require("electron");
const path = require("path");

async function createWindow() {
  console.log("🟢 Création de la fenêtre...");
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:8080")
    .then(() => console.log("✅ Fenêtre chargée"))
    .catch(err => console.error("❌ Erreur chargement fenêtre:", err));
}

app.whenReady().then(async () => {
  console.log("🟢 App prête, démarrage du serveur Express...");
  const expressServer = require("./server/server.js");
  try {
    await expressServer.startServer();
    console.log("✅ Serveur Express démarré");
    await createWindow();
  } catch (error) {
    console.error("❌ Erreur serveur ou fenêtre :", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  console.log("🛑 Toutes fenêtres fermées, quitte l'app");
  if (process.platform !== "darwin") app.quit();
});
