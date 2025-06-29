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

const logger = require("../logger").logger;  // importe ton logger Winston

const ytDlpPath = path.join(__dirname, '../../yt-dlp.exe');

router.post("/", (req, res) => {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
      subtitles: req.body.subs === "1",
    };

    if (!options.url) {
      logger.warn("Requête POST /download sans URL");
      return res.status(400).send("❌ URL manquante !");
    }

    // Récupérer le chemin Freedom Loader Output depuis app.locals
    const outputFolder = req.app.locals.outputFolder;

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
      logger.info("Dossier Freedom Loader Output créé à la volée dans Téléchargements.");
    }

    // Construire le template de sortie
    const outputTemplate = path.join(outputFolder, "%(title)s.%(ext)s");

    // Construire les arguments pour execFile
    const args = [];

    if (options.audioOnly) {
      args.push("--extract-audio", "--audio-format", "mp3");
    }

    if (options.subtitles) {
      args.push("--write-subs", "--sub-lang", "en");
    }

    args.push("-f", options.quality);
    args.push("-o", outputTemplate);
    args.push(options.url);

    logger.info(`Commande yt-dlp : ${ytDlpPath} ${args.join(" ")}`);

    const child = execFile(ytDlpPath, args);

    child.stdout.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if(line.trim()) logger.info(`[yt-dlp stdout] ${line.trim()}`);
      });
    });

    child.stderr.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if(line.trim()) logger.error(`[yt-dlp stderr] ${line.trim()}`);
      });
    });

    child.on("error", (err) => {
      logger.error(`Erreur lancement yt-dlp : ${err.message}`);
      res.status(500).send(`❌ Erreur lors de l'exécution : ${err.message}`);
    });

    child.on("close", (code) => {
      logger.info(`yt-dlp terminé avec code de sortie : ${code}`);
      if(code === 0) {
        res.send("✅ Téléchargement terminé !");
      } else {
        res.status(500).send(`❌ yt-dlp a échoué avec le code : ${code}`);
      }
    });

  } catch (err) {
    logger.error(`Erreur serveur dans /download : ${err.message}`);
    res.status(500).send(`Erreur serveur : ${err.message}`);
  }
});

module.exports = router;
