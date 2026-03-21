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

// GET /api/verify/search?q=query - البحث عن الشهادات (يجب أن يكون قبل /:certificateId)
router.get('/search', verificationController.searchCertificates);

// POST /api/verify/bulk - التحقق من عدة شهادات
router.post('/bulk', verificationController.verifyBulk);

// GET /api/verify/stats - إحصائيات التحقق
router.get('/stats', verificationController.getVerificationStats);

// GET /api/verify/:certificateId/report - تحميل تقرير PDF للتحقق
router.get('/:certificateId/report', verificationController.downloadVerificationReport);

// GET /api/verify/:certificateId - التحقق من شهادة واحدة (يجب أن يكون آخراً)
router.get('/:certificateId', verificationController.verifyCertificate);

module.exports = router;
