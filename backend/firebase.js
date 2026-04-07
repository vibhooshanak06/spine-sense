const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
let db = null;
function initFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, "serviceAccount.json");
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(
        "[firebase] serviceAccount.json not found. Firebase initialization skipped.",
      );
      return null;
    }
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  db = admin.database();
  return db;
}

function getDb() {
  if (!db) {
    initFirebase();
  }
  return db;
}
module.exports = { initFirebase, getDb };
