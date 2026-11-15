const {ipcMain} = require("electron");
const { reloadThemes, getThemes } = require("../themeManager");

function registerThemeAPIHandlers(){

    /**
     * Retrieves available themes from filesystem.
     */
    ipcMain.handle("get-themes", () => getThemes());

    /**
     * Reloads themes from disk dynamically.
     */
    ipcMain.handle("reload-themes", async () => {
        return await reloadThemes();
    });
}

module.exports = {
    registerThemeAPIHandlers
};