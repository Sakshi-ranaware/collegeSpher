// src/routes/departmentRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  getAssignedApplications,
  updateStatus,
} = require('../controllers/departmentController');

const router = express.Router();

router.get('/applications', auth, role('department'), getAssignedApplications);
router.put('/applications/:id', auth, role('department'), updateStatus);

module.exports = router;
