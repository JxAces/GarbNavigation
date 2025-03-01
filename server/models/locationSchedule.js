const mongoose = require('mongoose');

const LocationScheduleSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  shift: {type: String, required: true, enu: ['First','Second','Third']}
});

module.exports = mongoose.model('LocationSchedule', LocationScheduleSchema);
