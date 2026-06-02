/**
 * Initializes topbar button event listeners and binds them
 * to the Electron preload API exposed in `window.topbarAPI`.
 *
 * This function is safe to call once DOM is ready.
 * It silently aborts if the API or elements are missing.
 */
function setupTopbarListeners() {
  const { topbarAPI } = window;
  if (!topbarAPI) return;

  const minBtn = document.getElementById("minimize-btn");
  const maxBtn = document.getElementById("maximize-btn");
  const closeBtn = document.getElementById("close-btn");
  const devtoolsBtn = document.getElementById("devtools-btn");
  const logsBtn = document.getElementById("logs-btn");
  const websiteBtn = document.getElementById("website-btn");
  const wikiBtn = document.getElementById("wiki-btn");
  const workshopBtn = document.getElementById("workshop-btn");

  if (minBtn) minBtn.onclick = () => topbarAPI.minimize();
  if (maxBtn) maxBtn.onclick = () => topbarAPI.maximize();
  if (closeBtn) closeBtn.onclick = () => topbarAPI.close();
  if (devtoolsBtn) devtoolsBtn.onclick = () => topbarAPI.openDevTools();
  if (logsBtn) logsBtn.onclick = () => topbarAPI.openLogs();
  if (websiteBtn) websiteBtn.onclick = () => topbarAPI.openWebsite();
  if (wikiBtn) wikiBtn.onclick = () => topbarAPI.openWiki();
  if (workshopBtn) workshopBtn.onclick = () => topbarAPI.openWorkshop();
}

/**
 * Registers topbar event listeners after DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", setupTopbarListeners);

/**
 * Applies UI layout adjustments depending on feature flags
 * provided by the Electron backend.
 *
 * Specifically handles:
 * - hiding custom topbar
 * - adjusting layout spacing
 * - repositioning theme switcher
 */
(async function applyFeatureLayout() {
  const features = await window.electronAPI.getFeatures();

  if (!features.customTopBar) {
    const topbar = document.getElementById("topbar");
    const container = document.getElementById("container");
    const themeSwitcher = document.getElementById("theme-switcher");

    if (topbar) topbar.style.display = "none";
    if (container) container.style.marginTop = "0";
    if (themeSwitcher) themeSwitcher.style.top = "30px";
  }
})();