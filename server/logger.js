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
const fs = require("fs");
const path = require("path");
const os = require("os");

// Dossier de logs Windows
const logDir = path.join(os.homedir(), "AppData", "Local", "FreedomLoader", "logs");

// Création du dossier si nécessaire
fs.mkdirSync(logDir, { recursive: true });

// Format commun pour tous les logs
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `${timestamp} | ${level.toUpperCase()} |  ${message}`)
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `${timestamp} | ${level} |  ${message}`)
);

// Configuration du logger
const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "LOGS-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "7d",
      format: logFormat,
      options: { flags: "a" },
    }),
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Helpers pour sessions
function getSessionStartLine() {
  return `--- Démarrage de la session : ${new Date().toISOString()} ---`;
}

function getSessionEndLine() {
  return `--- Fin de la session : ${new Date().toISOString()} ---`;
}

function logSessionStart() {
  logger.info(getSessionStartLine());
}

function logSessionEnd() {
  logger.info(getSessionEndLine());
}

// Export
module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
  logDir,
};
