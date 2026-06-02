/**
 * Settings panel DOM elements used to control application feature flags
 * and configuration UI interactions.
 */
const settingsPanel = document.getElementById("settings-panel");
const settingsModal = document.querySelector(".settings-modal");
const settingsButton = document.getElementById("settings-button");

/**
 * Tracks current settings panel state.
 * NOTE: actual visibility is derived from DOM style in current implementation.
 */
let isOpen = false;

/**
 * Toggles visibility of the settings panel when clicking the settings button.
 */
settingsButton.addEventListener("click", () => {
  const currentlyOpen = settingsPanel.style.display === "block";
  settingsPanel.style.display = currentlyOpen ? "none" : "block";
});

/**
 * Closes the settings panel and resets internal state.
 */
function closePanel() {
  isOpen = false;
  settingsPanel.style.display = "none";
}

/**
 * Loads feature flags from Electron backend and syncs them
 * with corresponding UI controls (checkboxes, selects).
 *
 * Also registers change listeners to persist updates in real time.
 */
async function loadSettings() {
  const features = await window.electronAPI.getFeatures();

  document
    .querySelectorAll(".settings-section input, .settings-section select")
    .forEach((el) => {
      const key = el.dataset.key;
      if (!key) return;

      if (features[key] !== undefined) {
        if (el.type === "checkbox") el.checked = features[key];
        else if (el.tagName === "SELECT") el.value = features[key];
      }

      el.addEventListener("change", () => {
        if (key === "theme") return;

        const value = el.type === "checkbox" ? el.checked : el.value;
        window.electronAPI.setFeature(key, value);
      });
    });
}

/**
 * Opens configuration JSON file via Electron topbar API.
 */
document.getElementById("open-json-btn")
  ?.addEventListener("click", () => {
    window.topbarAPI.openConfig();
  });

/**
 * Opens theme directory via Electron topbar API.
 */
document.getElementById("open-theme")
  ?.addEventListener("click", () => {
    window.topbarAPI.openTheme();
  });

/**
 * Refreshes theme list and updates UI selector with a short animation.
 */
document.getElementById("refresh-themes-btn")
  ?.addEventListener("click", function () {
    this.classList.add("spinning");
    window.refreshThemes();

    setTimeout(() => {
      this.classList.remove("spinning");
    }, 600);
  });

/**
 * Clicking the overlay outside the modal closes the settings panel.
 */
settingsPanel?.addEventListener("click", closePanel);

/**
 * Prevents modal clicks from closing the settings panel
 * by stopping event propagation to the overlay.
 */
settingsModal?.addEventListener("click", (e) => {
  e.stopPropagation();
});

/**
 * Initializes settings UI by loading backend feature flags.
 */
loadSettings();