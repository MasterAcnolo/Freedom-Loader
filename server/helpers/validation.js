const path = require("path");

function isValidUrl(url) { 
  try { 
      new URL(url); 
      return true; 
      
    } catch { 
      return false; 
    } 

}

function isSafePath(folder) {
  if (!folder || folder.length < 3) return false;
  const unsafe = ["System32", "\\Windows"];
  const resolved = path.resolve(folder);
  return !unsafe.some(u => resolved.includes(u));
}

module.exports = { isValidUrl, isSafePath };
