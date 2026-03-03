const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');
const { authenticate } = require('../middleware/auth');

/**
 * Interview Routes (Recording Consent)
 * مسارات موافقة التسجيل
 * 
 * Requirements: 2.2, 2.3
 */

// إضافة موافقة على التسجيل
router.post('/:interviewId/recording-consent', authenticate, recordingController.addRecordingConsent);

// الحصول على حالة الموافقات
router.get('/:interviewId/recording-consents', authenticate, recordingController.getRecordingConsents);

module.exports = router;
