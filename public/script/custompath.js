/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
  const savePathElem = document.getElementById("savePath");

  // 1️Essayer de charger depuis le localStorage
  let savedPath = localStorage.getItem("customDownloadPath");

  // 2️Sinon demander le chemin par défaut à l'API Electron
  if (!savedPath) {
    savedPath = await window.electronAPI.getDefaultDownloadPath();
  }

  // 3 Afficher le chemin
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

