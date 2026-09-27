async function initUpdateUI() {
  const container = document.getElementById("updateAvailable");

  const hasUpdate = await window.electronAPI.isUpdateAvailable();
  if (hasUpdate) {
    setupAndShowUpdateUI();
  }

  window.electronAPI.onUpdateAvailable((info) => {
    setupAndShowUpdateUI(info);
  });

  function setupAndShowUpdateUI(info) {
    container.style.display = "block";

    const btn = document.getElementById("btn-update");
    const icon = document.getElementById("update-icon");
    const title = document.getElementById("update-title");
    const sub = document.getElementById("update-sub");
    const progressWrap = document.getElementById("progress-wrap");
    const progressFill = document.getElementById("progress-fill");
    const progressPct = document.getElementById("progress-pct");
    const progressEta = document.getElementById("progress-eta");

    if (info && info.version) {
      sub.textContent = `A new version (${info.version}) is ready`;
    }

    if (info && info.environment && info.environment !== "auto") {
      icon.textContent = "open_in_new";

      if (info.environment === "snap") {
        sub.textContent = `Version ${info.version} is out. Use the Snap Store or run "snap refresh".`;
        btn.textContent = "View Release";
      } else {
        sub.textContent = `Version ${info.version} is out. Update via your package manager or download it manually.`;
        btn.textContent = "Download manually";
      }

      btn.onclick = () => {
        window.electronAPI.openReleasePage();
        container.style.display = "none";
      };

      return;
    }

    const initialButtonText = btn.textContent;
    const initialIconText = icon.textContent;
    const initialTitleText = title.textContent;
    const initialSubText = sub.textContent;

    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Downloading...";
      icon.textContent = "download";
      title.textContent = "Downloading update";
      progressWrap.style.display = "flex";

      try {
        await window.electronAPI.downloadUpdate();
      } catch {
        btn.disabled = false;
        btn.textContent = initialButtonText;
        icon.textContent = initialIconText;
        title.textContent = initialTitleText;
        sub.textContent = initialSubText;
        progressWrap.style.display = "none";
        progressFill.style.width = "0%";
        progressPct.textContent = "0%";
        progressEta.textContent = "";
      }
    };

    window.electronAPI.onDownloadProgress((progress) => {
      const pct = Math.round(progress.percent);
      progressFill.style.width = pct + "%";
      progressPct.textContent = pct + "%";

      const remaining = (progress.total - progress.transferred) / progress.bytesPerSecond;
      progressEta.textContent =
        remaining > 0 ? `~${Math.ceil(remaining)}s left` : "almost done";
    });

    window.electronAPI.onUpdateDownloaded(() => {
      progressFill.style.width = "100%";
      progressPct.textContent = "100%";
      progressEta.textContent = "Done";
      icon.textContent = "check";
      title.textContent = "Ready to install";
      sub.textContent = "Restart to apply the update";
      btn.textContent = "Restart";
      btn.disabled = false;
      btn.onclick = () => window.electronAPI.installUpdate();
    });
  }
}

initUpdateUI();
