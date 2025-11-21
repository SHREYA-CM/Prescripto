const Appointment = require('../models/Appointment');
const Doctor = require('../models/doctor');
const User = require('../models/user');

/* ---------------------------------------------------------
   1. BOOK APPOINTMENT (PATIENT)
--------------------------------------------------------- */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   2. GET MY BOOKINGS (PATIENT + DOCTOR)
--------------------------------------------------------- */
exports.getMyBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter = { user: req.user._id };
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor record not found" });
      }

      filter = { doctor: doctor._id };
    }

    const bookings = await Appointment.find(filter)
      .populate("doctor", "name speciality fees image")
      .populate("user", "name email");

    res.json(bookings);

  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   3. GET ALL APPOINTMENTS (ADMIN)
--------------------------------------------------------- */
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctor", "name speciality")
      .populate("user", "name email");

    res.json(appointments);

  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   4. GET DOCTOR'S APPOINTMENTS (DOCTOR DASHBOARD)
--------------------------------------------------------- */
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("user", "name email")
      .populate("doctor", "name speciality fees image");

    res.json(appointments);

  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   5. DOCTOR ACCEPT / DECLINE APPOINTMENT
--------------------------------------------------------- */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      appointment,
    });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   6. PATIENT CANCEL APPOINTMENT
--------------------------------------------------------- */
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findOne({
      _id: id,
      user: req.user._id
    });

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appt.status === "Paid") {
      return res.status(400).json({ message: "Cannot cancel a paid appointment" });
    }

    appt.status = "Cancelled";
    await appt.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: appt
    });

  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ---------------------------------------------------------
   7. PATIENT PAY FOR APPOINTMENT (DUMMY PAYMENT)
--------------------------------------------------------- */
exports.payForAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findOne({
      _id: id,
      user: req.user._id
    });

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appt.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot pay for a cancelled appointment" });
    }

    if (appt.status === "Pending") {
      return res.status(400).json({ message: "Doctor must confirm before payment" });
    }

    if (appt.status === "Paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const txnId = "TXN-" + Math.floor(100000 + Math.random() * 900000);

    appt.status = "Paid";
    appt.transactionId = txnId;
    appt.paidAt = new Date();

    await appt.save();

    res.json({
      success: true,
      message: "Payment successful",
      appointment: appt
    });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: error.message });
  }
};
