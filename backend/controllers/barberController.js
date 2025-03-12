const admin = require("firebase-admin");
const db = admin.firestore();

exports.addBarber = async (req, res) => {
  try {
    const { name, experience, workingHours, availableDays } = req.body;
    // workingHours: { start: "09:00", end: "17:00", slotDuration: 30 }
    // availableDays is an array of strings (e.g., ["Monday", "Tuesday", ...])
    const newBarber = {
      name,
      experience,
      workingHours: workingHours || {
        start: "09:00",
        end: "17:00",
        slotDuration: 30,
      },
      availableDays: availableDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("barbers").add(newBarber);
    res.status(201).json({ id: docRef.id, ...newBarber });
  } catch (error) {
    console.error("Error adding barber:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getBarbers = async (req, res) => {
  try {
    const snapshot = await db.collection("barbers").orderBy("createdAt").get();
    const barbers = [];
    snapshot.forEach((doc) => {
      barbers.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteBarber = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("barbers").doc(id).delete();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting barber:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
