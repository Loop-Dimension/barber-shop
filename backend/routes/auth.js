// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/update", authController.updateProfile);
router.post("/check", authController.checkAuth);

module.exports = router;
