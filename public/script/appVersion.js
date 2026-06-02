/**
 * Retrieves the application version from the Electron main process
 * and displays it in the UI version badge (bottom-right corner).
 *
 * This is mainly used for debugging and build identification.
 */
async function versionLabel() {
  const appVersion = await window.electronAPI.getVersion();

    /**
     * UI element displaying the current application version.
     * Updated at runtime after IPC call resolves.
     */
    const versionBadge = document.getElementById("version-badge");

    if (!versionBadge) return;

    versionBadge.textContent = `${appVersion}`;
}

versionLabel();