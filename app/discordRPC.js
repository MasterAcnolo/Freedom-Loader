const config = require('../config');
const RPC = require("discord-rpc");
const { logger } = require("../server/logger");
const fs = require("fs");
const path = require("path");

/**
 * Discord Application Client ID used to authenticate the RPC connection.
 * Comes from the application configuration.
 */
const clientId = `${config.DiscordRPCID}`;

/**
 * Discord RPC client instance using IPC transport.
 * Maintains a persistent connection with Discord desktop client.
 */
const rpc = new RPC.Client({ transport: "ipc" });

/**
 * Optional interval reference used for future RPC refresh logic.
 * Currently reserved for potential periodic activity updates.
 */
let intervalId;

/**
 * Automagically fixes Discord RPC on Linux for Sandboxed versions (Flatpak & Snap).
 * It creates a symlink from the sandbox IPC socket to the standard system location.
 *
 * @returns {void}
 */
function fixLinuxDiscordRPC() {
  // Only execute on Linux
  if (process.platform !== "linux") return;

  /**
   * Get the user's runtime directory (e.g., /run/user/1000).
   * @type {string}
   */
  const xdgDir = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}`;
  const standardSocket = path.join(xdgDir, "discord-ipc-0");

  // If the standard socket already exists (Native Discord), do nothing.
  if (fs.existsSync(standardSocket)) return;

  /**
   * Paths for known sandboxed Discord IPC sockets.
   */
  const flatpakSocket = path.join(xdgDir, "app/com.discordapp.Discord/discord-ipc-0");
  const snapSocket = path.join(xdgDir, "snap.discord/discord-ipc-0");

  let targetSocket = null;

  if (fs.existsSync(flatpakSocket)) {
    targetSocket = flatpakSocket;
  } else if (fs.existsSync(snapSocket)) {
    targetSocket = snapSocket;
  }

  // If a sandboxed socket is found, create the symlink stealthily.
  if (targetSocket) {
    try {
      fs.symlinkSync(targetSocket, standardSocket);
      logger.info(`Discord RPC bridge created automatically targeting: ${targetSocket}`);
    } catch (err) {
      logger.warn(`Failed to create Discord RPC bridge: ${err.message}`);
    }
  }
}

/**
 * Initializes Discord Rich Presence (RPC) connection.
 *
 * Responsibilities:
 * - Connect to Discord via IPC transport
 * - Set application presence (title, state, timestamps, assets)
 * - Handle connection errors gracefully via logger
 *
 * Triggered once during application startup.
 */
function startRPC() {

  /**
   * Patch that create Simlinks for Linux environment;
   */
  fixLinuxDiscordRPC();

  /**
   * Rich Presence payload describing current application state
   * shown in Discord user profile.
   */
  rpc.on("ready", () => {
    const presence = {
      largeImageKey: "icon",
      smallImageKey: "acnolo_pfp",
      smallImageText: "By MasterAcnolo",
      startTimestamp: new Date(),
      details: `Open Source Download Tools - ${config.version}`,
      state: "masteracnolo.github.io/FreedomLoader",
    };
    rpc.clearActivity()
    rpc.setActivity(presence);

  });

  rpc.login({ clientId }).catch(err => {
    logger.error("Unable to connect to the RPC:", err);
  });
}

/**
 * Gracefully stops Discord Rich Presence connection.
 *
 * Responsibilities:
 * - Clear any running intervals
 * - Remove current activity from Discord if connected
 * - Destroy RPC transport connection
 * - Handle cleanup errors safely
 */
async function stopRPC() {
  if (rpc) {
    try {
      if (intervalId) clearInterval(intervalId);

      /**
       * Ensures RPC connection AND the underlying socket exist
       * before attempting to clear activity to prevent crash.
       */
      if (rpc.transport && rpc.transport.socket) {
        await rpc.clearActivity();
      }

      await rpc.destroy();

    } catch (err) {
      logger.error("Error while closing the RPC:", err);
    }
  }
}


module.exports = { startRPC, stopRPC};
