const {ipcMain} = require("electron");
const { createSystemTray, destroyTray } = require("../tray");
const { configFeatures } = require("../../config");
const fs = require("fs");
const { logger } = require("../../server/logger");
const { devMode } = require("../../config");
const { featuresPath } = require("../../config");

function registerFeatureAPIHandlers(){

    /**
     * Security whitelist for feature flags that can be modified at runtime.
     *
     * Prevents unauthorized or unexpected configuration keys from being persisted.
     * Acts as a basic validation layer for IPC "set-feature".
     */
    const FEATURE_WHITELIST = new Set([
        "systemTray",
        "discordRPC",
        "autoCheckInfo",
        "addThumbnail",
        "addMetadata",
        "verboseLogs",
        "autoUpdateYtDlp",
        "autoDownloadPlaylist",
        "keepPlaylistOrder",
        "customCodec",
        "theme",
        "createPlaylistFolders",
        "notifySystem",
        "enableHardwareAcceleration",
        "downloadPath"
    ]);

  /**
   * Returns runtime feature configuration object.
   */
  ipcMain.handle("features", () => configFeatures);

  /**
   * Updates a runtime feature flag and persists it to disk.
   *
   * Flow:
   * - Validates key against whitelist
   * - Prevents unnecessary writes if value is unchanged
   * - Updates in-memory config object
   * - Persists to configuration file
   *
   * Security note:
   * Only whitelisted keys can be modified via IPC to prevent config injection.
   *
   * @param {Electron.IpcMainEvent} event
   * @param {{key: string, value: any}} payload
   * @returns {boolean} success state
   */
  ipcMain.handle("set-feature", (event, { key, value }) => {
    try {
      if (!FEATURE_WHITELIST.has(key)) {
        logger.warn(`Rejected feature (not whitelisted): ${key}`);
        return false;
      }

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
        featuresPath,
        JSON.stringify(configFeatures, null, 2),
        "utf-8",
      );

      logger.info(`Feature updated: ${key} = ${value}`);
      return true;
    } catch (err) {
      logger.error(`set-feature failed (${key}): ${err.message}`);
      return false;
    }
  });
}

module.exports = {
    registerFeatureAPIHandlers
};