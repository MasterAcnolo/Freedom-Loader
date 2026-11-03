const fs = require("fs");
const { logger } = require("../../server/logger");
const { configFeatures, featuresPath, devMode } = require("../../config");
const { createSystemTray, destroyTray } = require("../tray");

const configFolderPath = featuresPath;

/**
 * Security whitelist for feature flags that can be modified at runtime.
 *
 * Prevents unauthorized or unexpected configuration keys from being persisted.
 * Acts as a basic validation layer for IPC "set-feature".
 */
const FEATURE_WHITELIST = new Set([
  "autoUpdate",
  "systemTray",
  "discordRPC",
  "customTopBar",
  "autoCheckInfo",
  "addThumbnail",
  "addMetadata",
  "verboseLogs",
  "autoDownloadPlaylist",
  "keepPlaylistOrder",
  "customCodec",
  "theme",
  "createPlaylistFolders",
  "notifySystem",
  "enableHardwareAcceleration",
  "downloadPath"
]);

function isFeatureWhitelisted(featureName) {
    if (!FEATURE_WHITELIST.has(featureName)) {
        logger.warn(`Rejected feature (not whitelisted): ${featureName}`);
        return false;
    } else {
        return true
    }
}

function setFeature(key, value) {

    if(!isFeatureWhitelisted(key)) return false;

    // If the feature is already set to the desired value, no action is needed.
    if (configFeatures[key] === value) {
        return true;
    }

    /**
     * Dynamically intercepts and applies System Tray state changes at runtime.
     * Instantiates or destroys the tray icon immediately to prevent window 
     * lifecycle desynchronization (e.g., minimizing a window to a non-existent tray).
     */
    if (key === "systemTray") {
        if (value === true) {
            logger.info("System Tray enabled dynamically.");
            createSystemTray(devMode);
        } else {
            logger.info("System Tray disabled dynamically.");
            destroyTray();
        }
    }

    configFeatures[key] = value;

    fs.writeFileSync(
        configFolderPath,
        JSON.stringify(configFeatures, null, 2),
        "utf-8"
    );

    logger.info(`Feature updated: ${key} = ${value}`);
    return true;
}

module.exports = {setFeature};