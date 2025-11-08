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

const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { Notification } = require("electron");
const logger = require("../logger").logger;

// Path vers le fichier exécutable yt-dlp (outil tiers pour le téléchargement)
// const ytDlpPath = path.join(process.resourcesPath, '../../yt-dlp.exe'); 
const ytDlpPath = path.join(process.resourcesPath, 'yt-dlp.exe');

execFile(ytDlpPath, ["-U"], (err, stdout, stderr) => {
  if (err) {
    logger.error("Erreur update yt-dlp:", err);
    return;
  }
  logger.info(`Update yt-dlp : ${stdout}`);
});

router.post("/", (req, res) => {
  try {
    // Récupération des options envoyées par le frontend via le formulaire
    // On vérifie la présence de l'URL, le choix audioOnly, et la qualité demandée
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
    };

    // Validation simple : si l'URL est manquante, on rejette la requête
    if (!options.url) {
      logger.warn("Requête POST /download sans URL");
      return res.status(400).send("❌ URL manquante !");
    }

    // Récupération du chemin de sauvegarde personnalisé envoyé depuis Electron,
    // ou on utilise un chemin par défaut stocké dans app.locals
    let requestedOutputFolder = req.body.savePath || req.app.locals.outputFolder;

    // On normalise le chemin pour éviter des erreurs liées aux séparateurs ou chemins relatifs
    requestedOutputFolder = path.normalize(requestedOutputFolder);

    /*
      Sécurité basique : On refuse certains chemins sensibles ou suspects
      (ex: System32, /etc, Windows) pour éviter que l'application n'écrive dans des dossiers système.
      On vérifie aussi la longueur minimale du chemin pour éviter des valeurs vides ou invalides.
    */
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

    // Vérifie que le dossier de sortie existe, sinon le crée récursivement
    if (!fs.existsSync(requestedOutputFolder)) {
      fs.mkdirSync(requestedOutputFolder, { recursive: true });
      logger.info(`Dossier de sortie créé : ${requestedOutputFolder}`);
    }

    // Construction du template de sortie pour yt-dlp (nom de fichier basé sur le titre)
    const outputTemplate = path.join(requestedOutputFolder, "%(title)s.%(ext)s");

    // Construction du tableau d'arguments à passer à yt-dlp
    // --no-continue pour forcer un téléchargement propre
    // --restrict-filenames pour éviter les caractères problématiques dans les noms
   const args = [
        "--no-continue",              // pas de reprise, c'est un choix que j'ai fait voila
        //"--restrict-filenames",       // noms de fichiers sans caractères spéciaux (Cyrilique, accents, etc.)
        "--no-overwrites",            // évite d'écraser un fichier existant
        "--embed-thumbnail",          // ajoute la pochette
        "--add-metadata",             // ajoute les tags (titre, artiste, etc.)
        "--concurrent-fragments", "8",// accélère le téléchargement
        "--retries", "10",            // réessaie jusqu'à 10 fois en cas d'erreur
        "--fragment-retries", "10"   , // réessaie aussi 10 fois chaque fragment
        "--ffmpeg-location", path.join(process.resourcesPath, "ffmpeg.exe")
      ];

    // Si l'option audioOnly est activée, on ajoute les flags pour extraction audio en mp3
    if (options.audioOnly) {
      args.push(
      "-f", 
      "bestaudio", 
      "--extract-audio",
      "--audio-format", 
      "mp3",
    );
    }


    // Correspondance entre la qualité choisie et le format à demander à yt-dlp
    const qualityMap = {
      best: "bestvideo+bestaudio/best",
      medium: "bestvideo[height<=720]+bestaudio/best[height<=720]",
      worst: "worstvideo+worstaudio/worst",
      1080: "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
      720: "bestvideo[height<=720]+bestaudio/best[height<=720]",
      480: "bestvideo[height<=480]+bestaudio/best[height<=480]",
    };

    // Sélection du format basé sur la qualité, par défaut 'best' si option invalide
    const format = qualityMap[options.quality] || "best";
    args.push("-f", format);

    // Ajout du template de sortie et de l'URL à télécharger
    args.push("-o", outputTemplate);
    args.push(options.url);

    // Log de la commande complète pour traçabilité et débogage
    logger.info(`Téléchargement demandé : url=${options.url}, audioOnly=${options.audioOnly}, quality=${options.quality}`);
    logger.info(`Commande yt-dlp : ${ytDlpPath} ${args.join(" ")}`);

    // Lancement du processus yt-dlp avec les arguments définis
    const child = execFile(ytDlpPath, args);

    /*
      Gestion des sorties standards (stdout) du processus,
      on log chaque ligne pour suivre la progression ou informations diverses
    */
    child.stdout.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if (line.trim()) logger.info(`[yt-dlp stdout] ${line.trim()}`);
      });
    });

    /*
      Gestion des erreurs (stderr) du processus,
      on log chaque ligne d'erreur pour diagnostic
    */
    child.stderr.on("data", (data) => {
      data.toString().split("\n").forEach(line => {
        if (line.trim()) logger.error(`[yt-dlp stderr] ${line.trim()}`);
      });
    });

    /*
      En cas d'erreur lors du lancement du processus yt-dlp,
      on log l'erreur et on répond au client avec un statut 500
    */
    child.on("error", (err) => {
      logger.error(`Erreur lancement yt-dlp : ${err.message}`);
      res.status(500).send(`❌ Erreur lors de l'exécution : ${err.message}`);
    });

    /*
      Quand le processus se termine, on vérifie le code de sortie.
      Code 0 = succès, on informe le client que le téléchargement est terminé.
      Sinon, on envoie une erreur au client avec le code d'échec.
    */
    child.on("close", (code) => {
      logger.info(`yt-dlp terminé avec code de sortie : ${code}`);
      if (code === 0) {

        const iconPath = path.join(process.resourcesPath, "confirm-icon.png"); // la sécurité pour toutes les machines

        console.log("Icon path pour la notif :", iconPath);
        
        const notif = new Notification({
          title: "Freedom Loader",
          body: "Ton téléchargement est terminé, clique ici pour l'ouvrir.",
          icon: iconPath,
        });
        
        notif.on("click", () => {
          console.log("Notification cliquée !");
          //Pour pouvoir ouvrir le dossier de la vidéo
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
    // Capture toute autre erreur serveur non prévue, log et réponse 500
    logger.error(`Erreur serveur dans /download : ${err.message}`);
    res.status(500).send(`Erreur serveur : ${err.message}`);
  }
});

module.exports = router;
