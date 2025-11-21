const express = require('express');
const router = express.Router();

const Doctor = require('../models/doctor');
const { protect, authorize } = require('../middleware/authMiddleware');


// ----------------------------------------------------
// 1) GET DOCTOR PROFILE
// ----------------------------------------------------
router.get(
  '/doctor/profile',
  protect,
  authorize('doctor'),
  async (req, res) => {
    try {
      // Find doctor using the user ID inside the token
      const doctor = await Doctor.findOne({ user: req.user.id });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      res.json({ doctor });
    } catch (err) {
      console.error("GET /doctor/profile error:", err.message);
      res.status(500).json({ message: "Failed to load doctor profile" });
    }
  }
);


// ----------------------------------------------------
// 2) UPDATE DOCTOR PROFILE
// ----------------------------------------------------
router.put(
  '/doctor/profile',
  protect,
  authorize('doctor'),
  async (req, res) => {
    try {
      const updates = req.body;

      const doctor = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        updates,
        { new: true }
      );

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json({
        message: "Doctor profile updated successfully",
        doctor,
      });
    } catch (err) {
      console.error("PUT /doctor/profile error:", err.message);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);


// ----------------------------------------------------
// 3) PUBLIC: ALL DOCTORS
// ----------------------------------------------------
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (err) {
    console.error("GET /doctors error:", err.message);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});


// ----------------------------------------------------
// 4) PUBLIC: SINGLE DOCTOR
// ----------------------------------------------------
router.get('/doctor/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ doctor });
  } catch (err) {
    console.error("GET /doctor/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
});


module.exports = router;
