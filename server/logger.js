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

/**
 * Start Log Session 
 */
function logSessionStart(logDir, downloadPath) {
  logger.info(`--- Starting session: ${new Date().toISOString()} ---`);
  logger.info(`Application Version: ${config.version}`)
  logSystemInfo(logger, logDir, downloadPath)
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