/**
 * Initializes topbar button event listeners and binds them
 * to the Electron preload API exposed in `window.topbarAPI`.
 *
 * This function is safe to call once DOM is ready.
 * It silently aborts if the API or elements are missing.
 */
export function initTopBar() {
  const { topbarAPI } = window;
  if (!topbarAPI) return;

  const minBtn = document.getElementById("minimize-btn");
  if (minBtn) minBtn.onclick = () => topbarAPI.minimize();

  const maxBtn = document.getElementById("maximize-btn");
  if (maxBtn) maxBtn.onclick = () => topbarAPI.maximize();

  const closeBtn = document.getElementById("close-btn");
  if (closeBtn) closeBtn.onclick = () => topbarAPI.close();
  
  const devtoolsBtn = document.getElementById("devtools-btn");
  if (devtoolsBtn) devtoolsBtn.onclick = () => topbarAPI.openDevTools();
  
  const logsBtn = document.getElementById("logs-btn");
  if (logsBtn) logsBtn.onclick = () => topbarAPI.openLogs();
  
  const websiteBtn = document.getElementById("website-btn");
  if (websiteBtn) websiteBtn.onclick = () => topbarAPI.openWebsite();
  
  const wikiBtn = document.getElementById("wiki-btn");
  if (wikiBtn) wikiBtn.onclick = () => topbarAPI.openWiki();
  
  const workshopBtn = document.getElementById("workshop-btn");
  if (workshopBtn) workshopBtn.onclick = () => topbarAPI.openWorkshop();

}

async function attachListeners(){
  try{
    const featuresList = await window.electronAPI.getFeatures();
  
    if (!featuresList.customTopBar) {
      const topbar = document.getElementById("topbar");
      const container = document.getElementById("container");
      const themeSwitcher = document.getElementById("theme-switcher");
  
      if (topbar) topbar.style.display = "none";
      if (container) container.style.marginTop = "0";
      if (themeSwitcher) themeSwitcher.style.top = "30px";
    }
    
  } catch (error) {
    console.error("Failed to load layout features for topbar:", error);
  }

}

initTopBar()
document.addEventListener("DOMContentLoaded", attachListeners)