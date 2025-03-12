const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Create a new queue entry.
 * Expected request body: { name: string, status?: string }
 * Allowed statuses: "pending", "canceled", "completed".
 * For pending entries, the computed position is based on createdAt order; for others, position is 0.
 */
exports.createQueueEntry = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }
    const validStatuses = ["pending", "canceled", "completed"];
    const queueStatus = validStatuses.includes(status) ? status : "pending";

    const newEntry = {
      name,
      status: queueStatus,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("queue").add(newEntry);

    // After creation, fetch the document (and its createdAt timestamp)
    const createdDoc = await docRef.get();

    // Compute position on the fly if status is pending.
    let position = 0;
    if (queueStatus === "pending") {
      const pendingSnapshot = await db
        .collection("queue")
        .where("status", "==", "pending")
        .orderBy("createdAt")
        .get();
      let pos = 1;
      pendingSnapshot.forEach((doc) => {
        if (doc.id === docRef.id) {
          position = pos;
        }
        pos++;
      });
    }

    return res.status(201).json({ id: docRef.id, position });
  } catch (error) {
    console.error("Error creating queue entry:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get all queue entries.
 * For pending entries, compute position on the fly based on createdAt order.
 * For non-pending entries, the position is returned as 0.
 */
exports.getAllQueueEntries = async (req, res) => {
  try {
    const snapshot = await db.collection("queue").get();
    const pendingEntries = [];
    const otherEntries = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const entry = { id: doc.id, ...data };
      if (data.status === "pending") {
        pendingEntries.push(entry);
      } else {
        entry.position = 0;
        otherEntries.push(entry);
      }
    });

    // Sort pending entries by createdAt (oldest first)
    pendingEntries.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.toMillis() - b.createdAt.toMillis();
    });

    // Assign positions to pending entries based on their order
    pendingEntries.forEach((entry, index) => {
      entry.position = index + 1;
    });

    // Combine pending and non-pending entries; pending entries first
    const sortedQueue = [...pendingEntries, ...otherEntries];
    res.status(200).json(sortedQueue);
  } catch (error) {
    console.error("Error fetching all queue entries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get the position for a specific queue entry by its ID.
 * For pending entries, the position is computed on the fly based on createdAt order.
 * For non-pending entries, the position is returned as 0.
 */
exports.getQueuePositionById = async (req, res) => {
  try {
    const { queueid } = req.params;
    if (!queueid || queueid.trim() === "") {
      return res.status(400).json({ error: "Queue ID is required" });
    }
    const doc = await db.collection("queue").doc(queueid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    const data = doc.data();
    let position = 0;
    if (data.status === "pending") {
      const pendingSnapshot = await db
        .collection("queue")
        .where("status", "==", "pending")
        .orderBy("createdAt")
        .get();
      let pos = 1;
      pendingSnapshot.forEach((docSnap) => {
        if (docSnap.id === queueid) {
          position = pos;
        }
        pos++;
      });
    }
    res.status(200).json({ id: doc.id, position });
  } catch (error) {
    console.error("Error fetching queue entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Remove a queue entry by its ID.
 * Since positions are computed on the fly, no recalculation is needed.
 */
exports.removeFromQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("queue").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    await docRef.delete();
    res.status(200).json({ message: "Queue entry removed" });
  } catch (error) {
    console.error("Error removing from queue:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Complete a queue entry by its ID.
 * Since positions are computed on the fly, no recalculation is needed.
 */

exports.completeQueueEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("queue").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    await docRef.update({ status: "completed" });
    res.status(200).json({ message: "Queue entry completed" });
  } catch (error) {
    console.error("Error completing queue entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Cancel a queue entry by its ID.
 * Since positions are computed on the fly, no recalculation is needed.
 */

exports.cancelQueueEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("queue").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    await docRef.update({ status: "canceled" });
    res.status(200).json({ message: "Queue entry canceled" });
  } catch (error) {
    console.error("Error canceling queue entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
