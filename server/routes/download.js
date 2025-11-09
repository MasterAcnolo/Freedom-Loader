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
*/
const { app } = require("electron");
const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { Notification } = require("electron");
const logger = require("../logger").logger;
const userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");

// Path vers yt-dlp
const ytDlpPath = path.join(process.resourcesPath, "yt-dlp.exe");
const sourceYtDlp = path.join(process.resourcesPath, "yt-dlp.exe");


if (!fs.existsSync(userYtDlp)) {
  fs.copyFileSync(sourceYtDlp, userYtDlp);
  logger.info(`yt-dlp copié dans le dossier utilisateur : ${userYtDlp}`);
}

//  Lancement de la mise à jour une seule fois au démarrage 
execFile(userYtDlp, ["-U"], (err, stdout, stderr) => {
  if (err) {
    logger.warn("Erreur update yt-dlp:", err);
    logger.debug(err);
    return;
  }
  logger.info(`Update yt-dlp : ${stdout}`);
});

// Validation simple d'une URL
function isValidUrl(url) {
  return /^https?:\/\/.+/.test(url); // Petit Regex qui renvoie true si l'URL est bonne et False si elle est pas bonne
}

router.post("/", (req, res) => {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
    };

    if (!options.url) {
      logger.warn("Requête POST /download sans URL");
      return res.status(400).send("❌ URL manquante !");
    }

    if (!isValidUrl(options.url)) {
      logger.warn(`URL invalide : ${options.url}`);
      return res.status(400).send("❌ URL invalide !");
    }

    let requestedOutputFolder = req.body.savePath || req.app.locals.outputFolder;
    requestedOutputFolder = path.normalize(requestedOutputFolder);

    if (
      !requestedOutputFolder ||
      requestedOutputFolder.length < 3 ||
      requestedOutputFolder.includes("System32") ||
      requestedOutputFolder.includes("/etc") ||
      requestedOutputFolder.includes("\\Windows")
    ) {
      logger.warn(`Chemin potentiellement dangereux refusé : ${requestedOutputFolder}`);
      return res.status(400).send("❌ Chemin de sauvegarde non autorisé.");
    }

    if (!fs.existsSync(requestedOutputFolder)) {
      fs.mkdirSync(requestedOutputFolder, { recursive: true });
      logger.info(`Dossier de sortie créé : ${requestedOutputFolder}`);
    }

    const outputTemplate = path.join(requestedOutputFolder, "%(title)s.%(ext)s");

    const args = [
      "--no-continue",
      // "--restrict-filenames",
      "--no-overwrites",
      
      "--embed-thumbnail",
      "--add-metadata",
      "--concurrent-fragments", "8",
      "--retries", "10",
      "--fragment-retries", "10",
      "--ffmpeg-location", path.join(process.resourcesPath, "ffmpeg.exe")
    ];

    if (options.audioOnly) {
      args.push("-f", "bestaudio", "--extract-audio", "--audio-format", "mp3");
    } else
      args.push("--merge-output","mp4")

    const qualityMap = {
      best: "bestvideo+bestaudio/best/mp4",
      medium: "bestvideo[height<=720]+bestaudio/best[height<=720]/mp4",
      worst: "worstvideo+worstaudio/worst/mp4",
      1080: "bestvideo[height<=1080]+bestaudio/best[height<=1080]/mp4",
      720: "bestvideo[height<=720]+bestaudio/best[height<=720]/mp4",
      480: "bestvideo[height<=480]+bestaudio/best[height<=480]/mp4",
    };

    const format = qualityMap[options.quality] || "best";
    args.push("-f", format);
    
    args.push("-o", outputTemplate);
    args.push(options.url);

    logger.info(`Téléchargement demandé : url=${options.url}, audioOnly=${options.audioOnly}, quality=${options.quality}`);
    logger.info(`Commande yt-dlp : ${ytDlpPath} ${args.join(" ")}`);

    const child = execFile(userYtDlp, args);

    child.stdout.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if (line.trim()) logger.info(`[yt-dlp stdout] ${line.trim()}`);
      });
    });

    child.stderr.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if (line.trim()) logger.error(`[yt-dlp stderr] ${line.trim()}`);
      });
    });

    child.on("error", (err) => {
      logger.error(`Erreur lancement yt-dlp : ${err.message}`);
      res.status(500).send(`❌ Erreur lors de l'exécution : ${err.message}`);
    });

    child.on("close", (code) => {
      logger.info(`yt-dlp terminé avec code de sortie : ${code}`);
      if (code === 0) {
        const iconPath = path.join(process.resourcesPath, "confirm-icon.png");
        const notif = new Notification({
          title: "Freedom Loader",
          body: "Ton téléchargement est terminé, clique ici pour l'ouvrir.",
          icon: iconPath,
        });

        notif.on("click", () => {
          const { shell } = require("electron");
          shell.openPath(requestedOutputFolder);
        });

        notif.show();
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
