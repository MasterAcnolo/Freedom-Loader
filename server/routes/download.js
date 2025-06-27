const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

router.post("/", (req, res) => {
  const options = {
    url: req.body.url,
    audioOnly: req.body.audioOnly === "1",
    quality: req.body.quality || "best",
    subtitles: req.body.subs === "1",
  };

  if (!options.url) {
    return res.status(400).send("❌ URL manquante !");
  }

  let command = `yt-dlp`;

  if (options.audioOnly) {
    command += " --extract-audio --audio-format mp3";
  }

  if (options.subtitles) {
    command += " --write-subs --sub-lang en";
  }

  command += ` -f ${options.quality}`;
  command += ` -o "downloads/%(title)s.%(ext)s"`;
  command += ` "${options.url}"`;

  console.log("🔧 Commande finale :", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur yt-dlp :", stderr || error.message);
      return res.status(500).send("❌ Erreur pendant le téléchargement.");
    }

    console.log("yt-dlp terminé :", stdout);
    res.send("✅ Téléchargement terminé !");
  });
});

module.exports = router;
