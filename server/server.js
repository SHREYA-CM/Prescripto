// server.js (FINAL FIXED VERSION)

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load .env
dotenv.config();

// Connect DB
connectDB();

const app = express();

/* ---------------------------------------------------
   🔥 CORS (FIXED: allow your Render domain + others)
--------------------------------------------------- */
// IMPORTANT CHANGE: no more manual "Not allowed by CORS" error.
// `origin: true` lets cors reflect the incoming Origin header.
const corsOptions = {
  origin: true, // allow all origins (including your Render URL)
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// (Optional extra header middleware – safe to keep)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder (server/uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/api", (req, res) => {
  res.send("Prescripto API is running...");
});

/* ---------------------------------------------------
   🔥 ROUTES
--------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

/* ---------------------------------------------------
   🔥 SERVE FRONTEND (DEPLOYMENT)
--------------------------------------------------- */

// IMPORTANT:
// Project structure:
//   root/
//     frontend/   <-- Vite build goes to frontend/dist
//     server/
//       server.js (this file)
//
// So from /server we go one level up (..) then into frontend/dist
const frontendPath = path.join(__dirname, "..", "frontend", "dist");

// Serve static files (JS, CSS, images from Vite build)
app.use(express.static(frontendPath));

// Catch-all route for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ---------------------------------------------------
   🔥 START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
