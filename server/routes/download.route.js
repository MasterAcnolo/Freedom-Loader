const express = require("express");
const router = express.Router();
const {
  progressController,
  speedController,
  stageController,
  playlistInfoController,
} = require("../controller/download.controller");

// SSE for download progress
router.get("/progress", progressController);
router.get("/speed", speedController);
router.get("/stage", stageController);
router.get("/playlist-info", playlistInfoController);

module.exports = router;