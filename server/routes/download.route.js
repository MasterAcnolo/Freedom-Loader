const express = require("express");
const router = express.Router();
const { downloadController, progressController, speedController, cancelDownloadController } = require("../controller/download.controller");

router.post("/", downloadController);
router.post("/cancel", cancelDownloadController);

// SSE for download progress
router.get("/progress", progressController);
router.get("/speed", speedController);

module.exports = router;