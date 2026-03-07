const express = require('express');
const router = express.Router();
const salaryEstimateController = require('../controllers/salaryEstimateController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/jobs/:id/salary-estimate
 * @desc    الحصول على تقدير الراتب لوظيفة معينة
 * @access  Public
 */
router.get('/jobs/:id/salary-estimate', salaryEstimateController.getSalaryEstimate);

/**
 * @route   POST /api/salary-data/update
 * @desc    تحديث بيانات الرواتب (للأدمن فقط)
 * @access  Private/Admin
 */
router.post(
  '/salary-data/update',
  protect,
  authorize('admin'),
  salaryEstimateController.updateSalaryData
);

/**
 * @route   DELETE /api/salary-data/cleanup
 * @desc    حذف بيانات الرواتب القديمة (للأدمن فقط)
 * @access  Private/Admin
 */
router.delete(
  '/salary-data/cleanup',
  protect,
  authorize('admin'),
  salaryEstimateController.cleanupOldData
);

/**
 * @route   GET /api/salary-data/statistics
 * @desc    الحصول على إحصائيات بيانات الرواتب (للأدمن فقط)
 * @access  Private/Admin
 */
router.get(
  '/salary-data/statistics',
  protect,
  authorize('admin'),
  salaryEstimateController.getStatistics
);

module.exports = router;
