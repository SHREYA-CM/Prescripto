const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // 🔥 Link to User model (MUST HAVE)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    image: {
      type: String,
      default: "https://placehold.co/150x150/E2E8F0/4A5568?text=Doctor",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;