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

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function getSessionStartLine() {
  const now = new Date().toISOString();
  return `--- Démarrage de la session : ${now} ---`;
}

function getSessionEndLine() {
  const now = new Date().toISOString();
  return `--- Fin de la session : ${now} ---`;
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) =>
      `${timestamp} | ${level.toUpperCase()} |  ${message}`
    )
  ),
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,  // tu peux mettre true si tu veux compresser
      maxFiles: "14d",       // conserve les logs des 14 derniers jours
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) =>
          `${timestamp} | ${level.toUpperCase()} |  ${message}`
        )
      ),
      options: { flags: "a" },
    }),
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

function logSessionStart() {
  logger.info(getSessionStartLine());
}

function logSessionEnd() {
  logger.info(getSessionEndLine());
}

module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
};
