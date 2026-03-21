const antiFraudService = require('../services/antiFraudService');
const FraudCheck = require('../models/FraudCheck');
const Referral = require('../models/Referral');
const { User } = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');

/**
 * POST /fraud/check
 * فحص إحالة معينة للاحتيال
 */
async function checkFraud(req, res) {
  try {
    const { referrerId, referredUserId, referralId } = req.body;
    if (!referrerId) return res.status(400).json({ error: 'referrerId مطلوب' });

    const result = await antiFraudService.checkFraud({
      referrerId,
      referredUserId,
      referralId,
      ipAddress: req.ip,
      deviceFingerprint: req.headers['x-device-fingerprint']
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /fraud/suspicious
 * جلب الإحالات المشبوهة مع pagination وفلترة (للأدمن)
 * Requirements: 6.4, 6.5
 * Query: page, limit, status, minScore, maxScore
 */
async function getSuspiciousReferrals(req, res) {
  try {
    const { page = 1, limit = 20, status = 'suspicious', minScore, maxScore } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = status === 'all' ? {} : { status };
    if (minScore !== undefined) query.suspicionScore = { ...query.suspicionScore, $gte: parseInt(minScore) };
    if (maxScore !== undefined) query.suspicionScore = { ...query.suspicionScore, $lte: parseInt(maxScore) };

    const [checks, total] = await Promise.all([
      FraudCheck.find(query)
        .populate('userId', 'name email profilePicture')
        .populate('referralId', 'referralCode source createdAt status')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FraudCheck.countDocuments(query)
    ]);

    res.json({ checks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// alias للتوافق مع الكود القديم
const getSuspicious = getSuspiciousReferrals;

/**
 * GET /fraud/suspicious/:id
 * تفاصيل فحص احتيال واحد
 * Requirements: 6.4, 6.5
 */
async function getSuspiciousById(req, res) {
  try {
    const check = await FraudCheck.findById(req.params.id)
      .populate('userId', 'name email profilePicture isBlocked blockedAt blockedReason')
      .populate('referralId', 'referralCode source createdAt status rewards ipAddress')
      .populate('reviewedBy', 'name email');

    if (!check) return res.status(404).json({ error: 'السجل غير موجود' });
    res.json({ check });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/review/:referralId
 * مراجعة إحالة (قبول/رفض) من قِبل الأدمن
 * Requirements: 6.4, 6.5
 */
async function reviewReferral(req, res) {
  try {
    const { referralId } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    if (!referralId) return res.status(400).json({ error: 'referralId مطلوب' });
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action يجب أن يكون approve أو reject' });
    }

    const adminId = req.user._id || req.user.id;

    // تحديث FraudCheck
    const newStatus = action === 'approve' ? 'clean' : 'blocked';
    const fraudCheck = await FraudCheck.findOneAndUpdate(
      { referralId },
      {
        status: newStatus,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNote: note || (action === 'approve' ? 'تمت الموافقة من الأدمن' : 'تم الرفض من الأدمن')
      },
      { new: true, upsert: false }
    );

    if (!fraudCheck) {
      return res.status(404).json({ error: 'لم يتم العثور على سجل الفحص لهذه الإحالة' });
    }

    // تحديث حالة الإحالة نفسها
    const referralStatus = action === 'approve' ? 'completed' : 'cancelled';
    await Referral.findByIdAndUpdate(referralId, { status: referralStatus });

    res.json({
      message: action === 'approve' ? 'تمت الموافقة على الإحالة' : 'تم رفض الإحالة',
      fraudCheck,
      referralStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/flag
 * وضع علامة مشبوهة على مستخدم (للأدمن)
 */
async function flagUser(req, res) {
  try {
    const { userId, referralId, note } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId مطلوب' });

    const check = await antiFraudService.flagSuspicious(userId, referralId, note);
    res.json({ message: 'تم وضع علامة مشبوهة', check });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/block/:userId
 * حظر مستخدم وإلغاء مكافآته (للأدمن)
 * Requirements: 6.5
 */
async function blockUser(req, res) {
  try {
    const userId = req.params.userId || req.body.userId;
    const { note } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId مطلوب' });

    const adminId = req.user._id || req.user.id;
    const result = await antiFraudService.blockUser(userId, adminId, note);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /fraud/stats
 * إحصائيات الاحتيال الشاملة (للأدمن)
 * Requirements: 6.4
 */
async function getFraudStats(req, res) {
  try {
    const [total, suspicious, blocked, clean, recentChecks] = await Promise.all([
      FraudCheck.countDocuments(),
      FraudCheck.countDocuments({ status: 'suspicious' }),
      FraudCheck.countDocuments({ status: 'blocked' }),
      FraudCheck.countDocuments({ status: 'clean' }),
      FraudCheck.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .lean()
    ]);

    // إحصائيات الـ flags الأكثر شيوعاً
    const flagStats = await FraudCheck.aggregate([
      { $unwind: '$flags' },
      { $group: { _id: '$flags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // إحصائيات آخر 30 يوم
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentStats = await FraudCheck.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          suspicious: { $sum: { $cond: [{ $eq: ['$status', 'suspicious'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: { total, suspicious, blocked, clean },
      flagStats,
      recentActivity: recentStats,
      recentChecks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/unblock/:userId
 * رفع الحظر عن مستخدم (للأدمن)
 * Requirements: 6.5
 */
async function unblockUser(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId مطلوب' });

    const adminId = req.user._id || req.user.id;

    // تحديث حالة المستخدم
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false, $unset: { blockedAt: 1, blockedReason: 1 } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    // تحديث سجلات FraudCheck
    await FraudCheck.updateMany(
      { userId, status: 'blocked' },
      { status: 'suspicious', reviewedBy: adminId, reviewedAt: new Date(), reviewNote: 'تم رفع الحظر من الأدمن' }
    );

    res.json({ success: true, message: 'تم رفع الحظر عن المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/revoke-rewards/:referralId
 * إلغاء مكافآت إحالة معينة (للأدمن)
 * Requirements: 6.5
 */
async function revokeRewards(req, res) {
  try {
    const { referralId } = req.params;
    if (!referralId) return res.status(400).json({ error: 'referralId مطلوب' });

    const adminId = req.user._id || req.user.id;

    // جلب الإحالة
    const referral = await Referral.findById(referralId);
    if (!referral) return res.status(404).json({ error: 'الإحالة غير موجودة' });

    // حساب إجمالي النقاط الممنوحة من هذه الإحالة
    const totalPoints = (referral.rewards || []).reduce((sum, r) => sum + (r.points || 0), 0);

    // إلغاء المكافآت من الإحالة
    await Referral.findByIdAndUpdate(referralId, { rewards: [], status: 'cancelled' });

    // خصم النقاط من المحيل إذا كانت هناك نقاط
    if (totalPoints > 0 && referral.referrerId) {
      const referrer = await User.findById(referral.referrerId).select('pointsBalance');
      const newBalance = Math.max(0, (referrer?.pointsBalance || 0) - totalPoints);

      await User.findByIdAndUpdate(referral.referrerId, {
        pointsBalance: newBalance
      });

      // تسجيل معاملة الخصم
      await PointsTransaction.create({
        userId: referral.referrerId,
        type: 'expire',
        amount: -totalPoints,
        balance: newBalance,
        source: 'admin',
        referralId,
        description: `إلغاء مكافآت إحالة بسبب الاحتيال (بواسطة الأدمن)`
      });
    }

    // تحديث FraudCheck
    await FraudCheck.findOneAndUpdate(
      { referralId },
      { status: 'blocked', reviewedBy: adminId, reviewedAt: new Date(), reviewNote: 'تم إلغاء المكافآت بسبب الاحتيال' },
      { upsert: false }
    );

    res.json({
      success: true,
      message: 'تم إلغاء مكافآت الإحالة بنجاح',
      revokedPoints: totalPoints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /fraud/revoke-rewards/user/:userId
 * إلغاء جميع مكافآت مستخدم محتال (للأدمن)
 * Requirements: 6.5
 */
async function revokeAllUserRewards(req, res) {
  try {
    const { userId } = req.params;
    const { note } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId مطلوب' });

    const adminId = req.user._id || req.user.id;
    const result = await antiFraudService.revokeAllUserRewards(userId, adminId, note);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  checkFraud,
  getSuspiciousReferrals,
  getSuspicious,
  getSuspiciousById,
  reviewReferral,
  flagUser,
  blockUser,
  unblockUser,
  revokeRewards,
  revokeAllUserRewards,
  getFraudStats
};
