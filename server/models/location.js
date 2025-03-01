const mongoose = require('mongoose');

// Location Schema (Supports both IoT and Non-IoT Locations)
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { type: String, enum: ["IoT", "Non-IoT"], required: true },
  status: { type: String, default: "Inactive" }, // Only for IoT locations
  volume: { type: Number, default: 0 }, // Only for IoT locations
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', LocationSchema);
