// src/middleware/uploadMiddleware.js
const multer = require('multer');

// Store file in memory buffer for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;
