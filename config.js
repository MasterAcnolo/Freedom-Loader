const packageJson = require("./package.json");
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

/**
 * Indicates whether the application is running in development mode.
 * Determined by Electron's packaging state.
 */
const devMode = !app.isPackaged || process.env.NODE_ENV === "test";

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
 * Resolves the bundled default configuration path.
 *
 * @returns {string} Absolute path to the default configuration file
 */
function getDefaultConfigPath() {
  return devMode
    ? path.join(__dirname, "config", "config.default.json")
    : path.join(process.resourcesPath, "config", "config.default.json");
}

/**
 * Adds missing default feature flags without overwriting user settings.
 *
 * Unknown user-defined keys are intentionally preserved.
 *
 * @param {Object} defaults - Default feature flags
 * @param {Object} current - User feature flags
 * @returns {{features: Object, changed: boolean}} Merged features and migration state
 */
function mergeMissingFeatures(defaults, current) {
  if (!defaults || typeof defaults !== "object" || Array.isArray(defaults)) {
    throw new Error("Default configuration must be a JSON object");
  }
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    throw new Error("User configuration must be a JSON object");
  }

  const features = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => !Object.prototype.hasOwnProperty.call(current, key));

  return { features, changed };
}

/**
 * Loads and parses the feature configuration file.
 *
 * @returns {Object} Parsed feature flags configuration
 * @throws {Error} If the configuration file is missing or invalid
 */
function loadFeatures() {
  const defaults = JSON.parse(fs.readFileSync(getDefaultConfigPath(), "utf-8"));
  const current = JSON.parse(fs.readFileSync(featuresPath, "utf-8"));
  const { features, changed } = mergeMissingFeatures(defaults, current);

  if (changed) {
    fs.writeFileSync(featuresPath, JSON.stringify(features, null, 2), "utf-8");
  }

  return features;
}

/**
 * Reloads feature flags from disk.
 * Use this instead of the cached configFeatures snapshot
 * when you need the latest user settings at call time.
 *
 * @returns {Object} Fresh feature flags from config file
 */
function reloadFeatures() {
  try {
    return loadFeatures();
  } catch (err) {
    // Fallback to cached snapshot if file read fails
    return configFeatures;
  }
}

/**
 * In-memory snapshot of application feature flags.
 *
 * Note: Changes to the config file are not automatically reflected.
 * A restart or reload is required.
 */
let configFeatures = loadFeatures();

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
   * Function to reload the config
   */
  reloadFeatures,

  /**
   * Path to the active configuration file
   */
  featuresPath,

  /**
   * Merges missing default feature flags into user configuration without overwriting existing settings.
   */
  mergeMissingFeatures,
};