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
// on importe Winston (logger populaire pour Node.js)

const DailyRotateFile = require("winston-daily-rotate-file"); 
// plugin pour Winston qui permet la rotation automatique des fichiers de logs

const fs = require("fs");       // pour vérifier/créer le dossier de logs
const path = require("path");   // pour gérer proprement les chemins

// on définit le dossier de logs
const logDir = path.join(__dirname, "../logs");
// on le crée si inexistant
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// fonction pour générer une ligne de début de session (date ISO)
function getSessionStartLine() {
  const now = new Date().toISOString();
  return `--- Démarrage de la session : ${now} ---`;
}

// fonction pour générer une ligne de fin de session (date ISO)
function getSessionEndLine() {
  const now = new Date().toISOString();
  return `--- Fin de la session : ${now} ---`;
}

// configuration principale de Winston
const logger = createLogger({
  level: "info", // niveau de log minimum (info, warn, error, etc.)
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // timestamp lisible
    format.printf(({ timestamp, level, message }) =>
      `${timestamp} | ${level.toUpperCase()} |  ${message}` // format de ligne de log
    )
  ),
  transports: [
    new DailyRotateFile({
      dirname: logDir,                     // dossier de logs
      filename: "combined-%DATE%.log",     // nom de fichier journalier
      datePattern: "YYYY-MM-DD",           // pattern de rotation
      zippedArchive: false,                // true = compression des archives
      maxFiles: "14d",                     // garde 14 jours d’historique
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} | ${level.toUpperCase()} |  ${message}`
        )
      ),
      options: { flags: "a" },             // mode append
    }),
    new transports.Console({
      // sortie console colorisée (dev en local)
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "HH:mm:ss" }), // horodatage plus court
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} | ${level} |  ${message}`
        )
      ),
    }),
  ],
});

// fonction d'utilitaire pour marquer le début de la session
function logSessionStart() {
  logger.info(getSessionStartLine());
}

// idem pour la fin de la session
function logSessionEnd() {
  logger.info(getSessionEndLine());
}

// exporte le logger et les helpers pour les autres modules
module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
};
