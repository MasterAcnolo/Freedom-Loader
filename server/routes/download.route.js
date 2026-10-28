const express = require("express");
const router = express.Router();
const {
  downloadController,
  progressController,
  speedController,
  stageController,
  cancelDownloadController,
  playlistInfoController,
} = require("../controller/download.controller");
const {downloadRateLimit} = require("../helpers/rateLimit.helpers");

router.post("/", downloadRateLimit, downloadController);
router.post("/cancel", downloadRateLimit, cancelDownloadController);

// SSE for download progress
router.get("/progress", progressController);
router.get("/speed", speedController);
router.get("/stage", stageController);
router.get("/playlist-info", playlistInfoController);

module.exports = router;