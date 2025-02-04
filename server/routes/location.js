const express = require("express");
const router = express.Router();
const { getLocation, createLocation, updateLocation, deleteLocation, getAllLocations } = require("../controllers/locationController");

router.get("/:id", getLocation);
router.post("/add", createLocation);
router.put("/", updateLocation);
router.delete("/:id", deleteLocation);
router.get("/", getAllLocations);

module.exports = router;
