const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// POST /api/certificates/generate - إصدار شهادة جديدة
router.post('/generate', protect, certificateController.issueCertificate);

// GET /api/certificates/:certificateId/download - تحميل PDF بجودة عالية (عام)
router.get('/:certificateId/download', certificateController.downloadCertificate);

// GET /api/certificates/:certificateId - جلب شهادة واحدة
router.get('/:certificateId', certificateController.getCertificateById);

// GET /api/certificates/user/:userId - جلب شهادات المستخدم
router.get('/user/:userId', protect, certificateController.getUserCertificates);

// GET /api/certificates/verify/:certificateId - التحقق من شهادة (عام)
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// PUT /api/certificates/:certificateId/revoke - إلغاء شهادة
router.put('/:certificateId/revoke', protect, certificateController.revokeCertificate);

// POST /api/certificates/:certificateId/reissue - إعادة إصدار شهادة
router.post('/:certificateId/reissue', protect, certificateController.reissueCertificate);

// POST /api/certificates/:certificateId/linkedin-share - تحديد كمشاركة على LinkedIn
router.post('/:certificateId/linkedin-share', protect, certificateController.markAsSharedOnLinkedIn);

// GET /api/certificates/stats - إحصائيات الشهادات
router.get('/stats', protect, certificateController.getCertificateStats);

module.exports = router;
