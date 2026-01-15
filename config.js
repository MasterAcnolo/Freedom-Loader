const packageJson = require("./package.json");
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const localMode = !app.isPackaged;

const featuresPath = localMode ? path.join(__dirname, "./config/config.json") : path.join(path.join(process.resourcesPath, "config.json"));

let features = {};

function loadFeatures() {
    const raw = fs.readFileSync(featuresPath, "utf-8");
    features = JSON.parse(raw);
    console.log(features)
    return features;
}

const configFeatures = loadFeatures();

module.exports = {
    version: packageJson.version,
    applicationPort: "8787",
    debugMode: true,
    localMode,
    DiscordRPCID: "1410934537051181146",
    configFeatures
}