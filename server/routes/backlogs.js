const express = require("express");
const router = express.Router();
const {getBacklogs} = require("../controllers/backlogController");

router.get("/", getBacklogs);

module.exports = router;