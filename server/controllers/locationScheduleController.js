const LocationSchedule = require("../models/locationSchedule");
const moment = require("moment");

exports.getSchedulesForCurrentShift = async (req, res) => {
  try {
    const currentDay = moment().format("dddd"); // e.g., 'Saturday'
    const currentTime = moment().format("HH:mm"); // e.g., '12:24'

    console.log(`Current Day: ${currentDay}, Current Time: ${currentTime}`);

    let shift = null;
    if (currentTime >= "04:00" && currentTime < "13:00") shift = "First";
    else if (currentTime >= "13:00" && currentTime < "20:00") shift = "Second";
    else shift = "Third"; // 8PM to 4AM

    console.log(`Querying for day: ${currentDay}, shift: ${shift}`);

    // ✅ Use populate to get full location details
    const schedules = await LocationSchedule.find({ day: currentDay, shift })
      .populate("locationId"); // Ensure we get full location details

    console.log("Schedules with Locations:", schedules);

    if (!schedules.length) {
      return res.status(404).json({
        message: `No schedules found for ${currentDay} - ${shift} shift.`,
        debug: { currentDay, currentTime, shift },
      });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
