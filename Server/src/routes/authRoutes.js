// src/routes/authRoutes.js
const express = require('express');
const { login, register, verifyUser } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyUser);

module.exports = router;
