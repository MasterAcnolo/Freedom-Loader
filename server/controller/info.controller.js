const { fetchInfo } = require("../services/info.services");
const { parseVideo, parsePlaylist } = require("../helpers/parseInfo.helpers");
const { logger } = require("../logger");
const { isValidUrl } = require("../helpers/validation.helpers");

async function infoController(req, res){

    const url = req.body.url || req.query.url; // POST et GET


    // If no url, non-string url or invalid url

    if (!url || typeof url !== "string" || !isValidUrl(url)) return res.status(400).send("Invalid URL Or Missing");

    logger.info(`/Info Request receive by the Info Controller. URL: ${url}`);

    if (url.includes("&list") || url.includes("?list")) {
        logger.info("Estimated Data Type: Playlist")

    } else{
        logger.info("Estimated Data Type: Video")
    }

    try {
    let data;
    let fetchError = null;

    try {
        data = await fetchInfo(url);
    } catch (err) {
        fetchError = err;
        
        // If it's a playlist URL and fetch failed, try fetching just the single video
        if ((url.includes("&list") || url.includes("?list"))) {
            logger.info(`Playlist fetch failed: ${err.message}. Retrying with single video...`);
            
            // Remove the &list parameter
            const singleVideoUrl = url.split("&list")[0].split("?list")[0];
            
            try {
                data = await fetchInfo(singleVideoUrl);
                logger.info(`Single video fetch succeeded after playlist failure`);
            } catch (retryErr) {
                logger.error(`Single video fetch also failed: ${retryErr.message}`);
                throw err; // Throw the original error
            }
        } else {
            throw err;
        }
    }

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