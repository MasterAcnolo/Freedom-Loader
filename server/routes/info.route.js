const express = require("express");
const router = express.Router();
const { infoController } = require("../controller/info.controller");
const {infoRateLimit} = require("../helpers/rateLimit.helpers");

router.get("/", infoRateLimit, infoController);
router.post("/", infoRateLimit, infoController);

module.exports = router;