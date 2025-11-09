const config = require('../config');
const RPC = require("discord-rpc");

const clientId = `${config.DiscordRPCID}`;

const rpc = new RPC.Client({ transport: "ipc" });

let intervalId;

function startRPC() {
  rpc.on("ready", () => {
    console.log("Connecté à Discord !");

    const presence = {
      largeImageKey: "icon",
      smallImageKey: "acnolo_pfp",
      smallImageText: "By MasterAcnolo",
      startTimestamp: new Date(),
      details: "github.com/MasterAcnolo/Freedom-Loader",
    };

    rpc.setActivity(presence);

    // Met à jour la présence toutes les 15s
    intervalId = setInterval(() => {
      rpc.setActivity(presence);
    }, 15000);
  });

  rpc.login({ clientId }).catch(err => {
    console.error("Erreur Discord RPC :", err);
  });


  const cleanExit = () => {
    if (intervalId) clearInterval(intervalId); 
    rpc.destroy(); // déconnecte proprement
  };

  process.on("exit", cleanExit);
  process.on("SIGINT", () => {
    cleanExit();
    process.exit();
  });
  process.on("SIGTERM", () => {
    cleanExit();
    process.exit();
  });
}

module.exports = { startRPC };