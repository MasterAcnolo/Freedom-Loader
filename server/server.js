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

const express = require("express");        // framework web
const { exec } = require("child_process"); // si besoin d’exécuter des commandes (pas utilisé ici directement)
const fs = require("fs");                  // accès au système de fichiers
const path = require("path");              // gestion de chemins
const debug = require("debug")("freedom-loader:server"); 
// petit debugger coloré en console

const { logger, logSessionStart, logSessionEnd } = require("./logger");
// récupère notre logger Winston + helpers de session

const app = express(); // instancie l'application Express

// logSessionStart(); // désactivé, mais pourrait logguer le début de session

// on définit le dossier de téléchargement dans le dossier Téléchargements de l’utilisateur
const downloadsPath = path.join(process.env.USERPROFILE, "Downloads");
const outputFolder = path.join(downloadsPath, "Freedom Loader Output");

// création du dossier s’il n’existe pas
if (!fs.existsSync(outputFolder)) {
  try {
    fs.mkdirSync(outputFolder, { recursive: true });
    logger.info("Dossier Freedom Loader Output cree dans Telechargements.");
  } catch (err) {
    logger.error("Impossible de creer le dossier :", err);
    process.exit(1); // arrêt du programme en cas d’échec
  }
} else {
  logger.info("Dossier Freedom Loader Output deja existant.");
}

// on rend ce dossier dispo via app.locals
app.locals.outputFolder = outputFolder;

// configuration pour parser les requêtes POST en urlencoded
app.use(express.urlencoded({ extended: true }));

// sert les fichiers statiques (frontend)
const staticPath = path.join(__dirname, "../public");
debug("Serveur statique sur", staticPath);
app.use(express.static(staticPath));

// enregistre les routes API
const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");
debug("Routes /download et /info installees");
app.use("/download", downloadRoute);
app.use("/info", infoRoute);

// route GET / de base
app.get("/", (req, res) => {
  debug("Requete GET / servie");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// fonction pour démarrer le serveur (Promise pour pouvoir await ailleurs)
function startServer() {
  return new Promise((resolve, reject) => {
    logger.info("Demarrage du serveur Express...");
    const serverInstance = app.listen(8080, () => {
      logger.info("Serveur Express pret sur http://localhost:8080");
      resolve(serverInstance); // succès
    });
    serverInstance.on("error", (err) => {
      logger.error("Erreur serveur Express :", err);
      reject(err);
    });
  });
}

// gestion de la fermeture propre du process
// process.on("exit", () => {
//   logSessionEnd();
// });
process.on("SIGINT", () => {   // Ctrl+C
  logSessionEnd();
  process.exit();
});
process.on("SIGTERM", () => {  // kill
  logSessionEnd();
  process.exit();
});

// on exporte la fonction startServer pour que d’autres modules puissent la lancer
module.exports = { startServer };
