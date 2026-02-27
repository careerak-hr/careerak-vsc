/**
 * 🤖 Daily Recommendation Controller
 * معالج طلبات التوصيات اليومية
 * 
 * يوفر endpoints لجلب التوصيات الجديدة وإدارة التحديث اليومي
 * 
 * المتطلبات: 7.2, 7.3 (تحديث يومي، قسم "جديد لك")
 * Task: 12.2 تحديث يومي
 */

const dailyRecommendationService = require('../services/dailyRecommendationService');
const dailyRecommendationCron = require('../jobs/dailyRecommendationCron');

/**
 * جلب التوصيات الجديدة للمستخدم (قسم "جديد لك")
 * GET /api/recommendations/new
 */
exports.getNewRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await dailyRecommendationService.getNewRecommendations(userId, {
      limit
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
      message: recommendations.length > 0 
        ? `تم جلب ${recommendations.length} توصية جديدة`
        : 'لا توجد توصيات جديدة حالياً'
    });

  } catch (error) {
    console.error('❌ خطأ في جلب التوصيات الجديدة:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب التوصيات الجديدة',
      error: error.message
    });
  }
};

/**
 * تحديد توصية كمشاهدة
 * PATCH /api/recommendations/:id/seen
 */
exports.markRecommendationAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await dailyRecommendationService.markRecommendationAsSeen(id);

    res.status(200).json({
      success: true,
      message: 'تم تحديد التوصية كمشاهدة'
    });

  } catch (error) {
    console.error('❌ خطأ في تحديد التوصية كمشاهدة:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديد التوصية كمشاهدة',
      error: error.message
    });
  }
};

/**
 * تشغيل التحديث اليومي يدوياً (للأدمن فقط)
 * POST /api/recommendations/daily-update
 */
exports.runDailyUpdate = async (req, res) => {
  try {
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتشغيل التحديث اليومي'
      });
    }

    const options = {
      lastActiveWithinDays: parseInt(req.body.lastActiveWithinDays) || 30,
      minProfileCompleteness: parseInt(req.body.minProfileCompleteness) || 30,
      batchSize: parseInt(req.body.batchSize) || 10,
      maxUsers: parseInt(req.body.maxUsers) || 1000
    };

    const result = await dailyRecommendationCron.runManually(options);

    res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    console.error('❌ خطأ في تشغيل التحديث اليومي:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تشغيل التحديث اليومي',
      error: error.message
    });
  }
};

/**
 * الحصول على حالة التحديث اليومي (للأدمن فقط)
 * GET /api/recommendations/daily-update/status
 */
exports.getDailyUpdateStatus = async (req, res) => {
  try {
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض حالة التحديث اليومي'
      });
    }

    const status = dailyRecommendationCron.getStatus();

    res.status(200).json({
      success: true,
      status
    });

  } catch (error) {
    console.error('❌ خطأ في جلب حالة التحديث اليومي:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب حالة التحديث اليومي',
      error: error.message
    });
  }
};

/**
 * بدء/إيقاف جدولة التحديث اليومي (للأدمن فقط)
 * POST /api/recommendations/daily-update/schedule
 */
exports.toggleDailyUpdateSchedule = async (req, res) => {
  try {
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بإدارة جدولة التحديث اليومي'
      });
    }

    const { action } = req.body; // 'start' أو 'stop'

    if (action === 'start') {
      dailyRecommendationCron.start(req.body.options);
      res.status(200).json({
        success: true,
        message: 'تم بدء جدولة التحديث اليومي',
        status: dailyRecommendationCron.getStatus()
      });
    } else if (action === 'stop') {
      dailyRecommendationCron.stop();
      res.status(200).json({
        success: true,
        message: 'تم إيقاف جدولة التحديث اليومي',
        status: dailyRecommendationCron.getStatus()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'إجراء غير صالح. استخدم "start" أو "stop"'
      });
    }

  } catch (error) {
    console.error('❌ خطأ في إدارة جدولة التحديث اليومي:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إدارة جدولة التحديث اليومي',
      error: error.message
    });
  }
};
