const shareTrackingService = require('../services/shareTrackingService');
const shareService = require('../services/shareService');

const EXTERNAL_METHODS = new Set(['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email']);

/**
 * Record a share event
 * POST /api/shares
 * Req 13, 15
 */
exports.recordShare = async (req, res) => {
  try {
    const { contentType, contentId, shareMethod } = req.body;
    const userId = req.user?.id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    if (!contentType || !contentId || !shareMethod) {
      return res.status(400).json({
        success: false,
        error: 'contentType, contentId, and shareMethod are required'
      });
    }

    const isExternal = EXTERNAL_METHODS.has(shareMethod);
    const { allowed, reason } = await shareService.validateSharePermissions(
      contentType, contentId, userId, isExternal
    );

    if (!allowed) {
      return res.status(403).json({ success: false, error: reason });
    }

    const share = await shareService.recordShare({
      contentType, contentId, userId, shareMethod, ip, userAgent
    });

    return res.status(201).json({ success: true, data: share });
  } catch (error) {
    console.error('Error in recordShare:', error);
    const status = error.message.startsWith('Invalid') ? 400 : 500;
    return res.status(status).json({ success: false, error: error.message });
  }
};

/**
 * Get share analytics
 * GET /api/shares/analytics
 * Req 15
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { contentType, contentId } = req.query;
    const { totalShares, sharesByMethod, analytics } = await shareService.getShareAnalytics(
      contentType, contentId
    );
    return res.status(200).json({
      success: true,
      data: { totalShares, sharesByMethod, analytics }
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get share count for a specific content item
 * GET /api/shares/:contentType/:contentId
 * Req 15
 */
exports.getShareCount = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { totalShares, sharesByMethod } = await shareService.getShareAnalytics(
      contentType, contentId
    );
    return res.status(200).json({
      success: true,
      data: { contentType, contentId, totalShares, sharesByMethod }
    });
  } catch (error) {
    console.error('Error in getShareCount:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Build a date range filter from query params.
 * Supports ?startDate=&endDate= (ISO strings) or falls back to ?days= (default 30).
 * @param {object} query - req.query
 * @returns {{ dateFilter: object, startDate: Date, endDate: Date, days: number|null }}
 */
function buildDateRangeFilter(query) {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  // Set end of day for endDate
  endDate.setHours(23, 59, 59, 999);

  let startDate;
  let days = null;

  if (query.startDate) {
    startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
  } else {
    days = parseInt(query.days) || 30;
    startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  }

  // Support both 'createdAt' (new docs with timestamps:true) and legacy 'timestamp' field
  const dateRange = { $gte: startDate, $lte: endDate };
  return {
    dateFilter: { $or: [{ createdAt: dateRange }, { timestamp: dateRange }] },
    startDate,
    endDate,
    days
  };
}

/**
 * GET /api/shares/analytics/summary
 * Summary of total shares by content type
 * Supports ?startDate=&endDate= or ?days= (default 30)
 * Req 15
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const Share = require('../models/Share');
    const { dateFilter, startDate, endDate, days } = buildDateRangeFilter(req.query);

    const [byContentType, total] = await Promise.all([
      Share.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$contentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Share.countDocuments(dateFilter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        byContentType,
        period: days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getAnalyticsSummary:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/shares/analytics/by-platform
 * Shares grouped by share method/platform
 * Supports ?startDate=&endDate= or ?days= (default 30)
 * Req 15
 */
exports.getAnalyticsByPlatform = async (req, res) => {
  try {
    const Share = require('../models/Share');
    const { dateFilter, startDate, endDate, days } = buildDateRangeFilter(req.query);

    const byPlatform = await Share.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$shareMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byPlatform,
        period: days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getAnalyticsByPlatform:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/shares/analytics/top-content
 * Top 10 most shared content items
 * Supports ?startDate=&endDate= or ?days= (default 30)
 * Req 15
 */
exports.getTopContent = async (req, res) => {
  try {
    const Share = require('../models/Share');
    const { dateFilter, startDate, endDate, days } = buildDateRangeFilter(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const topContent = await Share.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { contentType: '$contentType', contentId: '$contentId' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          contentType: '$_id.contentType',
          contentId: '$_id.contentId',
          shareCount: '$count'
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        topContent,
        period: days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getTopContent:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


/**
 * GET /api/shares/analytics/export
 * Export analytics data as CSV or JSON file download
 * Query params: format (csv|json), type (summary|by-platform|top-content|all), startDate, endDate, days
 * Admin only
 * Req 15
 */
exports.exportAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
    }

    const Share = require('../models/Share');
    const format = (req.query.format || 'json').toLowerCase();
    const type = req.query.type || 'all';
    const { dateFilter, startDate, endDate, days } = buildDateRangeFilter(req.query);

    // Gather data based on type
    const fetchSummary = type === 'summary' || type === 'all';
    const fetchByPlatform = type === 'by-platform' || type === 'all';
    const fetchTopContent = type === 'top-content' || type === 'all';

    const [summaryResult, byPlatformResult, topContentResult] = await Promise.all([
      fetchSummary
        ? Promise.all([
            Share.aggregate([
              { $match: dateFilter },
              { $group: { _id: '$contentType', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ]),
            Share.countDocuments(dateFilter)
          ])
        : Promise.resolve(null),
      fetchByPlatform
        ? Share.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$shareMethod', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ])
        : Promise.resolve(null),
      fetchTopContent
        ? Share.aggregate([
            { $match: dateFilter },
            { $group: { _id: { contentType: '$contentType', contentId: '$contentId' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, contentType: '$_id.contentType', contentId: '$_id.contentId', shareCount: '$count' } }
          ])
        : Promise.resolve(null)
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `share-analytics-${dateStr}.${format}`;

    if (format === 'json') {
      const payload = {
        exportedAt: new Date().toISOString(),
        period: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), days }
      };

      if (summaryResult) {
        const [byContentType, total] = summaryResult;
        payload.summary = { total, byContentType };
      }
      if (byPlatformResult) {
        payload.byPlatform = byPlatformResult;
      }
      if (topContentResult) {
        payload.topContent = topContentResult;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(JSON.stringify(payload, null, 2));
    }

    // CSV format
    const lines = [];

    if (summaryResult) {
      const [byContentType, total] = summaryResult;
      lines.push('Type,Content Type,Count');
      lines.push(`summary,all,${total}`);
      for (const row of byContentType) {
        lines.push(`summary,${row._id},${row.count}`);
      }
    }

    if (byPlatformResult) {
      if (lines.length > 0) lines.push('');
      lines.push('Platform,Share Count');
      for (const row of byPlatformResult) {
        lines.push(`${row._id},${row.count}`);
      }
    }

    if (topContentResult) {
      if (lines.length > 0) lines.push('');
      lines.push('Content Type,Content ID,Share Count');
      for (const row of topContentResult) {
        lines.push(`${row.contentType},${row.contentId},${row.shareCount}`);
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(lines.join('\n'));
  } catch (error) {
    console.error('Error in exportAnalytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

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
