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

const express = require("express");         // importe le framework Express
const router = express.Router();            // crée un routeur Express pour modulariser les routes
const { execFile } = require("child_process"); // permet d’exécuter un binaire externe sans passer par un shell
const path = require("path");               // module Node.js pour gérer les chemins de fichiers
const fs = require("fs");                   // module Node.js pour manipuler le système de fichiers

const logger = require("../logger").logger; // récupère l'instance de logger Winston personnalisée

// chemin vers l’exécutable yt-dlp packagé avec l’appli
const ytDlpPath = path.join(__dirname, '../../yt-dlp.exe');

// route POST sur la racine (ex: POST /download)
router.post("/", (req, res) => {
  try {
    // récupère les options envoyées depuis le frontend (via formulaire ou requête AJAX)
    const options = {
      url: req.body.url,                              // URL à télécharger
      audioOnly: req.body.audioOnly === "1",          // conversion audio uniquement (mp3)
      quality: req.body.quality || "best",            // qualité vidéo à télécharger
      subtitles: req.body.subs === "1",               // récupérer les sous-titres anglais
    };

    if (!options.url) {
      // si l’URL est absente, on log et on renvoie 400
      logger.warn("Requête POST /download sans URL");
      return res.status(400).send("❌ URL manquante !");
    }

    // on récupère le dossier de sortie depuis app.locals (défini ailleurs dans le serveur)
    const outputFolder = req.app.locals.outputFolder;

    // s'il n'existe pas, on le crée automatiquement
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
      logger.info("Dossier Freedom Loader Output créé à la volée dans Téléchargements.");
    }

    // template du nom de fichier de sortie (ex: MonTitre.mp4 ou MonTitre.mp3)
    const outputTemplate = path.join(outputFolder, "%(title)s.%(ext)s");

    // tableau d'arguments pour yt-dlp
    const args = [];

    if (options.audioOnly) {
      // si audioOnly, on force extraction audio en mp3
      args.push("--extract-audio", "--audio-format", "mp3");
    }

    if (options.subtitles) {
      // si l’utilisateur veut des sous-titres
      args.push("--write-subs", "--sub-lang", "en");
    }

    // // qualité souhaitée
    // args.push("-f", options.quality);

    // let format;
    // if (options.quality === "best") {
    //   format = "bestvideo+bestaudio/best";
    // } else if (options.quality === "worst") {
    //   format = "worstvideo+worstaudio/worst";
    // } else {
    //   format = "best";  // fallback
    // }
    // args.push("-f", format);

  args.push("--no-continue");

  let format;

  switch (options.quality) {
    case "best":
      format = "bestvideo+bestaudio/best";
      break;
    case "medium":
      // qualité moyenne, ex: 720p vidéo + meilleur audio
      format = "bestvideo[height<=720]+bestaudio/best[height<=720]";
      break;
    case "worst":
      format = "worstvideo+worstaudio/worst";
      break;
    case "1080":
      format = "bestvideo[height<=1080]+bestaudio/best[height<=1080]";
      break;
    case "720":
      format = "bestvideo[height<=720]+bestaudio/best[height<=720]";
      break;
    case "480":
      format = "bestvideo[height<=480]+bestaudio/best[height<=480]";
      break;
    default:
      format = "best";
  }
  args.push("-f", format);

    // modèle de sortie
    args.push("-o", outputTemplate);
    // enfin, l'URL à télécharger
    args.push(options.url);

    // log de la commande complète pour debug
    logger.info(`Commande yt-dlp : ${ytDlpPath} ${args.join(" ")}`);

    // exécution du binaire yt-dlp
    const child = execFile(ytDlpPath, args);

    // gestion des logs stdout de yt-dlp
    child.stdout.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if(line.trim()) logger.info(`[yt-dlp stdout] ${line.trim()}`);
      });
    });

    // gestion des logs stderr de yt-dlp (les erreurs)
    child.stderr.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if(line.trim()) logger.error(`[yt-dlp stderr] ${line.trim()}`);
      });
    });

    // si une erreur système survient (par ex : yt-dlp.exe introuvable)
    child.on("error", (err) => {
      logger.error(`Erreur lancement yt-dlp : ${err.message}`);
      res.status(500).send(`❌ Erreur lors de l'exécution : ${err.message}`);
    });

    // callback quand le processus se termine
    child.on("close", (code) => {
      logger.info(`yt-dlp terminé avec code de sortie : ${code}`);
      if(code === 0) {
        // succès
        res.send("✅ Téléchargement terminé !");
      } else {
        // yt-dlp a échoué
        res.status(500).send(`❌ yt-dlp a échoué avec le code : ${code}`);
      }
    });

  } catch (err) {
    // en cas d'erreur JavaScript
    logger.error(`Erreur serveur dans /download : ${err.message}`);
    res.status(500).send(`Erreur serveur : ${err.message}`);
  }
});

// on exporte ce routeur pour qu'il soit utilisé par l'app principale
module.exports = router;