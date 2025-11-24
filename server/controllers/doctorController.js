const Doctor = require("../models/doctor");
const User = require("../models/user"); // for user checks
const cloudinary = require("../config/cloudinary");

/* -----------------------------------------------------------
   Helper: Clean doctor profile for frontend
   - Defaults ko hata ke blank/empty bhejte hain
----------------------------------------------------------- */
const cleanDoctorProfile = (doctor) => {
  if (!doctor) return null;
  const d = doctor.toObject ? doctor.toObject() : doctor;

  return {
    _id: d._id,
    userId: d.userId,
    name: d.name,
    email: d.email,
    status: d.status, // pending / approved / rejected

    // agar sirf default hai to "" bhej do taaki form blank rahe
    speciality:
      d.speciality && d.speciality !== "general physician"
        ? d.speciality
        : "",

    degree: d.degree || "",

    experience:
      typeof d.experience === "number" && d.experience !== 0
        ? d.experience
        : "",

    fees:
      typeof d.fees === "number" && d.fees !== 500
        ? d.fees
        : "",

    about: d.about || "",
  };
};

/* ============================================================
   1) Get ALL doctors  (public)
   GET /api/doctors
============================================================ */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    console.error("getAllDoctors error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ============================================================
   2) Get doctors by SPECIALITY  (public)
   GET /api/doctors/speciality/:spec
============================================================ */
exports.getDoctorBySpeciality = async (req, res) => {
  try {
    const spec = req.params.spec;

    const doctors = await Doctor.find({
      speciality: { $regex: new RegExp("^" + spec + "$", "i") },
    });

    if (!doctors || doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No doctors found for this speciality" });
    }

    res.json(doctors);
  } catch (error) {
    console.error("getDoctorBySpeciality error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ============================================================
   3) Get SINGLE doctor by ID (public)
   GET /api/doctor/:id
============================================================ */
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error("getDoctorById error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ============================================================
   4) Add a new Doctor (with optional Image Upload)
   POST /api/admin/doctors (if wired)
============================================================ */
exports.addDoctor = async (req, res) => {
  try {
    const {
      name,
      speciality,
      specialization,
      about,
      bio,
      isAvailable,
      fees,
      experience,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const finalSpeciality = speciality || specialization || "General Physician";
    const finalAbout = about || bio || "";

    const doctorData = {
      name,
      speciality: finalSpeciality,
      about: finalAbout,
    };

    if (typeof isAvailable !== "undefined") doctorData.isAvailable = isAvailable;
    if (typeof fees !== "undefined") doctorData.fees = fees;
    if (typeof experience !== "undefined")
      doctorData.experience = experience;

    // If file is sent, upload to cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "prescripto_doctors",
      });
      doctorData.image = result.secure_url;
    }

    const newDoctor = await Doctor.create(doctorData);
    res.status(201).json(newDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ============================================================
   5) DOCTOR: Get own profile (protected)
   GET /api/doctor/profile
============================================================ */
exports.getDoctorProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized to access profile" });
    }

    const userId = req.user._id;
    console.log("getDoctorProfile userId:", userId);

    // user check
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found for this token" });
    }

    if (user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Only doctor accounts can access this profile" });
    }

    // Try by userId first
    let doctor = await Doctor.findOne({ userId }).select("-password");

    // Fallback: by email (old data)
    if (!doctor) {
      doctor = await Doctor.findOne({ email: user.email }).select("-password");
    }

    if (!doctor) {
      return res
        .status(404)
        .json({ message: "Doctor profile not found for this account" });
    }

    const cleaned = cleanDoctorProfile(doctor);

    return res.json({ doctor: cleaned });
  } catch (error) {
    console.error("getDoctorProfile error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

/* ============================================================
   6) DOCTOR: Update own profile (protected)
   PUT /api/doctor/profile
============================================================ */
exports.updateDoctorProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update profile" });
    }

    const userId = req.user._id;
    console.log("updateDoctorProfile userId:", userId);

    const user = await User.findById(userId);
    if (!user || user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Only doctor accounts can update this profile" });
    }

    // Try by userId first, then by email
    let doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      doctor = await Doctor.findOne({ email: user.email });
    }

    if (!doctor) {
      return res
        .status(404)
        .json({ message: "Doctor profile not found for this account" });
    }

    const { speciality, degree, experience, fees, about } = req.body;

    if (typeof speciality !== "undefined") doctor.speciality = speciality;
    if (typeof degree !== "undefined") doctor.degree = degree;
    if (typeof experience !== "undefined")
      doctor.experience = Number(experience) || 0;
    if (typeof fees !== "undefined") doctor.fees = Number(fees) || 0;
    if (typeof about !== "undefined") doctor.about = about;

    await doctor.save();

    const cleaned = cleanDoctorProfile(doctor);

    return res.json({
      message: "Profile updated successfully",
      doctor: cleaned,
    });
  } catch (error) {
    console.error("updateDoctorProfile error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
