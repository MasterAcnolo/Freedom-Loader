const themeSelect = document.getElementById("themeSelect");
/**
 * Currently selected themes loaded from backend.
 * Used as cache for UI theme switching.
 */
let loadedThemes = [];

/**
 * Applies a theme object to the application UI by mapping
 * theme configuration values to CSS variables and DOM properties.
 *
 * This function mutates:
 * - document.body (background styling)
 * - :root CSS variables (design system tokens)
 * - subtitle DOM element (theme metadata display)
 *
 * @param {Object} theme - Theme definition object
 * @param {Object} theme.style - Style configuration
 */
function applyTheme(theme) {
  const root = document.documentElement;
  const style = theme.style;

  // Background
  if (theme.image) {
    document.body.style.backgroundImage = `url('${theme.image}')`;
    document.body.style.backgroundSize = style.background?.size || "cover";
    document.body.style.backgroundPosition = style.background?.position || "center";
    document.body.style.backgroundAttachment = style.background?.attachment || "fixed";
  } else {
    document.body.style.backgroundImage = "";
  }

  // CSS variables (design tokens)
  root.style.setProperty("--background-color", style.colors?.background || "#121212");
  root.style.setProperty("--default-text-color", style.colors?.text?.default || "#e0e0e0");
  root.style.setProperty("--subtitle-color", style.colors?.text?.subtitle || "#2196f3");
  root.style.setProperty("--audio-only-label-color", style.colors?.text?.audioOnly || "#f5f5f5");

  root.style.setProperty("--form-bg-color", style.form?.background || "#1e1e1e");
  root.style.setProperty("--form-input-bg-color", style.form?.input?.background || "#2a2a2a");
  root.style.setProperty("--form-input-border-color", style.form?.input?.border || "#444444");
  root.style.setProperty("--form-input-border-focus-color", style.form?.input?.borderFocus || "#2196f3");
  root.style.setProperty("--form-input-text-color", style.form?.input?.text || "#f5f5f5");
  root.style.setProperty("--form-input-placeholder-color", style.form?.input?.placeholder || "#888888");
  root.style.setProperty("--form-button-bg-color", style.form?.button?.background || "#2196f3");
  root.style.setProperty("--form-button-text-color", style.form?.button?.text || "#ffffff");
  root.style.setProperty("--form-button-bg-hover-color", style.form?.button?.hover || "#1976d2");
  root.style.setProperty("--paste-button-icon-color", style.form?.pasteButtonIcon || "#ffffff");

  root.style.setProperty("--checkbox-unchecked-bg-color", style.checkbox?.background?.unchecked || "#555555");
  root.style.setProperty("--checkbox-checked-bg-color", style.checkbox?.background?.checked || "#2196f3");
  root.style.setProperty("--checkbox-checkmark-border-color", style.checkbox?.checkmarkBorder || "#ffffff");
  root.style.setProperty("--checkbox-pulse-color", style.checkbox?.pulse || "rgba(33, 150, 243, 0.5)");

  root.style.setProperty("--download-status-color", style.download?.status || "#2196f3");

  root.style.setProperty("--progress-bar-bg-color", style.progressBar?.background || "#444444");
  root.style.setProperty("--progress-bar-fill-color", style.progressBar?.fill || "#2196f3");

  root.style.setProperty("--video-info-bg-color", style.videoInfo?.background || "#1a1a1a");
  root.style.setProperty("--video-info-text-color", style.videoInfo?.text || "#e0e0e0");
  root.style.setProperty("--video-info-heading-color", style.videoInfo?.heading || "#2196f3");
  root.style.setProperty("--video-info-list-color", style.videoInfo?.list || "#cccccc");
  root.style.setProperty("--video-info-list-strong-color", style.videoInfo?.strong || "#ffffff");
  root.style.setProperty("--video-info-link-color", style.videoInfo?.link || "#2196f3");
  root.style.setProperty("--video-info-link-hover-color", style.videoInfo?.linkHover || "#1976d2");

  root.style.setProperty("--playlist-background-color", style.playlist?.background || "#303030");

  root.style.setProperty("--settings-button-bg-color", style.settings?.button?.background || "#1e1e1e");
  root.style.setProperty("--settings-button-text-color", style.settings?.button?.text || "#e0e0e0");
  root.style.setProperty("--open-theme-button-bg-color", style.settings?.openThemeButton?.background || "#2196f3");
  root.style.setProperty("--open-theme-button-text-color", style.settings?.openThemeButton?.text || "#ffffff");
  root.style.setProperty("--open-json-button-bg-color", style.settings?.openJsonButton?.background || style.settings?.button?.background || "#1e1e1e");
  root.style.setProperty("--open-json-button-text-color", style.settings?.openJsonButton?.text || style.settings?.button?.text || "#e0e0e0");
  root.style.setProperty("--settings-modal-bg-color", style.settings?.background?.modal || "#1e1e1e");
  root.style.setProperty("--settings-section-bg-color", style.settings?.background?.section || "#2a2a2a");
  root.style.setProperty("--settings-text-color", style.settings?.text || "#e0e0e0");
  root.style.setProperty("--settings-subtitle-color", style.settings?.subtitle || "#aaaaaa");

  const subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.textContent = theme.subtitle || theme.name;
}

/**
 * Persists selected theme ID into Electron backend features storage.
 *
 * @param {string} themeId
 */
function saveTheme(themeId) {
  window.electronAPI.setFeature("theme", themeId);
}

/**
 * Populates theme dropdown selector with available themes.
 *
 * @param {Array} themes
 */
function populateThemeSelect(themes) {
  themeSelect.innerHTML = "";

  for (const theme of themes) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;
    themeSelect.appendChild(option);
  }
}

/**
 * Initializes theme system:
 * - loads themes from backend
 * - restores saved theme
 * - applies selected theme
 */
async function initThemes() {
  loadedThemes = await window.electronAPI.getThemes();

  if (!loadedThemes.length) {
    const defaultTheme = {
      id: "dark",
      name: "Dark",
      subtitle: "Because Why Not ?",
      style: {
        background: {
          size: "cover",
          position: "center",
          attachment: "fixed"
        },

        colors: {
          background: "#121212",
          text: {
            default: "#e0e0e0",
            subtitle: "#2196f3",
            audioOnly: "#f5f5f5"
          }
        },

        form: {
          background: "#1e1e1e",
          input: {
            background: "#2a2a2a",
            border: "#444444",
            borderFocus: "#2196f3",
            text: "#f5f5f5",
            placeholder: "#888888"
          },
          button: {
            background: "#2196f3",
            text: "#ffffff",
            hover: "#1976d2"
          },
          pasteButtonIcon: "#ffffff"
        },

        checkbox: {
          background: {
            unchecked: "#555555",
            checked: "#2196f3"
          },
          checkmarkBorder: "#ffffff",
          pulse: "rgba(33, 150, 243, 0.5)"
        },

        download: {
          status: "#2196f3"
        },

        progressBar: {
          background: "#444444",
          fill: "#2196f3"
        },

        videoInfo: {
          background: "#1a1a1a",
          text: "#e0e0e0",
          heading: "#2196f3",
          list: "#cccccc",
          strong: "#ffffff",
          link: "#2196f3",
          linkHover: "#1976d2"
        },

        playlist: {
          background: "#303030"
        },

        settings: {
          button: {
            background: "#1e1e1e",
            text: "#e0e0e0"
          },
          openThemeButton: {
            background: "#2196f3",
            text: "#ffffff"
          },
          openJsonButton: {
            background: "#2196f3",
            text: "#ffffff"
          },
          background: {
            modal: "#1e1e1e",
            section: "#2a2a2a"
          },
          text: "#e0e0e0",
          subtitle: "#aaaaaa"
        }
      }
    };

    loadedThemes = [defaultTheme];
  }

  populateThemeSelect(loadedThemes);

  const features = await window.electronAPI.getFeatures();
  const savedId = features.theme;

  const theme = loadedThemes.find(t => t.id === savedId) || loadedThemes[0];

  themeSelect.value = theme.id;
  applyTheme(theme);
}

/**
 * Handles theme selection change from UI dropdown.
 */
themeSelect.addEventListener("change", (e) => {
  const theme = loadedThemes.find(t => t.id === e.target.value);
  if (!theme) return;

  applyTheme(theme);
  saveTheme(theme.id);
});

/**
 * Reloads themes from backend and reapplies current selection.
 */
async function refreshThemes() {
  loadedThemes = await window.electronAPI.reloadThemes();
  populateThemeSelect(loadedThemes);

  const features = await window.electronAPI.getFeatures();
  const savedId = features.theme;

  const theme = loadedThemes.find(t => t.id === savedId) || loadedThemes[0];

  themeSelect.value = theme.id;
  applyTheme(theme);
}

window.refreshThemes = refreshThemes;

initThemes();