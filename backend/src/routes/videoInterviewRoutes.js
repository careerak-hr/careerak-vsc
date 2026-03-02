/**
 * Video Interview Routes
 * مسارات API لمقابلات الفيديو
 */

const express = require('express');
const router = express.Router();
const { VideoInterviewController, uploadMiddleware } = require('../controllers/videoInterviewController');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية بـ authentication
router.use(protect);

/**
 * @route   GET /api/video-interviews/upcoming
 * @desc    الحصول على قائمة المقابلات القادمة
 * @access  Private
 * Requirements: 8.1
 */
router.get('/upcoming', VideoInterviewController.getUpcomingInterviews);

/**
 * @route   GET /api/video-interviews/past
 * @desc    الحصول على سجل المقابلات السابقة
 * @access  Private
 * Requirements: 8.2
 */
router.get('/past', VideoInterviewController.getPastInterviews);

/**
 * @route   GET /api/video-interviews/search
 * @desc    البحث والفلترة في المقابلات
 * @access  Private
 * Requirements: 8.6
 */
router.get('/search', VideoInterviewController.searchInterviews);

/**
 * @route   GET /api/video-interviews/stats
 * @desc    الحصول على إحصائيات المقابلات
 * @access  Private
 */
router.get('/stats', VideoInterviewController.getInterviewStats);

/**
 * @route   GET /api/video-interviews/:interviewId
 * @desc    الحصول على تفاصيل مقابلة واحدة
 * @access  Private
 * Requirements: 8.1, 8.2, 8.3
 */
router.get('/:interviewId', VideoInterviewController.getInterviewDetails);

/**
 * @route   PUT /api/video-interviews/:interviewId/notes
 * @desc    إضافة ملاحظات بعد المقابلة
 * @access  Private (Host only)
 * Requirements: 8.4
 */
router.put('/:interviewId/notes', VideoInterviewController.addNotes);

/**
 * @route   PUT /api/video-interviews/:interviewId/rating
 * @desc    تقييم المرشح بعد المقابلة
 * @access  Private (Host only)
 * Requirements: 8.5
 */
router.put('/:interviewId/rating', VideoInterviewController.rateCandidate);

/**
 * @route   POST /api/video-interviews/:interviewId/files
 * @desc    رفع ملف أثناء المقابلة
 * @access  Private
 */
router.post('/:interviewId/files', uploadMiddleware, VideoInterviewController.uploadFile);

/**
 * @route   DELETE /api/video-interviews/:interviewId/files/:fileId
 * @desc    حذف ملف من المقابلة
 * @access  Private
 */
router.delete('/:interviewId/files/:fileId', VideoInterviewController.deleteFile);

/**
 * @route   POST /api/video-interviews/file-info
 * @desc    الحصول على معلومات الملف
 * @access  Private
 */
router.post('/file-info', uploadMiddleware, VideoInterviewController.getFileInfo);

module.exports = router;

