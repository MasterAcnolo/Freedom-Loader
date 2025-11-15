const express = require("express");
const router = express.Router();
const { infoController } = require("../controller/info.controller");

router.post("/", infoController);

module.exports = router;