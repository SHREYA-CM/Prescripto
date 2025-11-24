const multer = require("multer");
const path = require("path");

// Temporary storage before uploading to Cloudinary
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
