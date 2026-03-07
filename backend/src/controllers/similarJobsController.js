const similarJobsService = require('../services/similarJobsService');

/**
 * الحصول على الوظائف المشابهة
 * GET /api/jobs/:id/similar
 */
exports.getSimilarJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    // التحقق من صحة limit
    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 20'
      });
    }

    const similarJobs = await similarJobsService.findSimilarJobs(id, limit);

    res.status(200).json({
      success: true,
      count: similarJobs.length,
      data: similarJobs
    });
  } catch (error) {
    console.error('Error in getSimilarJobs:', error);
    
    if (error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching similar jobs',
      error: error.message
    });
  }
};

/**
 * حساب درجة التشابه بين وظيفتين
 * POST /api/jobs/similarity
 */
exports.calculateSimilarity = async (req, res) => {
  try {
    const { job1Id, job2Id } = req.body;

    if (!job1Id || !job2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both job1Id and job2Id are required'
      });
    }

    const JobPosting = require('../models/JobPosting');
    const job1 = await JobPosting.findById(job1Id).lean();
    const job2 = await JobPosting.findById(job2Id).lean();

    if (!job1 || !job2) {
      return res.status(404).json({
        success: false,
        message: 'One or both jobs not found'
      });
    }

    const score = similarJobsService.calculateSimilarity(job1, job2);

    res.status(200).json({
      success: true,
      data: {
        job1Id,
        job2Id,
        similarityScore: score
      }
    });
  } catch (error) {
    console.error('Error in calculateSimilarity:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating similarity',
      error: error.message
    });
  }
};

/**
 * تحديث cache الوظائف المشابهة
 * DELETE /api/jobs/:id/similar/cache
 */
exports.invalidateCache = async (req, res) => {
  try {
    const { id } = req.params;
    await similarJobsService.invalidateCache(id);

    res.status(200).json({
      success: true,
      message: 'Cache invalidated successfully'
    });
  } catch (error) {
    console.error('Error in invalidateCache:', error);
    res.status(500).json({
      success: false,
      message: 'Error invalidating cache',
      error: error.message
    });
  }
};
