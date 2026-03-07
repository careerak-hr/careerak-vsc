const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

// جميع المسارات تحتاج authentication
router.use(protect);

/**
 * @route   POST /api/jobs/:id/bookmark
 * @desc    تبديل حالة الحفظ (toggle bookmark)
 * @access  Private
 */
router.post('/:id/bookmark', bookmarkController.toggleBookmark);

/**
 * @route   GET /api/jobs/bookmarked
 * @desc    الحصول على جميع الوظائف المحفوظة
 * @access  Private
 * @query   startDate, endDate, tags
 */
router.get('/bookmarked', bookmarkController.getBookmarkedJobs);

/**
 * @route   GET /api/jobs/:id/bookmark/status
 * @desc    التحقق من حفظ وظيفة معينة
 * @access  Private
 */
router.get('/:id/bookmark/status', bookmarkController.checkBookmarkStatus);

/**
 * @route   PATCH /api/jobs/:id/bookmark
 * @desc    تحديث ملاحظات أو tags للوظيفة المحفوظة
 * @access  Private
 * @body    { notes, tags, notifyOnChange }
 */
router.patch('/:id/bookmark', bookmarkController.updateBookmark);

/**
 * @route   GET /api/jobs/bookmarks/stats
 * @desc    الحصول على إحصائيات الحفظ
 * @access  Private
 */
router.get('/bookmarks/stats', bookmarkController.getBookmarkStats);

module.exports = router;
