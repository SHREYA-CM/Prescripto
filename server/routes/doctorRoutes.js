// routes/doctorRoutes.js

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getAllDoctors,
  getDoctorBySpeciality,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
} = require("../controllers/doctorController");

/* 1) PUBLIC: GET ALL DOCTORS
   GET /api/doctors
*/
router.get("/doctors", getAllDoctors);

/* 2) PUBLIC: GET DOCTORS BY SPECIALITY
   GET /api/doctors/speciality/:spec
*/
router.get("/doctors/speciality/:spec", getDoctorBySpeciality);

/* 3) DOCTOR: GET OWN PROFILE (protected)
   GET /api/doctor/profile
   🔥 MUST be BEFORE /doctor/:id
*/
router.get("/doctor/profile", protect, getDoctorProfile);

/* 4) DOCTOR: UPDATE OWN PROFILE (protected)
   PUT /api/doctor/profile
*/
router.put("/doctor/profile", protect, updateDoctorProfile);

/* 5) PUBLIC: GET SINGLE DOCTOR BY ID
   GET /api/doctor/:id
   (keep this LAST so it doesn't catch "/doctor/profile")
*/
router.get("/doctor/:id", getDoctorById);

module.exports = router;
