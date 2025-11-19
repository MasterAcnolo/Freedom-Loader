const { Notification, shell } = require("electron");
const path = require("path");

function notifyDownloadFinished(folder) {
  const iconPath = path.join(process.resourcesPath, "confirm-icon.png");
  const notif = new Notification({
    title: "Freedom Loader",
    body: "Your download is complete, click here to open it.",
    icon: iconPath,
  });

  notif.on("click", () => shell.openPath(folder));
  notif.show();
}

function notifyCookiesBrowserError(){
  const iconPath = path.join(process.resourcesPath, "error.png");
  const notif = new Notification({
    title: "Cookies Error",
    body: "Unable to retrieve cookies. Please log in to your browser and click here to view the tutorial.",
    icon: iconPath,
  });

  notif.on("click", () => shell.openExternal("https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"));
  notif.show();
}

function notifyFirefoxBrowserMissing(){
  const iconPath = path.join(process.ressourcesPath, "error.png");
  const notif = new Notification({
    title: "Firefox Missing",
    body: "Firefox was not found on your system. Click here to follow the installation guide",
    icon: iconPath,
  });

  notif.on("click", () => shell.openExternal("https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"))
  notif.show();
}

module.exports = {
  notifyDownloadFinished, 
  notifyCookiesBrowserError,
  notifyFirefoxBrowserMissing
};