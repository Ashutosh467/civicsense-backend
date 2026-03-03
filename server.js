import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// ================================
// FIX __dirname (ES Modules)
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// ================================
// FIREBASE INIT
// ================================
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
  "http://localhost:5173",
  "https://civic-sense-gamma.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools (Postman, curl)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// ================================
// SOCKET.IO WITH CORS
// ================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

setIO(io);

// ================================
// ROUTES
// ================================
app.get("/", (req, res) => {
  res.send("🚀 CivicSense Backend Running (Production)");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "Firebase Firestore",
    realtime: true,
    service: "CivicSense Backend",
  });
});

app.use("/api/complaint", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ================================
// SOCKET CONNECTION LOG
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
const PORT = process.env.PORT || 10000;

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
