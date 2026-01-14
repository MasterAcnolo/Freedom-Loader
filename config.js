const packageJson = require("./package.json");
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const featuresPath = path.join(__dirname, "./config/config.json");

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
    localMode: !app.isPackaged,
    DiscordRPCID: "1410934537051181146",
    configFeatures
}