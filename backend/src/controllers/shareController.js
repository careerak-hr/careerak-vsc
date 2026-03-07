const shareTrackingService = require('../services/shareTrackingService');

/**
 * تسجيل مشاركة وظيفة
 * POST /api/jobs/:id/share
 */
exports.trackJobShare = async (req, res) => {
  try {
    const { platform, metadata } = req.body;
    const jobId = req.params.id;
    const userId = req.user.id;

    // التحقق من المنصة
    const validPlatforms = ['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy', 'native'];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ')
      });
    }

    // الحصول على معلومات الطلب
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // تسجيل المشاركة
    const result = await shareTrackingService.trackShare({
      jobId,
      userId,
      platform,
      ipAddress,
      userAgent,
      metadata: metadata || {}
    });

    if (!result.success) {
      const statusCode = result.spam ? 429 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Share tracked successfully',
      data: result.share,
      shareCount: result.newShareCount
    });
  } catch (error) {
    console.error('Error in trackJobShare:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track share',
      message: error.message
    });
  }
};

/**
 * الحصول على إحصائيات المشاركة لوظيفة
 * GET /api/jobs/:id/share-stats
 */
exports.getJobShareStats = async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await shareTrackingService.getJobShareStats(jobId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.stats
    });
  } catch (error) {
    console.error('Error in getJobShareStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get share stats',
      message: error.message
    });
  }
};

/**
 * الحصول على إحصائيات المشاركة للمستخدم الحالي
 * GET /api/users/me/share-stats
 */
exports.getUserShareStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const result = await shareTrackingService.getUserShareStats(userId, days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.stats
    });
  } catch (error) {
    console.error('Error in getUserShareStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user share stats',
      message: error.message
    });
  }
};

/**
 * الحصول على أكثر الوظائف مشاركة
 * GET /api/analytics/most-shared-jobs
 */
exports.getMostSharedJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const result = await shareTrackingService.getMostSharedJobs(limit, days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      period: result.period,
      data: result.jobs
    });
  } catch (error) {
    console.error('Error in getMostSharedJobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get most shared jobs',
      message: error.message
    });
  }
};

/**
 * الحصول على اتجاهات المشاركة
 * GET /api/analytics/share-trends
 */
exports.getShareTrends = async (req, res) => {
  try {
    const jobId = req.query.jobId || null;
    const days = parseInt(req.query.days) || 30;

    const result = await shareTrackingService.getShareTrends(jobId, days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      period: result.period,
      jobId: result.jobId,
      data: result.trends
    });
  } catch (error) {
    console.error('Error in getShareTrends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get share trends',
      message: error.message
    });
  }
};

/**
 * حذف سجلات المشاركة القديمة (للأدمن فقط)
 * DELETE /api/analytics/cleanup-shares
 */
exports.cleanupOldShares = async (req, res) => {
  try {
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Admin access required.'
      });
    }

    const days = parseInt(req.query.days) || 365;

    const result = await shareTrackingService.cleanupOldShares(days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in cleanupOldShares:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old shares',
      message: error.message
    });
  }
};
