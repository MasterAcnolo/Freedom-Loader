const packageJson = require("./package.json");
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const localMode = !app.isPackaged;

function resolveConfigPath() {
  if (localMode) {
    const devConfigPath = path.join(__dirname, "config", "config.dev.json");
    if (!fs.existsSync(devConfigPath)) {
      const defaultConfigPath = path.join(__dirname, "config", "config.default.json");
      fs.copyFileSync(defaultConfigPath, devConfigPath);
    }
    return devConfigPath;
  }

  const userConfigPath = path.join(app.getPath("userData"), "config.json");
  if (!fs.existsSync(userConfigPath)) {
    const defaultConfigPath = path.join(process.resourcesPath, "config", "config.default.json");
    fs.copyFileSync(defaultConfigPath, userConfigPath);
  }

  return userConfigPath;
}

const featuresPath = resolveConfigPath();

function loadFeatures() {
  const raw = fs.readFileSync(featuresPath, "utf-8");
  return JSON.parse(raw);
}

const configFeatures = loadFeatures();

module.exports = {
  version: packageJson.version,
  applicationPort: "8787",
  localMode,
  DiscordRPCID: "1410934537051181146",
  configFeatures,
  featuresPath
}