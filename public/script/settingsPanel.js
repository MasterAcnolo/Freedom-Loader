const settingsPanel = document.getElementById("settings-panel");
const settingsModal = document.querySelector(".settings-modal");

const settingsButton = document.getElementById("settings-button");

let isOpen = false;

settingsButton.addEventListener("click", () => {
    const isOpen = settingsPanel.style.display === "block";
    settingsPanel.style.display = isOpen ? "none" : "block";
});

function closePanel() {
    isOpen = false;
    settingsPanel.style.display = "none";
}

// charge les features
async function loadSettings() {
  const features = await window.electronAPI.getFeatures();

  document.querySelectorAll(".settings-section input, .settings-section select").forEach(el => {
    const key = el.dataset.key;
    if (features[key] !== undefined) {
      if (el.type === "checkbox") el.checked = features[key];
      else if (el.tagName === "SELECT") el.value = features[key];
    }

    el.addEventListener("change", () => {
      let value = el.type === "checkbox" ? el.checked : el.value;
      window.electronAPI.setFeature(key, value);
    });
  });
}

// ouvrir le JSON
document.getElementById("open-json-btn").addEventListener("click", () => {
  window.topbarAPI.openConfig(); // ton IPC existant
});


/* clic sur l'overlay = fermer */
settingsPanel.addEventListener("click", closePanel);

/* clic dans la modal = stop propagation */
settingsModal.addEventListener("click", (e) => {
    e.stopPropagation();
});

loadSettings();
