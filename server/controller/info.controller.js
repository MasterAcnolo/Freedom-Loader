const {fetchNormalizedInfo} = require("../services/info.services");
const { logger } = require("../logger");
const { isValidUrl } = require("../helpers/validation.helpers");

/**
 * Handles metadata retrieval for a video or playlist.
 *
 * Returns normalized JSON responses. Accepts URL via query (?url=...)
 * or request body for flexibility.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function infoController(req, res) {
  try {
    const url = req.query.url || (req.body && req.body.url);
    const encodedUrl = typeof url === "string" ? encodeURIComponent(url) : undefined;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return res.status(400).json({
        error: {code: "INVALID_URL", message: "Invalid or missing URL"},
      });
    }

    logger.info(`Info request received. RAW URL: ${url}`);
    if (encodedUrl) {
      logger.info(`Info request received. ENCODED: ${encodedUrl}`);
    }

    const result = await fetchNormalizedInfo(url);
    return res.json(result);
  } catch (err) {
    logger.error(
        `Info controller error: ${err && err.message ? err.message : err}`
    );
    return res.status(500).json({
      error: {code: "FETCH_FAILED", message: "Unable to fetch info"},
    });
  }
}

module.exports = { infoController };