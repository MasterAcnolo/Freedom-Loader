const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config");

const { logger } = require("../logger.js");

// Centralisation de tous les chemins de ressources
const resourcesPath = config.localMode 
  ? path.join(__dirname, "../../ressources")
  : process.resourcesPath;

// Chemins des binaires
let userYtDlp;
let ffmpegPath;
let denoPath;

const sourceYtDlp = path.join(resourcesPath, "binaries","yt-dlp.exe");

if (config.localMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources/"); // <- contient ffmpeg.exe et ffprobe.exe
  denoPath = path.join(__dirname, "../../ressources/deno.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"),"yt-dlp.exe");
  ffmpegPath = path.join(resourcesPath, "binaries","ffmpeg.exe"); 
  denoPath = path.join(resourcesPath, "binaries","deno.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }

}

// Chemins des icônes de notification
const iconPaths = {
  confirm: path.join(resourcesPath, "confirm-icon.png"),
  error: path.join(resourcesPath, "error.png"),
  app: path.join(resourcesPath, "app-icon.ico")
};

// Chemins des binaires pour vérification
const binaryPaths = {
  ytDlp: path.join(resourcesPath, "binaries", "yt-dlp.exe"),
  ffmpeg: path.join(resourcesPath, "binaries", "ffmpeg.exe"),
  ffprobe: path.join(resourcesPath, "binaries", "ffprobe.exe"),
  deno: path.join(resourcesPath, "binaries", "deno.exe")
};

if (!userYtDlp){ logger.error("Missing YT-DLP")}
if (!ffmpegPath){ logger.error("Missing FFMPEG")}
if (!denoPath){ logger.error("Missing DENO")}

module.exports = { userYtDlp, ffmpegPath, denoPath, iconPaths, binaryPaths, resourcesPath };
