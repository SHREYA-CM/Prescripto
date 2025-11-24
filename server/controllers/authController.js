// backend/controllers/authController.js

const User = require("../models/user");
const Doctor = require("../models/doctor.js");
const Otp = require("../models/Otp");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ⛔ REMOVE nodemailer imports completely
// const nodemailer = require("nodemailer");

// ✅ ADD RESEND MAILER
const { sendMail } = require("..utils/mailer");

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Gmail regex
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

/* ---------------------------------------------------------
   🔹 SEND WELCOME EMAIL USING RESEND
--------------------------------------------------------- */
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const roleLabel =
      role === "doctor"
        ? "Doctor"
        : role === "admin"
        ? "Admin"
        : "Patient";

    await sendMail({
      to: email,
      subject: "Welcome to Prescripto 🎉",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your <b>${roleLabel}</b> account has been created successfully.</p>
      `,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending welcome email:", err.message);
  }
};

/* ---------------------------------------------------------
   🔹 GENERATE OTP
--------------------------------------------------------- */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ---------------------------------------------------------
   🔹 VERIFY EMAIL (REAL TIME)
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
        message: "This email is already registered.",
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
   🔹 SEND OTP (NOW USING RESEND)
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
        message: "Please enter a valid Gmail address.",
      });
    }

    const code = generateOtpCode();
    const expiresInMinutes = parseInt(process.env.OTP_EXP_MINUTES || "10", 10);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Save OTP
    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // SEND OTP USING RESEND
    await sendMail({
      to: email,
      subject: "Your Prescripto Verification Code",
      html: `
        <p>Your OTP code is: <b>${code}</b></p>
        <p>This OTP expires in ${expiresInMinutes} minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your Gmail.",
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

/* ---------------------------------------------------------
   🔹 VERIFY OTP
--------------------------------------------------------- */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Request a new one.",
      });
    }

    if (otpRecord.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

/* ---------------------------------------------------------
   🔹 REGISTER PATIENT
--------------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({
        message: "Please verify your email with OTP.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
    });

    await Otp.deleteOne({ email });

    sendWelcomeEmail(user.email, user.name, "patient");

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
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 LOGIN PATIENT
--------------------------------------------------------- */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "patient" });

    if (!user)
      return res.status(400).json({ message: "Patient not found" });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

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
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 REGISTER DOCTOR
--------------------------------------------------------- */
exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, experience, fees, about } =
      req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password required" });

    const exists = await Doctor.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Doctor already exists" });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified)
      return res
        .status(400)
        .json({ message: "Please verify your email with OTP." });

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

    const uploadToCloudinary = async (file, folder, type = "image") => {
      if (!file) return "";

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: type,
      });

      try {
        fs.unlinkSync(file.path);
      } catch (err) {}

      return result.secure_url;
    };

    if (files.photo && files.photo[0])
      photoUrl = await uploadToCloudinary(files.photo[0], "prescripto/photo");

    if (files.idProof && files.idProof[0])
      idProofUrl = await uploadToCloudinary(
        files.idProof[0],
        "prescripto/idProof",
        "raw"
      );

    if (files.degree && files.degree[0])
      degreeUrl = await uploadToCloudinary(
        files.degree[0],
        "prescripto/degree",
        "raw"
      );

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

    await Otp.deleteOne({ email });

    sendWelcomeEmail(user.email, user.name, "doctor");

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully. Await admin approval.",
      role: "doctor",
      token: generateToken(user._id, "doctor"),
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status,
    });
  } catch (error) {
    console.error("registerDoctor error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 LOGIN DOCTOR
--------------------------------------------------------- */
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res.status(400).json({ message: "Doctor not found" });

    const match = await bcrypt.compare(password, doctor.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const user =
      doctor.userId ||
      (await User.findOne({ email, role: "doctor" }));

    const tokenId = user?._id || doctor._id;

    return res.json({
      success: true,
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
      token: generateToken(tokenId, "doctor"),
      status: doctor.status,
    });
  } catch (error) {
    console.error("loginDoctor error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 LOGIN ADMIN
--------------------------------------------------------- */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });

    if (!admin)
      return res.status(400).json({ message: "Admin not found" });

    const match = await admin.matchPassword(password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

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
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 FORGOT PASSWORD
--------------------------------------------------------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "No user found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click below:</p>
        <a href="${resetURL}">${resetURL}</a>
      `,
    });

    return res.json({ success: true, message: "Reset link sent" });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   🔹 RESET PASSWORD
--------------------------------------------------------- */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: error.message });
  }
};
