const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();
const upload = require('../middleware/multer');

// Routes
router.post('/register',upload.single("image"), authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/admin/login', authController.adminLogin);

module.exports = router;
