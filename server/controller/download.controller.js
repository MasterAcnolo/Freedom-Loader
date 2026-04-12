const { fetchDownload, cancelDownload } = require("../services/download.services");
const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation.helpers");
const { notifyDownloadFinished } = require("../helpers/notify.helpers");

const listeners = [];
const speedListeners = [];
const stageListeners = [];

async function downloadController(req, res) {
  try {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",
      quality: req.body.quality || "best",
      outputFolder: req.body.savePath || undefined,
      playlistTitle: req.body.playlistTitle || undefined,
    };

    if (!options.url || !isValidUrl(options.url)) return res.status(400).send("Invalid URL !");
    if (options.outputFolder && !isSafePath(options.outputFolder)) {
      logger.warn(`Unsafe download path rejected: ${options.outputFolder}`);
      return res.status(400).send("❌ Save Path Not Allowed.");
    }

    // Get output folder when the download is finished
    const outputFolder = await fetchDownload(options, listeners, speedListeners, stageListeners);
    notifyDownloadFinished(outputFolder);
    res.send("Download Done !");
    
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

function stageController(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendStage = stage => res.write(`data: ${stage}\n\n`);
  stageListeners.push(sendStage);

  req.on('close', () => {
    stageListeners.splice(stageListeners.indexOf(sendStage), 1);
    res.end();
  });
}

function cancelDownloadController(req, res) {
  const cancelled = cancelDownload();
  if (cancelled) {
    logger.info("Download and queue cancelled by user");
    res.send("✅ Download stopped! Queue cleared.");
  } else {
    logger.warn("No download to cancel");
    res.status(400).send("❌ No download in progress !");
  }
}

module.exports = { downloadController, progressController, speedController, stageController, cancelDownloadController};
