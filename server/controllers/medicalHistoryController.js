// controllers/medicalHistoryController.js

const MedicalHistory = require('../models/MedicalHistory');
const Appointment = require('../models/Appointment');

// -----------------------------------------------------
//  1) DOCTOR: Create / Update history for an appointment
//  Route: POST /api/medical-history/appointment/:appointmentId
//  Access: doctor only
// -----------------------------------------------------
exports.upsertHistoryForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { symptoms, diagnosis, prescription, notes, followUp } = req.body;

    // Appointment nikalo
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Yahan authorize('doctor') pehle se laga hoga route me,
    // aur authMiddleware ne req.account = Doctor doc set kiya hoga.
    // appointment.doctor (Doctor _id) == req.account._id check:
    if (!req.account || !req.account._id) {
      return res.status(403).json({ message: 'Doctor account not found' });
    }

    if (appointment.doctor.toString() !== req.account._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the doctor for this appointment' });
    }

    // Patient (user) id seedha appointment.user se
    const patientId = appointment.user;

    const update = {
      patientId,
      doctorId: req.user._id, // doctor ka USER id (token se)
      appointmentId: appointment._id,
    };

    // Sirf wahi fields set karo jo body me aaye hain
    if (symptoms !== undefined) update.symptoms = symptoms;
    if (diagnosis !== undefined) update.diagnosis = diagnosis;
    if (prescription !== undefined) update.prescription = prescription;
    if (notes !== undefined) update.notes = notes;
    if (followUp !== undefined && followUp !== '') update.followUp = followUp;

    const history = await MedicalHistory.findOneAndUpdate(
      { appointmentId: appointment._id },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: history,
      message: 'Medical history saved/updated successfully',
    });
  } catch (error) {
    console.error('upsertHistoryForAppointment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// -----------------------------------------------------
//  2) PATIENT: apni history dekh sakta hai
//  Route: GET /api/medical-history/my
//  Access: patient
// -----------------------------------------------------
exports.getMyHistory = async (req, res) => {
  try {
    const histories = await MedicalHistory.find({ patientId: req.user._id })
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'appointmentDate appointmentTime status');

    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    console.error('getMyHistory error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// -----------------------------------------------------
//  3) DOCTOR / ADMIN: kisi patient ki history
//  Route: GET /api/medical-history/patient/:patientId
//  Access: doctor, admin
// -----------------------------------------------------
exports.getHistoryForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const histories = await MedicalHistory.find({ patientId })
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'appointmentDate appointmentTime status');

    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    console.error('getHistoryForPatient error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// -----------------------------------------------------
//  4) ADMIN: saari histories
//  Route: GET /api/medical-history
//  Access: admin
// -----------------------------------------------------
exports.getAllHistories = async (req, res) => {
  try {
    const histories = await MedicalHistory.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'appointmentDate appointmentTime status');

    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    console.error('getAllHistories error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
