import admin from "firebase-admin";

const firebaseKey = process.env.FIREBASE_KEY
  ? JSON.parse(process.env.FIREBASE_KEY)
  : null;

if (!firebaseKey) {
  throw new Error("FIREBASE_KEY environment variable not found");
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
});

const db = admin.firestore();

console.log("✅ Firebase Firestore Connected (Production Mode)");

export default db;
