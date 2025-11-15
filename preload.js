const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),
  setProgress: (percent) => ipcRenderer.send("set-progress", percent)
});
