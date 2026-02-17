async function versionLabel(){
    const appVersion = await window.electronAPI.getVersion();

    // Write in front the app version for debugging (bottom right)
    document.getElementById("version-badge").textContent = `v${appVersion}`;
};

versionLabel();