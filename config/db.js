import admin from "firebase-admin";
import serviceAccount from "./firebaseKey.json" with { type: "json" };
import { getIO } from "../sockets/socket.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

console.log("✅ Firebase Firestore Connected");

/*
====================================
 REALTIME FIRESTORE LISTENER
====================================
*/
db.collection("complaints").onSnapshot(async (snapshot) => {
  const io = getIO();

  for (const change of snapshot.docChanges()) {
    const complaint = {
      id: change.doc.id,
      ...change.doc.data(),
    };

    if (change.type === "added") {
      io.emit("newComplaint", complaint);
    }

    if (change.type === "modified") {
      io.emit("statusUpdated", complaint);
    }
  }

  /*
  ====================================
  🔥 DASHBOARD LIVE UPDATE
  ====================================
  */

  const allDocs = await db.collection("complaints").get();

  let totalToday = 0;
  let pending = 0;
  let inProgress = 0;
  let resolvedToday = 0;
  let urgentCount = 0;

  const today = new Date().toDateString();

  allDocs.forEach((doc) => {
    const data = doc.data();

    if (new Date(data.time).toDateString() === today) {
      totalToday++;
    }

    if (data.status === "pending") pending++;
    if (data.status === "in_progress") inProgress++;
    if (data.status === "resolved") {
      if (new Date(data.time).toDateString() === today) {
        resolvedToday++;
      }
    }

    if (data.urgency === "high") urgentCount++;
  });

  io.emit("dashboardUpdate", {
    totalToday,
    pending,
    inProgress,
    resolvedToday,
    urgentCount,
  });
});

export default db;
