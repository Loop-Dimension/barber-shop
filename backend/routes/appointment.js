const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Create an appointment
router.post("/", appointmentController.createAppointment);

// Cancel an appointment
router.post("/cancel/:id", appointmentController.cancelAppointment);

// Reschedule an appointment
router.post("/reschedule/:id", appointmentController.rescheduleAppointment);

// Mark an appointment as completed
router.post("/complete/:id", appointmentController.completeAppointment);

// Delete an appointment
router.delete("/:id", appointmentController.deleteAppointment);

// Get all appointments
router.get("/:date", appointmentController.getAppointments);

module.exports = router;
