const path = require("path");
const fs = require("fs");
const os = require("os");
const { app } = require("electron");
const config = require("../../config.js");

const { logger } = require("../logger.js");

// Centralized resource paths
const resourcesPath = config.devMode 
  ? path.join(__dirname, "../../ressources")
  : process.resourcesPath;

// Default download folder (centralized)
const defaultDownloadFolder = path.join(os.homedir(), "Downloads", "Freedom Loader");

/**
 * Runtime-resolved binary paths.
 * These values differ between development and production builds.
 */

let userYtDlp;
let ffmpegPath;
let denoPath;

/** Source binary bundled inside application resources (used for first-time copy) */
const sourceYtDlp = path.join(resourcesPath, "binaries","yt-dlp.exe");

/**
 * Resolve binary locations depending on environment:
 * - dev: local resources folder
 * - prod: extracted userData + packaged resources
 */
if (config.devMode) {
  userYtDlp = path.join(__dirname, "../../ressources/yt-dlp.exe");
  ffmpegPath = path.join(__dirname, "../../ressources/"); // <- has ffmpeg.exe and ffprobe.exe
  denoPath = path.join(__dirname, "../../ressources/deno.exe"); 
} else {
  userYtDlp = path.join(app.getPath("userData"),"yt-dlp.exe");
  ffmpegPath = path.join(resourcesPath, "binaries","ffmpeg.exe"); 
  denoPath = path.join(resourcesPath, "binaries","deno.exe");

  if (!fs.existsSync(userYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);
  }
}

/**
 * Centralized notification and UI icon paths.
 * Used by Electron notifications and UI components.
 */
const iconPaths = {
  confirm: path.join(resourcesPath, "confirm-icon.png"),
  error: path.join(resourcesPath, "error.png"),
  app: path.join(resourcesPath, "app-icon.ico")
};

/**
 * Static reference paths to bundled binaries.
 * Used mainly for verification and diagnostics.
 */
const binaryPaths = {
  ytDlp: path.join(resourcesPath, "binaries", "yt-dlp.exe"),
  ffmpeg: path.join(resourcesPath, "binaries", "ffmpeg.exe"),
  ffprobe: path.join(resourcesPath, "binaries", "ffprobe.exe"),
  deno: path.join(resourcesPath, "binaries", "deno.exe")
};

/**
 * Theme storage system:
 * - default themes come from app resources
 * - user themes are persisted in userData to survive updates
 */
const userThemesPath = path.join(app.getPath("userData"), "themes");
const defaultThemesSourcePath = path.join(resourcesPath, "theme");

/**
 * Initializes user theme directory and ensures default themes exist.
 *
 * - Creates user themes folder if missing
 * - Copies bundled themes from resources if not present
 * - Applies permissive permissions for runtime modification
 */
function initUserThemes() {
  try {
    if (!fs.existsSync(userThemesPath)) {
      fs.mkdirSync(userThemesPath, { recursive: true });
      // Ensure folder is writable
      fs.chmodSync(userThemesPath, 0o777);
      logger.info("Created user themes directory");
    }

    // Copy default themes from resources to user directory if they don't exist
    if (fs.existsSync(defaultThemesSourcePath)) {
      const defaultThemes = fs.readdirSync(defaultThemesSourcePath);
      for (const theme of defaultThemes) {
        const srcPath = path.join(defaultThemesSourcePath, theme);
        const destPath = path.join(userThemesPath, theme);
        
        if (!fs.existsSync(destPath)) {
          try {
            copyDirectory(srcPath, destPath);
            fs.chmodSync(destPath, 0o777);
            logger.info(`Copied default theme: ${theme}`);
          } catch (copyErr) {
            logger.warn(`Failed to copy theme ${theme}: ${copyErr.message}. Theme folder will be created, add theme files manually.`);
            try {
              fs.mkdirSync(destPath, { recursive: true });
              fs.chmodSync(destPath, 0o777);
            } catch (mkdirErr) {
              logger.warn(`Could not create theme directory ${theme}: ${mkdirErr.message}`);
            }
          }
        }
      }
    } else {
      logger.warn(`Default themes source path not found: ${defaultThemesSourcePath}`);
    }
  } catch (err) {
    logger.error(`Failed to initialize user themes: ${err.message}`);
  }
}

/**
 * Recursively copies a directory and its contents.
 *
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @throws Error If copy operation fails
 */
function copyDirectory(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true, mode: 0o777 });
    }
    
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        copyDirectory(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  } catch (err) {
    throw new Error(`Copy error: ${err.message}`);
  }
}

// Runtime validation of critical binaries
if (!userYtDlp){ logger.error("Missing yt-dlp binary")}
if (!ffmpegPath){ logger.error("Missing ffmpeg binary")}
if (!denoPath){ logger.error("Missing deno binary")}

module.exports = { userYtDlp, ffmpegPath, denoPath, iconPaths, binaryPaths, resourcesPath, defaultDownloadFolder, userThemesPath, initUserThemes };
