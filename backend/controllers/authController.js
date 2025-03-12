// controllers/authController.js
const admin = require("firebase-admin");
const axios = require("axios");

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save the user data to Firestore (collection "users")
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      isAdmin: false, // Default admin flag is false
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    res
      .status(400)
      .json({ error: error.response?.data.error.message || error.message });
  }
};

// Endpoint to update user profile (e.g., name and admin flag)
exports.updateProfile = async (req, res) => {
  try {
    const { name, isAdmin } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const db = admin.firestore();
    await db
      .collection("users")
      .doc(decodedToken.uid)
      .update({
        name: name,
        isAdmin: isAdmin !== undefined ? isAdmin : false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).json(decodedToken);
  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ error: error.message });
  }
};
