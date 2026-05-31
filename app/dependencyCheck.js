const fs = require("fs");
const { app, dialog } = require("electron");
const { logger } = require("../server/logger");

/**
 * Verifies that all required native binaries exist before the app starts.
 *
 * This includes:
 * - yt-dlp (download engine)
 * - ffmpeg (media processing)
 * - ffprobe (media inspection)
 * - deno (JS runtime used by yt-dlp hooks)
 *
 * If any dependency is missing:
 * - logs the error
 * - shows a blocking Electron error dialog
 * - exits the application
 *
 * @returns {boolean} true if all dependencies are present, false otherwise
 */
function checkNativeDependencies() {
  /**
   * Native dependency paths are resolved at runtime from the server helpers.
   * This ensures correct resolution in both dev and packaged builds.
   */
  const { binaryPaths } = require("../server/helpers/path.helpers");

  /**
   * List of required external executables used by the application runtime.
   * Each entry defines a binary name and its resolved absolute path.
   */
  const deps = [
    { name: "yt-dlp.exe",  path: binaryPaths.ytDlp },
    { name: "ffmpeg.exe",  path: binaryPaths.ffmpeg },
    { name: "ffprobe.exe", path: binaryPaths.ffprobe },
    { name: "deno.exe",    path: binaryPaths.deno },
  ];

  const missing = deps.filter(d => !fs.existsSync(d.path));
  if (missing.length === 0) return true;

  /**
   * Human-readable list of missing binaries for logging and user dialog display.
   */
  const list = missing.map(d => d.name).join(", ");
  logger.error(`Missing dependencies: ${list}`);

  /**
   * Defers error dialog until Electron app is fully initialized.
   * Required to safely display modal dialogs before quit.
   */
  app.whenReady().then(() => {
    dialog.showErrorBox(
      "Missing dependencies",
      `The following files are missing in the 'ressources' folder:\n${list}\n\nThe application will now exit. Try to reinstall.`
    );
    app.quit();
  });

  return false;
}

module.exports = { checkNativeDependencies };