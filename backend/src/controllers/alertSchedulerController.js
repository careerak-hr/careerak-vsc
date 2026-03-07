const alertScheduler = require('../jobs/alertScheduler');

/**
 * Controller للتحكم في جدولة التنبيهات
 * (للاختبار والإدارة)
 */

/**
 * GET /api/admin/alert-scheduler/status
 * الحصول على حالة المهام المجدولة
 */
exports.getStatus = async (req, res) => {
  try {
    const status = alertScheduler.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب حالة الجدولة'
    });
  }
};

/**
 * POST /api/admin/alert-scheduler/run-daily
 * تشغيل التنبيهات اليومية يدوياً
 */
exports.runDailyAlerts = async (req, res) => {
  try {
    const result = await alertScheduler.runDailyAlertsNow();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تشغيل التنبيهات اليومية',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error running daily alerts:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تشغيل التنبيهات اليومية'
    });
  }
};

/**
 * POST /api/admin/alert-scheduler/run-weekly
 * تشغيل التنبيهات الأسبوعية يدوياً
 */
exports.runWeeklyAlerts = async (req, res) => {
  try {
    const result = await alertScheduler.runWeeklyAlertsNow();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تشغيل التنبيهات الأسبوعية',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error running weekly alerts:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تشغيل التنبيهات الأسبوعية'
    });
  }
};

module.exports = exports;
