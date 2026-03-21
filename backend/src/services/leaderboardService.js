/**
 * LeaderboardService - نظام لوحة المتصدرين
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */

const Leaderboard = require('../models/Leaderboard');
const Referral = require('../models/Referral');
const PointsTransaction = require('../models/PointsTransaction');
const { User } = require('../models/User');
const pusherService = require('./pusherService');

// جوائز المتصدرين
const LEADERBOARD_PRIZES = {
  1: { points: 1000, badge: 'gold', label: { ar: 'شارة ذهبية', en: 'Gold Badge', fr: 'Badge Or' } },
  2: { points: 500, badge: 'silver', label: { ar: 'شارة فضية', en: 'Silver Badge', fr: 'Badge Argent' } },
  3: { points: 250, badge: 'bronze', label: { ar: 'شارة برونزية', en: 'Bronze Badge', fr: 'Badge Bronze' } },
};
const TOP_10_BADGE = { badge: 'active_referrer', label: { ar: 'محيل نشط', en: 'Active Referrer', fr: 'Parrain Actif' } };

/**
 * حساب تاريخ بداية الفترة
 */
function getPeriodStartDate(period) {
  const now = new Date();
  if (period === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === 'yearly') {
    return new Date(now.getFullYear(), 0, 1);
  }
  return null; // alltime - لا يوجد تاريخ بداية
}

/**
 * تحديث لوحة المتصدرين لفترة معينة
 * يُستدعى عند كل إحالة جديدة أو تغيير في النقاط
 */
async function updateLeaderboard(period = 'alltime') {
  const startDate = getPeriodStartDate(period);

  // بناء فلتر التاريخ
  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // جمع بيانات الإحالات المكتملة لكل مستخدم
  const referralAgg = await Referral.aggregate([
    { $match: { status: 'completed', ...dateFilter } },
    { $group: { _id: '$referrerId', referralCount: { $sum: 1 } } }
  ]);

  // جمع النقاط المكتسبة لكل مستخدم
  const pointsAgg = await PointsTransaction.aggregate([
    { $match: { type: 'earn', ...dateFilter } },
    { $group: { _id: '$userId', totalPoints: { $sum: '$amount' } } }
  ]);

  // دمج البيانات
  const referralMap = {};
  referralAgg.forEach(r => { referralMap[r._id.toString()] = r.referralCount; });

  const pointsMap = {};
  pointsAgg.forEach(p => { pointsMap[p._id.toString()] = p.totalPoints; });

  // جمع جميع المستخدمين الذين لديهم إحالات أو نقاط
  const allUserIds = new Set([
    ...Object.keys(referralMap),
    ...Object.keys(pointsMap)
  ]);

  if (allUserIds.size === 0) return { updated: 0 };

  // ترتيب المستخدمين: الأكثر إحالات أولاً، ثم الأكثر نقاطاً عند التعادل
  const sorted = Array.from(allUserIds)
    .map(uid => ({
      userId: uid,
      referralCount: referralMap[uid] || 0,
      totalPoints: pointsMap[uid] || 0
    }))
    .sort((a, b) => {
      if (b.referralCount !== a.referralCount) return b.referralCount - a.referralCount;
      return b.totalPoints - a.totalPoints;
    });

  // تحديث أو إنشاء سجلات اللوحة
  const now = new Date();
  const bulkOps = sorted.map((entry, index) => ({
    updateOne: {
      filter: { userId: entry.userId, period },
      update: {
        $set: {
          referralCount: entry.referralCount,
          totalPoints: entry.totalPoints,
          rank: index + 1,
          lastUpdated: now
        },
        $setOnInsert: { isVisible: true }
      },
      upsert: true
    }
  }));

  if (bulkOps.length > 0) {
    await Leaderboard.bulkWrite(bulkOps);
  }

  return { updated: bulkOps.length };
}

/**
 * جلب قائمة المتصدرين
 * Requirements: 4.1, 4.2
 */
async function getRankings(period = 'alltime', { limit = 10, page = 1 } = {}) {
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    Leaderboard.find({ period, isVisible: true })
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName profileImage referralCode'),
    Leaderboard.countDocuments({ period, isVisible: true })
  ]);

  const result = entries.map(entry => {
    const prize = LEADERBOARD_PRIZES[entry.rank] || null;
    const isTop10 = entry.rank <= 10;
    return {
      rank: entry.rank,
      userId: entry.userId?._id,
      name: entry.userId
        ? `${entry.userId.firstName || ''} ${entry.userId.lastName || ''}`.trim()
        : 'مستخدم',
      profileImage: entry.userId?.profileImage || null,
      referralCount: entry.referralCount,
      totalPoints: entry.totalPoints,
      prize: prize || (isTop10 ? { badge: TOP_10_BADGE.badge, label: TOP_10_BADGE.label } : null),
      lastUpdated: entry.lastUpdated
    };
  });

  return { rankings: result, total, page, pages: Math.ceil(total / limit) };
}

/**
 * جلب ترتيب المستخدم الحالي
 * Requirements: 4.2
 */
async function getMyRank(userId, period = 'alltime') {
  const entry = await Leaderboard.findOne({ userId, period });

  if (!entry) {
    return {
      rank: null,
      referralCount: 0,
      totalPoints: 0,
      isVisible: true,
      prize: null,
      message: 'لم تظهر في اللوحة بعد'
    };
  }

  const prize = LEADERBOARD_PRIZES[entry.rank] || null;
  const isTop10 = entry.rank <= 10;

  return {
    rank: entry.rank,
    referralCount: entry.referralCount,
    totalPoints: entry.totalPoints,
    isVisible: entry.isVisible,
    prize: prize || (isTop10 ? { badge: TOP_10_BADGE.badge, label: TOP_10_BADGE.label } : null),
    lastUpdated: entry.lastUpdated
  };
}

/**
 * تحديث إعداد الخصوصية (إخفاء/إظهار الاسم)
 * Requirements: 4.5
 */
async function updateVisibility(userId, isVisible) {
  // تحديث جميع الفترات
  const result = await Leaderboard.updateMany(
    { userId },
    { $set: { isVisible: !!isVisible } }
  );
  return { updated: result.modifiedCount, isVisible: !!isVisible };
}

/**
 * تحديث جميع الفترات دفعة واحدة
 */
async function updateAllPeriods() {
  const results = await Promise.all([
    updateLeaderboard('monthly'),
    updateLeaderboard('yearly'),
    updateLeaderboard('alltime')
  ]);

  // بث التحديث الفوري عبر Pusher لكل فترة
  const periods = ['monthly', 'yearly', 'alltime'];
  for (const period of periods) {
    try {
      const { rankings } = await getRankings(period, { limit: 10 });
      pusherService.broadcastLeaderboardUpdate(period, rankings)
        .catch(err => console.error(`Pusher leaderboard broadcast error (${period}):`, err));
    } catch (err) {
      console.error(`Error fetching rankings for broadcast (${period}):`, err);
    }
  }

  return {
    monthly: results[0],
    yearly: results[1],
    alltime: results[2]
  };
}

module.exports = {
  updateLeaderboard,
  updateAllPeriods,
  getRankings,
  getMyRank,
  updateVisibility,
  LEADERBOARD_PRIZES,
  TOP_10_BADGE
};
