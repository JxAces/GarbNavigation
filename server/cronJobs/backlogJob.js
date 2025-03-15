const cron = require("node-cron");
const moment = require("moment");
const LocationSchedule = require("../models/locationSchedule");
const Backlog = require("../models/backlog");

// Function to move pending schedules to backlog
const processBacklog = async (shift) => {
  try {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${currentTime}] Running processBacklog for ${shift} shift`);
    const previousDay = moment().subtract(1, "days").format("dddd");
    const currentDay = moment().format("dddd");

    // If the shift is Third (ending at 4AM), move the previous day's Third shift
    const targetDay = shift === "Third" ? previousDay : currentDay;

    console.log(`Processing backlog for ${targetDay} - ${shift} shift`);

    const pendingSchedules = await LocationSchedule.find({
      day: targetDay,
      shift,
      collection: { $ne: "Collected" }
    });

    if (pendingSchedules.length > 0) {
      const backlogEntries = pendingSchedules.map((s) => ({
        locationSchedule: s._id
      }));

      await Backlog.insertMany(backlogEntries);
      console.log(`Moved ${pendingSchedules.length} schedules to backlog for ${shift} shift.`);
    } else {
      console.log(`No pending schedules to move for ${shift} shift.`);
    }
  } catch (error) {
    console.error("Error processing backlog:", error);
  }
};

// Schedule jobs for each shift end time
cron.schedule("03 17 * * *", () => processBacklog("First"));  // Runs at 12:00 PM
cron.schedule("0 20 * * *", () => processBacklog("Second")); // Runs at 8:00 PM
cron.schedule("0 4 * * *", () => processBacklog("Third"));   // Runs at 4:00 AM

console.log("Backlog cron jobs scheduled.");

