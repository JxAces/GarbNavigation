const mongoose = require('mongoose');

const UserScheme = new mongoose.Schema({
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  role: {type: String, required: true},
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('User', UserScheme);