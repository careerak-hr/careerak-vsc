const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, checkRole } = require('../middleware/auth');

// Middleware للتحقق من صلاحية المدرب أو الأدمن
const requireInstructorOrAdmin = [protect, checkRole('instructor', 'admin', 'Admin', 'HR')];

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

// PUT /api/certificates/:certificateId/revoke - إلغاء شهادة (مدرب أو أدمن فقط)
router.put('/:certificateId/revoke', requireInstructorOrAdmin, certificateController.revokeCertificate);

// POST /api/certificates/:certificateId/reissue - إعادة إصدار شهادة (مدرب أو أدمن فقط)
router.post('/:certificateId/reissue', requireInstructorOrAdmin, certificateController.reissueCertificate);

// POST /api/certificates/:certificateId/linkedin-share - تحديد كمشاركة على LinkedIn
router.post('/:certificateId/linkedin-share', protect, certificateController.markAsSharedOnLinkedIn);

// PATCH /api/certificates/:certificateId/visibility - تحديث رؤية الشهادة
router.patch('/:certificateId/visibility', protect, certificateController.updateCertificateVisibility);

// GET /api/certificates/stats - إحصائيات الشهادات
router.get('/stats', protect, certificateController.getCertificateStats);

module.exports = router;
