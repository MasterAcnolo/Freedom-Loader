async function versionLabel(){
    const appVersion = await window.electronAPI.getVersion();
    document.getElementById("version-badge").textContent = `v${appVersion}`;
};

versionLabel();