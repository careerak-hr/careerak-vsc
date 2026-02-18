const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /auth/check-email
 * @desc    التحقق من صحة البريد الإلكتروني
 * @access  Public
 */
router.post('/check-email', authController.checkEmail);

/**
 * @route   POST /auth/validate-password
 * @desc    التحقق من قوة كلمة المرور
 * @access  Public
 */
router.post('/validate-password', authController.validatePassword);

/**
 * @route   POST /auth/generate-password
 * @desc    توليد كلمة مرور قوية
 * @access  Public
 */
router.post('/generate-password', authController.generatePassword);

module.exports = router;

/**
 * @route   POST /auth/refresh-token
 * @desc    تجديد Access Token باستخدام Refresh Token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /auth/send-verification-email
 * @desc    إرسال بريد تأكيد البريد الإلكتروني
 * @access  Public
 */
router.post('/send-verification-email', authController.sendVerificationEmail);

/**
 * @route   POST /auth/verify-email
 * @desc    تأكيد البريد الإلكتروني
 * @access  Public
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @route   POST /auth/forgot-password
 * @desc    طلب إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /auth/reset-password
 * @desc    إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);
