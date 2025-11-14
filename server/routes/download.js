const { execFile } = require("child_process");
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation");
const { buildYtDlpArgs } = require("../helpers/buildArgs");
const { notifyDownloadFinished } = require("../helpers/notify");
const { userYtDlp } = require("../helpers/path");

const listeners = [];

router.post("/", (req, res) => {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
      outputFolder: req.body.savePath || path.join(process.env.USERPROFILE, "Downloads", "Freedom Loader"),
    };

    // Vérifications
    if (!options.url || !isValidUrl(options.url)) return res.status(400).send("❌ URL invalide !");
    if (!isSafePath(options.outputFolder)) return res.status(400).send("❌ Chemin de sauvegarde non autorisé.");

    // Création dossier si inexistant
    fs.mkdirSync(options.outputFolder, { recursive: true });

    // Construire les arguments yt-dlp
    const args = buildYtDlpArgs(options);
    logger.info(`[yt-dlp args] ${args.join(" ")}`);

    const child = execFile(userYtDlp, args);

    // Gestion erreurs
    child.on("error", err => {
      logger.error(`Erreur yt-dlp : ${err.message}`);
      res.status(500).send(`❌ Erreur yt-dlp : ${err.message}`);
    });

    // Téléchargement terminé
    child.on("close", code => {
      if (code === 0) {
        notifyDownloadFinished(options.outputFolder);

        // signal SSE fin de playlist
        listeners.forEach(fn => fn("done"));

        res.send("✅ Téléchargement terminé !");
      } else {
        res.status(500).send(`❌ yt-dlp a échoué avec le code : ${code}`);
        listeners.forEach(fn => fn("done"));
      }
    });

    child.stdout.on("data", data => {
      data.toString().split("\n").forEach(line => line.trim() && logger.info(`[yt-dlp stdout] ${line}`));
    });

    child.stderr.on("data", data => {
      data.toString().split("\n").forEach(line => line.trim() && logger.error(`[yt-dlp stderr] ${line}`));
    });
  

    child.stdout.on("data", data => {
      const lines = data.toString().split("\n");
      lines.forEach(line => {
        // reset progress si nouveau fichier
        if (line.startsWith("[download] Destination:")) {
          listeners.forEach(fn => fn("reset")); // tu peux envoyer un signal spécial
        }

        // envoyer le % classique
        const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
        if (match) {
          const percent = parseFloat(match[1]);
          listeners.forEach(fn => fn(percent));
        }
      });
    });

  } catch (err) {
    logger.error(`Erreur serveur dans /download : ${err.message}`);
    res.status(500).send(`Erreur serveur : ${err.message}`);
  }
});

// SSE endpoint
router.get("/progress", (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendProgress = percent => res.write(`data: ${percent}\n\n`);
  listeners.push(sendProgress);

  req.on('close', () => {
    listeners.splice(listeners.indexOf(sendProgress), 1);
    res.end();
  });
});

module.exports = router;
