/**
 * ReferralAnalyticsService - لوحة الإحصائيات الشخصية
 * Requirements: 7.1, 7.2, 7.3
 */

const Referral = require('../models/Referral');
const PointsTransaction = require('../models/PointsTransaction');
const { User } = require('../models/User');

/**
 * إحصائيات الإحالات الشخصية للمستخدم
 * Requirements: 7.1
 */
async function getPersonalStats(userId) {
  const [referralStats, pointsStats, conversionData, channelStats] = await Promise.all([
    _getReferralCounts(userId),
    _getPointsSummary(userId),
    _getConversionRate(userId),
    _getChannelBreakdown(userId)
  ]);

  return {
    referrals: referralStats,
    points: pointsStats,
    conversion: conversionData,
    channels: channelStats
  };
}

/**
 * عدد الإحالات حسب الحالة
 */
async function _getReferralCounts(userId) {
  const results = await Referral.aggregate([
    { $match: { referrerId: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = { total: 0, completed: 0, pending: 0, cancelled: 0 };
  for (const r of results) {
    counts[r._id] = r.count;
    counts.total += r.count;
  }
  return counts;
}

/**
 * ملخص النقاط: مكتسبة، مستبدلة، رصيد حالي
 */
async function _getPointsSummary(userId) {
  const [user, earned, redeemed] = await Promise.all([
    User.findById(userId).select('pointsBalance'),
    PointsTransaction.aggregate([
      { $match: { userId, type: 'earn' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    PointsTransaction.aggregate([
      { $match: { userId, type: 'redeem' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    balance: user?.pointsBalance || 0,
    totalEarned: earned[0]?.total || 0,
    totalRedeemed: redeemed[0]?.total || 0
  };
}

/**
 * معدل التحويل ومعدل النجاح
 * Requirements: 7.3
 * - conversionRate: نسبة المُحالين الذين أكملوا التسجيل (referredUserId موجود)
 * - successRate: نسبة الإحالات المكتملة بالكامل (status = 'completed')
 */
async function _getConversionRate(userId) {
  const [total, registered, completed] = await Promise.all([
    Referral.countDocuments({ referrerId: userId }),
    Referral.countDocuments({ referrerId: userId, referredUserId: { $ne: null } }),
    Referral.countDocuments({ referrerId: userId, status: 'completed' })
  ]);

  const conversionRate = total > 0 ? Math.round((registered / total) * 100) : 0;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    registered,
    completed,
    conversionRate,  // نسبة المُحالين الذين سجّلوا
    successRate      // نسبة الإحالات المكتملة بالكامل
  };
}

/**
 * توزيع الإحالات حسب قناة المشاركة
 * Requirements: 7.2
 */
async function _getChannelBreakdown(userId) {
  const results = await Referral.aggregate([
    { $match: { referrerId: userId } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return results.map(r => ({ channel: r._id || 'direct', count: r.count }));
}

/**
 * اتجاه الإحالات الشهري (آخر 6 أشهر)
 * Requirements: 7.1
 */
async function getMonthlyTrend(userId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const results = await Referral.aggregate([
    { $match: { referrerId: userId, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return results.map(r => ({
    year: r._id.year,
    month: r._id.month,
    total: r.total,
    completed: r.completed,
    conversionRate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0
  }));
}

/**
 * توزيع النقاط المكتسبة حسب نوع المكافأة
 * Requirements: 7.1
 */
async function getEarningsBySource(userId) {
  const results = await PointsTransaction.aggregate([
    { $match: { userId, type: 'earn' } },
    { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  return results.map(r => ({ source: r._id, totalPoints: r.total, count: r.count }));
}

/**
 * ROI تقديري: نقاط مكتسبة مقابل نقاط مستبدلة
 * Requirements: 7.3
 */
async function getROI(userId) {
  const [earned, redeemed] = await Promise.all([
    PointsTransaction.aggregate([
      { $match: { userId, type: 'earn' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    PointsTransaction.aggregate([
      { $match: { userId, type: 'redeem' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const totalEarned = earned[0]?.total || 0;
  const totalRedeemed = redeemed[0]?.total || 0;
  const redemptionRate = totalEarned > 0 ? Math.round((totalRedeemed / totalEarned) * 100) : 0;

  return { totalEarned, totalRedeemed, redemptionRate };
}

/**
 * معدل التحويل والنجاح على مستوى البرنامج كله (للأدمن)
 * Requirements: 7.3, 7.4
 */
async function getAdminConversionStats() {
  const [total, registered, completed, pending, cancelled] = await Promise.all([
    Referral.countDocuments({}),
    Referral.countDocuments({ referredUserId: { $ne: null } }),
    Referral.countDocuments({ status: 'completed' }),
    Referral.countDocuments({ status: 'pending' }),
    Referral.countDocuments({ status: 'cancelled' })
  ]);

  const conversionRate = total > 0 ? Math.round((registered / total) * 100) : 0;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // معدلات الشهر الحالي
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthTotal, monthRegistered, monthCompleted] = await Promise.all([
    Referral.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Referral.countDocuments({ referredUserId: { $ne: null }, createdAt: { $gte: startOfMonth } }),
    Referral.countDocuments({ status: 'completed', createdAt: { $gte: startOfMonth } })
  ]);

  const monthConversionRate = monthTotal > 0 ? Math.round((monthRegistered / monthTotal) * 100) : 0;
  const monthSuccessRate = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;

  return {
    overall: {
      total,
      registered,
      completed,
      pending,
      cancelled,
      conversionRate,  // نسبة المُحالين الذين سجّلوا
      successRate      // نسبة الإحالات المكتملة بالكامل
    },
    currentMonth: {
      total: monthTotal,
      registered: monthRegistered,
      completed: monthCompleted,
      conversionRate: monthConversionRate,
      successRate: monthSuccessRate
    }
  };
}

module.exports = {
  getPersonalStats,
  getMonthlyTrend,
  getEarningsBySource,
  getROI,
  getAdminConversionStats
};
