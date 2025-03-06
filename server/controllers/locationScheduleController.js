const LocationSchedule = require("../models/locationSchedule");
const moment = require("moment");

exports.getSchedulesForShift = async (req, res) => {
  try {
    const currentDay = moment().format("dddd"); // Get today's day (e.g., 'Saturday')
    const { shift } = req.params; // Get shift from request parameters

    const currentHour = moment().hour();
    let autoShift;

    if (currentHour >= 4 && currentHour < 12) autoShift = "First";
    else if (currentHour >= 12 && currentHour < 20) autoShift = "Second";
    else autoShift = "Third"; // Covers 8PM - 4AM

    const validShifts = ["First", "Second", "Third"];
    const selectedShift = validShifts.includes(shift) ? shift : autoShift;
    console.log("Selected Shift:", selectedShift);

    const schedules = await LocationSchedule.find({ day: currentDay, shift: selectedShift })
      .populate("locationId");

    if (!schedules.length) {
      return res.status(404).json({
        message: `No schedules found for ${currentDay} - ${selectedShift} shift.`,
      });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
