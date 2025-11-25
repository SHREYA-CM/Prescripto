// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const {
  registerUser,
  loginUser,
  registerDoctor,
  loginDoctor,
  loginAdmin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");

// Multer for doctor document uploads
const upload = require("../middleware/multer");

/* -----------------------------------------------
   EMAIL & OTP ROUTES
------------------------------------------------ */
router.post("/verify-email", verifyEmail);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

/* -----------------------------------------------
   PATIENT ROUTES
------------------------------------------------ */
router.post("/register", registerUser);     // POST /api/auth/register
router.post("/login", loginUser);          // POST /api/auth/login

/* -----------------------------------------------
   DOCTOR ROUTES
------------------------------------------------ */

// Doctor Register (with documents)
router.post(
  "/register-doctor",                       // POST /api/auth/register-doctor
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "degree", maxCount: 1 },
  ]),
  registerDoctor
);

// Doctor Login
router.post("/doctor-login", loginDoctor);  // POST /api/auth/doctor-login

/* -----------------------------------------------
   ADMIN ROUTES
------------------------------------------------ */
router.post("/admin-login", loginAdmin);    // POST /api/auth/admin-login

/* -----------------------------------------------
   PASSWORD RESET ROUTES
------------------------------------------------ */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
