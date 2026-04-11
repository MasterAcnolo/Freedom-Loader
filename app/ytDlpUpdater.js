const { execFile } = require("child_process");
const { logger } = require("../server/logger");

function updateYtDlp(ytDlpPath) {
  logger.info("yt-dlp update check starting...");
  execFile(ytDlpPath, ["-U"], (err, stdout) => {
    if (err) logger.warn("yt-dlp update failed (continuing):", err.message);
    else logger.info(`yt-dlp update: ${stdout.trim()}`);
  });
}

module.exports = { updateYtDlp };