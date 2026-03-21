/**
 * Referral Analytics Controller
 * لوحة الإحصائيات الشخصية - Requirements: 7.1, 7.2, 7.3
 */

const analyticsService = require('../services/referralAnalyticsService');

/**
 * GET /referrals/analytics/personal
 * الإحصائيات الشخصية الكاملة للمستخدم
 */
async function getPersonalStats(req, res) {
  try {
    const stats = await analyticsService.getPersonalStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /referrals/analytics/trend
 * اتجاه الإحالات الشهري (آخر 6 أشهر)
 */
async function getMonthlyTrend(req, res) {
  try {
    const trend = await analyticsService.getMonthlyTrend(req.user._id);
    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /referrals/analytics/earnings
 * توزيع النقاط المكتسبة حسب المصدر
 */
async function getEarningsBySource(req, res) {
  try {
    const earnings = await analyticsService.getEarningsBySource(req.user._id);
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /referrals/analytics/roi
 * معدل الاستبدال والعائد
 */
async function getROI(req, res) {
  try {
    const roi = await analyticsService.getROI(req.user._id);
    res.json(roi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /admin/referrals/analytics/conversion
 * معدل التحويل والنجاح على مستوى البرنامج كله (للأدمن)
 * Requirements: 7.3, 7.4
 */
async function getAdminConversionStats(req, res) {
  try {
    const stats = await analyticsService.getAdminConversionStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPersonalStats, getMonthlyTrend, getEarningsBySource, getROI, getAdminConversionStats };
