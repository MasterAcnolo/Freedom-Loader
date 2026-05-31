/**
 * Initializes the download path system once the UI is ready.
 *
 * Responsibilities:
 * - Restore last known user-selected download path (localStorage)
 * - Validate it against backend rules
 * - Synchronize with backend authoritative path
 * - Setup folder selection UI interaction
 */
window.addEventListener("DOMContentLoaded", async () => {
  const savePathElem = document.getElementById("savePath");
  const form = document.getElementById("downloadForm");

  /**
   * Hidden form field storing the validated download path
   * used during download submission.
   *
   * Created dynamically if not already present in DOM.
   */
  let hidden = document.getElementById("savePathInput");
  
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "savePath";
    hidden.id = "savePathInput";
    form.appendChild(hidden);
  }

  /**
   * Applies a validated download path received from backend.
   *
   * Updates:
   * - UI display (visible path)
   * - tooltip (full path)
   * - hidden form input (used for submission)
   * - localStorage cache (UX persistence only, not authoritative)
   *
   * @param {string} path - validated absolute download path
   */
  async function applyPathFromBack(path) {
    savePathElem.textContent = path;
    savePathElem.title = path; 
    hidden.value = path;
    localStorage.setItem("customDownloadPath", path); // UX only
  }

  /**
   * Loads the initial download path on application startup.
   *
   * Priority order:
   * 1. cached localStorage value (UX only, not trusted)
   * 2. backend validated version of cached path
   * 3. backend default fallback path if validation fails
   */
  async function loadInitialPath() {
    // On affiche ce que le user a vu la dernière fois (UX)
    const cached = localStorage.getItem("customDownloadPath");
    if (cached) {
      savePathElem.textContent = cached;
    }

    // MAIS la source de vérité reste le back
    try {
      const validatedPath = await window.electronAPI.getValidatedDownloadPath(
        cached
      );
      await applyPathFromBack(validatedPath);
    } catch {
      // fallback sûr
      const defaultPath =
        await window.electronAPI.getDefaultDownloadPath();
      await applyPathFromBack(defaultPath);
    }
  }

  await loadInitialPath();

  /**
   * Opens system folder selector and updates download path.
   *
   * The selected folder is validated by Electron backend
   * before being applied to the UI and persisted.
   */
  document.getElementById("changePath").addEventListener("click", async () => {
      try {
        // selectDownloadFolder already returns a validated path
        const validatedPath = await window.electronAPI.selectDownloadFolder();

        if (!validatedPath) return; // cancelled

        await applyPathFromBack(validatedPath);
      } catch (err) {
        alert("This folder is not allowed. Only specific folders (Users, Downloads, Documents) are authorized for downloads.");
      }
    });
});
