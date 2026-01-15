const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config");

const { logger } = require("../logger.js");

let userYtDlp;
let ffmpegPath;
let denoPath;

const sourceYtDlp = path.join(process.resourcesPath, "binaries","yt-dlp.exe");

if (config.localMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources/"); // <- contient ffmpeg.exe et ffprobe.exe
  denoPath = path.join(__dirname, "../../ressources/deno.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"),"yt-dlp.exe");
  ffmpegPath = path.join(process.resourcesPath, "binaries","ffmpeg.exe"); 
  denoPath = path.join(process.resourcesPath, "binaries","deno.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }

}

if (!userYtDlp){ logger.error("Missing YT-DLP")}
if (!ffmpegPath){ logger.error("Missing FFMPEG")}
if (!denoPath){ logger.error("Missing DENO")}

module.exports = { userYtDlp, ffmpegPath, denoPath };
