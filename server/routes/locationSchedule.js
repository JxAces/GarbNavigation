const express = require('express');
const router = express.Router();
const { getSchedulesForShift, updateScheduleStatus } = require("../controllers/locationScheduleController");

router.get('/today/:shift?', getSchedulesForShift);
router.put("/:locationScheduleId/collect", updateScheduleStatus);

module.exports = router;
    