const bookmarkService = require('../services/bookmarkService');

/**
 * تبديل حالة الحفظ (toggle bookmark)
 * POST /api/jobs/:id/bookmark
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    const result = await bookmarkService.toggleBookmark(userId, jobId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in toggleBookmark:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تبديل حالة الحفظ'
    });
  }
};

/**
 * الحصول على جميع الوظائف المحفوظة
 * GET /api/jobs/bookmarked
 */
exports.getBookmarkedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };

    const jobs = await bookmarkService.getBookmarkedJobs(userId, filters);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Error in getBookmarkedJobs:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الوظائف المحفوظة'
    });
  }
};

/**
 * التحقق من حفظ وظيفة معينة
 * GET /api/jobs/:id/bookmark/status
 */
exports.checkBookmarkStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    const isBookmarked = await bookmarkService.isBookmarked(userId, jobId);

    res.status(200).json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    console.error('Error in checkBookmarkStatus:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من حالة الحفظ'
    });
  }
};

/**
 * تحديث ملاحظات أو tags للوظيفة المحفوظة
 * PATCH /api/jobs/:id/bookmark
 */
exports.updateBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;
    const updates = req.body;

    const bookmark = await bookmarkService.updateBookmark(userId, jobId, updates);

    res.status(200).json({
      success: true,
      message: 'تم تحديث الوظيفة المحفوظة بنجاح',
      bookmark
    });
  } catch (error) {
    console.error('Error in updateBookmark:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث الوظيفة المحفوظة'
    });
  }
};

/**
 * الحصول على إحصائيات الحفظ
 * GET /api/jobs/bookmarks/stats
 */
exports.getBookmarkStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await bookmarkService.getBookmarkStats(userId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in getBookmarkStats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
};
