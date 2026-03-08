const similarJobsService = require('../services/similarJobsService');

/**
 * Get similar jobs for a job posting
 * GET /api/job-postings/:id/similar
 */
exports.getSimilarJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    
    const similarJobs = await similarJobsService.getSimilarJobs(id, parseInt(limit) || 5);

    res.status(200).json({
      success: true,
      data: similarJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Refresh similar jobs cache (Admin only)
 * POST /api/job-postings/:id/similar/refresh
 */
exports.refreshSimilarJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `similar_jobs_${id}_*`;

    const redisCache = require('../services/redisCache');
    await redisCache.delPattern(cacheKey);

    res.status(200).json({
      success: true,
      message: 'Similar jobs cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
