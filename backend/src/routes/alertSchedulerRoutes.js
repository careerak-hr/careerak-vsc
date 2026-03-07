const express = require('express');
const router = express.Router();
const alertSchedulerController = require('../controllers/alertSchedulerController');
const { protect, authorize } = require('../middleware/auth');

// جميع المسارات محمية ومخصصة للأدمن فقط
router.use(protect);
router.use(authorize('Admin'));

/**
 * @route   GET /api/admin/alert-scheduler/status
 * @desc    الحصول على حالة المهام المجدولة
 * @access  Private/Admin
 */
router.get('/status', alertSchedulerController.getStatus);

/**
 * @route   POST /api/admin/alert-scheduler/run-daily
 * @desc    تشغيل التنبيهات اليومية يدوياً
 * @access  Private/Admin
 */
router.post('/run-daily', alertSchedulerController.runDailyAlerts);

/**
 * @route   POST /api/admin/alert-scheduler/run-weekly
 * @desc    تشغيل التنبيهات الأسبوعية يدوياً
 * @access  Private/Admin
 */
router.post('/run-weekly', alertSchedulerController.runWeeklyAlerts);

module.exports = router;
