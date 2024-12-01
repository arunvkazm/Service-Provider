const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();

// Routes
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/admin/login', authController.adminLogin);

module.exports = router;
