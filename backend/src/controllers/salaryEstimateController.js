const salaryEstimatorService = require('../services/salaryEstimatorService');
const logger = require('../utils/logger');

/**
 * الحصول على تقدير الراتب لوظيفة معينة
 * GET /api/jobs/:id/salary-estimate
 */
exports.getSalaryEstimate = async (req, res) => {
  try {
    const { id } = req.params;

    const estimate = await salaryEstimatorService.estimateSalaryByJobId(id);

    if (!estimate) {
      return res.status(200).json({
        success: true,
        message: 'Insufficient data for salary estimation',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    logger.error('Error getting salary estimate:', error);
    
    if (error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get salary estimate',
      error: error.message
    });
  }
};

/**
 * تحديث بيانات الرواتب (للأدمن فقط)
 * POST /api/salary-data/update
 */
exports.updateSalaryData = async (req, res) => {
  try {
    const result = await salaryEstimatorService.updateSalaryData();

    res.status(200).json({
      success: true,
      message: 'Salary data updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error updating salary data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary data',
      error: error.message
    });
  }
};

/**
 * حذف بيانات الرواتب القديمة (للأدمن فقط)
 * DELETE /api/salary-data/cleanup
 */
exports.cleanupOldData = async (req, res) => {
  try {
    const result = await salaryEstimatorService.cleanupOldData();

    res.status(200).json({
      success: true,
      message: 'Old salary data cleaned up successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error cleaning up old salary data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old salary data',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات بيانات الرواتب (للأدمن فقط)
 * GET /api/salary-data/statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const statistics = await salaryEstimatorService.getStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Error getting salary statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get salary statistics',
      error: error.message
    });
  }
};
