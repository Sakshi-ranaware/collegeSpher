// src/routes/authRoutes.js
const express = require('express');
const { login, register, verifyUser } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyUser);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/verify-otp', require('../controllers/authController').verifyOTP);
router.post('/reset-password', require('../controllers/authController').resetPassword);

module.exports = router;
