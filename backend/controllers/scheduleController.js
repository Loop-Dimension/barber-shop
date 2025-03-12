const admin = require("firebase-admin");
const db = admin.firestore();

exports.getAvailableSlots = async (req, res) => {
  try {
    const { barberId, date } = req.params; // date in YYYY-MM-DD

    // Fetch barber document
    const barberDoc = await db.collection("barbers").doc(barberId).get();
    if (!barberDoc.exists) {
      return res.status(404).json({ error: "Barber not found" });
    }
    const barberData = barberDoc.data();
    let workingHours = barberData.workingHours || {
      start: "09:00",
      end: "17:00",
      slotDuration: 30,
    };

    // Generate time slots based on working hours
    const slots = generateTimeSlots(
      date,
      workingHours.start,
      workingHours.end,
      workingHours.slotDuration
    );

    // Query appointments for that barber on the given date
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("barberId", "==", barberId)
      .where("appointmentDate", "==", date)
      .where("status", "in", ["pending", "scheduled"]) // Only consider active bookings
      .get();

    const bookedSlots = [];
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert stored appointment time to HH:mm format
      const appointmentTime = new Date(data.appointmentTime)
        .toLocaleTimeString("en-GB", { hour12: false })
        .substr(0, 5);
      bookedSlots.push(appointmentTime);
    });

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function generateTimeSlots(date, start, end, slotDuration) {
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let current = new Date(date);
  current.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (current < endTime) {
    const slot = current.toISOString().substr(11, 5);
    slots.push(slot);
    current = new Date(current.getTime() + slotDuration * 60000);
  }
  return slots;
}
