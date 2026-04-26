
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getAllApplications, approveApplication } = require('../controllers/hodController');
const { downloadCertificate } = require('../controllers/studentController');

const router = express.Router();

router.get('/applications', auth, role('hod'), getAllApplications);
router.put('/approve/:id', auth, role('hod'), approveApplication);
router.get('/application/:id/download', auth, role('hod'), downloadCertificate);

// Alumni Routes
const { getAlumniApplications, updateAlumniStatus } = require('../controllers/hodController');
router.get('/alumni/applications', auth, role('hod'), getAlumniApplications);
router.put('/alumni/approve/:id', auth, role('hod'), updateAlumniStatus);

module.exports = router;
