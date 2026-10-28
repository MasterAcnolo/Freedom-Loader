const EventEmitter = require("events");
const { fetchDownload, cancelDownload } = require("../services/download.services");
const { logger } = require("../logger");
const { isValidUrl, isSafePath } = require("../helpers/validation.helpers");
const { notifyDownloadFinished } = require("../helpers/notify.helpers");
const { configFeatures } = require("../../config");

const progressEmitter = new EventEmitter();
const speedEmitter = new EventEmitter();
const stageEmitter = new EventEmitter();
const playlistEmitter = new EventEmitter();

progressEmitter.setMaxListeners(0);
speedEmitter.setMaxListeners(0);
stageEmitter.setMaxListeners(0);
playlistEmitter.setMaxListeners(0);

/**
 * Active Server-Sent Event subscribers receiving
 * download progress updates.
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
 * Set of allowed quality values for downloads.
 * Used to validate user input and prevent invalid
 * quality options from being passed to the download service.
 */
const ALLOWED_QUALITIES = new Set(["best", "medium", "worst", "1080", "720", "480"]);

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
    const body = req.body || {};
    const options = {
      url: body.url,
      audioOnly: body.audioOnly === "1" || body.audioOnly === true,
      quality: ALLOWED_QUALITIES.has(body.quality) ? body.quality : "best",
      outputFolder: body.savePath || body.outputFolder || undefined,
      playlistTitle: body.playlistTitle || undefined,
    };

    if (!options.url || typeof options.url !== "string" || !isValidUrl(options.url)) {
      return res.status(400).json({
        error: {code: "INVALID_URL", message: "Invalid URL"},
      });
    }
    if (options.outputFolder && !isSafePath(options.outputFolder)) {
      logger.warn(`Unsafe download path rejected: ${options.outputFolder}`);
      return res.status(400).json({
        error: {code: "INVALID_PATH", message: "Save path not allowed"},
      });
    }

    const progressHandler = (percent) => {
      progressEmitter.emit("progress", percent);
      for (let i = progressListeners.length - 1; i >= 0; i -= 1) {
        try {
          progressListeners[i](percent);
        } catch (err) {
          logger.debug(`progress listener error: ${err.message}`);
        }
      }
    };

    const speedHandler = (speed) => {
      speedEmitter.emit("speed", speed);
      for (let i = speedListeners.length - 1; i >= 0; i -= 1) {
        try {
          speedListeners[i](speed);
        } catch (err) {
          logger.debug(`speed listener error: ${err.message}`);
        }
      }
    };

    const stageHandler = (stage) => {
      stageEmitter.emit("stage", stage);
      for (let i = stageListeners.length - 1; i >= 0; i -= 1) {
        try {
          stageListeners[i](stage);
        } catch (err) {
          logger.debug(`stage listener error: ${err.message}`);
        }
      }
    };

    const playlistHandler = (info) => {
      playlistEmitter.emit("playlist", info);
      for (let i = playlistListeners.length - 1; i >= 0; i -= 1) {
        try {
          playlistListeners[i](info);
        } catch (err) {
          logger.debug(`playlist listener error: ${err.message}`);
        }
      }
    };

    const outputFolder = await fetchDownload(
      options,
        [progressHandler],
        [speedHandler],
        [stageHandler],
        [playlistHandler]
    );

    notifyDownloadFinished(outputFolder, configFeatures.notifySystem);
    return res.json({success: true, message: "Download Done !", outputFolder});
  } catch (err) {
    logger.error(`Server Error in /download: ${err?.message ?? err}`);
    if (err && err.message === "Download already in progress") {
      return res.status(409).json({
        error: {code: "DOWNLOAD_IN_PROGRESS", message: "A download is already in progress"},
      });
    }
    return res.status(500).json({
      error: {code: "DOWNLOAD_FAILED", message: "Server Error"},
    });
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
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const sendProgress = (percent) => {
    try {
      res.write(`data: ${percent}\n\n`);
    } catch (err) {
      // ignore broken pipe
    }
  };
  progressListeners.push(sendProgress);
  const onProgress = (percent) => sendProgress(percent);
  progressEmitter.on("progress", onProgress);

  req.on("close", () => {
    const index = progressListeners.indexOf(sendProgress);
    if (index >= 0) progressListeners.splice(index, 1);
    progressEmitter.removeListener("progress", onProgress);
    try {
      res.end();
    } catch (err) {
      // ignore
    }
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
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const sendSpeed = (speed) => {
    try {
      res.write(`data: ${speed}\n\n`);
    } catch (err) {
      // ignore broken pipe
    }
  };
  speedListeners.push(sendSpeed);
  const onSpeed = (speed) => sendSpeed(speed);
  speedEmitter.on("speed", onSpeed);

  req.on("close", () => {
    const index = speedListeners.indexOf(sendSpeed);
    if (index >= 0) speedListeners.splice(index, 1);
    speedEmitter.removeListener("speed", onSpeed);
    try {
      res.end();
    } catch (err) {
      // ignore
    }
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
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const sendStage = (stage) => {
    try {
      res.write(`data: ${stage}\n\n`);
    } catch (err) {
      // ignore broken pipe
    }
  };
  stageListeners.push(sendStage);
  const onStage = (stage) => sendStage(stage);
  stageEmitter.on("stage", onStage);

  req.on("close", () => {
    const index = stageListeners.indexOf(sendStage);
    if (index >= 0) stageListeners.splice(index, 1);
    stageEmitter.removeListener("stage", onStage);
    try {
      res.end();
    } catch (err) {
      // ignore
    }
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
    return res.json({success: true, message: "Download stopped! Queue cleared."});
  } else {
    logger.warn("No download to cancel");
    return res.status(400).json({
      error: {code: "NO_DOWNLOAD_IN_PROGRESS", message: "No download in progress !"},
    });
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
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const sendPlaylistInfo = (info) => {
    try {
      res.write(`data: ${info}\n\n`);
    } catch (err) {
      // ignore broken pipe
    }
  };
  playlistListeners.push(sendPlaylistInfo);
  const onPlaylist = (info) => sendPlaylistInfo(info);
  playlistEmitter.on("playlist", onPlaylist);

  // Remove listener when client disconnects
  req.on("close", () => {
    const index = playlistListeners.indexOf(sendPlaylistInfo);
    if (index >= 0) playlistListeners.splice(index, 1);
    playlistEmitter.removeListener("playlist", onPlaylist);
    try {
      res.end();
    } catch (err) {
      // ignore
    }
  });
}

module.exports = {
  downloadController,
  progressController,
  speedController,
  stageController,
  cancelDownloadController,
  playlistInfoController,
};
