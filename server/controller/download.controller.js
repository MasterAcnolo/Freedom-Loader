const { fetchDownload, cancelDownload } = require("../services/download.services");
const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation.helpers");
const { notifyDownloadFinished } = require("../helpers/notify.helpers");
const { configFeatures } = require("../../config");

/**
 * Active Server-Sent Event subscribers receiving
 * download progress updates.
 *
 * Each listener receives a percentage value between
 * 0 and 100 during the download lifecycle.
 */
const progressListeners = [];

/**
 * Active Server-Sent Event subscribers receiving
 * download speed updates.
 */
const speedListeners = [];

/**
 * Active Server-Sent Event subscribers receiving
 * download stage updates.
 */
const stageListeners = [];

/**
 * Active Server-Sent Event subscribers receiving
 * playlist progress information.
 */
const playlistListeners = [];

/**
 * Handles download requests and starts a yt-dlp download.
 *
 * Validates user input, prepares download options and
 * delegates the download process to the download service.
 *
 * Once the download completes successfully, a desktop
 * notification may be displayed depending on the
 * application configuration.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
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
      return res.status(400).send("Save Path Not Allowed.");
    }

    const outputFolder = await fetchDownload(
      options,
      progressListeners,
      speedListeners,
      stageListeners,
      playlistListeners
    );
    
    notifyDownloadFinished(outputFolder, configFeatures.notifySystem);
    res.send("Download Done !");
    
  } catch (err) {
    logger.error(`Server Error in /download: ${err?.message ?? err}`);
    res.status(500).send("Server Error");
  }
}

/**
 * Opens a Server-Sent Events (SSE) connection used to
 * stream download progress updates to the client.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
function progressController(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendProgress = percent => res.write(`data: ${percent}\n\n`);
  progressListeners.push(sendProgress);

  req.on('close', () => {
    progressListeners.splice(progressListeners.indexOf(sendProgress), 1);
    res.end();
  });
}

/**
 * Opens a Server-Sent Events (SSE) connection used to
 * stream download speed updates to the client.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

/**
 * Opens a Server-Sent Events (SSE) connection used to
 * stream download stage updates such as downloading,
 * merging, extracting audio or embedding metadata.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

/**
 * Cancels the currently running download process.
 *
 * Returns an error response if no download is active.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
function cancelDownloadController(req, res) {
  const cancelled = cancelDownload();
  if (cancelled) {
    logger.info("Download and queue cancelled by user");
    res.send("Download stopped! Queue cleared.");
  } else {
    logger.warn("No download to cancel");
    res.status(400).send("No download in progress !");
  }
}

/**
 * Opens a Server-Sent Events (SSE) connection used to
 * stream playlist progress information to the client.
 *
 * Example:
 * - Item 1 of 20
 * - Item 12 of 20
 * - Item 20 of 20
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
function playlistInfoController(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendPlaylistInfo = info => res.write(`data: ${info}\n\n`);
  playlistListeners.push(sendPlaylistInfo);

  req.on('close', () => {
    playlistListeners.splice(playlistListeners.indexOf(sendPlaylistInfo), 1);
    res.end();
  });
}

module.exports = { downloadController, progressController, speedController, stageController, cancelDownloadController, playlistInfoController};
