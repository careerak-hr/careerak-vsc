const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

// إعداد multer للرفع
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    // قبول ملفات الفيديو فقط
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

/**
 * Recording Routes
 * مسارات إدارة التسجيلات
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

// بدء تسجيل
router.post('/start', authenticate, recordingController.startRecording);

// إيقاف تسجيل
router.post('/stop', authenticate, recordingController.stopRecording);

// رفع تسجيل
router.post('/upload', authenticate, upload.single('recording'), recordingController.uploadRecording);

// الحصول على التسجيلات التي ستنتهي قريباً (يجب أن يكون قبل /:recordingId)
router.get('/expiring-soon', authenticate, recordingController.getExpiringSoonRecordings);

// الحصول على معلومات تسجيل
router.get('/:recordingId', authenticate, recordingController.getRecording);

// تحميل تسجيل
router.get('/:recordingId/download', authenticate, recordingController.downloadRecording);

// حذف تسجيل
router.delete('/:recordingId', authenticate, recordingController.deleteRecording);

module.exports = router;
