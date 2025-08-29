// discordRPC.js
const RPC = require("discord-rpc");

const clientId = "1410934537051181146";
const rpc = new RPC.Client({ transport: "ipc" });

function startRPC() {
  rpc.on("ready", () => {
    console.log("✅ Connecté à Discord !");

    const presence = {
        largeImageKey: "icon",
        smallImageKey: "acnolo_pfp",
        smallImageText: "By MasterAcnolo",
        startTimestamp: new Date(), // compteur de temps
        details: "github.com/MasterAcnolo/Freedom-Loader",
    };

    rpc.setActivity(presence);

    // Mise à jour toutes les 15 secondes si tu veux garder le compteur à jour
    setInterval(() => {
      rpc.setActivity(presence);
    }, 15000);
  });

  rpc.login({ clientId }).catch(err => {
    console.error("Erreur Discord RPC :", err);
  });
}

module.exports = { startRPC };
