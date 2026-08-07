const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("../config");
const {isWindows} = require("./helpers/path.helpers");
const { logSystemInfo } = require("./sysinfo");

// Logs folder in Windows
const logDir = isWindows ? path.join(os.homedir(), "AppData", "Local", "FreedomLoader", "logs") : path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"),  "FreedomLoader", "logs");

// Create "Logs" folder if needed
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  console.error(`Failed to create log directory: ${error.message}`);
}

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `${timestamp} | ${level.toUpperCase()} |  ${message}`)
);

/**
 * Format used by the saved file
 * @type {Format}
 */
const fileFormat = format.combine(
    format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
    format.errors({stack: true}), // Capture la stack trace complète des erreurs
    format.printf(({timestamp, level, message, stack}) => {
      return `${timestamp} | ${level.toUpperCase()} | ${stack || message}`;
    })
);

/**
 * Formated used by the IDE/Console
 * @type {Format}
 */
const consoleFormat = format.combine(
    format.colorize({all: true}),
    format.timestamp({format: "HH:mm:ss"}),
    format.errors({stack: true}),
    format.printf(({timestamp, level, message, stack}) => {
      return `[${timestamp}] ${level}: ${stack || message}`;
    })
);

/**
 * Logger Instance with differents types
 *  - info
 *  - error
 *  - warn 
 * 
 * You need to specify the text that need to be displayed
 * @param string
 */
const logger = createLogger({
  level: "info",
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "LOGS-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "7d",
      format: fileFormat,
      options: { flags: "a" },
    }),
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

/**
 * Start Log Session 
 */
function logSessionStart(logDir, downloadPath) {
  logger.info(`--- Starting session: ${new Date().toISOString()} ---`);
  logger.info("============================================================")
  logger.info(`Application Version: ${config.version}`)
  if (typeof logSystemInfo === 'function') logSystemInfo(logger, logDir, downloadPath);
}

/**
 * Stop Log Session
 */
function logSessionEnd() {
  logger.info(`--- Ending session: ${new Date().toISOString()} ---`);
}

module.exports = {
  logger,
  logSessionStart,
  logSessionEnd,
  logDir,
};