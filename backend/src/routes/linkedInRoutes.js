const express = require('express');
const router = express.Router();
const linkedInController = require('../controllers/linkedInController');
const { protect } = require('../middleware/auth');

/**
 * LinkedIn Routes
 * جميع المسارات محمية بـ authentication
 */

/**
 * @route   GET /api/linkedin/auth-url
 * @desc    الحصول على رابط OAuth للمصادقة مع LinkedIn
 * @access  Private
 */
router.get('/auth-url', protect, linkedInController.getAuthUrl);

/**
 * @route   GET /api/linkedin/callback
 * @desc    معالجة callback من LinkedIn بعد المصادقة
 * @access  Private
 */
router.get('/callback', protect, linkedInController.handleCallback);

/**
 * @route   POST /api/linkedin/share-certificate
 * @desc    مشاركة الشهادة على LinkedIn كمنشور
 * @access  Private
 * @body    { certificateId: string }
 */
router.post('/share-certificate', protect, linkedInController.shareCertificate);

/**
 * @route   POST /api/linkedin/add-certification
 * @desc    إضافة الشهادة إلى قسم Certifications في الملف الشخصي
 * @access  Private
 * @body    { certificateId: string }
 */
router.post('/add-certification', protect, linkedInController.addCertification);

/**
 * @route   DELETE /api/linkedin/unlink
 * @desc    إلغاء ربط حساب LinkedIn
 * @access  Private
 */
router.delete('/unlink', protect, linkedInController.unlinkAccount);

/**
 * @route   GET /api/linkedin/status
 * @desc    التحقق من حالة ربط LinkedIn
 * @access  Private
 */
router.get('/status', protect, linkedInController.getConnectionStatus);

/**
 * @route   GET /api/linkedin/profile
 * @desc    الحصول على معلومات المستخدم من LinkedIn
 * @access  Private
 */
router.get('/profile', protect, linkedInController.getProfile);

/**
 * @route   POST /api/linkedin/preview-post
 * @desc    معاينة المنشور قبل النشر على LinkedIn
 * @access  Private
 * @body    { certificateId: string }
 */
router.post('/preview-post', protect, linkedInController.previewPost);

module.exports = router;
