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

module.exports = { notifyDownloadFinished };
