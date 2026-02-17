const { execFile } = require("child_process");
const { userYtDlp, defaultDownloadFolder } = require("../helpers/path");
const fs = require("fs");
const { logger } = require("../logger");
const { buildYtDlpArgs } = require("../helpers/buildArgs");
const notify = require("../helpers/notify")

function fetchDownload(options, listeners, speedListeners) {

  return new Promise((resolve, reject) => {
    const outputFolder = options.outputFolder || defaultDownloadFolder;
    
    // Create download folder if it doesn't exist
    try {
      fs.mkdirSync(outputFolder, { recursive: true });
      logger.info(`Output folder ready: ${outputFolder}`);
    } catch (err) {
      logger.error(`Failed to create output folder: ${err.message}`);
      return reject(new Error(`Unable to create download folder: ${err.message}`));
    }

    const args = buildYtDlpArgs({ ...options, outputFolder });
    logger.info(`[yt-dlp args] ${args.join(" ")}`);

    const child = execFile(userYtDlp, args);

    child.on("error", err => reject(new Error(`YT-DLP Error : ${err.message}`)));

    child.on("close", code => {
      listeners.forEach(fn => fn("done"));
      if (code === 0) resolve(outputFolder);
      else reject(new Error(`YT-DLP failed with code : ${code}`));
    });

    
    child.stdout.on("data", data => {
      data.toString().split("\n").forEach(line => {
        if (!line.trim()) return;
        logger.info(`[yt-dlp] ${line}`);

        /* Progress Bar */
        if (line.startsWith("[download] Destination:")) listeners.forEach(fn => fn("reset"));
        const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
        if (match) listeners.forEach(fn => fn(parseFloat(match[1])));

        if (line.includes("MiB/s") || line.includes("KiB/s")) {
            const match = line.match(/\d+(\.\d+)?[KM]?iB\/s/);
            if (match) {
                const speed = match[0];
                speedListeners.forEach(fn => fn(speed));
            }
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

module.exports = { fetchDownload };
