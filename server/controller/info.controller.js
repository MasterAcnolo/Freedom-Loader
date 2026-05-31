const { fetchInfo } = require("../services/info.services");
const { parseVideo, parsePlaylist } = require("../helpers/parseInfo.helpers");
const { logger } = require("../logger");
const { isValidUrl } = require("../helpers/validation.helpers");

/**
 * Handles metadata retrieval for a video or playlist.
 *
 * This controller:
 * - Validates incoming URL (query or body)
 * - Calls yt-dlp metadata extraction service
 * - Detects playlist vs single video context
 * - Applies fallback strategy if playlist extraction fails
 * - Returns normalized parsed response (video or playlist)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function infoController(req, res) {

    const url = req.body.url || req.query.url; // Supports POST and GET requests

    /**
     * Basic validation:
     * - URL must exist
     * - Must be a string
     * - Must pass custom URL validation
     */
    if (!url || typeof url !== "string" || !isValidUrl(url)) {
        return res.status(400).send("Invalid URL Or Missing");
    }

    logger.info(`Info request received. URL: ${url}`);

    // Lightweight heuristic to detect playlist URLs
    const isPlaylistUrl = url.includes("&list") || url.includes("?list");

    logger.info(
        isPlaylistUrl
            ? "Estimated Data Type: Playlist"
            : "Estimated Data Type: Video"
    );

    try {
        let data;

        /**
         * Primary metadata fetch attempt
         */
        try {
            data = await fetchInfo(url);
        } catch (err) {

            /**
             * Fallback strategy:
             * If playlist extraction fails, retry as single video
             */
            if (isPlaylistUrl) {

                logger.info(
                    `Playlist fetch failed: ${err.message}. Retrying as single video...`
                );

                // Remove playlist query parameter (best-effort cleanup)
                const singleVideoUrl = url.split("&list")[0].split("?list")[0];

                try {
                    data = await fetchInfo(singleVideoUrl);
                    logger.info("Single video fetch succeeded after playlist failure");
                } catch (retryErr) {
                    logger.error(
                        `Single video fetch also failed: ${retryErr.message}`
                    );

                    // Preserve original error context
                    throw err;
                }

            } else {
                throw err;
            }
        }

        /**
         * Normalize response based on yt-dlp output type
         */
        if (data._type === "playlist") {

            const playlist = parsePlaylist(data);

            logger.info(
                `Playlist fetched: ${playlist.title} (${playlist.count} videos)`
            );

            return res.json(playlist);

        } else {

            const video = parseVideo(data);

            logger.info(`Video fetched: ${video.title}`);

            return res.json(video);
        }

    } catch (err) {

        logger.error(
            `Info controller error: ${err && err.message ? err.message : err}`
        );

        return res.status(500).send("Unable to fetch info");
    }
}

module.exports = { infoController };