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

const express = require("express");        // Framework web pour créer l’API et servir les fichiers
const { exec } = require("child_process"); // Permet d’exécuter des commandes systèmes (pas utilisé directement ici)
const fs = require("fs");                  // Module système pour gérer fichiers et dossiers
const path = require("path");              // Gestion propre des chemins de fichiers et dossiers
const debug = require("debug")("freedom-loader:server"); 
// Module de debug coloré en console, pratique pour dev

const { logger, logSessionStart, logSessionEnd } = require("./logger");
// Import du logger Winston et helpers pour marquer début/fin de session

const app = express(); // Création de l’instance Express, notre serveur web

// Définition du dossier par défaut où enregistrer les téléchargements
// On prend le dossier Téléchargements de l’utilisateur Windows (USERPROFILE)
const downloadsPath = path.join(process.env.USERPROFILE, "Downloads");
const outputFolder = path.join(downloadsPath, "Freedom Loader Output");

// Création du dossier de sortie s’il n’existe pas déjà
if (!fs.existsSync(outputFolder)) {
  try {
    fs.mkdirSync(outputFolder, { recursive: true }); // création récursive au cas où
    logger.info("Dossier Freedom Loader Output cree dans Telechargements.");
  } catch (err) {
    logger.error("Impossible de creer le dossier :", err);
    process.exit(1); // Arrêt du programme si dossier non créé (critique)
  }
} else {
  logger.info("Dossier Freedom Loader Output deja existant.");
}

// On rend ce dossier accessible globalement via app.locals pour l’utiliser dans les routes
app.locals.outputFolder = outputFolder;

// Middleware pour parser le corps des requêtes POST en application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Définition du dossier contenant les fichiers statiques (frontend)
// Permet d’accéder au HTML, CSS, JS côté client
const staticPath = path.join(__dirname, "../public");
debug("Serveur statique sur", staticPath);
app.use(express.static(staticPath));

// Import et enregistrement des routes API
// Ces routes gèrent les requêtes pour les infos vidéo et téléchargement
const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");
debug("Routes /download et /info installees");
app.use("/download", downloadRoute);
app.use("/info", infoRoute);

// Route GET / qui sert la page principale index.html
app.get("/", (req, res) => {
  debug("Requete GET / servie");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Fonction pour démarrer le serveur Express
// Retourne une Promise pour pouvoir await le démarrage dans d’autres modules
function startServer() {
  return new Promise((resolve, reject) => {
    logger.info("Demarrage du serveur Express...");
    const serverInstance = app.listen(8080, () => {
      logger.info("Serveur Express pret sur http://localhost:8080");
      resolve(serverInstance); // Serveur prêt, on résout la promesse
    });
    // Gestion des erreurs serveur lors du démarrage
    serverInstance.on("error", (err) => {
      logger.error("Erreur serveur Express :", err);
      reject(err); // Rejet de la promesse en cas d’erreur critique
    });
  });
}

// Gestion propre de la fermeture du process pour logger la fin de session
process.on("SIGINT", () => {   // Capture Ctrl+C (interruption)
  logSessionEnd();
  process.exit();
});
process.on("SIGTERM", () => {  // Capture kill ou arrêt du process
  logSessionEnd();
  process.exit();
});

// Export de la fonction startServer pour permettre son appel depuis d’autres fichiers
module.exports = { startServer };
