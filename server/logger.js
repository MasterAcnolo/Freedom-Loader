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

const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");       // Pour vérifier/créer le dossier de logs
const path = require("path");   // Pour gérer proprement les chemins
const os = require("os");       // Pour gérer les chemins aussi 

// Définition du dossier où seront stockés les logs
// const logDir = path.join(__dirname, "../logs"); Désactivé parce que cela requiert d'exec en admin mode. Donc pas pratique pour les gens

let logDir;
if (process.platform === "win32") {
  logDir = path.join(os.homedir(), "AppData", "Local", "FreedomLoader", "logs");
} else {
  logDir = path.join(os.homedir(), ".freedomloader", "logs");
}

// Création du dossier logs s’il n’existe pas encore
//if (!fs.existsSync(logDir)) fs.mkdirSync(logDir); OBSOLETE

fs.mkdirSync(logDir, { recursive: true }); // Evite les erreurs 


// Fonction utilitaire pour générer une ligne indiquant le début d’une session de logs
function getSessionStartLine() {
  const now = new Date().toISOString();
  return `--- Démarrage de la session : ${now} ---`;
}

// Fonction utilitaire pour générer une ligne indiquant la fin d’une session de logs
function getSessionEndLine() {
  const now = new Date().toISOString();
  return `--- Fin de la session : ${now} ---`;
}

// Configuration principale de Winston
// - Niveau minimum d’écriture : info (enregistre info, warn, error, etc.)
// - Formatage des logs avec timestamp lisible et format personnalisé
// - Transports : écriture dans fichier journalier + console avec couleurs
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) =>
      `${timestamp} | ${level.toUpperCase()} |  ${message}`
    )
  ),
  transports: [
    // Rotation quotidienne des fichiers de logs
    new DailyRotateFile({
      dirname: logDir,                  // dossier cible pour les logs
      filename: "LOGS-%DATE%.log",     // nom du fichier par date
      datePattern: "YYYY-MM-DD",       // pattern de date dans le nom
      zippedArchive: false,            // ne pas compresser les archives
      maxFiles: "7d",                 // conserve 14 jours d’historique
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} | ${level.toUpperCase()} |  ${message}`
        )
      ),
      options: { flags: "a" },         // mode ajout à la fin (append)
    }),
    // Affichage des logs en console avec coloration et format simple
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} | ${level} |  ${message}`
        )
      ),
    }),
  ],
});

// Helper pour marquer clairement le début de session dans les logs
function logSessionStart() {
  logger.info(getSessionStartLine());
}

// Helper pour marquer la fin de session dans les logs
function logSessionEnd() {
  logger.info(getSessionEndLine());
}

// Export du logger principal et des helpers pour usage dans d’autres modules
module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
};
