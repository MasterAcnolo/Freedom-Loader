const path = require("path");
const fs = require("fs");
const os = require("os");
const { app } = require("electron");
const config = require("../../config.js");

const { logger } = require("../logger.js");

// Centralized resource paths
const resourcesPath = config.localMode 
  ? path.join(__dirname, "../../ressources")
  : process.resourcesPath;

// Default download folder (centralized)
const defaultDownloadFolder = path.join(os.homedir(), "Downloads", "Freedom Loader");

// Binary paths
let userYtDlp;
let ffmpegPath;
let denoPath;

const sourceYtDlp = path.join(resourcesPath, "binaries","yt-dlp.exe");

if (config.localMode) {
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

// Notification icon paths
const iconPaths = {
  confirm: path.join(resourcesPath, "confirm-icon.png"),
  error: path.join(resourcesPath, "error.png"),
  app: path.join(resourcesPath, "app-icon.ico")
};

// Binary paths for verification
const binaryPaths = {
  ytDlp: path.join(resourcesPath, "binaries", "yt-dlp.exe"),
  ffmpeg: path.join(resourcesPath, "binaries", "ffmpeg.exe"),
  ffprobe: path.join(resourcesPath, "binaries", "ffprobe.exe"),
  deno: path.join(resourcesPath, "binaries", "deno.exe")
};

// Theme paths - themes stored in AppData to survive updates
const userThemesPath = path.join(app.getPath("userData"), "themes");
const defaultThemesSourcePath = path.join(resourcesPath, "theme");

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

if (!userYtDlp){ logger.error("Missing YT-DLP")}
if (!ffmpegPath){ logger.error("Missing FFMPEG")}
if (!denoPath){ logger.error("Missing DENO")}

module.exports = { userYtDlp, ffmpegPath, denoPath, iconPaths, binaryPaths, resourcesPath, defaultDownloadFolder, userThemesPath, initUserThemes };
