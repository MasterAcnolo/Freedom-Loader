const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config");

let userYtDlp;
let ffmpegPath;
let denoPath;

const sourceYtDlp = path.join(process.resourcesPath, "yt-dlp.exe");

if (config.localMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources"); // <- contient ffmpeg.exe et ffprobe.exe
  denoPath = path.join(__dirname, "../../ressources/deno.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");
  ffmpegPath = path.join(process.resourcesPath, "ressources"); // <- ici aussi
  denoPath = path.join(process.resourcesPath, "deno.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }
}

module.exports = { userYtDlp, ffmpegPath, denoPath };
