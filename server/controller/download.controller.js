const { fetchDownload } = require("../services/download.services");
const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation");
const { buildYtDlpArgs } = require("../helpers/buildArgs");
const { notifyDownloadFinished } = require("../helpers/notify");

const listeners = [];

async function downloadController(req, res) {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
      outputFolder: req.body.savePath || undefined,
    };

    if (!options.url || !isValidUrl(options.url)) return res.status(400).send("❌ URL invalide !");
    if (options.outputFolder && !isSafePath(options.outputFolder)) return res.status(400).send("❌ Chemin de sauvegarde non autorisé.");

    const filePath = await fetchDownload(options, listeners);
    notifyDownloadFinished(filePath);
    res.send("✅ Téléchargement terminé !");
    
  } catch (err) {
    logger.error(`Erreur serveur dans /download : ${err.message}`);
    res.status(500).send(`❌ ${err.message}`);
  }
}

function progressController(req, res) {
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
}

module.exports = { downloadController, progressController };
