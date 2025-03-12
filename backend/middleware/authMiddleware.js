// middleware/authMiddleware.js
const admin = require("firebase-admin");

exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check in Firestore if the user is an admin
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: "User not found in database" });
    }
    const userData = userDoc.data();

    if (!userData.isAdmin) {
      return res.status(403).json({ error: "Forbidden, not an admin" });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};
