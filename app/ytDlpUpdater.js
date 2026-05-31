const { execFile } = require("child_process");
const { logger } = require("../server/logger");

/**
 * Attempts to update the local yt-dlp binary using its built-in update command.
 *
 * This function:
 * - Executes yt-dlp with the `-U` flag
 * - Logs update output or warnings if update fails
 * - Never throws: update failure is non-blocking by design
 *
 * @param {string} ytDlpPath - Absolute path to the yt-dlp executable
 */
function updateYtDlp(ytDlpPath) {

  logger.info("yt-dlp update check starting...");

  /**
   * Executes yt-dlp CLI process in a non-interactive mode.
   * Used here specifically for self-update via `-U` flag.
   */
  execFile(ytDlpPath, ["-U"], (err, stdout) => {

    /**
     * Handles yt-dlp update result:
     * - Logs warning if update fails (network, binary issues, permissions)
     * - Logs stdout output when update succeeds
     */
    if (err) logger.warn("yt-dlp update failed (continuing):", err.message);
    
    else logger.info(`yt-dlp update: ${stdout.trim()}`);
  });
}

module.exports = { updateYtDlp };