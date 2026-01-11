
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getAllApplications, generateLC, downloadLC } = require('../controllers/principalController');

const router = express.Router();

router.get('/applications', auth, role('principal'), getAllApplications);
router.post('/generate/:id', auth, role('principal'), generateLC);
router.get('/application/:id/download', auth, role('principal'), downloadLC);

module.exports = router;
