const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");

const ytDlpPath = path.join(__dirname, "../../yt-dlp.exe");

router.post("/", (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).send("❌ URL manquante");

  execFile(ytDlpPath, ["--dump-json", url], (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur lors de l'exécution de yt-dlp :", error);
      console.error("stderr :", stderr);
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }

    try {
      const info = JSON.parse(stdout);
      res.json(info);
    } catch (e) {
      console.error("Erreur lors du parsing JSON :", e);
      res.status(500).send("❌ JSON illisible.");
    }
  });
});

module.exports = router;
