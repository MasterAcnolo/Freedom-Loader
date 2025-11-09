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
const { logger } = require("../logger");
const { app } = require("electron");
const userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");

const ytDlpPath = path.join(__dirname, '../../ressources/yt-dlp.exe');

// Copie yt-dlp si besoin
if (!fs.existsSync(userYtDlp)) {
  fs.copyFileSync(ytDlpPath, userYtDlp);
  logger.info(`yt-dlp copié dans le dossier utilisateur : ${userYtDlp}`);
}

if (!fs.existsSync(ytDlpPath)) {
  logger.error(`❌ yt-dlp introuvable à ${ytDlpPath}`);
  throw new Error(`yt-dlp introuvable à ${ytDlpPath}`);
}

function isValidUrl(url) {
  return typeof url === "string" && /^https?:\/\//.test(url);
}

router.post("/", (req, res) => {
  const url = req.body.url;
  if (!url || !isValidUrl(url)) {
    logger.warn("Requête /info invalide ou URL manquante");
    return res.status(400).send("❌ URL invalide ou manquante");
  }

  logger.info(`Requête /info reçue pour ${url}`);

  const args = ["--dump-single-json", "--ignore-errors", "--yes-playlist", url];

  execFile(userYtDlp, args, { timeout: 30_000 }, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Erreur exécution yt-dlp: ${error.message}`);
      if (stderr) logger.debug(`stderr: ${stderr}`);
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }

    try {
      const data = JSON.parse(stdout);

      if (data._type === "playlist") {
        logger.info(`Playlist détectée : ${data.title} (${data.entries.length} vidéos)`);

        const playlistPayload = {
          type: "playlist",
          title: data.title || data.id,
          channel: data.uploader,
          count: data.entries.length,
          videos: (data.entries || []).map(v => ({
            id: v.id,
            title: v.title,
            webpage_url: v.webpage_url,
            duration: v.duration,
            thumbnail: v.thumbnail,
            uploader: v.uploader
          }))
        };

        return res.json(playlistPayload);
      }

      // Vidéo unique
      logger.info(`Vidéo unique récupérée : ${data.title}`);
      res.json({
        type: "video",
        ...data
      });

    } catch (e) {
      logger.error(`Erreur parsing JSON: ${e.message}`);
      return res.status(500).send("❌ JSON illisible.");
    }
  });
});

module.exports = router;
