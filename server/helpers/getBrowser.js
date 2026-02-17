const fs = require("fs");
const os = require("os");
const path = require("path");
const notify = require("./notify")
const { logger } = require("../logger");

function getUserBrowser() {
  const userProfile = os.homedir();

  // Liste des navigateurs supportés par yt-dlp (Actuellement je peux que garantir Firefox, Désolé)
  const browsers = [
    { name: "firefox", path: path.join(userProfile, "AppData", "Roaming", "Mozilla", "Firefox", "Profiles") },
    // { name: "chrome", path: path.join(userProfile, "AppData", "Local", "Google", "Chrome", "User Data", "Default") },
    // { name: "brave", path: path.join(userProfile, "AppData", "Local", "BraveSoftware", "Brave-Browser", "User Data", "Default") },
    // { name: "edge", path: path.join(userProfile, "AppData", "Local", "Microsoft", "Edge", "User Data", "Default") },
    // { name: "opera", path: path.join(userProfile, "AppData", "Roaming", "Opera Software", "Opera Stable") },
    // { name: "vivaldi", path: path.join(userProfile, "AppData", "Local", "Vivaldi", "User Data", "Default") },
    // { name: "safari", path: path.join(userProfile, "AppData", "Local", "Apple Computer", "Safari") },
    // { name: "whale", path: path.join(userProfile, "AppData", "Local", "Naver", "Naver Whale", "User Data", "Default") }
  ];

  // Chercher un navigateur disponible
  for (const browser of browsers) {
    if (fs.existsSync(browser.path)) {
      logger.info(`Browser found: ${browser.name}`);
      return browser.name;
    }
  }

  // Aucun navigateur trouvé - notifier l'utilisateur
  logger.warn("No supported browser found on the system");
  notify.notifyFirefoxBrowserMissing();
  
  // Fallback: retourner "firefox" pour laisser yt-dlp gérer l'erreur
  // plutôt que de crasher l'application
  return "firefox";
}

module.exports = getUserBrowser