// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const User = require("../models/user");
const Doctor = require("../models/doctor");
const Appointment = require("../models/Appointment");
const nodemailer = require("nodemailer");

// Middleware: Admin only
const adminOnly = [protect, authorize("admin")];

/* -----------------------------------------------------------
   Email transporter (same as authController config)
----------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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
        <p>Your <b>doctor account</b> on <b>Prescripto</b> has been <b>approved</b> by the admin.</p>
        <p>You can now log in and start managing your appointments.</p>
        <br/>
        <p style="font-size:13px;color:#555">
          If you did not request this, please contact support.
        </p>
      `;
    } else if (status === "rejected") {
      subject = "Update on your Prescripto doctor account ❗";
      html = `
        <h2>Hi Dr. ${name},</h2>
        <p>We are sorry to inform you that your <b>doctor account</b> on <b>Prescripto</b> has been <b>rejected</b> by the admin.</p>
        <p>If you believe this is a mistake, please contact support or re-upload your documents.</p>
      `;
    } else {
      // other statuses ke liye mail nahi bhejna
      return;
    }

    await transporter.sendMail({
      from: process.env.MAIL_USER,
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

/** 1. Get ALL doctors
 *  GET /api/admin/doctors
 */
router.get("/doctors", adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (error) {
    console.error("ADMIN GET /doctors error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 2. Get ALL PENDING doctors
 *  GET /api/admin/doctors/pending
 */
router.get("/doctors/pending", adminOnly, async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ doctors: pendingDoctors });
  } catch (error) {
    console.error("ADMIN GET /doctors/pending error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 3. Add new doctor (MANUAL ADD by admin)
 *  POST /api/admin/doctors
 */
router.post("/doctors", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error("ADMIN POST /doctors error:", error);
    res.status(400).json({ message: error.message || "Invalid data" });
  }
});

/** 4. Toggle availability
 *  PATCH /api/admin/doctor/:id/availability
 */
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
    console.error("ADMIN PATCH /doctor/availability error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 5. Approve doctor
 *  PATCH /api/admin/doctor/:id/approve
 */
router.patch("/doctor/:id/approve", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // 🔔 send email on approval
    await sendDoctorStatusEmail(doctor, "approved");

    res.json({ message: "Doctor approved", doctor });
  } catch (error) {
    console.error("ADMIN APPROVE DOCTOR error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 6. Reject doctor
 *  PATCH /api/admin/doctor/:id/reject
 */
router.patch("/doctor/:id/reject", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // 🔔 send email on rejection (optional)
    await sendDoctorStatusEmail(doctor, "rejected");

    res.json({ message: "Doctor rejected", doctor });
  } catch (error) {
    console.error("ADMIN REJECT DOCTOR error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 7. Get single doctor details
 *  GET /api/admin/doctor/:id
 */
router.get("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    console.error("ADMIN GET /doctor/:id error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** 8. Delete doctor
 *  DELETE /api/admin/doctor/:id
 */
router.delete("/doctor/:id", adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor removed" });
  } catch (error) {
    console.error("ADMIN DELETE /doctor error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/* ============================================================
   🟩 PATIENT MANAGEMENT
============================================================ */

/** Get all patients
 *  GET /api/admin/patients
 */
router.get("/patients", adminOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json({ patients });
  } catch (error) {
    console.error("ADMIN GET /patients error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** Delete a patient
 *  DELETE /api/admin/patient/:id
 */
router.delete("/patient/:id", adminOnly, async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient removed" });
  } catch (error) {
    console.error("ADMIN DELETE /patient error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/* ============================================================
   🟨 APPOINTMENTS (Admin View)
============================================================ */

/** Get all appointments
 *  GET /api/admin/appointments
 */
router.get("/appointments", adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctorId", "name speciality")
      .populate("userId", "name email");

    res.json({ appointments });
  } catch (error) {
    console.error("ADMIN GET /appointments error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/** Update appointment status
 *  PATCH /api/admin/appointment/:id/status
 */
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
    console.error("ADMIN PATCH /appointment/status error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/* ============================================================
   📊 ANALYTICS
============================================================ */

/** Summary stats
 *  GET /api/admin/analytics/summary
 */
router.get("/analytics/summary", adminOnly, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    res.json({ totalDoctors, totalPatients, totalAppointments });
  } catch (error) {
    console.error("ADMIN GET /analytics error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;
