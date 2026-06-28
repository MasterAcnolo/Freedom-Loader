async function initPlatformRestrictions() {
  const platform = await window.electronAPI.getProcessPlatform();

  const themeSelect = document.getElementById("themeSelect");
  const refreshBtn = document.getElementById("refresh-themes-btn");

  /**
   * Is the OS windows
   * @type {boolean}
   */
  const isWindows = platform === "win32";

  console.log(isWindows);

  // If it's windows, the button is not disabled.
  themeSelect.disabled = !isWindows;
  refreshBtn.disabled = !isWindows;

  themeSelect.classList.toggle("disabled", !isWindows);
  refreshBtn.classList.toggle("disabled", !isWindows);

  if (!isWindows) {
    themeSelect.title = "Themes are only available on Windows";
    refreshBtn.title = "Themes are only available on Windows";
  }
}

document.addEventListener('DOMContentLoaded', function(){
    initPlatformRestrictions();
})