const mongoose = require('mongoose');
require('dotenv').config();


const dbHost = process.env.IP_ADD;

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${dbHost}:27017/Garbage`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;