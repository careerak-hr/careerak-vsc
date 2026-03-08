const salaryEstimationService = require('../services/salaryEstimationService');

/**
 * Get salary estimate for a job
 * GET /api/job-postings/:id/salary-estimate
 */
exports.getSalaryEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await salaryEstimationService.getSalaryEstimate(id);

    if (!estimate) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No salary data available for this job'
      });
    }

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
