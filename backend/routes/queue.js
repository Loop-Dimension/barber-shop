const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queueController");

// Create a new queue entry (only needs name, optional status)
router.post("/", queueController.createQueueEntry);

// Get all queue entries
router.get("/", queueController.getAllQueueEntries);

// Get a queue entry's position by its ID
router.get("/search/:queueid", queueController.getQueuePositionById);

// Complete a queue entry
router.post("/complete/:id", queueController.completeQueueEntry);

// Cancel a queue entry
router.post("/cancel/:id", queueController.cancelQueueEntry);

// Remove a queue entry
router.delete("/:id", queueController.removeFromQueue);

module.exports = router;
