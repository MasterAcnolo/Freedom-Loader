const { execFile } = require("child_process");
const { userYtDlp, defaultDownloadFolder } = require("../helpers/path.helpers");
const fs = require("fs");
const { logger } = require("../logger");
const { buildYtDlpArgs } = require("../helpers/buildArgs.helpers");
const notify = require("../helpers/notify.helpers");
const path = require("path");
const { isSafePath } = require("../helpers/validation.helpers");

let currentDownloadProcess = null;

function fetchDownload(options, listeners, speedListeners, stageListeners) {

  return new Promise((resolve, reject) => {
    const outputFolder = options.outputFolder || defaultDownloadFolder;
    
    // Normalize path and validate it's safe (within Users folder)
    let safeOutputFolder = path.resolve(outputFolder);
    
    if (!isSafePath(safeOutputFolder)) {
      logger.warn(`Path not allowed, using default instead: ${safeOutputFolder}`);
      safeOutputFolder = path.resolve(defaultDownloadFolder);
    }
    
    // Create download folder if it doesn't exist
    try {
      fs.mkdirSync(safeOutputFolder, { recursive: true });
      logger.info(`Output folder ready: ${safeOutputFolder}`);
    } catch (err) {
      logger.error(`Failed to create output folder: ${err.message}`);
      return reject(new Error(`Unable to create download folder: ${err.message}`));
    }

    const args = buildYtDlpArgs({ ...options, outputFolder: safeOutputFolder });
    logger.info(`[yt-dlp args] ${args.join(" ")}`);

    const child = execFile(userYtDlp, args);
    currentDownloadProcess = child;

    child.on("error", err => reject(new Error(`YT-DLP Error : ${err.message}`)));

    child.on("close", code => {
      currentDownloadProcess = null;
      listeners.forEach(fn => fn("done"));
      if (code === 0) resolve(safeOutputFolder);
      else if (code === null) reject(new Error(`Download cancelled by user`));
      else reject(new Error(`YT-DLP failed with code : ${code}`));
    });

    
    child.stdout.on("data", data => {
      data.toString().split("\n").forEach(line => {
        if (!line.trim()) return;
        logger.info(`[yt-dlp] ${line}`);

        // Progress Bar 
        if (line.startsWith("[download] Destination:")) {
          listeners.forEach(fn => fn("reset"));
          stageListeners.forEach(fn => fn("Downloading..."));
        }
        const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
        if (match) listeners.forEach(fn => fn(parseFloat(match[1])));

        if (line.includes("MiB/s") || line.includes("KiB/s")) {
            const match = line.match(/\d+(\.\d+)?[KM]?iB\/s/);
            if (match) {
                const speed = match[0];
                speedListeners.forEach(fn => fn(speed));
            }
        }

        // Stage messages
        if (line.includes("[Merger]")) {
          stageListeners.forEach(fn => fn("Merging formats..."));
        }
        if (line.includes("[ExtractAudio]")) {
          stageListeners.forEach(fn => fn("Extracting audio..."));
        }
        if (line.includes("[Metadata]")) {
          stageListeners.forEach(fn => fn("Adding metadata..."));
        }
        if (line.includes("[ThumbnailsConvertor]")) {
          stageListeners.forEach(fn => fn("Converting thumbnail..."));
        }
        if (line.includes("[EmbedThumbnail]")) {
          stageListeners.forEach(fn => fn("Embedding thumbnail..."));
        }

        if (line.match(/ERROR: Could not copy .* cookie database/i)) {
          notify.notifyCookiesBrowserError();
        }

      });
    });

    child.stderr.on("data", data => {
      data.toString().split("\n").forEach(line => line.trim() && logger.error(`[yt-dlp stderr] ${line}`));
    });

    
  });
}

function cancelDownload() {
  if (currentDownloadProcess) {
    logger.info("Cancelling download and killing all child processes...");
    
    // Force kill the process and all its children with SIGKILL
    try {
      // Try to kill with SIGKILL on Windows (process group) or Unix
      if (process.platform === 'win32') {
        // On Windows, kill the process tree
        require('child_process').execSync(`taskkill /PID ${currentDownloadProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        // On Unix, send SIGKILL to process group
        process.kill(-currentDownloadProcess.pid, 'SIGKILL');
      }
    } catch (err) {
      logger.warn(`Error killing process: ${err.message}`);
      // Fallback to regular kill
      currentDownloadProcess.kill('SIGKILL');
    }
    
    currentDownloadProcess = null;
    logger.info("Download cancelled successfully");
    return true;
  }
  return false;
}

module.exports = { fetchDownload, cancelDownload };
