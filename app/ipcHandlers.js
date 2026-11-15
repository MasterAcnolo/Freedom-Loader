const {registerLoggerAPIHandlers} = require("./ipc/loggerAPI");
const {registerFeatureAPIHandlers} = require("./ipc/featureAPI");
const {registerInfoAPIHandlers} = require("./ipc/infoAPI");
const {registerDownloadAPIHandlers} = require("./ipc/downloadAPI");
const {registerThemeAPIHandlers} = require("./ipc/themeAPI");
const {registerTopbarAPIHandlers} = require("./ipc/topbarAPI");
const {registerUpdaterAPIHandlers} = require("./ipc/updaterAPI");
const {registerReportBugAPIHandlers} = require("./ipc/reportBugAPI");
const {registerUiAPIHandlers} = require("./ipc/uiAPI");

/**
 * Registers all IPC handlers and event listeners for Electron main process.
 *
 * This function wires renderer → main communication channels:
 * - synchronous queries (handle)
 * - fire-and-forget events (on)
 *
 * @param {Function} getMainWindow - Function returning current BrowserWindow instance
 */
function registerIpcHandlers(getMainWindow) {

  registerLoggerAPIHandlers();
  registerFeatureAPIHandlers();
  registerInfoAPIHandlers();
  registerDownloadAPIHandlers(getMainWindow);
  registerThemeAPIHandlers();
  registerTopbarAPIHandlers(getMainWindow);
  registerUpdaterAPIHandlers();
  registerReportBugAPIHandlers();
  registerUiAPIHandlers();
}

module.exports = { registerIpcHandlers };
