const fs = require("fs");
const os = require("os");
const path = require("path");
const notify = require("./notify")

function getUserBrowser() {
  const userProfile = os.homedir();

  // Liste des navigateurs supportés par yt-dlp
  const browsers = [
    { name: "firefox", path: path.join(userProfile, "AppData", "Roaming", "Mozilla", "Firefox", "Profiles")},
    { name: "chrome", path: path.join(userProfile, "AppData", "Local", "Google", "Chrome", "User Data") },
    { name: "edge", path: path.join(userProfile, "AppData", "Local", "Microsoft", "Edge", "User Data") },
  ];

  for (const browser of browsers) {
    if (fs.existsSync(browser.path)) {
      return browser.name;
    } else{
        
    }
  }
  notify.notifyCookiesBrowserError()
  return ;
}

module.exports = getUserBrowser