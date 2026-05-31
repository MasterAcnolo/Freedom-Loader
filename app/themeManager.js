/**
 * Theme loading and parsing system.
 *
 * Supports:
 * - Folder-based themes
 * - ZIP-based themes
 * - Theme validation against required schema
 * - Image embedding as base64 data URIs
 * - Cached theme registry with sorted priority order
 *
 * Acts as the core theme ingestion pipeline for the application UI.
 */

const fs = require("fs");
const path = require("path");
const { logger } = require("../server/logger");
const JSZip = require("jszip");

/**
 * Maximum allowed size (in bytes) for theme images.
 * Prevents memory abuse from large embedded assets.
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * List of supported image file extensions for theme assets.
 */
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

/**
 * Allowed base filenames for theme background/cover images.
 * Restricts theme asset resolution to known conventions.
 */
const ALLOWED_IMAGE_NAMES = ["cover", "background"];

/**
 * Priority order used to sort themes in UI.
 * Themes not listed are placed at the end.
 */
const THEME_ORDER = ["dark", "light"];

/**
 * Required JSON schema paths for a valid theme definition.
 * Each entry represents a nested property path that must exist.
 */
const REQUIRED_KEYS = [
  ["meta", "name"],
  ["meta", "author"],
  ["meta", "version"],
  ["meta", "formatVersion"],
  ["style", "colors", "background"],
  ["style", "colors", "text", "default"],
  ["style", "form", "button", "background"],
  ["style", "progressBar", "fill"],
];

/**
 * Safely retrieves a deeply nested value from an object using a key path array.
 *
 * @param {object} obj - Target object
 * @param {string[]} keys - Property path segments
 * @returns {*} value or undefined if path is invalid
 */
function getNestedValue(obj, keys) {
  return keys.reduce((acc, key) => acc?.[key], obj);
}

/**
 * Validates theme JSON structure against required schema.
 *
 * Ensures all mandatory configuration keys exist before theme is accepted.
 *
 * @param {object} json - Parsed theme JSON
 * @returns {{valid: boolean, reason?: string}}
 */
function validateThemeJson(json) {
  for (const keyPath of REQUIRED_KEYS) {
    if (getNestedValue(json, keyPath) === undefined) {
      return { valid: false, reason: `Missing key: ${keyPath.join(".")}` };
    }
  }
  return { valid: true };
}

/**
 * Normalizes raw theme JSON into application-ready theme object.
 *
 * @param {string} themeId
 * @param {object} themeJson
 * @param {string|null} imageData - Base64 encoded theme image
 * @returns {object} normalized theme object
 */
function buildThemeObject(themeId, themeJson, imageData) {
  return {
    id: themeId.toLowerCase(),
    name: themeJson.meta.name || themeId,
    author: themeJson.meta.author || "Unknown",
    version: themeJson.meta.version,
    subtitle: themeJson.meta.subtitle || "",
    style: themeJson.style,
    image: imageData,
  };
}

/**
 * Extracts and encodes an image from theme archive into base64 data URI.
 *
 * Applies safety checks:
 * - Rejects images exceeding MAX_IMAGE_SIZE
 * - Converts file extension into valid MIME type
 *
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {string|null} data URI or null if invalid
 */
function extractImage(buffer, filename) {
  if (buffer.length > MAX_IMAGE_SIZE) {
    logger.warn(`Image too large, ignoring`);
    return null;
  }
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${buffer.toString("base64")}`;
}

/**
 * Loads a theme from a ZIP archive.
 *
 * Steps:
 * - Extract ZIP content
 * - Locate .theme.json file
 * - Validate JSON structure
 * - Extract optional image asset
 * - Build normalized theme object
 *
 * @param {string} zipPath
 * @param {string} themeId
 * @returns {Promise<object|null>}
 */
async function loadThemeFromZip(zipPath, themeId) {
  try {
    const zipBuffer = fs.readFileSync(zipPath);
    const zip = await JSZip.loadAsync(zipBuffer);

    const jsonFile = Object.keys(zip.files).find(f => f.endsWith(".theme.json"));
    if (!jsonFile) { logger.warn(`Theme ${themeId}: no .theme.json, skipping`); return null; }

    let themeJson;
    try { themeJson = JSON.parse(await zip.files[jsonFile].async("string")); }
    catch { logger.warn(`Theme ${themeId}: invalid JSON, skipping`); return null; }

    const validation = validateThemeJson(themeJson);
    if (!validation.valid) { logger.warn(`Theme ${themeId}: ${validation.reason}, skipping`); return null; }

    let imageData = null;
    const imageFile = Object.keys(zip.files).find(f => {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext).toLowerCase();
      return ALLOWED_IMAGE_NAMES.includes(name) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFile) {
      const buf = await zip.files[imageFile].async("nodebuffer");
      imageData = extractImage(buf, imageFile);
    }

    logger.info(`Theme loaded (zip): ${themeId}`);
    return buildThemeObject(themeId, themeJson, imageData);

  } catch (err) {
    logger.warn(`Theme ${themeId}: failed to load zip — ${err.message}`);
    return null;
  }
}

/**
 * Loads a theme from a directory structure.
 *
 * Equivalent to ZIP loader but works on filesystem directly.
 *
 * @param {string} folderPath
 * @param {string} themeId
 * @returns {Promise<object|null>}
 */
async function loadThemeFromFolder(folderPath, themeId) {
  try {
    const jsonFile = fs.readdirSync(folderPath).find(f => f.endsWith(".theme.json"));
    if (!jsonFile) { logger.warn(`Theme ${themeId}: no .theme.json, skipping`); return null; }

    let themeJson;
    try { themeJson = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), "utf-8")); }
    catch { logger.warn(`Theme ${themeId}: invalid JSON, skipping`); return null; }

    const validation = validateThemeJson(themeJson);
    if (!validation.valid) { logger.warn(`Theme ${themeId}: ${validation.reason}, skipping`); return null; }

    let imageData = null;
    const imageFile = fs.readdirSync(folderPath).find(f => {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext).toLowerCase();
      return ALLOWED_IMAGE_NAMES.includes(name) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFile) {
      const buf = fs.readFileSync(path.join(folderPath, imageFile));
      imageData = extractImage(buf, imageFile);
    }

    logger.info(`Theme loaded (folder): ${themeId}`);
    return buildThemeObject(themeId, themeJson, imageData);

  } catch (err) {
    logger.warn(`Theme ${themeId}: failed to load folder — ${err.message}`);
    return null;
  }
}

/**
 * In-memory cache of loaded themes.
 * Avoids re-parsing filesystem on every request.
 */
let cachedThemes = null;

/**
 * Active theme directory path used as source of truth.
 */
let themeFolderPath = null;

/**
 * Sets the active theme directory path.
 *
 * @param {string} folderPath
 */
function setThemeFolderPath(folderPath) {
  themeFolderPath = folderPath;
}

/**
 * Loads all themes from the configured theme directory.
 *
 * Supports:
 * - ZIP themes (.zip)
 * - Folder themes (directory-based)
 *
 * Iterates through filesystem entries and delegates parsing
 * to the appropriate loader (ZIP or folder).
 *
 * @returns {Promise<object[]>} List of valid theme objects
 */
async function loadThemesFromFolder() {
  const themes = [];

  if (!fs.existsSync(themeFolderPath)) {
    logger.warn(`Theme folder not found: ${themeFolderPath}`);
    return themes;
  }

  const files = fs.readdirSync(themeFolderPath);

  for (const file of files) {
    const filePath = path.join(themeFolderPath, file);
    const themeId = path.basename(file, path.extname(file));

    if (file.endsWith(".zip")) {
      const theme = await loadThemeFromZip(filePath, themeId);
      if (theme) themes.push(theme);
      continue;
    }

    if (fs.statSync(filePath).isDirectory()) {
      const theme = await loadThemeFromFolder(filePath, themeId);
      if (theme) themes.push(theme);
      continue;
    }
  }

  return themes;
}

/**
 * Returns sorting priority for a theme ID.
 *
 * Lower index = higher priority.
 * Themes not in THEME_ORDER are placed at the end.
 *
 * @param {string} id
 * @returns {number}
 */
function getThemeOrder(id) {
  const index = THEME_ORDER.indexOf(id);
  return index === -1 ? Infinity : index;
}

/**
 * Initializes the theme system.
 *
 * Steps:
 * - Sets theme folder path
 * - Loads all themes from disk
 * - Sorts themes by priority order
 * - Caches result in memory
 *
 * @param {string} folderPath
 */
async function initThemes(folderPath) {
  setThemeFolderPath(folderPath);
  const themes = await loadThemesFromFolder();
  logger.info(`Themes before sort: ${themes.map(t => t.id).join(", ")}`);
  cachedThemes = themes.sort((a, b) => getThemeOrder(a.id) - getThemeOrder(b.id));
  logger.info(`Themes after sort: ${cachedThemes.map(t => t.id).join(", ")}`);
}

/**
 * Returns cached themes.
 *
 * If themes are not loaded yet, returns empty array.
 *
 * @returns {object[]}
 */
function getThemes() {
  return cachedThemes ?? [];
}

/**
 * Reloads themes from disk and refreshes cache.
 *
 * Used when themes are modified at runtime without restart.
 *
 * @returns {Promise<object[]>}
 */
async function reloadThemes() {
  const themes = await loadThemesFromFolder();
  cachedThemes = themes.sort((a, b) => getThemeOrder(a.id) - getThemeOrder(b.id));
  logger.info(`Themes reloaded: ${cachedThemes.length} theme(s)`);
  return cachedThemes;
}

module.exports = { initThemes, getThemes , reloadThemes };