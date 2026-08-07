const express = require("express");
const router = express.Router();
const { infoController } = require("../controller/info.controller");

router.get("/", infoController);

module.exports = router;