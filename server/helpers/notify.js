const { Notification, shell } = require("electron");
const path = require("path");

function notifyDownloadFinished(folder) {
  const iconPath = path.join(process.resourcesPath, "confirm-icon.png");
  const notif = new Notification({
    title: "Freedom Loader",
    body: "Ton téléchargement est terminé, clique ici pour l'ouvrir.",
    icon: iconPath,
  });

  notif.on("click", () => shell.openPath(folder));
  notif.show();
}

function notifyCookiesBrowserError(){
  const iconPath = path.join(process.resourcesPath, "error.png");
  const notif = new Notification({
    title: "Cookies Error",
    body: "Impossible de récupérer les cookies. Connectez-vous sur votre navigateur et cliquez ici pour voir le tuto.",
    icon: iconPath,
  });

  notif.on("click", () => shell.openExternal("https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"));
  notif.show();
}

module.exports = {
  notifyDownloadFinished, 
  notifyCookiesBrowserError
};