const path = require("path");
const fs = require("fs");
const { app } = require("electron");

const userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");
const sourceYtDlp = path.join(process.resourcesPath, "yt-dlp.exe");

if (!fs.existsSync(userYtDlp)) fs.copyFileSync(sourceYtDlp, userYtDlp);

module.exports = { 
    userYtDlp, 
    sourceYtDlp 
};
