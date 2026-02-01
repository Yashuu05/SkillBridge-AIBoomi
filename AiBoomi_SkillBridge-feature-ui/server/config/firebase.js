// server/config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // Adjust path if needed

// Prevent multiple initializations
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("🔥 Firebase Admin Initialized");
}

const db = admin.firestore();

module.exports = { db, admin };