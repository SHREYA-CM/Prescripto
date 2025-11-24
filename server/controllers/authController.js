// backend/controllers/authController.js

const User = require("../models/user");
const Doctor = require("../models/doctor.js");
const Otp = require("../models/Otp");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ---------------------------------------------------------
   🔹 COMMON EMAIL TRANSPORTER  (Gmail SMTP)
--------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* ---------------------------------------------------------
   🔹 GMAIL REGEX (Only allow @gmail.com here)
--------------------------------------------------------- */
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

/* ---------------------------------------------------------
   🔹 HELPER: SEND WELCOME EMAIL ON REGISTRATION
--------------------------------------------------------- */
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const roleLabel =
      role === "doctor"
        ? "Doctor"
        : role === "admin"
        ? "Admin"
        : "Patient";

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Welcome to Prescripto 🎉",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your <b>${roleLabel}</b> account has been created successfully on <b>Prescripto</b>.</p>
        <p>You can now login using your registered email and password.</p>
        <br/>
        <p style="font-size:13px;color:#555">
          If you did not create this account, please ignore this email.
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending welcome email:", err.message);
    // Registration should still succeed even if email fails
  }
};

/* ---------------------------------------------------------
   🔹 GENERATE 6-DIGIT OTP
--------------------------------------------------------- */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ---------------------------------------------------------
   🔹 0️⃣ VERIFY EMAIL (REAL-TIME CHECK)
   POST /api/auth/verify-email
   ✅ Works for both Patient + Doctor
   ✅ Only format + DB uniqueness (no SMTP existence check)
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

    // Only allow Gmail
    if (!gmailRegex.test(email)) {
      return res.status(200).json({
        exists: false,
        message: "Please enter a valid Gmail address (example@gmail.com).",
      });
    }

    // Check if email already registered in User OR Doctor
    const userExists = await User.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });

    if (userExists || doctorExists) {
      return res.status(200).json({
        exists: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    // ✅ Valid Gmail + not in DB -> allow OTP step
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
   POST /api/auth/send-otp
   ✅ Works for any valid Gmail (patient / doctor / admin)
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

    const code = generateOtpCode();
    const expiresInMinutes = parseInt(process.env.OTP_EXP_MINUTES || "10", 10);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Upsert OTP record
    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your Prescripto Verification Code",
      html: `
        <p>Your OTP code is: <b>${code}</b></p>
        <p>This code will expire in ${expiresInMinutes} minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your Gmail address.",
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

/* ---------------------------------------------------------
   🔹 0️⃣ VERIFY OTP
   POST /api/auth/verify-otp
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

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please request a new one.",
      });
    }

    if (otpRecord.verified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (otpRecord.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now complete registration.",
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
   1️⃣ REGISTER PATIENT  (REQUIRES VERIFIED OTP)
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

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({
        message: "Please verify your email with OTP before registering.",
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
   3️⃣ REGISTER DOCTOR  (REQUIRES VERIFIED OTP + DOCUMENTS)
   Uses multer (req.files) + Cloudinary
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

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email & password are required" });
    }

    // Check if doctor already exists
    const exists = await Doctor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Check OTP verification
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({
        message: "Please verify your email with OTP before registering.",
      });
    }

    // Create User record (User model will hash password itself)
    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    // Hash password separately for Doctor model
    const hashed = await bcrypt.hash(password, 10);

    // -----------------------------
    //  CLOUDINARY UPLOADS (3 docs)
    // -----------------------------
    let photoUrl = "";
    let idProofUrl = "";
    let degreeUrl = "";

    const files = req.files || {};

    // 🔥 Generic helper: choose resource_type based on file kind
    const uploadToCloudinary = async (file, folder, resourceType = "image") => {
      if (!file) return "";

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: resourceType, // "image" | "raw"
      });

      // delete local temp file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.warn("Failed to delete temp file:", e.message);
      }

      return result.secure_url;
    };

    // 👩‍⚕️ Profile photo = IMAGE
    if (files.photo && files.photo[0]) {
      photoUrl = await uploadToCloudinary(
        files.photo[0],
        "prescripto_doctors/photo",
        "image"
      );
    }

    // 🪪 ID proof = RAW (pdf/image/doc)
    if (files.idProof && files.idProof[0]) {
      idProofUrl = await uploadToCloudinary(
        files.idProof[0],
        "prescripto_doctors/idProof",
        "raw"
      );
    }

    // 🎓 Degree document = RAW
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
      status: "pending", // 🔥 must be approved by admin
    });

    await Otp.deleteOne({ email });

    sendWelcomeEmail(user.email, user.name, "doctor");

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
   4️⃣ LOGIN DOCTOR  (FIXED VERSION)
--------------------------------------------------------- */
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res
        .status(400)
        .json({ message: "No doctor found with this email" });
    }

    // 2. Compare password with hashed doctor.password
    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 3. Try to find linked user (optional, for consistency)
    const user = doctor.userId
      ? await User.findById(doctor.userId)
      : await User.findOne({ email, role: "doctor" });

    // 4. Build token payload from userId if possible, else fallback to doctor._id
    const tokenId = user ? user._id : doctor.userId || doctor._id;

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
   6️⃣ FORGOT PASSWORD (Send reset email)
--------------------------------------------------------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "No user found with this email" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
      `,
    });

    return res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------------------------------
   7️⃣ RESET PASSWORD
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
