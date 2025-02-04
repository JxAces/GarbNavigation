const mongoose = require('mongoose');

const LocationScheme = new mongoose.Schema({
   name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  volume: { type: Number, default: 0 },
  status: { type: String, default: "Inactive" },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Location', LocationScheme);