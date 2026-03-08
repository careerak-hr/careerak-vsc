const bookmarkService = require('../services/bookmarkService');

/**
 * Toggle bookmark for a job
 * POST /api/job-postings/:id/bookmark
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const userId = req.user.id;

    const result = await bookmarkService.toggleBookmark(userId, jobId);

    res.status(200).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get user's bookmarked jobs
 * GET /api/job-postings/bookmarked
 */
exports.getBookmarkedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const result = await bookmarkService.getUserBookmarks(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    res.status(200).json({
      success: true,
      data: result.bookmarks,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
