const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const config = require("../../config.js");

/**
 * Is the OS windows
 */
const isWindows = process.platform === 'win32'

/**
 * On windows the binaries are name.exe on Linux/macOS no
 */
const ext = isWindows ? '.exe' : ''

/**  Centralized resource paths */
const resourcesPath = config.devMode
  ? path.join(__dirname, "../../resources")
  : process.resourcesPath;

/**  Default download folder (centralized) */
const defaultDownloadFolder = path.join(app.getPath("downloads"), "Freedom Loader");

/**
 * Current platform:
 * win32 | linux | darwin
 */
const platform = process.platform;

/**
 * Dev source tree uses platform-named subfolders (matches resources/binaries/{win-32,linux,darwin}).
 * Packaged builds flatten everything directly under binaries/, since each
 * platform build only ships its own binaries — no subfolder needed.
 */
const devPlatformFolder = {
  win32: "win-32",
  linux: "linux",
  darwin: "darwin"
}[platform];

const binariesPath = config.devMode
    ? path.join(resourcesPath, "binaries", devPlatformFolder)
    : path.join(resourcesPath, "binaries");


/**
 * Runtime-resolved binary paths.
 * These values differ between development and production builds.
 */

let userYtDlp;
let ffmpegPath;
let denoPath;

/** Source binary bundled inside application resources (used for first-time copy) */
const sourceYtDlp = path.join(
  binariesPath,
  `yt-dlp${ext}`
);

/**
 * Resolve binary locations depending on environment:
 * - dev: local resources folder
 * - prod: extracted userData + packaged resources
 */
if (config.devMode) {
  userYtDlp = path.join(
    binariesPath,
    `yt-dlp${ext}`
  );

  ffmpegPath = path.join(
    binariesPath,
    `ffmpeg${ext}`
  );

  denoPath = path.join(
    binariesPath,
    `deno${ext}`
  );
} else {
  userYtDlp = path.join(
    app.getPath("userData"),
    `yt-dlp${ext}`
  );

  ffmpegPath = path.join(
    binariesPath,
    `ffmpeg${ext}`
  );

  denoPath = path.join(
    binariesPath,
    `deno${ext}`
  );

  if (!fs.existsSync(userYtDlp) && fs.existsSync(sourceYtDlp)) {
    fs.copyFileSync(sourceYtDlp, userYtDlp);

    // Linux/macOS executable permission
    if (!isWindows) {
      try {
        fs.chmodSync(userYtDlp, 0o755);
      } catch (err) {
          getLogger().warn(`Failed to chmod yt-dlp: ${err.message}`);
      }
    }
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
  ytDlp: path.join(
    binariesPath,
    `yt-dlp${ext}`
  ),

  ffmpeg: path.join(
    binariesPath,
    `ffmpeg${ext}`
  ),

  ffprobe: path.join(
    binariesPath,
    `ffprobe${ext}`
  ),

  deno: path.join(
    binariesPath,
    `deno${ext}`
  )
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
      fs.chmodSync(userThemesPath, 0o777);
        getLogger().info("Created user themes directory");
    }

    if (fs.existsSync(defaultThemesSourcePath)) {
      const defaultThemes = fs.readdirSync(defaultThemesSourcePath);
      for (const theme of defaultThemes) {
        const srcPath = path.join(defaultThemesSourcePath, theme);
        const destPath = path.join(userThemesPath, theme);

        if (!fs.existsSync(destPath)) {
          try {
              if (fs.statSync(srcPath).isDirectory()) {
                  copyDirectory(srcPath, destPath);
                  fs.chmodSync(destPath, 0o777);
              } else {
                  fs.copyFileSync(srcPath, destPath);
                  fs.chmodSync(destPath, 0o666);
              }
              getLogger().info(`Copied default theme: ${theme}`);
          } catch (copyErr) {
              getLogger().warn(`Failed to copy theme ${theme}: ${copyErr.message}`);
          }
        }
      }
    } else {
        getLogger().warn(`Default themes source path not found: ${defaultThemesSourcePath}`);
    }
  } catch (err) {
      getLogger().error(`Failed to initialize user themes: ${err.message}`);
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
      fs.mkdirSync(dest, {
        recursive: true,
        mode: 0o777
      });
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
if (!userYtDlp) {
    getLogger().error("Missing yt-dlp binary");
}

if (!ffmpegPath) {
    getLogger().error("Missing ffmpeg binary");
}

if (!denoPath) {
    getLogger().error("Missing deno binary");
}

/**
 * Helper to lazy load logger, avoid circular import
 * @returns {winston.Logger}
 */
function getLogger() {
    return require("../logger.js").logger;
}

module.exports = { userYtDlp, ffmpegPath, denoPath, iconPaths, binaryPaths, resourcesPath, defaultDownloadFolder, userThemesPath, initUserThemes, isWindows };