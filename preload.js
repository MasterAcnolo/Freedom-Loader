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

const { contextBridge, ipcRenderer } = require("electron");

/*
  Expose dans le contexte global (window.electronAPI) deux méthodes sécurisées
  pour que le renderer puisse interagir avec le main process via IPC.

  - getDefaultDownloadPath : récupère le chemin de téléchargement par défaut.
  - selectDownloadFolder : ouvre la boîte de dialogue pour choisir un dossier.
*/
contextBridge.exposeInMainWorld("electronAPI", {
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),
});
