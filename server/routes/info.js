const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

router.post("/", (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).send("❌ URL manquante");

  const command = `yt-dlp --dump-json "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }
    try {
      const info = JSON.parse(stdout);
      res.json(info);
    } catch (e) {
      res.status(500).send("❌ JSON illisible.");
    }
  });
});

module.exports = router;
