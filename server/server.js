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
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const debug = require("debug")("freedom-loader:server");
const { logger, logSessionStart, logSessionEnd } = require("./logger");

const app = express();

// // Lancement d'une nouvelle session de log
// logSessionStart();

// dossier de sortie
const downloadsPath = path.join(process.env.USERPROFILE, "Downloads");
const outputFolder = path.join(downloadsPath, "Freedom Loader Output");

if (!fs.existsSync(outputFolder)) {
  try {
    fs.mkdirSync(outputFolder, { recursive: true });
    logger.info("Dossier Freedom Loader Output cree dans Telechargements.");
  } catch (err) {
    logger.error("Impossible de creer le dossier :", err);
    process.exit(1);
  }
} else {
  logger.info("Dossier Freedom Loader Output deja existant.");
}

app.locals.outputFolder = outputFolder;
app.use(express.urlencoded({ extended: true }));

const staticPath = path.join(__dirname, "../public");
debug("Serveur statique sur", staticPath);
app.use(express.static(staticPath));

// routes
const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");
debug("Routes /download et /info installees");
app.use("/download", downloadRoute);
app.use("/info", infoRoute);

app.get("/", (req, res) => {
  debug("Requete GET / servie");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

function startServer() {
  return new Promise((resolve, reject) => {
    logger.info("Demarrage du serveur Express...");
    const serverInstance = app.listen(8080, () => {
      logger.info("Serveur Express pret sur http://localhost:8080");
      resolve(serverInstance);
    });
    serverInstance.on("error", (err) => {
      logger.error("Erreur serveur Express :", err);
      reject(err);
    });
  });
}

// Gestion propre de la fin de session à la fermeture du process
// process.on("exit", () => {
//   logSessionEnd();
// });
process.on("SIGINT", () => {
  logSessionEnd();
  process.exit();
});
process.on("SIGTERM", () => {
  logSessionEnd();
  process.exit();
});

module.exports = { startServer };
