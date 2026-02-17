const { fetchInfo } = require("../services/info.services");
const { parseVideo, parsePlaylist } = require("../helpers/parseInfo");
const { logger } = require("../logger");
const { isValidUrl } = require("../helpers/validation");

async function infoController(req, res){

    const url = req.body.url || req.query.url; // Gérer POST et GET


    /* Si pas d'url, url non-string ou url invalide*/
    if (!url || typeof url !== "string" || !isValidUrl(url)) return res.status(400).send("❌ Invalid URL Or Missing");

    logger.info(`/Info Request receive by the Info Controller. URL: ${url}`);

    if (url.includes("&list")) {
        logger.info("Estimated Data Type: Playlist")

    } else{
        logger.info("Estimated Data Type: Video")
    }

    try {
    const data = await fetchInfo(url);

    if (data._type === "playlist") {

        const playlist = parsePlaylist(data);
        logger.info(`Playlist : ${playlist.title} (${playlist.count} vidéos)`);
        return res.json(playlist);

    } else{
        const video = parseVideo(data);
        logger.info(`Unique Video: ${video.title}`);
        return res.json(video);
    }


    } catch (err) {
        logger.error(`Info controller error: ${err && err.message ? err.message : err}`);
        return res.status(500).send(`❌ Unable to fetch info`);
    }
    
}

module.exports = {infoController};