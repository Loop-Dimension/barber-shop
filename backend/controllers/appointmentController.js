// ------------------------- BACKEND (appointmentController.js) -------------------------
const admin = require("firebase-admin");
const db = admin.firestore();
const notificationController = require("./notificationController");

// Function to calculate position dynamically per day
const calculatePosition = async (appointmentDate) => {
  const snapshot = await db
    .collection("appointments")
    .where("appointmentDate", "==", appointmentDate)
    .where("status", "==", "pending")
    .orderBy("appointmentTime")
    .get();
  return snapshot.size + 1;
};

exports.createAppointment = async (req, res) => {
  try {
    const { customerName, customerEmail, appointmentTime, barberId, service } =
      req.body;
    const appointmentDate = appointmentTime.split("T")[0];
    const position = await calculatePosition(appointmentDate);

    const appointmentRef = await db.collection("appointments").add({
      customerName,
      customerEmail,
      appointmentTime,
      appointmentDate,
      barberId,
      service,
      status: "pending",
      position,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: appointmentRef.id,
      appointmentTime,
      position,
      message: "Appointment created successfully",
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("appointments").doc(id).update({ status: "canceled" });
    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAppointmentTime } = req.body;
    const appointmentDate = newAppointmentTime.split("T")[0];
    const position = await calculatePosition(appointmentDate);

    await db.collection("appointments").doc(id).update({
      appointmentTime: newAppointmentTime,
      appointmentDate,
      position,
    });

    res.status(200).json({ message: "Appointment rescheduled successfully" });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("appointments").doc(id).update({ status: "completed" });
    res.status(200).json({ message: "Appointment marked as completed" });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("appointments").doc(id).delete();
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get appointments by date

exports.getAppointments = async (req, res) => {
  try {
    const { date } = req.params;
    const snapshot = await db
      .collection("appointments")
      .where("appointmentDate", "==", date)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "No appointments found for this date" });
    }

    const appointments = [];
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
