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
    rpc.clearActivity()
    rpc.setActivity(presence);

  });

  rpc.login({ clientId }).catch(err => {
    logger.error("Unable to connect to the RPC:", err);
  });
}

async function stopRPC(){
    try {
      if (intervalId) clearInterval(intervalId);

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
