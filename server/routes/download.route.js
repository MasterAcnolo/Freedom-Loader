const express = require("express");
const router = express.Router();
const { fetchDownload } = require("../services/download.services");

const listeners = [];

router.post("/", async (req, res) => {
  const options = {
    url: req.body.url,
    audioOnly: req.body.audioOnly === "1",
    quality: req.body.quality || "best",
    outputFolder: req.body.savePath || null
  };

  try {
    await fetchDownload(options, listeners);
    res.send(`✅ Téléchargement terminé`);
  } catch (err) {
    res.status(500).send(`❌ ${err.message}`);
  }
});

// SSE pour la barre de progression
router.get("/progress", (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendProgress = percent => res.write(`data: ${percent}\n\n`);
  listeners.push(sendProgress);

  req.on("close", () => {
    listeners.splice(listeners.indexOf(sendProgress), 1);
    res.end();
  });
});

module.exports = router;
