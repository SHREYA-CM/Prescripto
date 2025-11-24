// models/MedicalHistory.js
const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema(
  {
    // Patient ka USER _id
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Doctor ka USER _id (Doctor.userId)
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Appointment ka _id
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // ek appointment ki ek hi history
    },

    symptoms: {
      type: String,
      default: '',
    },
    diagnosis: {
      type: String,
      default: '',
    },
    prescription: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    followUp: {
      type: Date,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
