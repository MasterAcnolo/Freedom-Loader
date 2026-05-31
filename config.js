const packageJson = require("./package.json");
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

/**
 * Indicates whether the application is running in development mode.
 * Determined by Electron's packaging state.
 */
const devMode = !app.isPackaged;

/**
 * Resolves the configuration file path depending on runtime environment.
 *
 * In development:
 * - Uses local config/config.dev.json
 * - Creates it from default if missing
 *
 * In production:
 * - Uses app userData/config.json
 * - Creates it from bundled default config if missing
 *
 * @returns {string} Absolute path to the active configuration file
 */
function resolveConfigPath() {
  if (devMode) {
    const devConfigPath = path.join(__dirname, "config", "config.dev.json");

    if (!fs.existsSync(devConfigPath)) {
      const defaultConfigPath = path.join(
        __dirname,
        "config",
        "config.default.json"
      );
      fs.copyFileSync(defaultConfigPath, devConfigPath);
    }

    return devConfigPath;
  }

  const userConfigPath = path.join(app.getPath("userData"), "config.json");

  if (!fs.existsSync(userConfigPath)) {
    const defaultConfigPath = path.join(
      process.resourcesPath,
      "config",
      "config.default.json"
    );
    fs.copyFileSync(defaultConfigPath, userConfigPath);
  }

  return userConfigPath;
}

/**
 * Path to the active configuration file used at runtime.
 */
const featuresPath = resolveConfigPath();

/**
 * Loads and parses the feature configuration file.
 *
 * @returns {Object} Parsed feature flags configuration
 * @throws {Error} If the configuration file is missing or invalid
 */
function loadFeatures() {
  const raw = fs.readFileSync(featuresPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * In-memory snapshot of application feature flags.
 *
 * Note: Changes to the config file are not automatically reflected.
 * A restart or reload is required.
 */
const configFeatures = loadFeatures();

module.exports = {
  /**
   * Application version from package.json
   */
  version: devMode ? `dev-${packageJson.version}` : `v${packageJson.version}` ,

  /**
   * Backend Express / internal server port
   */
  applicationPort: "8787",

  /**
   * Indicates whether the app is running in development mode
   */
  devMode,

  /**
   * Discord RPC application identifier
   */
  DiscordRPCID: "1410934537051181146",

  /**
   * Runtime feature flags loaded from configuration file
   */
  configFeatures,

  /**
   * Path to the active configuration file
   */
  featuresPath,
};