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
