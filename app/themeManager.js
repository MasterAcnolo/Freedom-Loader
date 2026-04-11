const fs = require("fs");
const path = require("path");
const { logger } = require("../server/logger");
const JSZip = require("jszip");

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const ALLOWED_IMAGE_NAMES = ["cover", "background"];

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

function getNestedValue(obj, keys) {
  return keys.reduce((acc, key) => acc?.[key], obj);
}

function validateThemeJson(json) {
  for (const keyPath of REQUIRED_KEYS) {
    if (getNestedValue(json, keyPath) === undefined) {
      return { valid: false, reason: `Missing key: ${keyPath.join(".")}` };
    }
  }
  return { valid: true };
}

let cachedThemes = null;
let themeFolderPath = null;

function setThemeFolderPath(folderPath) {
  themeFolderPath = folderPath;
}

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

    // ZIP
    if (file.endsWith(".zip")) {
      const theme = await loadThemeFromZip(filePath, themeId);
      if (theme) themes.push(theme);
      continue;
    }

    // Dossier décompressé
    if (fs.statSync(filePath).isDirectory()) {
      const theme = await loadThemeFromFolder(filePath, themeId);
      if (theme) themes.push(theme);
      continue;
    }
  }

  return themes;
}

async function loadThemeFromZip(zipPath, themeId) {
  try {
    const zipBuffer = fs.readFileSync(zipPath);
    const zip = await JSZip.loadAsync(zipBuffer);

    const jsonFile = Object.keys(zip.files).find(f => f.endsWith(".theme.json"));
    if (!jsonFile) {
      logger.warn(`Theme ${themeId}: no .theme.json found, skipping`);
      return null;
    }

    const jsonContent = await zip.files[jsonFile].async("string");
    let themeJson;
    try { themeJson = JSON.parse(jsonContent); }
    catch { logger.warn(`Theme ${themeId}: invalid JSON, skipping`); return null; }

    const validation = validateThemeJson(themeJson);
    if (!validation.valid) {
      logger.warn(`Theme ${themeId}: ${validation.reason}, skipping`);
      return null;
    }

    let imageData = null;
    const imageFile = Object.keys(zip.files).find(f => {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext).toLowerCase();
      return ALLOWED_IMAGE_NAMES.includes(name) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFile) {
      const imageBuffer = await zip.files[imageFile].async("nodebuffer");
      if (imageBuffer.length > MAX_IMAGE_SIZE) {
        logger.warn(`Theme ${themeId}: image too large, ignoring image`);
      } else {
        const ext = path.extname(imageFile).toLowerCase().replace(".", "");
        const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
        imageData = `data:image/${mime};base64,${imageBuffer.toString("base64")}`;
      }
    }

    logger.info(`Theme loaded (zip): ${themeId}`);
    return buildThemeObject(themeId, themeJson, imageData);

  } catch (err) {
    logger.warn(`Theme ${themeId}: failed to load zip — ${err.message}`);
    return null;
  }
}

async function loadThemeFromFolder(folderPath, themeId) {
  try {
    const jsonFile = fs.readdirSync(folderPath).find(f => f.endsWith(".theme.json"));
    if (!jsonFile) {
      logger.warn(`Theme ${themeId}: no .theme.json found, skipping`);
      return null;
    }

    const jsonContent = fs.readFileSync(path.join(folderPath, jsonFile), "utf-8");
    let themeJson;
    try { themeJson = JSON.parse(jsonContent); }
    catch { logger.warn(`Theme ${themeId}: invalid JSON, skipping`); return null; }

    const validation = validateThemeJson(themeJson);
    if (!validation.valid) {
      logger.warn(`Theme ${themeId}: ${validation.reason}, skipping`);
      return null;
    }

    let imageData = null;
    const imageFile = fs.readdirSync(folderPath).find(f => {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext).toLowerCase();
      return ALLOWED_IMAGE_NAMES.includes(name) && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFile) {
      const imageBuffer = fs.readFileSync(path.join(folderPath, imageFile));
      if (imageBuffer.length > MAX_IMAGE_SIZE) {
        logger.warn(`Theme ${themeId}: image too large, ignoring image`);
      } else {
        const ext = path.extname(imageFile).toLowerCase().replace(".", "");
        const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
        imageData = `data:image/${mime};base64,${imageBuffer.toString("base64")}`;
      }
    }

    logger.info(`Theme loaded (folder): ${themeId}`);
    return buildThemeObject(themeId, themeJson, imageData);

  } catch (err) {
    logger.warn(`Theme ${themeId}: failed to load folder — ${err.message}`);
    return null;
  }
}

function buildThemeObject(themeId, themeJson, imageData) {
  return {
    id: themeId,
    name: themeJson.meta.name || themeId,
    author: themeJson.meta.author || "Unknown",
    version: themeJson.meta.version,
    subtitle: themeJson.meta.subtitle || "",
    style: themeJson.style,
    image: imageData,
  };
}

async function initThemes(folderPath) {
  setThemeFolderPath(folderPath);
  cachedThemes = await loadThemesFromFolder();
  logger.info(`${cachedThemes.length} theme(s) loaded`);
}

function getThemes() {
  return cachedThemes ?? [];
}

module.exports = { initThemes, getThemes };