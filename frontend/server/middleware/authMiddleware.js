const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Doctor = require("../models/doctor");

// -----------------------------------------------------
//  PROTECT MIDDLEWARE
// -----------------------------------------------------
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Debug print
      console.log("\n----------------------------------");
      console.log("TOKEN DECODED:", decoded);

      req.user = {
        _id: decoded.id,
        role: decoded.role.trim().toLowerCase(),
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "No token provided" });
};

// -----------------------------------------------------
//  AUTHORIZE MIDDLEWARE
// -----------------------------------------------------
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    console.log("ROLE:", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role === "patient" || req.user.role === "admin") {
      req.account = await User.findById(req.user._id).select("-password");
    }

    if (req.user.role === "doctor") {
      req.account = await Doctor.findOne({ userId: req.user._id }).select("-password");
    }

    console.log("ACCOUNT:", req.account);

    if (!req.account) {
      return res.status(403).json({ message: "User/Doctor account not found" });
    }

    return next();
  };
};
