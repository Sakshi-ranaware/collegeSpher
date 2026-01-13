// src/routes/studentRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  applyLeavingCertificate,
  getMyApplications,
  registerAlumni,
  getAlumniApplications,
  downloadCertificate
} = require('../controllers/studentController');

const router = express.Router();

// Leaving Certificate Routes
router.post('/apply', auth, role('student'), upload.single('marksheet'), applyLeavingCertificate);
router.get('/applications', auth, role('student'), getMyApplications);
router.get('/application/:id/download', auth, role('student'), downloadCertificate);

// Alumni Routes
router.post('/alumni/apply', auth, role('student'), registerAlumni);
router.get('/alumni/applications', auth, role('student'), getAlumniApplications);

module.exports = router;
