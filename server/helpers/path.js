const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config");

let userYtDlp;
let ffmpegPath;

const sourceYtDlp = path.join(process.resourcesPath, "yt-dlp.exe");

if (config.localMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources/ffmpeg.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");
  ffmpegPath = path.join(process.resourcesPath, "ffmpeg.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }
}

module.exports = { userYtDlp, sourceYtDlp, ffmpegPath };
