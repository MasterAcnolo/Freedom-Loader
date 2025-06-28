const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

// import des routes
const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");

// Chemin vers le dossier Téléchargements de l'utilisateur
const downloadsPath = path.join(process.env.USERPROFILE, 'Downloads');

// Créer un sous-dossier "Freedom Loader Output" dans le dossier Téléchargements
const outputFolder = path.join(downloadsPath, 'Freedom Loader Output');

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
  console.log("✅ Dossier Freedom Loader Output créé dans Téléchargements.");
}

// rendre le chemin accessible à tes routes
app.locals.outputFolder = outputFolder;

app.use(express.urlencoded({ extended: true }));

// servir le dossier public comme site
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../public")));


// routes
app.use("/download", downloadRoute); // ex: /download
app.use("/info", infoRoute);         // ex: /info

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Export d'une fonction startServer qui retourne une promesse
function startServer() {
  return new Promise((resolve, reject) => {
    console.log("🟢 Démarrage du serveur Express...");
    const serverInstance = app.listen(8080, () => {
      console.log("🟢 Serveur Express prêt sur http://localhost:8080");
      resolve(serverInstance);
    });
    serverInstance.on('error', (err) => {
      console.error("❌ Erreur serveur Express :", err);
      reject(err);
    });
  });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
module.exports = { startServer };
