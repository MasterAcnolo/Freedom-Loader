const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),
  setProgress: (percent) => ipcRenderer.send("set-progress", percent),
  getFeatures: () => ipcRenderer.invoke("features")
});

// Contrôles de fenêtre et outils custom pour la topbar
contextBridge.exposeInMainWorld("topbarAPI", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  openDevTools: () => ipcRenderer.send("open-devtools"),
  openLogs: () => ipcRenderer.send("open-logs"),
  openWebsite: () => ipcRenderer.send("open-website"),
  openWiki: () => ipcRenderer.send("open-wiki")
});
