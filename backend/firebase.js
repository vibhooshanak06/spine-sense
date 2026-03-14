const admin = require('firebase-admin');
const path = require('path');

let db;

function initFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, 'serviceAccount.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('✅ Firebase initialized');
  }
  db = admin.database();
  return db;
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

module.exports = { initFirebase, getDb };
