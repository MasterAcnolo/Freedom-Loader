window.addEventListener("DOMContentLoaded", async () => {
  const savePathElem = document.getElementById("savePath");

  // Essayer de charger depuis le localStorage
  let savedPath = localStorage.getItem("customDownloadPath");

  // Sinon demander le chemin par défaut à l'API Electron
  if (!savedPath) {
    savedPath = await window.electronAPI.getDefaultDownloadPath();
  }

  // Afficher le chemin
  if (savePathElem) {
    savePathElem.textContent = savedPath;
  }

  //  Créer l'input caché s'il n'existe pas déjà
  let hidden = document.getElementById("savePathInput");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "savePath";
    hidden.id = "savePathInput";
    document.getElementById("downloadForm").appendChild(hidden);
  }
  hidden.value = savedPath;

  //  Gestion du bouton de modification
  document.getElementById("changePath").addEventListener("click", async () => {
    const selectedPath = await window.electronAPI.selectDownloadFolder();
    if (selectedPath) {
      // Met à jour l'affichage
      savePathElem.textContent = selectedPath;
      hidden.value = selectedPath;

      // Et le stocke en localStorage pour la prochaine fois
      localStorage.setItem("customDownloadPath", selectedPath);
    }
  });
});

