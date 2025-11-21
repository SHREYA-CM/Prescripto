const Doctor = require('../models/doctor');
const cloudinary = require('../config/cloudinary'); // Hamara new config file

// --- 1. Get All Doctors ---
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// --- 2. Get Doctors by Specialization ---
exports.getDoctorBySpecialization = async (req, res) => {
  try {
    const specialization = req.params.spec;
    const doctors = await Doctor.find({ 
      specialization: { $regex: new RegExp('^' + specialization + '$', 'i') } 
    });

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found for this specialization' });
    }
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// --- 3. Add a new Doctor (with Image Upload) ---
exports.addDoctor = async (req, res) => {
  try {
    // Ab data 'req.body' se aur file 'req.file' se aayegi
    const { name, specialization, bio, isAvailable } = req.body;
    
    if (!name || !specialization || !bio) {
      return res.status(400).json({ message: 'Please enter name, specialization, and bio' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // 1. Image ko Cloudinary pe upload karo
    // Hum file ka path bhej rahe hain (yeh multer se ayega)
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'prescripto_doctors', // Cloudinary mein ek folder ban jayega
    });

    // 2. Naya doctor create karo Cloudinary URL ke saath
    const newDoctor = new Doctor({
      name,
      specialization,
      bio,
      isAvailable,
      image: result.secure_url, // Cloudinary se mila URL
    });

    // 3. Doctor ko DB mein save karo
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);

  } catch (error) {
    console.error("Error adding doctor:", error); // Error check karne ke liye
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};