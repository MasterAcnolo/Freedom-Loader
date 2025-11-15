const express = require("express");
const router = express.Router();
const { downloadController, progressController } = require("../controller/download.controller");

router.post("/", downloadController);

// SSE pour la progression du téléchargement
router.get("/progress", progressController);

module.exports = router;
