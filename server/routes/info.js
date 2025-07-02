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

const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { logger } = require("../logger"); // on récupère ton logger Winston

const ytDlpPath = path.join(__dirname, "../../yt-dlp.exe");

// Check si ya YT DLP
if (!fs.existsSync(ytDlpPath)) {
  logger.error(`❌ yt-dlp.exe introuvable à ${ytDlpPath}`);
  throw new Error(`yt-dlp.exe introuvable à ${ytDlpPath}`);
}

router.post("/", (req, res) => {
  const url = req.body.url;
  if (!url) {
    logger.warn("Requête metadata sans URL");
    return res.status(400).send("❌ URL manquante");
  }

  logger.info(`Requête metadata reçue pour ${url}`);

  execFile(
    ytDlpPath,
    ["--dump-json", url],
    { timeout: 10_000 }, // 10s de timeout
    (error, stdout, stderr) => {
      if (error) {
        logger.error(`Erreur exécution yt-dlp: ${error.message}`);
        logger.debug(`stderr: ${stderr}`);
        return res.status(500).send("❌ Impossible de récupérer les infos.");
      }

      try {
        // découpe multi-JSON propre
        const infos = stdout
          .trim()
          .split("\n")
          .map(line => JSON.parse(line));

        logger.info(`Infos récupérées pour ${url} (${infos.length} élément(s))`);
        res.json(infos.length === 1 ? infos[0] : infos);
      } catch (e) {
        logger.error(`Erreur parsing JSON: ${e.message}`);
        return res.status(500).send("❌ JSON illisible.");
      }
    }
  );
});

module.exports = router;
