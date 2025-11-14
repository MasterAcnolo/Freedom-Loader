const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const { logger } = require("../logger");
const { userYtDlp } = require("../helpers/path");
const getUserBrowser = require("../helpers/getBrowser");

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

router.post("/", (req, res) => {
  const { url } = req.body;
  if (!url || !isValidUrl(url)) return res.status(400).send("❌ URL invalide ou manquante");

  logger.info(`Requête /info reçue pour ${url}`);

  const args = [
    "--dump-single-json",
    "--ignore-errors",
    "--yes-playlist",
    url,
    "--cookies-from-browser",
    `${getUserBrowser()}`,
    "--extractor-args",
    "youtube:player_client=default",
    "--ignore-no-formats-error"

  ];

  execFile(userYtDlp, args, { timeout: 30_000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {

    if (stderr) {
      const lower = stderr.toLowerCase();
      if (lower.includes("sign in to confirm") || lower.includes("failed to decrypt") || lower.includes("could not copy")) {
        const browser = getUserBrowser();
        return res.status(400).send(
          `❌ Impossible d'extraire les cookies depuis ${browser}. Connectez-vous dans ce navigateur et réessayez.`
        );
      }
    }

    if (error) {
      logger.error(`Erreur yt-dlp: ${error.message}`);
      if (stderr) logger.debug(`stderr: ${stderr}`);
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }

    if (!stdout) return res.status(500).send("❌ Aucune donnée reçue.");

    try {
      const data = JSON.parse(stdout);

      if (data._type === "playlist") {
        const playlistPayload = {
          type: "playlist",
          title: data.title || data.id,
          channel: data.uploader,
          count: data.entries.length,
          videos: (data.entries || []).map(v => ({
            id: v.id,
            title: v.title,
            url: v.webpage_url,
            duration: v.duration,
            thumbnail: v.thumbnail,
            uploader: v.uploader
          }))
        };
        logger.info(`Playlist détectée : ${playlistPayload.title} (${playlistPayload.count} vidéos)`);
        return res.json(playlistPayload);
      }

      // Vidéo unique
      if (!data.title) {
        return res.status(500).send("❌ Impossible de récupérer les infos pour cette vidéo.");

      }

      logger.info(`Vidéo unique récupérée : ${data.title}`);
      res.json({ type: "video", ...data });

    } catch (e) {
      // fallback aussi si JSON est illisible
      logger.error(`Erreur parsing JSON: ${e.message}`);
      return res.status(500).send("❌ Impossible de récupérer les infos (JSON illisible).");

    }

  });
});

module.exports = router;
