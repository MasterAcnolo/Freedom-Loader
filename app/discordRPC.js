const config = require('../config');
const RPC = require("discord-rpc");
const { logger } = require("../server/logger");

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
 * - Remove current activity from Discord
 * - Destroy RPC transport connection
 * - Handle cleanup errors safely
 */
async function stopRPC(){
    try {
      if (intervalId) clearInterval(intervalId);

      /**
       * Ensures RPC connection exists before attempting cleanup.
       */
      if (rpc && rpc.transport) {
        await rpc.clearActivity()
        await rpc.destroy();
      } else{
        logger.error("Not Able to close RPC")
      }
      
    } catch (err) {
      logger.error("Error while closing the RPC:", err);
    }
  }


module.exports = { startRPC, stopRPC};
