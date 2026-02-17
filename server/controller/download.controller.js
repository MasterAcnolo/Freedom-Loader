const { fetchDownload } = require("../services/download.services");
const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation");
const { notifyDownloadFinished } = require("../helpers/notify");

const listeners = [];
const speedListeners = [];

async function downloadController(req, res) {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
      outputFolder: req.body.savePath || undefined,
    };

    if (!options.url || !isValidUrl(options.url)) return res.status(400).send("❌ Invalid URL !");
    if (options.outputFolder && !isSafePath(options.outputFolder)) {
      logger.warn(`Unsafe download path rejected: ${options.outputFolder}`);
      return res.status(400).send("❌ Save Path Not Allowed.");
    }

    // Get output folder when the download is finished
    const outputFolder = await fetchDownload(options, listeners, speedListeners);
    notifyDownloadFinished(outputFolder);
    res.send("✅ Download Done !");
    
  } catch (err) {
    logger.error(`Server Error in /download : ${err.message}`);
    res.status(500).send(`❌ Server Error`);
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

function speedController(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendSpeed = speed => res.write(`data: ${speed}\n\n`);
  speedListeners.push(sendSpeed);

  req.on('close', () => {
    speedListeners.splice(speedListeners.indexOf(sendSpeed), 1);
    res.end();
  });
}


module.exports = { downloadController, progressController, speedController};
