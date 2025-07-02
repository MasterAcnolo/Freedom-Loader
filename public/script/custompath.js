/*
  Ce script attend que le DOM soit complètement chargé pour initialiser
  l'affichage et la gestion du chemin de sauvegarde personnalisé.

  1. Récupère le chemin de téléchargement par défaut depuis le main process via l'API exposée.
  2. Met à jour le texte affiché dans l'élément avec l'id "savePath".
  3. Crée un input caché nommé "savePath" dans le formulaire pour envoyer ce chemin lors du submit.
  4. Ajoute un écouteur sur le bouton "changePath" pour permettre à l'utilisateur
     de choisir un dossier via une boîte de dialogue native.
  5. Met à jour l'affichage et la valeur cachée du chemin sélectionné.
*/
window.addEventListener("DOMContentLoaded", async () => {
  const defaultPath = await window.electronAPI.getDefaultDownloadPath();
  const savePathElem = document.getElementById("savePath");

  if (savePathElem) {
    savePathElem.textContent = defaultPath;
  }

  // Vérifie si l'input caché existe déjà, sinon le crée et l'ajoute au formulaire
  let hidden = document.getElementById("savePathInput");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "savePath";
    hidden.id = "savePathInput";
    document.getElementById("downloadForm").appendChild(hidden);
  }
  hidden.value = defaultPath;

  // Gestion du clic sur le bouton pour changer le dossier de téléchargement
  document.getElementById("changePath").addEventListener("click", async () => {
    const selectedPath = await window.electronAPI.selectDownloadFolder();
    if (selectedPath) {
      savePathElem.textContent = selectedPath;
      hidden.value = selectedPath;
    }
  });
});
