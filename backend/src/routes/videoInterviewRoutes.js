const express = require('express');
const router = express.Router();
const videoInterviewController = require('../controllers/videoInterviewController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

// إعداد multer للرفع في الذاكرة
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
  fileFilter: (req, file, cb) => {
    // قبول ملفات الفيديو فقط
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('يجب أن يكون الملف فيديو'), false);
    }
  },
});

/**
 * مسارات مقابلات الفيديو
 * جميع المسارات تتطلب مصادقة
 */

// إنشاء مقابلة جديدة
router.post('/create', authenticate, videoInterviewController.createInterview);

// الحصول على قائمة المقابلات
router.get('/', authenticate, videoInterviewController.getInterviews);

// الحصول على تفاصيل مقابلة
router.get('/:id', authenticate, videoInterviewController.getInterview);

// الانضمام لمقابلة
router.post('/:id/join', authenticate, videoInterviewController.joinInterview);

// مغادرة مقابلة
router.post('/:id/leave', authenticate, videoInterviewController.leaveInterview);

// إنهاء مقابلة (المضيف فقط)
router.post('/:id/end', authenticate, videoInterviewController.endInterview);

// ===== مسارات التسجيل =====

// بدء التسجيل (المضيف فقط)
router.post('/:id/recording/start', authenticate, videoInterviewController.startRecording);

// إيقاف التسجيل (المضيف فقط)
router.post('/:id/recording/stop', authenticate, videoInterviewController.stopRecording);

// رفع التسجيل (المضيف فقط)
router.post(
  '/:id/recording/upload',
  authenticate,
  upload.single('video'),
  videoInterviewController.uploadRecording
);

// الحصول على معلومات التسجيل
router.get('/:id/recording', authenticate, videoInterviewController.getRecording);

// تسجيل تحميل التسجيل
router.post('/:id/recording/download', authenticate, videoInterviewController.recordDownload);

// إضافة موافقة على التسجيل
router.post('/:id/recording/consent', authenticate, videoInterviewController.addRecordingConsent);

// التحقق من موافقة جميع المشاركين
router.get('/:id/recording/consents', authenticate, videoInterviewController.checkAllConsents);

module.exports = router;
