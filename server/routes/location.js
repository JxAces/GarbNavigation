const express = require("express");
const router = express.Router();
const { getLocation, createLocation, updateLocation, deleteLocation, getAllLocations, getLocationbyName } = require("../controllers/locationController");

router.get("/:id", getLocation);
router.get("/name/:name", getLocationbyName);
router.post("/add", createLocation);
router.put("/", updateLocation);
router.delete("/:id", deleteLocation);
router.get("/", getAllLocations);

module.exports = router;
