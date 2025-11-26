// server/controllers/authController.js

const User = require("../models/user");
const Doctor = require("../models/doctor.js");
// OTP model abhi use nahi ho raha, future ke liye rakha hai
const Otp = require("../models/Otp");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ❌ NO MAILER NOW – backend will not send any emails
// const { sendMail } = require("../utils/mailer");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ---------------------------------------------------------
   🔹 GMAIL REGEX (Only allow @gmail.com here)
--------------------------------------------------------- */
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

/* ---------------------------------------------------------
   🔹 0️⃣ VERIFY EMAIL 
--------------------------------------------------------- */
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        exists: false,
        message: "Email is required",
      });
    }

    if (!gmailRegex.test(email)) {
      return res.status(200).json({
        exists: false,
        message: "Please enter a valid Gmail address (example@gmail.com).",
      });
    }

    const userExists = await User.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });

    if (userExists || doctorExists) {
      return res.status(200).json({
        exists: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    return res.status(200).json({
      exists: true,
      message: "Email is valid and available.",
    });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({
      exists: false,
      message: "Server error while verifying email",
    });
  }
};

/* ---------------------------------------------------------
   🔹 0️⃣ SEND OTP 
      (DISABLED: OTP is now sent by frontend via EmailJS)
--------------------------------------------------------- */
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Gmail address (example@gmail.com).",
      });
    }

    console.log(
      "[sendOtp] OTP sending is handled on the frontend (EmailJS). Email:",
      email
    );

    return res.status(200).json({
      success: true,
      message: "OTP is being handled on the frontend.",
    });
  } catch (error) {
    console.error("sendOtp error (disabled):", error);
    return res.status(500).json({
      success: false,
      message: "Server error in sendOtp.",
    });
  }
};

/* ---------------------------------------------------------
   🔹 0️⃣ VERIFY OTP 
      (DISABLED: OTP is verified on frontend)
--------------------------------------------------------- */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    console.log(
      "[verifyOtp] OTP verification is handled on the frontend. Email:",
      email,
      "Code:",
      code
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified on frontend.",
    });
  } catch (error) {
    console.error("verifyOtp error (disabled):", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

/* ---------------------------------------------------------
   1️⃣ REGISTER PATIENT 
--------------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
    });

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      role: "patient",
      token: generateToken(user._id, "patient"),
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   2️⃣ LOGIN PATIENT
--------------------------------------------------------- */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "patient" });

    if (!user) {
      return res
        .status(400)
        .json({ message: "No patient found with this email" });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: "patient",
      token: generateToken(user._id, "patient"),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   3️⃣ REGISTER DOCTOR
--------------------------------------------------------- */
exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      experience,
      fees,
      about,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email & password are required" });
    }

    const exists = await Doctor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    const hashed = await bcrypt.hash(password, 10);

    let photoUrl = "";
    let idProofUrl = "";
    let degreeUrl = "";

    const files = req.files || {};

    const uploadToCloudinary = async (file, folder, resourceType = "image") => {
      if (!file) return "";

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: resourceType,
      });

      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      return result.secure_url;
    };

    if (files.photo && files.photo[0]) {
      photoUrl = await uploadToCloudinary(
        files.photo[0],
        "prescripto_doctors/photo",
        "image"
      );
    }

    if (files.idProof && files.idProof[0]) {
      idProofUrl = await uploadToCloudinary(
        files.idProof[0],
        "prescripto_doctors/idProof",
        "raw"
      );
    }

    if (files.degree && files.degree[0]) {
      degreeUrl = await uploadToCloudinary(
        files.degree[0],
        "prescripto_doctors/degree",
        "raw"
      );
    }

    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email,
      password: hashed,
      speciality,
      experience,
      fees,
      about,
      photoUrl,
      idProofUrl,
      degreeUrl,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Doctor registered successfully. Please wait for admin approval.",
      role: "doctor",
      token: generateToken(user._id, "doctor"),
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status,
    });
  } catch (error) {
    console.error("registerDoctor error:", error);
    return res
      .status(500)
      .json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   4️⃣ LOGIN DOCTOR
--------------------------------------------------------- */
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res
        .status(400)
        .json({ message: "No doctor found with this email" });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const user = doctor.userId
      ? await User.findById(doctor.userId)
      : await User.findOne({ email, role: "doctor" });

    const tokenId = user ? user._id : doctor._id;

    return res.json({
      success: true,
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
      token: generateToken(tokenId, "doctor"),
      status: doctor.status,
      photoUrl: doctor.photoUrl,
      idProofUrl: doctor.idProofUrl,
      degreeUrl: doctor.degreeUrl,
    });
  } catch (error) {
    console.error("loginDoctor error:", error);
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   5️⃣ LOGIN ADMIN
--------------------------------------------------------- */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return res
        .status(400)
        .json({ message: "No admin found with this email" });
    }

    const match = await admin.matchPassword(password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.json({
      success: true,
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      token: generateToken(admin._id, "admin"),
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   6️⃣ FORGOT PASSWORD 
   ✅ ONLY: generate token + resetURL
   ✅ NO EMAIL FROM BACKEND
--------------------------------------------------------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Security: user na mile to bhi generic success
    if (!user) {
      return res.json({
        success: true,
        resetURL: null,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // FRONTEND_URL env se base URL – trailing slash hata diya
    const rawBaseUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    const resetURL = `${baseUrl}/reset-password/${token}`;

    return res.json({
      success: true,
      resetURL,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------------------------------------------
   7️⃣ RESET PASSWORD  (patients + doctors)
--------------------------------------------------------- */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1) Token se user nikaal lo (User collection)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 2) User ka password update (yahan pre-save hook hash kar dega)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 3) Agar ye doctor account hai, to Doctor collection me bhi password update karo
    if (user.role === "doctor") {
      const hashed = await bcrypt.hash(password, 10);

      await Doctor.findOneAndUpdate(
        {
          $or: [
            { userId: user._id },   // naya data — userId se link
            { email: user.email },  // purana data — email se link
          ],
        },
        { password: hashed }
      );
    }

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: error.message });
  }
};
