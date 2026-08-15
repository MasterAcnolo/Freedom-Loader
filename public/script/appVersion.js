/**
 * Retrieves the application version and build state from the backend.
 * Displays a formatted string indicating packaging state and preview status.
 * Hides the "Packaged" state for production builds to keep the UI clean.
 *
 * Example outputs: "Not Packaged Preview v1.6.2" or "Preview v1.6.2"
 *
 * @returns {Promise<void>}
 */
async function displayVersionLabel() {
  /**
   * Raw version string from the backend (e.g., "dev-1.6.2-preview" or "v1.6.2")
   * @type {string}
   */
  const appVersion = await window.electronAPI.getVersion();

  /**
   * UI element displaying the current application version.
   * @type {HTMLElement | null}
   */
  const versionBadge = document.getElementById("version-badge");

  if (!versionBadge) return;

  /**
   * Extracts the numeric semantic version (e.g., "1.6.2").
   * @type {RegExpMatchArray | null}
   */
  const versionMatch = appVersion.match(/(\d+\.\d+\.\d+)/);
  const baseVersion = versionMatch ? versionMatch[0] : "Unknown";

  /**
   * Determines the packaging state. The backend prepends "dev-" if unpackaged.
   * @type {boolean}
   */
  const isPackaged = !appVersion.includes("dev-");

  /**
   * Determines if the current build is a preview version.
   * @type {boolean}
   */
  const isPreview = appVersion.includes("preview");

  /**
   * Construct the final display string.
   * If packaged, we don't mention it. If not, we explicitly say "Not Packaged ".
   */
  const packageStateStr = isPackaged ? "" : "Not Packaged ";
  const previewStr = isPreview ? "Preview " : "";

  versionBadge.textContent = `${packageStateStr}${previewStr}v${baseVersion}`;
}

displayVersionLabel();