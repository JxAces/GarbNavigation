const express = require('express');
const router = express.Router();
const { getSchedulesForShift, updateScheduleStatus, getScheduleForShiftandDay, deleteSchedule, updateSchedule, createLocationSchedule } = require("../controllers/locationScheduleController");

router.get('/', getScheduleForShiftandDay);
router.get('/today/:shift?', getSchedulesForShift);
router.put("/:locationScheduleId/collect", updateScheduleStatus);
router.put("/edit/:locationScheduleId", updateSchedule);
router.delete("/delete/:locationScheduleId", deleteSchedule);
router.post("/create", createLocationSchedule);

module.exports = router;
    