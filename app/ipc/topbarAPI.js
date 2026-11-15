const {ipcMain, shell} = require("electron");
const { configFeatures } = require("../../config");
const { logger, logDir } = require("../../server/logger");
const { userThemesPath } = require("../../server/helpers/path.helpers");

function registerTopbarAPIHandlers(getMainWindow) {

    /**
     * Window minimize request from renderer.
     */
    ipcMain.on("window-minimize", () => {
        // Minimize to tray
        if (configFeatures.systemTray) {
            getMainWindow()?.hide();
            logger.info("Window Minimized in SystemTray (Using Minimize Button)");
        } else {
            // Native minimize
            getMainWindow()?.minimize();
            logger.info("Window minimized normally");
        }
    });

    /**
     * Toggles maximize/unmaximize state of main window.
     */
    ipcMain.on("window-maximize", () => {
        const win = getMainWindow();
        if (!win) return;
        win.isMaximized() ? win.unmaximize() : win.maximize();
    });

    /**
     * Closes the main application window.
     */
    ipcMain.on("window-close", () => getMainWindow()?.close());


    /**
     * Opens Chromium DevTools in detached mode.
     */
    ipcMain.on("open-devtools", () =>
        getMainWindow()?.webContents.openDevTools({ mode: "detach" })
    );

    /**
     * Opens application logs directory in system file explorer.
     */
    ipcMain.on("open-logs", () => logDir && shell.openPath(logDir));

    /**
     * Opens external website in default browser.
     */
    ipcMain.on("open-website", () =>
        shell.openExternal("https://freedomloader.acnolo.fr/")
    );

    /**
     * Opens official wiki page in external browser.
     */
    ipcMain.on("open-wiki", () =>
        shell.openExternal("https://freedomloader.acnolo.fr/wiki")
    );

    /**
     * Opens workshop page in external browser.
     */
    ipcMain.on("open-workshop", () =>
        shell.openExternal("https://masteracnolo.github.io/Freedom-Loader-Workshop")
    );

    /**
     * Opens the theme directory in the file explorer.
     */
    ipcMain.on("open-theme", () => shell.openPath(userThemesPath));

}

module.exports = {
    registerTopbarAPIHandlers,
};