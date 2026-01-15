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
    const configBtn = document.getElementById('config-btn');

    if (minBtn) minBtn.onclick = () => topbarAPI.minimize();
    if (maxBtn) maxBtn.onclick = () => topbarAPI.maximize();
    if (closeBtn) closeBtn.onclick = () => topbarAPI.close();
    if (devtoolsBtn) devtoolsBtn.onclick = () => topbarAPI.openDevTools();
    if (logsBtn) logsBtn.onclick = () => topbarAPI.openLogs();
    if (websiteBtn) websiteBtn.onclick = () => topbarAPI.openWebsite();
    if (wikiBtn) wikiBtn.onclick = () => topbarAPI.openWiki();
    if (configBtn) configBtn.onclick = () => topbarAPI.openConfig();
  });
}

setupTopbarListeners(); // IF it put it the if check. It don't work. Why ?

const features = await window.electronAPI.getFeatures();

if(!features.customTopBar){
  document.getElementById("topbar").style.display = "none"; 
  document.getElementById("container").style.marginTop = "0";
  document.getElementById("theme-switcher").style.top = "30px";  
} 