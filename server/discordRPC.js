/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const RPC = require("discord-rpc");
const clientId = "1410934537051181146";
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

  // Gestion propre de la fermeture
  const cleanExit = () => {
    if (intervalId) clearInterval(intervalId); // stop interval
    rpc.destroy(); // déconnecte proprement
    console.log("Discord RPC arrêté proprement.");
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
