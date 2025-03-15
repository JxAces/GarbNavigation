const mongoose = require("mongoose");

const BacklogSchema = new mongoose.Schema({
  locationSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocationSchedule",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Backlog", BacklogSchema);