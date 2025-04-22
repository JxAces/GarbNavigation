const LocationSchedule = require("../models/locationSchedule");
const Location = require('../models/location');
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

    // Fetch scheduled bins for the selected day/shift
    const scheduled = await LocationSchedule.find({ day: currentDay, shift: selectedShift })
      .populate("locationId");

    // Extract scheduled location IDs
    const scheduledLocationIds = scheduled.map(s => s.locationId?._id.toString());

    // Fetch all iot bins
    const allIotBins = await Location.find({ binType: 'iot' });

    // Add unscheduled iot bins
    const unscheduledIotBins = allIotBins.filter(bin => !scheduledLocationIds.includes(bin._id.toString()));

    // Convert unscheduled bins to a format similar to schedules
    const placeholderSchedules = unscheduledIotBins.map(bin => ({
      locationId: bin,
      isUnscheduled: true,
    }));

    // Merge both scheduled and unscheduled
    const finalSchedules = [...scheduled, ...placeholderSchedules];

    if (!finalSchedules.length) {
      return res.status(404).json({
        message: `No IoT bins or schedules found for ${currentDay} - ${selectedShift} shift.`,
      });
    }

    res.status(200).json(finalSchedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateScheduleStatus = async (req, res) => {
  try {
    const { locationScheduleId } = req.params;
    if (!locationScheduleId) {
      return res.status(400).json({ message: "Missing locationScheduleId in request" });
    }
    console.log(`Searching for schedule with ID: ${locationScheduleId}`);
    const schedule = await LocationSchedule.findById(locationScheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    console.log("Current Collection Status:", schedule.collection);
    if (schedule.collection === "Collected") {
      return res.status(400).json({ message: "Schedule is already collected" });
    }

    schedule.collection = "Collected";
    await schedule.save();

    res.status(200).json({ message: "Schedule updated to Collected", schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: error.message });
  }
};
