const express = require('express');
const router = express.Router();
const { getSchedulesForCurrentShift } = require("../controllers/locationScheduleController");

router.get('/today', getSchedulesForCurrentShift);

module.exports = router;
