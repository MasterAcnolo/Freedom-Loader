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
const { logger } = require("../logger"); // On récupère ton logger Winston

// Path absolu vers l'exécutable yt-dlp
const ytDlpPath = path.join(__dirname, '../../yt-dlp 2025.08.27.exe');

// Vérification que yt-dlp.exe existe bien au lancement du module
if (!fs.existsSync(ytDlpPath)) {
  logger.error(`❌ yt-dlp.exe introuvable à ${ytDlpPath}`);
  throw new Error(`yt-dlp.exe introuvable à ${ytDlpPath}`);
}

// Route POST pour récupérer les métadonnées d'une vidéo via yt-dlp
router.post("/", (req, res) => {
  const url = req.body.url;

  // Validation basique : on refuse la requête sans URL
  if (!url) {
    logger.warn("Requête metadata sans URL");
    return res.status(400).send("❌ URL manquante");
  }

  logger.info(`Requête metadata reçue pour ${url}`);

  // Exécution de yt-dlp avec l'option --dump-json pour récupérer les infos vidéo
  execFile(
    ytDlpPath,
    ["--dump-json", url],
    { timeout: 10_000 }, // Timeout fixé à 10 secondes pour éviter blocage
    (error, stdout, stderr) => {
      if (error) {
        // En cas d'erreur, on log l'erreur et le stderr, puis on renvoie un code 500
        logger.error(`Erreur exécution yt-dlp: ${error.message}`);
        logger.debug(`stderr: ${stderr}`);
        return res.status(500).send("❌ Impossible de récupérer les infos.");
      }

      try {
        // yt-dlp peut retourner plusieurs JSON séparés par des sauts de ligne
        // On split et parse chacun proprement
        const infos = stdout
          .trim()
          .split("\n")
          .map(line => JSON.parse(line));

        logger.info(`Infos récupérées pour ${url} (${infos.length} élément(s))`);

        // Si on a un seul élément, on renvoie directement l'objet JSON, sinon un tableau
        res.json(infos.length === 1 ? infos[0] : infos);
      } catch (e) {
        // Si parsing JSON échoue, on log et renvoie une erreur 500
        logger.error(`Erreur parsing JSON: ${e.message}`);
        return res.status(500).send("❌ JSON illisible.");
      }
    }
  );
});

module.exports = router;
