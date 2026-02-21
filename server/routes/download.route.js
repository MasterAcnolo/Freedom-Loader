const express = require("express");
const router = express.Router();
const { downloadController, progressController, speedController } = require("../controller/download.controller");

router.post("/", downloadController);

// SSE for download progress
router.get("/progress", progressController);
router.get("/speed", speedController);

module.exports = router;