const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

/**
 * Verification Routes
 * مسارات التحقق من الشهادات
 * 
 * All routes are public - no authentication required
 * جميع المسارات عامة - لا تحتاج مصادقة
 */

// GET /api/verify/:certificateId - التحقق من شهادة واحدة
router.get('/:certificateId', verificationController.verifyCertificate);

// GET /api/verify/search?q=query - البحث عن الشهادات
router.get('/search', verificationController.searchCertificates);

// POST /api/verify/bulk - التحقق من عدة شهادات
router.post('/bulk', verificationController.verifyBulk);

// GET /api/verify/stats - إحصائيات التحقق
router.get('/stats', verificationController.getVerificationStats);

module.exports = router;
