// controllers/adminController.js

const Doctor = require("../models/doctor");
const User = require("../models/user");
const Appointment = require("../models/Appointment");
const nodemailer = require("nodemailer");

/* ============================================================
   EMAIL TRANSPORTER (same as authController.js)
============================================================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* ============================================================
   Helper → Send Doctor Status Email (approved / rejected)
============================================================ */
const sendDoctorStatusEmail = async (doctor, status) => {
  try {
    if (!doctor || !doctor.email) return;

    const name = doctor.name || "Doctor";
    let subject = "";
    let html = "";

    if (status === "approved") {
      subject = "Your Prescripto Doctor Account Has Been Approved! 🎉";
      html = `
        <h2>Congratulations Dr. ${name},</h2>
        <p>Your doctor account on <b>Prescripto</b> has been <b>approved</b>.</p>
        <p>You can now login and start receiving appointments.</p>
      `;
    } else if (status === "rejected") {
      subject = "Your Prescripto Doctor Account Update ❗";
      html = `
        <h2>Hello Dr. ${name},</h2>
        <p>Your doctor account on <b>Prescripto</b> has been <b>rejected</b>.</p>
        <p>Please re-upload documents or contact support for clarification.</p>
      `;
    }

    await transporter.sendMail({
      from: process.env.MAIL_USER,
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
   1️⃣ Admin → Get ALL Doctors
============================================================ */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (error) {
    console.error("getAllDoctors error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   2️⃣ Admin → Get Pending Doctors
============================================================ */
exports.getPendingDoctors = async (req, res) => {
  try {
    const docs = await Doctor.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.json({ doctors: docs });
  } catch (error) {
    console.error("getPendingDoctors error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   3️⃣ Admin → Approve Doctor
============================================================ */
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    await sendDoctorStatusEmail(doctor, "approved");

    res.json({ message: "Doctor approved", doctor });
  } catch (error) {
    console.error("approveDoctor error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   4️⃣ Admin → Reject Doctor
============================================================ */
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    await sendDoctorStatusEmail(doctor, "rejected");

    res.json({ message: "Doctor rejected", doctor });
  } catch (error) {
    console.error("rejectDoctor error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   5️⃣ Admin → Toggle Doctor Availability
============================================================ */
exports.toggleAvailability = async (req, res) => {
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
    console.error("toggleAvailability error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   6️⃣ Admin → Get All Patients
============================================================ */
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json({ patients });
  } catch (error) {
    console.error("getPatients error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   7️⃣ Admin → Delete Patient
============================================================ */
exports.deletePatient = async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.json({ message: "Patient removed" });
  } catch (error) {
    console.error("deletePatient error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   8️⃣ Admin → Get All Appointments
============================================================ */
exports.getAllAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({})
      .populate("doctorId", "name speciality")
      .populate("userId", "name email");

    res.json({ appointments: appts });
  } catch (error) {
    console.error("getAllAppointments error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   9️⃣ Admin → Update Appointment Status
============================================================ */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    appt.status = status;
    await appt.save();

    res.json({ message: "Appointment updated", status: appt.status });
  } catch (error) {
    console.error("updateAppointmentStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   🔟 Admin → Dashboard Analytics Summary
============================================================ */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
    });
  } catch (error) {
    console.error("getAnalyticsSummary error:", error);
    res.status(500).json({ message: error.message });
  }
};
