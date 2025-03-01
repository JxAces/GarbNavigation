const express = require('express');
const router = express.Router();
const { getSchedulesForShift } = require("../controllers/locationScheduleController");

router.get('/today/:shift?', getSchedulesForShift);

module.exports = router;
