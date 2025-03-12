// routes/schedule.js
const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// Get available slots for a barber on a specific date (YYYY-MM-DD)
router.get("/:barberId/:date", scheduleController.getAvailableSlots);

module.exports = router;
