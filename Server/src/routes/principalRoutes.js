
const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getAllApplications, generateLC } = require('../controllers/principalController');

const router = express.Router();

router.get('/applications', auth, role('principal'), getAllApplications);
router.post('/generate/:id', auth, role('principal'), generateLC);

module.exports = router;
