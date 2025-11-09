const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config");

let userYtDlp;
const sourceYtDlp = path.join(process.resourcesPath, "yt-dlp.exe");

if (config.localMode === true) {

    userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
} else {

    userYtDlp = path.join(app.getPath("userData"), "yt-dlp.exe");
    if (!fs.existsSync(userYtDlp)) fs.copyFileSync(sourceYtDlp, userYtDlp);
}

module.exports = { userYtDlp, sourceYtDlp };
