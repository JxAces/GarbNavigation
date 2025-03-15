const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Import routes
const locationRoutes = require("./routes/location");
const userRoutes = require("./routes/userRoutes");
const locationSchedule = require("./routes/locationSchedule");
const backlogs = require("./routes/backlogs")

require("./cronJobs/backlogJob");

//DOTENV
dotenv.config();

// MONGODB CONNECTION
connectDB();

//REST OBJECT
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//ROUTES
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', locationSchedule);
app.use('/api/backlogs', backlogs);

//PORT
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Server Running ${PORT}`.bgGreen.white);
});
