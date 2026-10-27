const {getMainWindow} = require("./windowManager");

/**
 * Sends a toast notification to the renderer UI when the main window is ready.
 *
 * @param {string} message
 * @param {"success"|"error"|"warning"|"info"} [type="info"]
 * @param {number} [duration=4000]
 * @returns {boolean} Whether the toast was sent.
 */
function sendToast(message, type = "info", duration = 4000) {
    const mainWindow = getMainWindow();

    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isDestroyed()) {
        return false;
    }

    mainWindow.webContents.send("show-toast", {message, type, duration});
    return true;
}

module.exports = {sendToast};
