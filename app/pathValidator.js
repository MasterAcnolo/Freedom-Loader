const fs = require("fs");
const path = require("path");
const { logger } = require("../server/logger");

let _defaultPath = null;

function getDefaultDownloadPath() {
  if (!_defaultPath) {
    const { defaultDownloadFolder } = require("../server/helpers/path.helpers");
    _defaultPath = defaultDownloadFolder;
  }
  return _defaultPath;
}

function validateDownloadPath(userPath) {
  const { isSafePath } = require("../server/helpers/validation.helpers");

  if (!userPath) return getDefaultDownloadPath();

  try {
    const resolved = fs.realpathSync(path.resolve(userPath));
    if (!isSafePath(resolved)) {
      throw new Error("Path not allowed: system folders are blocked!");
    }
    return resolved;
  } catch (err) {
    logger.error(`Invalid download path: ${userPath} — ${err.message}`);
    throw new Error(`Invalid or inaccessible path: ${err.message}`);
  }
}

module.exports = { validateDownloadPath, getDefaultDownloadPath };