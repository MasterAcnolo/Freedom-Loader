const themeSelect = document.getElementById("themeSelect");
let loadedThemes = [];

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

  // Colors
  root.style.setProperty("--background-color",          style.colors?.background || "");
  root.style.setProperty("--default-text-color",        style.colors?.text?.default || "");
  root.style.setProperty("--subtitle-color",            style.colors?.text?.subtitle || "");
  root.style.setProperty("--audio-only-label-color",    style.colors?.text?.audioOnly || "");

  // Form
  root.style.setProperty("--form-bg-color",                   style.form?.background || "");
  root.style.setProperty("--form-input-bg-color",             style.form?.input?.background || "");
  root.style.setProperty("--form-input-border-color",         style.form?.input?.border || "");
  root.style.setProperty("--form-input-border-focus-color",   style.form?.input?.borderFocus || "");
  root.style.setProperty("--form-input-text-color",           style.form?.input?.text || "");
  root.style.setProperty("--form-input-placeholder-color",    style.form?.input?.placeholder || "");
  root.style.setProperty("--form-button-bg-color",            style.form?.button?.background || "");
  root.style.setProperty("--form-button-text-color",          style.form?.button?.text || "");
  root.style.setProperty("--form-button-bg-hover-color",      style.form?.button?.hover || "");
  root.style.setProperty("--paste-button-icon-color",         style.form?.pasteButtonIcon || "");

  // Checkbox
  root.style.setProperty("--checkbox-unchecked-bg-color",       style.checkbox?.background?.unchecked || "");
  root.style.setProperty("--checkbox-checked-bg-color",         style.checkbox?.background?.checked || "");
  root.style.setProperty("--checkbox-checkmark-border-color",   style.checkbox?.checkmarkBorder || "");
  root.style.setProperty("--checkbox-pulse-color",              style.checkbox?.pulse || "");

  // Download
  root.style.setProperty("--download-status-color", style.download?.status || "");

  // Progress bar
  root.style.setProperty("--progress-bar-bg-color",   style.progressBar?.background || "");
  root.style.setProperty("--progress-bar-fill-color", style.progressBar?.fill || "");

  // Video info
  root.style.setProperty("--video-info-bg-color",          style.videoInfo?.background || "");
  root.style.setProperty("--video-info-text-color",        style.videoInfo?.text || "");
  root.style.setProperty("--video-info-heading-color",     style.videoInfo?.heading || "");
  root.style.setProperty("--video-info-list-color",        style.videoInfo?.list || "");
  root.style.setProperty("--video-info-list-strong-color", style.videoInfo?.strong || "");
  root.style.setProperty("--video-info-link-color",        style.videoInfo?.link || "");
  root.style.setProperty("--video-info-link-hover-color",  style.videoInfo?.linkHover || "");

  // Playlist
  root.style.setProperty("--playlist-background-color", style.playlist?.background || "");

  // Settings
  root.style.setProperty("--settings-button-bg-color",    style.settings?.button?.background || "");
  root.style.setProperty("--settings-button-text-color",  style.settings?.button?.text || "");
  root.style.setProperty("--settings-modal-bg-color",     style.settings?.background?.modal || "");
  root.style.setProperty("--settings-section-bg-color",   style.settings?.background?.section || "");
  root.style.setProperty("--settings-text-color",         style.settings?.text || "");
  root.style.setProperty("--settings-subtitle-color",     style.settings?.subtitle || "");

  // Subtitle
  const subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.textContent = theme.subtitle || theme.name;
}

function saveTheme(themeId) {
  window.electronAPI.setFeature("theme", themeId);
}

function populateThemeSelect(themes) {
  themeSelect.innerHTML = "";
  for (const theme of themes) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;
    themeSelect.appendChild(option);
  }
}

async function initThemes() {
  loadedThemes = await window.electronAPI.getThemes();

  if (!loadedThemes.length) return;

  populateThemeSelect(loadedThemes);

  const features = await window.electronAPI.getFeatures();
  const savedId = features.theme;
  const theme = loadedThemes.find(t => t.id === savedId) || loadedThemes[0];

  themeSelect.value = theme.id;
  applyTheme(theme);
}

themeSelect.addEventListener("change", (e) => {
  const theme = loadedThemes.find(t => t.id === e.target.value);
  if (theme) {
    applyTheme(theme);
    saveTheme(theme.id);
  }
});

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