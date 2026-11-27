const EventEmitter = require("events");
const {randomUUID} = require("crypto");
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
const downloadJobs = new Map();
const MAX_RETAINED_DOWNLOAD_JOBS = 20;

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
 * @param {Object} body
 * @returns {Promise<{success: boolean, message: string, outputFolder: string}>}
 */
function prepareDownloadOptions(body = {}) {
  if(!body.url || !body.source){
    throw Object.assign(new Error("Missing required parameters"), {code: "MISSING_PARAMETERS"});
  }

  const options = {
      url: body.url,
      audioOnly: body.audioOnly === "1" || body.audioOnly === true,
      quality: ALLOWED_QUALITIES.has(body.quality) ? body.quality : "best",
      codec: typeof body.codec === "string" ? body.codec : undefined,
      outputFolder: body.savePath || body.outputFolder || undefined,
      playlistTitle: body.playlistTitle || undefined,
      source: body.source || "unknown",
  };

  logger.info(`Download request received from "${options.source}". URL: ${options.url}`);

  if (!options.url || typeof options.url !== "string" || !isValidUrl(options.url)) {
    throw Object.assign(new Error("Invalid URL"), {code: "INVALID_URL"});
  }
  if (options.outputFolder && !isSafePath(options.outputFolder)) {
    logger.warn(`Unsafe download path rejected: ${options.outputFolder}`);
    throw Object.assign(new Error("Save path not allowed"), {code: "INVALID_PATH"});
  }

  return options;
}

/**
 * Runs a prepared download and emits updates to an optional job listener as
 * well as to the legacy application SSE streams.
 *
 * @param {Object} options
 * @param {(event: string, data: unknown) => void} [onEvent]
 */
async function performDownload(options, onEvent) {
  const notifyEvent = (event, data) => {
    if (onEvent) onEvent(event, data);
  };

  const progressHandler = (percent) => {
    notifyEvent("progress", percent);
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
    notifyEvent("speed", speed);
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
    notifyEvent("stage", stage);
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
    notifyEvent("playlist-info", info);
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
  return {success: true, message: "Download Done !", outputFolder};
}

async function startDownload(body = {}) {
  return performDownload(prepareDownloadOptions(body));
}

/**
 * Starts a download for the HTTP API and retains its latest state so clients
 * can subscribe to its SSE stream after receiving the accepted response.
 *
 * @param {Object} body
 * @returns {{downloadId: string, eventsUrl: string}}
 */
function startHttpDownload(body = {}) {
  const options = prepareDownloadOptions(body);
  const downloadId = randomUUID();
  const job = {
    downloadId,
    status: "started",
    latest: {},
    listeners: new Set(),
  };
  downloadJobs.set(downloadId, job);

  const publish = (event, data) => {
    job.latest[event] = data;
    for (const listener of job.listeners) {
      try {
        listener(event, data);
      } catch (err) {
        job.listeners.delete(listener);
        logger.warn(`Download event listener disconnected: ${err.message}`);
      }
    }
  };

  publish("status", {status: "started"});
  pruneDownloadJobs();

  Promise.resolve()
    .then(() => {
      job.status = "running";
      publish("status", {status: "running"});
      return performDownload(options, publish);
    })
    .then((result) => {
      job.status = "completed";
      publish("completed", result);
    })
    .catch((err) => {
      job.status = "failed";
      logger.error(`HTTP download ${downloadId} failed: ${err?.message ?? err}`);
      const code = err?.code
        || (err?.message === "Download already in progress" ? "DOWNLOAD_IN_PROGRESS" : null)
        || (err?.message === "Download cancelled by user" ? "DOWNLOAD_CANCELLED" : "DOWNLOAD_FAILED");
      publish("failed", {
        error: {
          code,
          message: code === "DOWNLOAD_IN_PROGRESS"
            ? "A download is already in progress"
            : code === "DOWNLOAD_CANCELLED"
              ? "Download cancelled by user"
              : "Server Error",
        },
      });
    });

  return {downloadId, eventsUrl: `/download/${downloadId}/events`};
}

function pruneDownloadJobs() {
  while (downloadJobs.size > MAX_RETAINED_DOWNLOAD_JOBS) {
    const oldestTerminalJob = [...downloadJobs.keys()].find((id) => {
      const job = downloadJobs.get(id);
      return job.status === "completed" || job.status === "failed";
    });
    if (!oldestTerminalJob) return;
    downloadJobs.delete(oldestTerminalJob);
  }
}

/**
 * Streams the latest state and subsequent events for one HTTP download.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
function downloadEventsController(req, res) {
  const job = downloadJobs.get(req.params.downloadId);
  if (!job) {
    return res.status(404).json({
      error: {code: "DOWNLOAD_NOT_FOUND", message: "Download not found or expired"},
    });
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const writeEvent = (event, data) => {
    if (!res.destroyed && !res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };
  const snapshot = {
    downloadId: job.downloadId,
    status: job.status,
    latest: job.latest,
  };
  const listener = (event, data) => {
    writeEvent(event, data);
    if (event === "completed" || event === "failed") {
      job.listeners.delete(listener);
      if (!res.destroyed && !res.writableEnded) res.end();
    }
  };

  if (job.status !== "completed" && job.status !== "failed") {
    job.listeners.add(listener);
  }
  writeEvent("snapshot", snapshot);

  if (job.status === "completed" || job.status === "failed") {
    return res.end();
  }

  res.on("close", () => {
    job.listeners.delete(listener);
  });
}

/**
 * HTTP compatibility controller retained for consumers outside the Electron IPC bridge.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function downloadController(req, res) {
  try {
    const {downloadId, eventsUrl} = startHttpDownload(req.body || {});
    return res.status(202).json({
      success: true,
      message: "Download Started",
      downloadId,
      eventsUrl,
    });
  } catch (err) {
    logger.error(`Download error: ${err?.message ?? err}`);
    if (err?.message === "Download already in progress") {
      return res.status(409).json({
        error: {code: "DOWNLOAD_IN_PROGRESS", message: "A download is already in progress"},
      });
    }
    const isInvalidRequest = [
      "MISSING_PARAMETERS",
      "INVALID_URL",
      "INVALID_PATH",
    ].includes(err?.code);
    return res.status(isInvalidRequest ? 400 : 500).json({
      error: {
        code: err?.code || "DOWNLOAD_FAILED",
        message: isInvalidRequest
          ? err.message
          : err?.message === "Download already in progress"
            ? "A download is already in progress"
            : "Server Error",
      },
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
    } catch {
      // ignore broken pipe
    }
  };
  progressListeners.push(sendProgress);
  const onProgress = (percent) => sendProgress(percent);
  progressEmitter.on("progress", onProgress);

  res.on("close", () => {
    const index = progressListeners.indexOf(sendProgress);
    if (index >= 0) progressListeners.splice(index, 1);
    progressEmitter.removeListener("progress", onProgress);
    try {
      res.end();
    } catch {
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
    } catch {
      // ignore broken pipe
    }
  };
  speedListeners.push(sendSpeed);
  const onSpeed = (speed) => sendSpeed(speed);
  speedEmitter.on("speed", onSpeed);

  res.on("close", () => {
    const index = speedListeners.indexOf(sendSpeed);
    if (index >= 0) speedListeners.splice(index, 1);
    speedEmitter.removeListener("speed", onSpeed);
    try {
      res.end();
    } catch {
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
    } catch {
      // ignore broken pipe
    }
  };
  stageListeners.push(sendStage);
  const onStage = (stage) => sendStage(stage);
  stageEmitter.on("stage", onStage);

  res.on("close", () => {
    const index = stageListeners.indexOf(sendStage);
    if (index >= 0) stageListeners.splice(index, 1);
    stageEmitter.removeListener("stage", onStage);
    try {
      res.end();
    } catch {
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
    } catch {
      // ignore broken pipe
    }
  };
  playlistListeners.push(sendPlaylistInfo);
  const onPlaylist = (info) => sendPlaylistInfo(info);
  playlistEmitter.on("playlist", onPlaylist);

  // Remove listener when client disconnects
  res.on("close", () => {
    const index = playlistListeners.indexOf(sendPlaylistInfo);
    if (index >= 0) playlistListeners.splice(index, 1);
    playlistEmitter.removeListener("playlist", onPlaylist);
    try {
      res.end();
    } catch {
      // ignore
    }
  });
}

module.exports = {
  startDownload,
  startHttpDownload,
  downloadController,
  downloadEventsController,
  progressController,
  speedController,
  stageController,
  cancelDownloadController,
  playlistInfoController,
};
