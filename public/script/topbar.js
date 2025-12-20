// Ajout des listeners pour la topbar
function setupTopbarListeners() {
  document.addEventListener('DOMContentLoaded', () => {
    const { topbarAPI } = window;
    if (!topbarAPI) return;
    const minBtn = document.getElementById('minimize-btn');
    const maxBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    const devtoolsBtn = document.getElementById('devtools-btn');
    const logsBtn = document.getElementById('logs-btn');
    const websiteBtn = document.getElementById('website-btn');
    const wikiBtn = document.getElementById('wiki-btn');

    if (minBtn) minBtn.onclick = () => topbarAPI.minimize();
    if (maxBtn) maxBtn.onclick = () => topbarAPI.maximize();
    if (closeBtn) closeBtn.onclick = () => topbarAPI.close();
    if (devtoolsBtn) devtoolsBtn.onclick = () => topbarAPI.openDevTools();
    if (logsBtn) logsBtn.onclick = () => topbarAPI.openLogs();
    if (websiteBtn) websiteBtn.onclick = () => topbarAPI.openWebsite();
    if (wikiBtn) wikiBtn.onclick = () => topbarAPI.openWiki();
  });
}

setupTopbarListeners();
