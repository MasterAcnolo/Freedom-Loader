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
  if (!folder || typeof folder !== "string") return false;
  
  try {
    // Normalize path and resolve symlinks
    const resolved = path.resolve(folder).toLowerCase().replace(/\//g, "\\");
    
    // Block Windows system directories (on any drive)
    const unsafePaths = [
      "\\windows\\",
      "\\system32\\",
      "\\program files\\",
      "\\program files (x86)\\",
      "\\programdata\\",
      "\\$recycle.bin\\",
      "\\system volume information\\"
    ];
    
    // Check if path contains any unsafe directory
    if (unsafePaths.some(unsafe => resolved.includes(unsafe))) {
      return false;
    }
    
    // Allow all drives (C:, D:, E:, etc.) but block system folders
    return true;
    
  } catch (err) {
    // In case of path resolution error
    return false;
  }
}

module.exports = { isValidUrl, isSafePath };
