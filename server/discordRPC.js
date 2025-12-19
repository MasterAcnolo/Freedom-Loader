const config = require('../config');
const RPC = require("discord-rpc");
const { logger } = require("./logger");

const clientId = `${config.DiscordRPCID}`;
const rpc = new RPC.Client({ transport: "ipc" });

let intervalId;

function startRPC() {
  rpc.on("ready", () => {
    const presence = {
      largeImageKey: "icon",
      smallImageKey: "acnolo_pfp",
      smallImageText: "By MasterAcnolo",
      startTimestamp: new Date(),
      details: `Open Source Download Tools - ${config.version}`,
      state: "masteracnolo.github.io/FreedomLoader",
    };

    rpc.setActivity(presence);

    // Met à jour la présence toutes les 15s
    intervalId = setInterval(() => {
      rpc.setActivity(presence);
    }, 15000);
  });

  async function cleanExit() {
    try {
      if (intervalId) clearInterval(intervalId);

      if (rpc && rpc.transport) {
        await rpc.destroy();
      }
    } catch (err) {
      logger.error("Error while closing the RPC:", err);
    } finally {
      process.exit();
    }
  }

  process.on("exit", cleanExit);
  process.on("SIGINT", cleanExit);
  process.on("SIGTERM", cleanExit);

  rpc.login({ clientId }).catch(err => {
    logger.error("Unable to connect to the RPC:", err);
  });
}

module.exports = { startRPC };
