const { contextBridge, ipcRenderer } = require("electron");

/**
 * Exposes the main application API to the renderer process.
 *
 * This API acts as a secure bridge between the renderer and the
 * Electron main process using IPC (Inter-Process Communication).
 * All calls are explicitly whitelisted.
 */
contextBridge.exposeInMainWorld("electronAPI", {

  /**
   * Returns the default system download directory.
   */
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),

  /**
   * Opens a native dialog allowing the user to select a download folder.
   */
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),

  /**
   * Sends download progress value to the main process (used for taskbar / UI sync).
   *
   * @param {number} percent - Download progress percentage (0–100)
   */
  setProgress: (percent) => ipcRenderer.send("set-progress", percent),

  /**
   * Retrieves application feature flags (runtime configuration).
   */
  getFeatures: () => ipcRenderer.invoke("features"),

  /**
   * Updates a feature flag dynamically at runtime.
   *
   * @param {string} key - Feature name
   * @param {any} value - Feature value
   */
  setFeature: (key, value) =>
    ipcRenderer.invoke("set-feature", { key, value }),

  /**
   * Returns the current application version.
  */
  getVersion: () => ipcRenderer.invoke("version"),

  /**
   * Validates a download path before using it for file operations.
   *
   * @param {string} path - Path to validate
   */
  getValidatedDownloadPath: (path) =>
    ipcRenderer.invoke("validate-download-path", path),

  /**
   * Retrieves available themes from the filesystem or config layer.
   */
  getThemes: () => ipcRenderer.invoke("get-themes"),

  /**
   * Forces a reload of theme files (useful after modification/import).
   */
  reloadThemes: () => ipcRenderer.invoke("reload-themes"),
});


/**
 * Exposes window control and developer utilities for the custom topbar UI.
 *
 * These methods forward commands to the Electron main process via IPC.
 */
contextBridge.exposeInMainWorld("topbarAPI", {

  /**
   * Minimizes the application window.
   */
  minimize: () => ipcRenderer.send("window-minimize"),

  /**
   * Toggles maximize/restore state of the application window.
   */
  maximize: () => ipcRenderer.send("window-maximize"),

  /**
   * Closes the application window.
   */
  close: () => ipcRenderer.send("window-close"),

  /**
   * Opens Chromium DevTools for debugging.
   */
  openDevTools: () => ipcRenderer.send("open-devtools"),

  /**
   * Opens application logs directory or log viewer.
   */
  openLogs: () => ipcRenderer.send("open-logs"),

  /**
   * Opens the official website or project homepage.
   */
  openWebsite: () => ipcRenderer.send("open-website"),

  /**
   * Opens the theme directory or theme editor interface.
   */
  openTheme: () => ipcRenderer.send("open-theme"),

  /**
   * Opens project wiki/documentation.
   */
  openWiki: () => ipcRenderer.send("open-wiki"),

  /**
   * Opens the workshop or external content library.
   */
  openWorkshop: () => ipcRenderer.send("open-workshop"),

  /**
   * Opens configuration/settings panel.
   */
  openConfig: () => ipcRenderer.send("open-config"),
});