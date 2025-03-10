const LocationSchedule = require("../models/locationSchedule");
const moment = require("moment");

exports.getSchedulesForShift = async (req, res) => {
  try {
    const currentDay = moment().format("dddd");
    const { shift } = req.params; 

    const currentHour = moment().hour();
    let autoShift;

    if (currentHour >= 4 && currentHour < 12) autoShift = "First";
    else if (currentHour >= 12 && currentHour < 20) autoShift = "Second";
    else autoShift = "Third"; 

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

exports.updateScheduleStatus = async (req, res) => {
  try {
    const { locationScheduleId } = req.params;
    if (!locationScheduleId) {
      console.log("Error: Missing locationScheduleId in request.");
      return res.status(400).json({ message: "Missing locationScheduleId in request" });
    }
    console.log(`Searching for schedule with ID: ${locationScheduleId}`);
    const schedule = await LocationSchedule.findById(locationScheduleId);
    if (!schedule) {
      console.log(`Schedule with ID ${locationScheduleId} not found in the database.`);
      return res.status(404).json({ message: "Schedule not found" });
    }
    console.log("Current Collection Status:", schedule.collection);
    if (schedule.collection === "Collected") {
      console.log("Error: Schedule is already collected.");
      return res.status(400).json({ message: "Schedule is already collected" });
    }

    schedule.collection = "Collected";
    await schedule.save();

    console.log("Successfully updated schedule to 'Collected':", schedule);

    res.status(200).json({ message: "Schedule updated to Collected", schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: error.message });
  }
};
