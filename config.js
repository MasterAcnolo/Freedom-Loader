const packageJson = require("./package.json");
const { app } = require("electron");

module.exports = {
    version: packageJson.version,
    applicationPort: "8787",
    debugMode: true,
    localMode: !app.isPackaged,
    DiscordRPCID: "1410934537051181146",
}