const packageJson = require("./package.json");
const { app } = require("electron");

module.exports = {
    version: packageJson.version,
    applicationPort: "8787",
    debugMode: true,
    localMode: !app.isPackaged,
    DiscordRPCID: "1410934537051181146",

    // Variables Used to toggle main features
    autoUpdate: true,
    discordRPC: true,
    customTopBar: true, // (Will be active on next launch)
    autoDownloadPlaylist: true,
    logSystem: true, // Disable = Dangerous 
    autoCheckInfo: true, // To Improve speed ? (NO)
    outputTitleCheck: true, // For Non latin characters (Russian)
    addThumbail: true, // The Pictures in the files (audio files)
    addMetadata: true, // Looks Explicit
    downloadSystem: true, // Why would you disable this ? I don't know but why not
    notifySystem: true // Notification when download 
}