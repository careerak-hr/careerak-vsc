/**
 * CV Parser Routes
 * مسارات API لتحليل السيرة الذاتية
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cvParserController = require('../controllers/cvParserController');
const { protect } = require('../middleware/auth');

// إعداد multer للتعامل مع رفع الملفات
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOCX, TXT'));
    }
  },
});

/**
 * @route   POST /api/cv/parse
 * @desc    تحليل CV كامل
 * @access  Private (اختياري - يمكن جعله Public)
 */
router.post('/parse', protect, upload.single('cv'), cvParserController.parseCV);

/**
 * @route   POST /api/cv/extract-skills
 * @desc    استخراج المهارات فقط
 * @access  Private
 */
router.post('/extract-skills', protect, upload.single('cv'), cvParserController.extractSkills);

/**
 * @route   POST /api/cv/extract-experience
 * @desc    استخراج الخبرات فقط
 * @access  Private
 */
router.post('/extract-experience', protect, upload.single('cv'), cvParserController.extractExperience);

/**
 * @route   POST /api/cv/extract-education
 * @desc    استخراج التعليم فقط
 * @access  Private
 */
router.post('/extract-education', protect, upload.single('cv'), cvParserController.extractEducation);

/**
 * @route   GET /api/cv/analysis
 * @desc    الحصول على تحليل CV المحفوظ
 * @access  Private
 */
router.get('/analysis', protect, cvParserController.getCVAnalysis);

/**
 * @route   POST /api/cv/analyze-quality
 * @desc    تحليل جودة السيرة الذاتية (0-100)
 * @access  Private
 * Requirements: 4.3, 4.4
 */
router.post('/analyze-quality', protect, upload.single('cv'), cvParserController.analyzeQuality);

/**
 * @route   GET /api/cv/quality-analysis
 * @desc    الحصول على تحليل جودة CV المحفوظ
 * @access  Private
 */
router.get('/quality-analysis', protect, cvParserController.getQualityAnalysis);

/**
 * @route   POST /api/cv/improvement-suggestions
 * @desc    الحصول على اقتراحات تحسين السيرة الذاتية
 * @access  Private
 * Requirements: 4.3, 4.5
 */
router.post('/improvement-suggestions', protect, upload.single('cv'), cvParserController.getImprovementSuggestions);

/**
 * @route   GET /api/cv/improvement-suggestions
 * @desc    الحصول على اقتراحات التحسين المحفوظة
 * @access  Private
 */
router.get('/improvement-suggestions', protect, cvParserController.getSavedImprovementSuggestions);

module.exports = router;
