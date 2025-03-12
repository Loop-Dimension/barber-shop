// controllers/notificationController.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // Change if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendConfirmation = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Confirmation",
    text: `Your appointment is confirmed: ${JSON.stringify(
      appointmentDetails
    )}`,
  };
  return transporter.sendMail(mailOptions);
};

exports.sendCancellation = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Cancellation",
    text: `Your appointment has been canceled: ${JSON.stringify(
      appointmentDetails
    )}`,
  };
  return transporter.sendMail(mailOptions);
};

exports.sendReminder = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Reminder",
    text: `Reminder: Your appointment is scheduled for ${appointmentDetails.appointmentTime}`,
  };
  return transporter.sendMail(mailOptions);
};
