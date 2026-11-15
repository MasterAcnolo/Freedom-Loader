const {ipcMain, shell} = require("electron");
const { featuresPath } = require("../../config");
const {config} = require("../../config");
const { getChangelog, markChangelogSeen} = require("../changelogManager");

function registerUiAPIHandlers()  {
    /**
     * Returns application version from config.
     */
    ipcMain.handle("version", () => config.version);

    /**
     * Retrieves the changelog from cache or GitHub API.
     */
    ipcMain.handle("get-changelog", () => getChangelog());

    /**
     * Marks all changelog entries as seen and updates cache.
     */
    ipcMain.handle("mark-changelog-seen", () => markChangelogSeen());


    /**
     * Opens configuration folder in system file explorer.
     */
    ipcMain.on("open-config", () => shell.openPath(featuresPath));

}

module.exports = {
    registerUiAPIHandlers,
};