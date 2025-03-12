// routes/barber.js
const express = require("express");
const router = express.Router();
const barberController = require("../controllers/barberController");
const { authenticateAdmin } = require("../middleware/authMiddleware");

// Add a new barber (admin only)
router.post("/", authenticateAdmin, barberController.addBarber);
// Get list of barbers
router.get("/", barberController.getBarbers);

router.delete("/:id", authenticateAdmin, barberController.deleteBarber);

module.exports = router;
