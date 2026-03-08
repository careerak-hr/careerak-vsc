const shareService = require('../services/shareService');

/**
 * Record a job share
 * POST /api/job-postings/:id/share
 */
exports.recordShare = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { platform } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await shareService.recordShare(jobId, {
      userId,
      platform,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
