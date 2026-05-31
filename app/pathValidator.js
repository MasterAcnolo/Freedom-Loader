const fs = require("fs");
const path = require("path");
const { logger } = require("../server/logger");

/**
 * Cached resolved default download path.
 * Initialized lazily on first access to avoid unnecessary imports.
 */
let _defaultPath = null;

/**
 * Returns the application's default download directory.
 *
 * This value is lazily loaded and cached after first call.
 * The path originates from server configuration helpers.
 *
 * @returns {string} Absolute default download path
 */
function getDefaultDownloadPath() {

  if (!_defaultPath) {

    /**
     * Lazy-loaded dependency providing the configured default download folder.
     * Required only when function is executed to reduce startup cost.
     */
    const { defaultDownloadFolder } = require("../server/helpers/path.helpers");

    _defaultPath = defaultDownloadFolder;

  }
  return _defaultPath;
}

/**
 * Validates and sanitizes a user-provided download path.
 *
 * Steps performed:
 * - Resolves absolute real filesystem path
 * - Normalizes symbolic links via realpathSync
 * - Checks path safety rules (blocks system-critical directories)
 * - Falls back to default path if input is empty
 *
 * @param {string} userPath - User-provided directory path
 * @returns {string} Sanitized absolute path
 * @throws Error If path is invalid, unsafe, or inaccessible
 */
function validateDownloadPath(userPath) {
  
  /**
   * Lazy-loaded helper used to enforce safe directory constraints.
   * Prevents writes to protected system folders.
   */
  const { isSafePath } = require("../server/helpers/validation.helpers");

  if (!userPath) return getDefaultDownloadPath();

  try {

    /**
     * Resolves filesystem symlinks to ensure canonical absolute path.
     * Required to prevent path traversal or alias bypass.
     */
    const resolved = fs.realpathSync(path.resolve(userPath));
    if (!isSafePath(resolved)) {
      throw new Error("Path not allowed: system folders are blocked!");
    }
    return resolved;
  }
  catch (err) {
    
    /**
     * Handles invalid filesystem paths, permissions issues, or resolution failures.
     * Logs diagnostic information before propagating a sanitized error.
     */
    logger.error(`Invalid download path: ${userPath} — ${err.message}`);
    throw new Error(`Invalid or inaccessible path: ${err.message}`);
  }
}

module.exports = { validateDownloadPath, getDefaultDownloadPath };