const { ipcMain, shell } = require("electron");
const { isUpdateAvailable, downloadUpdate, installUpdate } = require("../autoUpdater");

function registerUpdaterAPIHandlers() {
    ipcMain.handle("is-update-available", () => {
        return isUpdateAvailable();
    });

    ipcMain.handle("download-update", async () => {
        return await downloadUpdate();
    });

    ipcMain.handle("install-update", async () => {
        return installUpdate();
    });

    ipcMain.on("open-release-page", () => {
        shell.openExternal(
            "https://github.com/MasterAcnolo/Freedom-Loader/releases/latest",
        );
    });
}

module.exports = {
    registerUpdaterAPIHandlers
};