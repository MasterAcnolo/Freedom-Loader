const path = require("path");

/**
 * Validates whether the provided string is a well-formed URL.
 *
 * The validation relies on the native URL constructor and
 * returns `true` only if the value can be successfully parsed.
 *
 * @param {string} url - URL to validate.
 * @returns {boolean} True if the URL is valid, otherwise false.
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;

  } catch {
    return false;
  }
}

/**
 * Validates whether a folder path is considered safe for
 * file operations.
 *
 * Security checks:
 * - Rejects empty or very short paths.
 * - Resolves the absolute path before validation.
 * - Prevents access to sensitive Windows system directories.
 *
 * @param {string} folder - Folder path to validate.
 * @returns {boolean} True if the path is considered safe, otherwise false.
 */
function isSafePath(folder) {
  if (!folder || folder.length < 3) return false;

  const unsafe = ["System32", "\\Windows"];
  const resolved = path.resolve(folder);

  return !unsafe.some(u => resolved.includes(u));
}

module.exports = { isValidUrl, isSafePath };