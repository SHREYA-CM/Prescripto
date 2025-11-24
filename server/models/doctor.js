const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // 🔥 Link to User model (MUST HAVE)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // BASIC DETAILS
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // DOCTOR DETAILS
    speciality: {
      type: String,
      default: "general physician",
    },

    degree: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    fees: {
      type: Number,
      default: 500,
    },

    about: {
      type: String,
      default: "",
    },

    // ADDRESS
    address: {
      line1: {
        type: String,
        default: "Not provided",
      },
      line2: {
        type: String,
        default: "",
      },
    },

    // MAIN PROFILE IMAGE
    image: {
      type: String,
      default:
        "https://placehold.co/150x150/E2E8F0/4A5568?text=Doctor",
    },

    // 🌟 NEW: DOCUMENT UPLOADS FOR VERIFICATION
    photoUrl: {
      type: String, // Doctor passport photo
      default: "",
    },

    idProofUrl: {
      type: String, // Aadhaar, PAN, etc.
      default: "",
    },

    degreeUrl: {
      type: String, // MBBS/MS/MD degree certificate
      default: "",
    },

    // 🌟 NEW: ADMIN APPROVAL STATUS
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // AVAILABILITY
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
