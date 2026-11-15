const {ipcMain, dialog} = require("electron");

const {logger} = require("../../server/logger");
const { validateDownloadPath, getDefaultDownloadPath } = require("../pathValidator");
const { startDownload } = require("../../server/controller/download.controller");
const { cancelDownload } = require("../../server/services/download.services");

function registerDownloadAPIHandlers(getMainWindow)  {
    ipcMain.handle("start-download", async (_, options) => {
        try {
            return await startDownload(options);
        } catch (err) {
            logger.error(`Download IPC error: ${err?.message ?? err}`);
            throw Object.assign(
                new Error(err?.message || "Server Error"),
                {code: err?.message === "Download already in progress"
                    ? "DOWNLOAD_IN_PROGRESS"
                    : err?.code || "DOWNLOAD_FAILED"}
            );
        }
    });

    ipcMain.handle("cancel-download", () => {
        if (cancelDownload()) {
            return {success: true, message: "Download stopped! Queue cleared."};
        }

        throw Object.assign(new Error("No download in progress !"), {
            code: "NO_DOWNLOAD_IN_PROGRESS",
        });
    });

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