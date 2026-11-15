const { ipcMain } = require("electron");
const { fetchNormalizedInfo } = require("../../server/services/info.services");
const { isValidUrl } = require("../../server/helpers/validation.helpers");
const { logger } = require("../../server/logger");

function registerInfoAPIHandlers() {
  ipcMain.handle("fetch-info", async (_, url) => {
    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      throw Object.assign(new Error("Invalid or missing URL"), {
        code: "INVALID_URL",
      });
    }

    try {
      logger.info(`Info request received. RAW URL: ${url}`);
      return await fetchNormalizedInfo(url);
    } catch (err) {
      logger.error(`Info handler error: ${err?.message ?? err}`);
      throw Object.assign(new Error("Unable to fetch info"), {
        code: "FETCH_FAILED",
      });
    }
  });
}

module.exports = {
  registerInfoAPIHandlers,
};
