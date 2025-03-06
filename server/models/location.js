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
  status: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Location', LocationScheme);