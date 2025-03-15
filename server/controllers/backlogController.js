const LocationSchedule = require("../models/locationSchedule");
const Backlog = require("../models/backlog");
const Location = require("../models/location")
const moment = require("moment");

exports.movePendingToBacklog = async () => {
  try {
    const previousDay = moment().subtract(1, "day").format("dddd");
    
    const shifts = ["First", "Second", "Third"];
    
    for (const shift of shifts) {
      const pendingSchedules = await LocationSchedule.find({ 
        day: previousDay, 
        collection: "Pending" 
      });

      if (pendingSchedules.length > 0) {
        const backlogEntries = pendingSchedules.map(s => ({ locationSchedule: s._id }));
        await Backlog.insertMany(backlogEntries);
        
        console.log(`Moved ${backlogEntries.length} schedules from ${previousDay} shift: ${shift} to backlog.`);
      }
    }
  } catch (error) {
    console.error("Error moving pending schedules to backlog:", error);
  }
};

exports.getBacklogs = async (req, res) => {
  try {
    const backlogs = await Backlog.find()
      .populate({
        path: "locationSchedule",
        populate: {
          path: "locationId", // ✅ Populate location details
          model: "Location",
        },
      });

    const formattedBacklogs = backlogs.map((backlog) => {
      if (!backlog.locationSchedule || !backlog.locationSchedule.locationId) {
        return null; // Skip invalid entries
      }

      return {
        _id: backlog.locationSchedule._id, // ✅ Use locationSchedule ID
        locationId: backlog.locationSchedule.locationId, // ✅ Full location data
        day: backlog.locationSchedule.day,
        shift: backlog.locationSchedule.shift,
        collection: backlog.locationSchedule.collection,
      };
    }).filter(Boolean); // Remove null values

    res.status(200).json(formattedBacklogs);
  } catch (error) {
    console.error("Error fetching backlog data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

