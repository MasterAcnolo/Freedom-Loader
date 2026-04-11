const fs = require("fs");
const { app, dialog } = require("electron");
const { logger } = require("../server/logger");

function checkNativeDependencies() {
  const { binaryPaths } = require("../server/helpers/path.helpers");

  const deps = [
    { name: "yt-dlp.exe",  path: binaryPaths.ytDlp },
    { name: "ffmpeg.exe",  path: binaryPaths.ffmpeg },
    { name: "ffprobe.exe", path: binaryPaths.ffprobe },
    { name: "deno.exe",    path: binaryPaths.deno },
  ];

  const missing = deps.filter(d => !fs.existsSync(d.path));
  if (missing.length === 0) return true;

  const list = missing.map(d => d.name).join(", ");
  logger.error(`Missing dependencies: ${list}`);

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