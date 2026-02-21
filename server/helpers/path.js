const path = require("path");
const fs = require("fs");
const os = require("os");
const { app } = require("electron");
const config = require("../../config");

const { logger } = require("../logger.js");

// Centralized resource paths
const resourcesPath = config.localMode 
  ? path.join(__dirname, "../../ressources")
  : process.resourcesPath;

// Default download folder (centralized)
const defaultDownloadFolder = path.join(os.homedir(), "Downloads", "Freedom Loader");

// Binary paths
let userYtDlp;
let ffmpegPath;
let denoPath;

const sourceYtDlp = path.join(resourcesPath, "binaries","yt-dlp.exe");

if (config.localMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources/"); // <- has ffmpeg.exe and ffprobe.exe
  denoPath = path.join(__dirname, "../../ressources/deno.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"),"yt-dlp.exe");
  ffmpegPath = path.join(resourcesPath, "binaries","ffmpeg.exe"); 
  denoPath = path.join(resourcesPath, "binaries","deno.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }
}

// Notification icon paths
const iconPaths = {
  confirm: path.join(resourcesPath, "confirm-icon.png"),
  error: path.join(resourcesPath, "error.png"),
  app: path.join(resourcesPath, "app-icon.ico")
};

// Binary paths for verification
const binaryPaths = {
  ytDlp: path.join(resourcesPath, "binaries", "yt-dlp.exe"),
  ffmpeg: path.join(resourcesPath, "binaries", "ffmpeg.exe"),
  ffprobe: path.join(resourcesPath, "binaries", "ffprobe.exe"),
  deno: path.join(resourcesPath, "binaries", "deno.exe")
};

if (!userYtDlp){ logger.error("Missing YT-DLP")}
if (!ffmpegPath){ logger.error("Missing FFMPEG")}
if (!denoPath){ logger.error("Missing DENO")}

module.exports = { userYtDlp, ffmpegPath, denoPath, iconPaths, binaryPaths, resourcesPath, defaultDownloadFolder };
