// src/routes/adminRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { 
  getPendingFinal, 
  finalApprove, 
  getAllLeavingCertificates,
  getAlumniApplications,
  updateAlumniStatus,
  updateNoDuesDetails
} = require('../controllers/adminController');
const router = express.Router();

// LC Routes
router.get('/lc/pending', auth, role('admin'), getPendingFinal);
router.get('/lc/all', auth, role('admin'), getAllLeavingCertificates);
router.post('/lc/approve/:id', auth, role('admin'), finalApprove);
router.put('/lc/:id/nodues', auth, role('admin'), updateNoDuesDetails);

// Alumni Routes
router.get('/alumni', auth, role('admin'), getAlumniApplications);
router.put('/alumni/:id/status', auth, role('admin'), updateAlumniStatus);

module.exports = router;
