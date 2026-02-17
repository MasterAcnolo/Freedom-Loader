const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("../config");

// Dossier de logs Windows
const logDir = path.join(os.homedir(), "AppData", "Local", "FreedomLoader", "logs");

// Création du dossier "logs" si nécessaire
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  console.error(`Failed to create log directory: ${error.message}`);
}

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

function logSessionStart() {
  logger.info(`--- Starting session: ${new Date().toISOString()} ---`);
  logger.info(`Application Version: ${config.version}`)
}

function logSessionEnd() {
  logger.info(`--- Ending session: ${new Date().toISOString()} ---`);
}

module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
  logDir,
};