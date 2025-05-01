const LocationSchedule = require("../models/locationSchedule");
const Location = require("../models/location");
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

exports.getScheduleForShiftandDay= async (req, res) => { 
  const { day, shift } = req.query;

  try {
    const query = {};

    if (day) query.day = day;
    if (shift) query.shift = shift;

    const schedules = await LocationSchedule.find(query).populate('locationId');

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Server error' });
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

exports.updateSchedule = async (req, res) => {
  try {
    const { locationScheduleId } = req.params;
    const { day, shift, latitude, longitude } = req.body;

    if (!locationScheduleId) {
      return res.status(400).json({ message: "Missing locationScheduleId in request" });
    }

    const schedule = await LocationSchedule.findById(locationScheduleId).populate("locationId");
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Update schedule fields
    if (day) schedule.day = day;
    if (shift) schedule.shift = shift;

    // Update location coordinates if provided
    if (latitude || longitude) {
      if (!schedule.locationId) {
        return res.status(400).json({ message: "No location associated with this schedule" });
      }

      if (latitude) schedule.locationId.latitude = latitude.toString();
      if (longitude) schedule.locationId.longitude = longitude.toString();
      
      await schedule.locationId.save();
    }

    await schedule.save();

    // Populate the updated data before sending response
    const updatedSchedule = await LocationSchedule.findById(locationScheduleId)
      .populate("locationId");

    res.status(200).json({ 
      message: "Schedule updated successfully",
      updatedSchedule
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { locationScheduleId } = req.params;

    const deletedSchedule = await LocationSchedule.findByIdAndDelete(locationScheduleId);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: error.message });
  }
};

