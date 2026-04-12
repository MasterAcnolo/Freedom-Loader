const express = require("express");
const router = express.Router();
const { downloadController, progressController, speedController, stageController, cancelDownloadController } = require("../controller/download.controller");

router.post("/", downloadController);
router.post("/cancel", cancelDownloadController);

// SSE for download progress
router.get("/progress", progressController);
router.get("/speed", speedController);
router.get("/stage", stageController);

module.exports = router;