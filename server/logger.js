const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("../config")

// Dossier de logs Windows
const logDir = path.join(os.homedir(), "AppData", "Local", "FreedomLoader", "logs");

// Création du dossier si nécessaire
fs.mkdirSync(logDir, { recursive: true });

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `${timestamp} | ${level.toUpperCase()} |  ${message}`)
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
      format: logFormat,
    }),
  ],
});

function getSessionStartLine() {
  return `--- Démarrage de la session : ${new Date().toISOString()} ---`;
}

function getSessionEndLine() {
  return `--- Fin de la session : ${new Date().toISOString()} ---`;
}

function logSessionStart() {
  logger.info(getSessionStartLine());
  logger.info(`Version de l'Application: ${config.version}`)
}

function logSessionEnd() {
  logger.info(getSessionEndLine());
}

module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
  logDir,
};