const { execFile } = require("child_process");
const { userYtDlp, denoPath } = require("../helpers/path.helpers");
const getUserBrowser = require("../helpers/getBrowser.helpers");
const { logger } = require("../logger");

/**
 * Retrieves metadata for a video or playlist using yt-dlp.
 *
 * The command executes yt-dlp in JSON mode and returns the
 * parsed response object without downloading any media.
 *
 * Features:
 * - Supports videos and playlists
 * - Imports browser cookies when available
 * - Uses Deno for JavaScript extraction
 * - Applies a 30-second timeout
 * - Limits response size to 10 MB
 *
 * @param {string} url - Video or playlist URL to inspect.
 * @returns {Promise<Object>} Resolves with the metadata returned by yt-dlp.
 *
 */
function fetchInfo(url) {

    /**
     * Base yt-dlp arguments used to retrieve metadata
     * without downloading media files.
     */
    const metadataArgs  = [
        "--js-runtimes", `deno:${denoPath}`,
        "--dump-single-json",
        "--ignore-errors",
        "--yes-playlist",
        "--cookies-from-browser",`${getUserBrowser()}`,
        "--extractor-args","youtube:player_client=default",
        "--ignore-no-formats-error",
    ];

    return new Promise((resolve, reject) => {

        execFile(userYtDlp,[...metadataArgs , url],
            {   timeout: 30_000, // 30s, if more timeout
                maxBuffer: 10 * 1024 * 1024 },  // Maximum response size: 10 MB (Node.js default is much smaller)
                
                (error, stdout, stderr) => {

            if (stderr) {
                const lower = stderr.toLowerCase();
                if (lower.includes("sign in to confirm") || lower.includes("failed to decrypt") || lower.includes("could not copy")) {
                    return reject(new Error(`Unable to extract cookies from ${getUserBrowser()}. Please log in to this browser and try again.`));
                }
            }

            if (error) {
                logger.error(`YT-DLP Error: ${error.message}`);
                if (stderr) logger.debug(`stderr: ${stderr}`);
                return reject(new Error("Unable to fetch Info."));
            }

            if (!stdout) return reject(new Error("No Data Received."));

            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                logger.error(`JSON Parsing Error: ${e.message}`);
                reject(new Error("JSON unreadable."));
            }
        });
    });
}

module.exports = { fetchInfo };
