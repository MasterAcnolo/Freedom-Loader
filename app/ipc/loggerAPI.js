const {ipcMain} = require("electron");
const { logger } = require("../../server/logger");

function registerLoggerAPIHandlers(){

  /**
   * Front end logger
   */
  ipcMain.on("log-error", (_, message) => logger.error(`[Frontend] ${message}`));
  ipcMain.on("log-info", (_, message) => logger.info(`[Frontend] ${message}`));
  ipcMain.on("log-warn", (_, message) => logger.warn(`[Frontend] ${message}`));

}

module.exports = {
    registerLoggerAPIHandlers    
};