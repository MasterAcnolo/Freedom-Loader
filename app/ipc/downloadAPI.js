const {ipcMain, dialog} = require("electron");

const {logger} = require("../../server/logger");
const { validateDownloadPath, getDefaultDownloadPath } = require("../pathValidator");

function registerDownloadAPIHandlers(getMainWindow)  {
    /**
     * Opens native folder selection dialog and validates selected path.
     *
     * Ensures:
     * - user cancellation is handled safely
     * - selected path is validated against security rules
     * - unsafe directories are rejected
     */
    ipcMain.handle("select-download-folder", async () => {
        const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
        if (result.canceled) {
            logger.info("Folder selection cancelled by user");
            return null;
        }
        try {
            const validated = validateDownloadPath(result.filePaths[0]);
            logger.info(`Folder selected and validated: ${validated}`);
            return validated;
        } catch (err) {
            logger.warn(`Unsafe or invalid folder rejected: ${err.message}`);
            throw err;
        }
    });

    ipcMain.handle("validate-download-path", (_, userPath) => validateDownloadPath(userPath));
    ipcMain.handle("get-default-download-path", () => getDefaultDownloadPath());

    /**
     * Updates Windows/macOS taskbar progress indicator.
     *
     * @param {number} percent - Progress value (0–100)
     */
    ipcMain.on("set-progress", (_, percent) => {
        getMainWindow()?.setProgressBar(percent / 100);
    });
}

module.exports = {
    registerDownloadAPIHandlers,
};