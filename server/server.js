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

const express = require("express");
const fs = require("fs");
const path = require("path");
const { logger, logSessionStart, logSessionEnd } = require("./logger");
const debug = require("debug")("freedom-loader:server");

const app = express();

const PORT = 8787; // Port de l'app

// Dossier de téléchargement Windows
const downloadsPath = path.join(process.env.USERPROFILE, "Downloads");
const outputFolder = path.join(downloadsPath, "Freedom Loader");

// Création du dossier si inexistant
if (!fs.existsSync(outputFolder)) {
  try {
    fs.mkdirSync(outputFolder, { recursive: true });
    logger.info("Dossier Freedom Loader créé dans Téléchargements.");
  } catch (err) {
    logger.error("Impossible de créer le dossier :", err);
    process.exit(1);
  }
} else {
  logger.info("Dossier Freedom Loader déjà existant.");
}

app.locals.outputFolder = outputFolder;

app.use(express.urlencoded({ extended: true })); // Middleware pour parser les POST en x-www-form-urlencoded

// Fichiers statiques (frontend)
const staticPath = path.join(__dirname, "../public");
debug("Serveur statique sur", staticPath);
app.use(express.static(staticPath));

// Routes API
const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");
debug("Routes /download et /info installées");
app.use("/download", downloadRoute);
app.use("/info", infoRoute);

// Route principale
app.get("/", (req, res) => {
  debug("Requête GET / servie");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Fonction pour démarrer le serveur Express
async function startServer() {
  return new Promise((resolve, reject) => {
    logSessionStart(); // Début de session

    const serverInstance = app.listen(PORT, () => {
      logger.info(`Serveur Express prêt sur http://localhost:${PORT}`);
      resolve(serverInstance);
    });

    // Gestion des erreurs serveur
    serverInstance.on("error", (err) => {
      logger.error("Erreur serveur Express :", err);
      reject(err);
    });

    // Gestion propre de la fermeture du serveur
    const gracefulExit = () => {
      logSessionEnd();
      serverInstance.close(() => {
        logger.info("Serveur Express fermé proprement.");
        process.exit();
      });
    };

    process.on("SIGINT", gracefulExit);
    process.on("SIGTERM", gracefulExit);
  });
}

// Export de startServer
module.exports = { startServer };

// Lancement du Discord RPC après que le serveur soit prêt
(async () => {
  const { startRPC } = require("./discordRPC");
  await startServer(); // on attend que le serveur démarre
  startRPC();
})();
