window.addEventListener("DOMContentLoaded", async () => {
  const savePathElem = document.getElementById("savePath");
  const form = document.getElementById("downloadForm");

  // input caché = DERNIER chemin validé par le back
  let hidden = document.getElementById("savePathInput");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "savePath";
    hidden.id = "savePathInput";
    form.appendChild(hidden);
  }

  async function applyPathFromBack(path) {
    savePathElem.textContent = path;
    hidden.value = path;
    localStorage.setItem("customDownloadPath", path); // UX only
  }

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

  document
    .getElementById("changePath")
    .addEventListener("click", async () => {
      try {
        // selectDownloadFolder already returns a validated path
        const validatedPath =
          await window.electronAPI.selectDownloadFolder();

        if (!validatedPath) return; // cancelled

        await applyPathFromBack(validatedPath);
      } catch (err) {
        alert("This folder is not allowed. Only specific folders (Users, Downloads, Documents) are authorized for downloads.");
      }
    });
});
