// server.js (updated)

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authroutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load .env
dotenv.config();

// Connect DB
connectDB();

const app = express();

/* ---------------------------------------------------
   🔥 UNIVERSAL CORS FIX — WORKS WITH ANY PORT
   - Allow all localhost and 127.0.0.1 origins (any port)
   - Accept PATCH & OPTIONS
   - Return preflight responses cleanly
--------------------------------------------------- */
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests from no origin (eg. Postman, server-to-server) and localhost origins
    if (
      !origin ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false, // respond to preflight here (do not pass to next)
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Pre-flight for all routes

// Extra safety: set CORS headers for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  // If it's a preflight request, end it here
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Body parser (JSON + urlencoded just in case)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static upload folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Test route
app.get("/", (req, res) => {
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
   🔥 START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
