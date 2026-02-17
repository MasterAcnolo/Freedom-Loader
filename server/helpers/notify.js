const { Notification, shell } = require("electron");
const { iconPaths } = require("./path");

function notifyDownloadFinished(folder) {
  const notif = new Notification({
    title: "Freedom Loader",
    body: "Your download is complete, click here to open it.",
    icon: iconPaths.confirm,
  });

  notif.on("click", () => shell.openPath(folder));
  notif.show();
}

function notifyCookiesBrowserError(){
  const notif = new Notification({
    title: "Cookies Error",
    body: "Unable to retrieve cookies. Please log in to your browser and click here to view the tutorial.",
    icon: iconPaths.error,
  });

  notif.on("click", () => shell.openExternal("https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"));
  notif.show();
}

function notifyFirefoxBrowserMissing(){
  const notif = new Notification({
    title: "Firefox Missing",
    body: "Firefox was not found on your system. Click here to follow the installation guide",
    icon: iconPaths.error,
  });

  notif.on("click", () => shell.openExternal("https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"))
  notif.show();
}

module.exports = {
  notifyDownloadFinished, 
  notifyCookiesBrowserError,
  notifyFirefoxBrowserMissing
};