// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const User = require("../models/user");
const Doctor = require("../models/doctor");
const Appointment = require("../models/Appointment");

// ✅ Replace nodemailer with Resend mailer
const { sendMail } = require("../utils/mailer");

// Middleware: Admin only
const adminOnly = [protect, authorize("admin")];

/* -----------------------------------------------------------
   Helper: send doctor status email (approved / rejected)
----------------------------------------------------------- */
const sendDoctorStatusEmail = async (doctor, status) => {
  try {
    if (!doctor || !doctor.email) return;

    const name = doctor.name || "Doctor";
    let subject = "";
    let html = "";

    if (status === "approved") {
      subject = "Your Prescripto doctor account has been approved ✅";
      html = `
        <h2>Hi Dr. ${name},</h2>
        <p>Your <b>doctor account</b> on <b>Prescripto</b> has been <b>approved</b>.</p>
        <p>You can now log in and start managing appointments.</p>
        <br/>
        <p style="font-size:13px;color:#555">
          If you did not request this, please contact support.
        </p>
      `;
    } else if (status === "rejected") {
      subject = "Update on your Prescripto doctor account ❗";
      html = `
        <h2>Hi Dr. ${name},</h2>
        <p>Your <b>doctor account</b> on <b>Prescripto</b> has been <b>rejected</b>.</p>
        <p>If you believe this is a mistake, please contact support or re-upload your documents.</p>
      `;
    } else {
      return;
    }

    // 🔥 Send email through Resend
    await sendMail({
      to: doctor.email,
      subject,
      html,
    });

    console.log(`✅ Doctor status email (${status}) sent to ${doctor.email}`);
  } catch (err) {
    console.error("❌ Error sending doctor status email:", err.message);
  }
};

/* ============================================================
   🟦 DOCTOR MANAGEMENT (Admin)
============================================================ */

/** 1. Get ALL doctors */
router.get("/doctors", adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (error) {
    console.error("ADMIN GET /doctors error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** 2. Get all pending doctors */
router.get("/doctors/pending", adminOnly, async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ doctors: pendingDoctors });
  } catch (error) {
    console.error("ADMIN GET /doctors/pending error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** 3. Add doctor manually */
router.post("/doctors", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error("ADMIN POST /doctors error:", error);
    res.status(400).json({ message: error.message });
  }
});

/** 4. Toggle availability */
router.patch("/doctor/:id/availability", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

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

/** 5. Approve doctor */
router.patch("/doctor/:id/approve", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    // 🔔 Send approval email
    await sendDoctorStatusEmail(doctor, "approved");

    res.json({ message: "Doctor approved", doctor });
  } catch (error) {
    console.error("ADMIN APPROVE error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** 6. Reject doctor */
router.patch("/doctor/:id/reject", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    // 🔔 Send rejection email
    await sendDoctorStatusEmail(doctor, "rejected");

    res.json({ message: "Doctor rejected", doctor });
  } catch (error) {
    console.error("ADMIN REJECT error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** 7. Get doctor by ID */
router.get("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    console.error("ADMIN GET doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** 8. Delete doctor */
router.delete("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor removed" });
  } catch (error) {
    console.error("ADMIN DELETE doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🟩 PATIENT MANAGEMENT
============================================================ */

/** Get all patients */
router.get("/patients", adminOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json({ patients });
  } catch (error) {
    console.error("ADMIN GET patients error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** Delete a patient */
router.delete("/patient/:id", adminOnly, async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.json({ message: "Patient removed" });
  } catch (error) {
    console.error("ADMIN DELETE patient error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🟨 APPOINTMENT MANAGEMENT
============================================================ */

/** Get all appointments */
router.get("/appointments", adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctorId", "name speciality")
      .populate("userId", "name email");

    res.json({ appointments });
  } catch (error) {
    console.error("ADMIN GET appointments error:", error);
    res.status(500).json({ message: error.message });
  }
});

/** Update appointment status */
router.patch("/appointment/:id/status", adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

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

/** Summary statistics */
router.get("/analytics/summary", adminOnly, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    res.json({ totalDoctors, totalPatients, totalAppointments });
  } catch (error) {
    console.error("ADMIN GET analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
