const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  registerDoctor,
  loginDoctor,
  loginAdmin,
} = require("../controllers/authController");


// ---------------------------------------------------------
// 1️⃣ PATIENT REGISTER
// ---------------------------------------------------------
router.post("/register", registerUser);


// ---------------------------------------------------------
// 2️⃣ PATIENT LOGIN
// ---------------------------------------------------------
router.post("/login", loginUser);


// ---------------------------------------------------------
// 3️⃣ DOCTOR REGISTER  ✅ IMPORTANT
// ---------------------------------------------------------
router.post("/register-doctor", registerDoctor);


// ---------------------------------------------------------
// 4️⃣ DOCTOR LOGIN
// ---------------------------------------------------------
router.post("/doctor-login", loginDoctor);


// ---------------------------------------------------------
// 5️⃣ ADMIN LOGIN
// ---------------------------------------------------------
router.post("/admin-login", loginAdmin);


module.exports = router;
