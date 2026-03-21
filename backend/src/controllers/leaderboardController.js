/**
 * LeaderboardController - معالج طلبات لوحة المتصدرين
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */

const leaderboardService = require('../services/leaderboardService');

/**
 * GET /leaderboard
 * جلب قائمة المتصدرين مع فلترة حسب الفترة
 */
async function getLeaderboard(req, res) {
  try {
    const period = ['monthly', 'yearly', 'alltime'].includes(req.query.period)
      ? req.query.period
      : 'alltime';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const data = await leaderboardService.getRankings(period, { limit, page });
    res.json({ success: true, period, ...data });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في جلب لوحة المتصدرين' });
  }
}

/**
 * GET /leaderboard/my-rank
 * جلب ترتيب المستخدم الحالي
 */
async function getMyRank(req, res) {
  try {
    const period = ['monthly', 'yearly', 'alltime'].includes(req.query.period)
      ? req.query.period
      : 'alltime';

    const data = await leaderboardService.getMyRank(req.user._id, period);
    res.json({ success: true, period, ...data });
  } catch (err) {
    console.error('getMyRank error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في جلب ترتيبك' });
  }
}

/**
 * PUT /leaderboard/visibility
 * تحديث إعداد الخصوصية (إخفاء/إظهار الاسم)
 */
async function updateVisibility(req, res) {
  try {
    const { isVisible } = req.body;
    if (typeof isVisible !== 'boolean') {
      return res.status(400).json({ success: false, error: 'يجب تحديد قيمة isVisible (true/false)' });
    }

    const result = await leaderboardService.updateVisibility(req.user._id, isVisible);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('updateVisibility error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في تحديث إعداد الخصوصية' });
  }
}

/**
 * POST /leaderboard/refresh (admin)
 * تحديث اللوحة يدوياً
 */
async function refreshLeaderboard(req, res) {
  try {
    const period = req.query.period;
    let result;
    if (period && ['monthly', 'yearly', 'alltime'].includes(period)) {
      result = await leaderboardService.updateLeaderboard(period);
    } else {
      result = await leaderboardService.updateAllPeriods();
    }
    res.json({ success: true, result });
  } catch (err) {
    console.error('refreshLeaderboard error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في تحديث اللوحة' });
  }
}

module.exports = { getLeaderboard, getMyRank, updateVisibility, refreshLeaderboard };
