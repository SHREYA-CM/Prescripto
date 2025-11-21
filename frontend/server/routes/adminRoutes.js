const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/Appointment');

// COMMON MIDDLEWARE: admin only
const adminOnly = [protect, authorize('admin')];

/* ---------- DOCTORS ---------- */

// 1. Get all doctors
router.get('/doctors', adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (error) {
    console.error('ADMIN GET /doctors error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// 2. Add new doctor (manual add from admin panel)
router.post('/doctors', adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error('ADMIN POST /doctors error:', error);
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
});

// 3. Toggle availability
router.patch('/doctor/:id/availability', adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    res.json({ message: 'Availability updated', isAvailable: doctor.isAvailable });
  } catch (error) {
    console.error('ADMIN PATCH /doctor/availability error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// 4. Approve / Reject doctor
router.patch('/doctor/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.status = status;
    await doctor.save();

    res.json({ message: 'Status updated', status: doctor.status });
  } catch (error) {
    console.error('ADMIN PATCH /doctor/status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// 5. Get single doctor (profile page)
router.get('/doctor/:id', adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json(doctor);
  } catch (error) {
    console.error('ADMIN GET /doctor/:id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// 6. Delete doctor
router.delete('/doctor/:id', adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    console.error('ADMIN DELETE /doctor error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

/* ---------- PATIENTS ---------- */

router.get('/patients', adminOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ patients });
  } catch (error) {
    console.error('ADMIN GET /patients error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.delete('/patient/:id', adminOnly, async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient removed' });
  } catch (error) {
    console.error('ADMIN DELETE /patient error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

/* ---------- APPOINTMENTS (for admin) ---------- */

// 9. All appointments list
router.get('/appointments', adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('doctorId', 'name speciality')
      .populate('userId', 'name email');

    res.json({ appointments });
  } catch (error) {
    console.error('ADMIN GET /appointments error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// 9(b). Cancel / update appointment status
router.patch('/appointment/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'cancelled', 'completed'
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    appt.status = status;
    await appt.save();

    res.json({ message: 'Appointment status updated', status: appt.status });
  } catch (error) {
    console.error('ADMIN PATCH /appointment/status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

/* ---------- ANALYTICS ---------- */

// 10. Simple analytics counts
router.get('/analytics/summary', adminOnly, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();

    res.json({ totalDoctors, totalPatients, totalAppointments });
  } catch (error) {
    console.error('ADMIN GET /analytics error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
