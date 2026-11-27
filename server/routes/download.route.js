const express = require("express");
const router = express.Router();
const { downloadRateLimit } = require("../helpers/rateLimit.helpers");
const {
  downloadController,
  cancelDownloadController,
  progressController,
  speedController,
  stageController,
  playlistInfoController,
} = require("../controller/download.controller");

router.post("/", downloadRateLimit, downloadController);
router.post("/cancel", cancelDownloadController);

// SSE streams for download updates.
router.get("/progress", progressController);
router.get("/speed", speedController);
router.get("/stage", stageController);
router.get("/playlist-info", playlistInfoController);

module.exports = router;