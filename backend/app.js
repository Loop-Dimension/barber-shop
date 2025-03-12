// app.js
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
const serviceAccount = require("./config/serviceAccountKey.json");
// cors
const cors = require("cors");
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
app.locals.db = db;

// Middleware to parse JSON
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const barberRoutes = require("./routes/barber");
const appointmentRoutes = require("./routes/appointment");
const queueRoutes = require("./routes/queue");
const scheduleRoutes = require("./routes/schedule");

// Route endpoints
app.use("/api/auth", authRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/", (req, res) => {
  res.send("Barber Queue Management API");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
