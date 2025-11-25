// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const User = require("../models/user");
const Doctor = require("../models/doctor");
const Appointment = require("../models/Appointment");

const { sendMail } = require("../utils/mailer"); // ✅ Resend mailer

// Middleware: Admin only
const adminOnly = [protect, authorize("admin")];

/* -----------------------------------------------------------
   Helper → Send doctor status email (approved / rejected)
----------------------------------------------------------- */
const sendDoctorStatusEmail = async (doctor, status) => {
  try {
    if (!doctor || !doctor.email) return;

    const name = doctor.name || "Doctor";
    let subject = "";
    let html = "";

    if (status === "approved") {
      subject = "Your Prescripto doctor account has been approved 🎉";
      html = `
        <h2>Hi Dr. ${name},</h2>
        <p>Your <b>doctor account</b> on <b>Prescripto</b> has been <b>approved</b>.</p>
        <p>You can now login and start managing your appointments.</p>
      `;
    } else if (status === "rejected") {
      subject = "Update on your Prescripto doctor account ❗";
      html = `
        <h2>Hi Dr. ${name},</h2>
        <p>Your doctor account on <b>Prescripto</b> has been <b>rejected</b>.</p>
        <p>Please re-upload documents or contact support.</p>
      `;
    } else {
      return;
    }

    await sendMail({
      to: doctor.email,
      subject,
      html,
    });

    console.log(`📧 Doctor ${status} mail sent → ${doctor.email}`);
  } catch (err) {
    console.log("❌ sendDoctorStatusEmail error:", err.message);
  }
};

/* ============================================================
   🟦 DOCTOR MANAGEMENT (Admin)
============================================================ */

router.get("/doctors", adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (error) {
    console.error("ADMIN GET /doctors error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/doctors/pending", adminOnly, async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ doctors: pendingDoctors });
  } catch (error) {
    console.error("ADMIN GET /pending error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/doctors", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error("ADMIN POST /doctors error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.patch("/doctor/:id/availability", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    res.json({
      message: "Availability updated",
      isAvailable: doctor.isAvailable,
    });
  } catch (error) {
    console.error("ADMIN PATCH availability error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/doctor/:id/approve", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await sendDoctorStatusEmail(doctor, "approved");

    res.json({ message: "Doctor approved", doctor });
  } catch (error) {
    console.error("ADMIN APPROVE error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/doctor/:id/reject", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await sendDoctorStatusEmail(doctor, "rejected");

    res.json({ message: "Doctor rejected", doctor });
  } catch (error) {
    console.error("ADMIN REJECT error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    console.error("ADMIN GET /doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor removed" });
  } catch (error) {
    console.error("ADMIN DELETE doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🟩 PATIENT MANAGEMENT
============================================================ */

router.get("/patients", adminOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json({ patients });
  } catch (error) {
    console.error("ADMIN GET /patients error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/patient/:id", adminOnly, async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json({ message: "Patient removed" });
  } catch (error) {
    console.error("ADMIN DELETE patient error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🟨 APPOINTMENT MANAGEMENT
============================================================ */

router.get("/appointments", adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctorId", "name speciality")
      .populate("userId", "name email");

    res.json({ appointments });
  } catch (error) {
    console.error("ADMIN GET /appointments error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/appointment/:id/status", adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = status;
    await appt.save();

    res.json({ message: "Appointment updated", status: appt.status });
  } catch (error) {
    console.error("ADMIN UPDATE appointment error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   📊 ANALYTICS
============================================================ */

router.get("/analytics/summary", adminOnly, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    res.json({ totalDoctors, totalPatients, totalAppointments });
  } catch (error) {
    console.error("ADMIN GET /analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
