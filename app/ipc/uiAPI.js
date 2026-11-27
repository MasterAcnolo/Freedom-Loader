const {ipcMain, shell} = require("electron");
const { featuresPath } = require("../../config");
const config = require("../../config");

function registerUiAPIHandlers()  {
    /**
     * Returns application version from config.
     */
    ipcMain.handle("version", () => config.version);

    /**
     * Opens configuration folder in system file explorer.
     */
    ipcMain.on("open-config", () => shell.openPath(featuresPath));

}

module.exports = {
    registerUiAPIHandlers,
};