const User = require("../models/user");
const Doctor = require("../models/doctor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
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
      return res.status(400).json({ message: "No patient found with this email" });
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
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   3️⃣ REGISTER DOCTOR — FIXED 🔥
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
      return res.status(400).json({ message: "Name, email & password are required" });
    }

    const exists = await Doctor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // 1️⃣ Create User account also (so doctor has a userId)
    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    // 2️⃣ Hash password for doctor schema
    const hashed = await bcrypt.hash(password, 10);

    // 3️⃣ Create doctor entry and link userId
    const doctor = await Doctor.create({
      userId: user._id,   // IMPORTANT 🔥
      name,
      email,
      password: hashed,
      speciality,
      experience,
      fees,
      about,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      role: "doctor",
      token: generateToken(user._id, "doctor"),
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ---------------------------------------------------------
   4️⃣ LOGIN DOCTOR — FIXED 🔥
--------------------------------------------------------- */
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // doctor ke User model ka check bhi hona chahiye
    const user = await User.findOne({ email, role: "doctor" });
    if (!user) {
      return res.status(400).json({ message: "No doctor account found" });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor profile missing!" });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.json({
      success: true,
      _id: user._id,
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
      token: generateToken(user._id, "doctor"),
    });

  } catch (error) {
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
      return res.status(400).json({ message: "No admin found with this email" });
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
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};
