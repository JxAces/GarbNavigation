const mongoose = require('mongoose');

const LocationScheme = new mongoose.Schema({
  name: {
    type: String,
  },
  latitude: {
    type: String, 
  },
  longitude: {
    type: String, 
  },
  volume: {
    type: Number,
  },
  status: {
    type: String,
  },
  binType: {
    type: String,
    enum: ['iot', 'non-iot'],
    default: 'iot',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Location', LocationScheme);