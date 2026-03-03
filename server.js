import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ================================
// FIX __dirname (ES Modules)
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// Initialize Firebase (Firestore listener runs automatically)
import "./config/db.js";

import complaintRoutes from "./routes/complaint.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { setIO } from "./sockets/socket.js";

// ================================
// EXPRESS APP
// ================================
const app = express();
const server = http.createServer(app);

// ================================
// PRODUCTION CORS CONFIG
// ================================

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://localhost:3000", // alternate local
  "https://civic-sense-gamma.vercel.app", // 🔥 your real frontend
];

// Express CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// ================================
// SOCKET.IO SETUP (WITH CORS)
// ================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});

// Make socket globally accessible
setIO(io);

// ================================
// BASIC ROUTES
// ================================
app.get("/", (req, res) => {
  res.send("🚀 CivicSense Backend Running (Production Mode)");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "Firebase Firestore",
    realtime: true,
    service: "CivicSense Backend",
  });
});

// ================================
// API ROUTES
// ================================
app.use("/api/complaint", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ================================
// SOCKET CONNECTION LOGGING
// ================================
io.on("connection", (socket) => {
  console.log("✅ Dashboard Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Dashboard Disconnected:", socket.id);
  });
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`
🔥 CivicSense Backend Started
🌐 Port: ${PORT}
🔥 Database: Firebase Firestore
📡 Realtime Enabled
🔒 CORS Secured for Production
🚀 Ready for Frontend Connection
`);
});
