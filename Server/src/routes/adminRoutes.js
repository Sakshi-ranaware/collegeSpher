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
  updateNoDuesDetails,
  getUnapprovedUsers,
  approveUser,
  getDepartments,
  addDepartment,
  removeDepartment,
  getStaff,
  addStaff,
  removeStaff,
  toggleStaffApproval
} = require('../controllers/adminController');
const router = express.Router();

// User Approval Routes
router.get('/users/unapproved', auth, role('admin'), getUnapprovedUsers);
router.post('/users/approve/:id', auth, role('admin'), approveUser);

// LC Routes
router.get('/lc/pending', auth, role('admin'), getPendingFinal);
router.get('/lc/all', auth, role('admin'), getAllLeavingCertificates);
router.post('/lc/approve/:id', auth, role('admin'), finalApprove);
router.put('/lc/:id/nodues', auth, role('admin'), updateNoDuesDetails);

// Alumni Routes
router.get('/alumni', auth, role('admin'), getAlumniApplications);
router.put('/alumni/:id/status', auth, role('admin'), updateAlumniStatus);

// Department Management Routes
router.get('/departments', auth, role('admin'), getDepartments);
router.post('/departments', auth, role('admin'), addDepartment);
router.delete('/departments/:id', auth, role('admin'), removeDepartment);

// Staff Management Routes
router.get('/staff', auth, role('admin'), getStaff);
router.post('/staff', auth, role('admin'), addStaff);
router.delete('/staff/:id', auth, role('admin'), removeStaff);
router.put('/staff/:id/approval', auth, role('admin'), toggleStaffApproval);

module.exports = router;
