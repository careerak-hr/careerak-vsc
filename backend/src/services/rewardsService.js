/**
 * RewardsService - نظام النقاط والمكافآت
 * يمنح النقاط تلقائياً عند تحقيق شروط الإحالة
 */

const mongoose = require('mongoose');
const { User } = require('../models/User');
const Referral = require('../models/Referral');
const PointsTransaction = require('../models/PointsTransaction');
const notificationService = require('./notificationService');
const antiFraudService = require('./antiFraudService');
const leaderboardService = require('./leaderboardService');

// هيكل المكافآت حسب المتطلبات
const REWARD_CONFIG = {
  signup: {
    referrer: 50,   // 50 نقطة للمحيل عند تسجيل المُحال
    referred: 25    // 25 نقطة للمُحال كمكافأة ترحيبية
  },
  first_course: {
    referrer: 100   // 100 نقطة للمحيل عند إكمال المُحال أول دورة
  },
  job: {
    referrer: 200   // 200 نقطة للمحيل عند حصول المُحال على وظيفة
  },
  five_courses: {
    referrer: 150   // 150 نقطة للمحيل عند إكمال المُحال 5 دورات
  },
  paid_subscription: {
    referrer: 300   // 300 نقطة للمحيل عند اشتراك المُحال المدفوع
  }
};

const SOURCE_LABELS = {
  referral_signup: 'مكافأة الإحالة - تسجيل جديد',
  referral_first_course: 'مكافأة الإحالة - إكمال أول دورة',
  referral_job: 'مكافأة الإحالة - الحصول على وظيفة',
  referral_five_courses: 'مكافأة الإحالة - إكمال 5 دورات',
  referral_paid_subscription: 'مكافأة الإحالة - اشتراك مدفوع',
  welcome_bonus: 'مكافأة الترحيب'
};

/**
 * منح نقاط لمستخدم مع تسجيل المعاملة
 */
async function awardPoints(userId, amount, source, description, referralId = null) {
  // تحديث الرصيد بشكل atomic
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { pointsBalance: amount } },
    { new: true, select: 'pointsBalance' }
  );

  if (!user) throw new Error(`المستخدم ${userId} غير موجود`);

  await PointsTransaction.create({
    userId,
    type: 'earn',
    amount,
    balance: user.pointsBalance,
    source,
    referralId,
    description
  });

  return { newBalance: user.pointsBalance, awarded: amount };
}

/**
 * منح مكافأة التسجيل (signup)
 * يُستدعى عند تسجيل مستخدم جديد باستخدام كود إحالة
 */
async function awardSignupReward(referral) {
  const results = [];

  // التحقق من عدم منح هذه المكافأة مسبقاً
  const alreadyAwarded = referral.rewards?.some(r => r.type === 'signup');
  if (alreadyAwarded) return results;

  // فحص الاحتيال قبل منح المكافأة
  const fraudCheck = await antiFraudService.checkFraud({
    referrerId: referral.referrerId,
    referredUserId: referral.referredUserId,
    ipAddress: referral.ipAddress,
    deviceFingerprint: referral.deviceFingerprint
  });

  if (!fraudCheck.allowed) {
    // حظر المكافأة - إحالة احتيالية
    await Referral.findByIdAndUpdate(referral._id, { status: 'cancelled' });
    return { blocked: true, reason: fraudCheck.flags, score: fraudCheck.score };
  }

  if (fraudCheck.status === 'suspicious') {
    // تأجيل المكافأة 7 أيام - إحالة مشبوهة
    await Referral.findByIdAndUpdate(referral._id, {
      $set: { fraudStatus: 'suspicious', fraudScore: fraudCheck.score, fraudFlags: fraudCheck.flags }
    });
    return { suspicious: true, waitingPeriodDays: fraudCheck.waitingPeriodDays, score: fraudCheck.score };
  }

  // نقاط للمحيل
  const referrerResult = await awardPoints(
    referral.referrerId,
    REWARD_CONFIG.signup.referrer,
    'referral_signup',
    SOURCE_LABELS.referral_signup,
    referral._id
  );
  results.push({ userId: referral.referrerId, ...referrerResult });

  // نقاط للمُحال (مكافأة ترحيبية)
  if (referral.referredUserId) {
    const referredResult = await awardPoints(
      referral.referredUserId,
      REWARD_CONFIG.signup.referred,
      'welcome_bonus',
      SOURCE_LABELS.welcome_bonus,
      referral._id
    );
    results.push({ userId: referral.referredUserId, ...referredResult });
  }

  // تسجيل المكافأة في سجل الإحالة
  await Referral.findByIdAndUpdate(referral._id, {
    $push: {
      rewards: {
        type: 'signup',
        points: REWARD_CONFIG.signup.referrer,
        awardedAt: new Date()
      }
    },
    status: 'completed',
    completedAt: new Date()
  });

  // إرسال إشعارات فورية للمحيل والمُحال
  notificationService.sendReferralRewardNotification(
    referral.referrerId,
    referral.referredUserId,
    'signup',
    REWARD_CONFIG.signup.referrer,
    referral._id
  ).catch(err => console.error('Referral notification error (non-blocking):', err));

  // تحديث لوحة المتصدرين بشكل غير متزامن
  leaderboardService.updateAllPeriods()
    .catch(err => console.error('Leaderboard update error (non-blocking):', err));

  return results;
}

/**
 * منح مكافأة إكمال أول دورة
 * يُستدعى عند إكمال المُحال أول دورة له
 */
async function awardFirstCourseReward(referredUserId) {
  const referral = await Referral.findOne({ referredUserId, status: 'completed' });
  if (!referral) return null;

  const alreadyAwarded = referral.rewards?.some(r => r.type === 'first_course');
  if (alreadyAwarded) return null;

  const result = await awardPoints(
    referral.referrerId,
    REWARD_CONFIG.first_course.referrer,
    'referral_first_course',
    SOURCE_LABELS.referral_first_course,
    referral._id
  );

  await Referral.findByIdAndUpdate(referral._id, {
    $push: {
      rewards: {
        type: 'first_course',
        points: REWARD_CONFIG.first_course.referrer,
        awardedAt: new Date()
      }
    }
  });

  // إشعار المحيل
  notificationService.sendReferralRewardNotification(
    referral.referrerId,
    null,
    'first_course',
    REWARD_CONFIG.first_course.referrer,
    referral._id
  ).catch(err => console.error('Referral notification error (non-blocking):', err));

  // تحديث لوحة المتصدرين بشكل غير متزامن
  leaderboardService.updateAllPeriods()
    .catch(err => console.error('Leaderboard update error (non-blocking):', err));

  return { referrerId: referral.referrerId, ...result };
}

/**
 * منح مكافأة الحصول على وظيفة
 * يُستدعى عند قبول طلب توظيف المُحال
 */
async function awardJobReward(referredUserId) {
  const referral = await Referral.findOne({ referredUserId, status: 'completed' });
  if (!referral) return null;

  const alreadyAwarded = referral.rewards?.some(r => r.type === 'job');
  if (alreadyAwarded) return null;

  const result = await awardPoints(
    referral.referrerId,
    REWARD_CONFIG.job.referrer,
    'referral_job',
    SOURCE_LABELS.referral_job,
    referral._id
  );

  await Referral.findByIdAndUpdate(referral._id, {
    $push: {
      rewards: {
        type: 'job',
        points: REWARD_CONFIG.job.referrer,
        awardedAt: new Date()
      }
    }
  });

  // إشعار المحيل
  notificationService.sendReferralRewardNotification(
    referral.referrerId,
    null,
    'job',
    REWARD_CONFIG.job.referrer,
    referral._id
  ).catch(err => console.error('Referral notification error (non-blocking):', err));

  // تحديث لوحة المتصدرين بشكل غير متزامن
  leaderboardService.updateAllPeriods()
    .catch(err => console.error('Leaderboard update error (non-blocking):', err));

  return { referrerId: referral.referrerId, ...result };
}

/**
 * منح مكافأة إكمال 5 دورات
 * يُستدعى عند إكمال المُحال دورته الخامسة
 */
async function awardFiveCoursesReward(referredUserId) {
  const referral = await Referral.findOne({ referredUserId, status: 'completed' });
  if (!referral) return null;

  const alreadyAwarded = referral.rewards?.some(r => r.type === 'five_courses');
  if (alreadyAwarded) return null;

  const result = await awardPoints(
    referral.referrerId,
    REWARD_CONFIG.five_courses.referrer,
    'referral_five_courses',
    SOURCE_LABELS.referral_five_courses,
    referral._id
  );

  await Referral.findByIdAndUpdate(referral._id, {
    $push: {
      rewards: {
        type: 'five_courses',
        points: REWARD_CONFIG.five_courses.referrer,
        awardedAt: new Date()
      }
    }
  });

  // تحديث لوحة المتصدرين بشكل غير متزامن
  leaderboardService.updateAllPeriods()
    .catch(err => console.error('Leaderboard update error (non-blocking):', err));

  return { referrerId: referral.referrerId, ...result };
}

/**
 * جلب رصيد النقاط للمستخدم
 */
async function getBalance(userId) {
  const user = await User.findById(userId).select('pointsBalance');
  if (!user) throw new Error('المستخدم غير موجود');
  return user.pointsBalance || 0;
}

/**
 * جلب سجل معاملات النقاط مع فلترة اختيارية
 */
async function getTransactionHistory(userId, { page = 1, limit = 20, type, source } = {}) {
  const skip = (page - 1) * limit;
  const filter = { userId };
  if (type) filter.type = type;
  if (source) filter.source = source;

  const [transactions, total] = await Promise.all([
    PointsTransaction.find(filter)
      .populate('referralId', 'referralCode status completedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PointsTransaction.countDocuments(filter)
  ]);
  return { transactions, total, page, pages: Math.ceil(total / limit) };
}

/**
 * جلب سجل المكافآت المكتسبة فقط (earn transactions)
 */
async function getRewardsHistory(userId, { page = 1, limit = 20, source } = {}) {
  const skip = (page - 1) * limit;
  const filter = { userId, type: 'earn' };
  if (source) filter.source = source;

  const [rewards, total] = await Promise.all([
    PointsTransaction.find(filter)
      .populate('referralId', 'referralCode status completedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PointsTransaction.countDocuments(filter)
  ]);

  // إجمالي النقاط المكتسبة
  const totalEarned = await PointsTransaction.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return {
    rewards,
    total,
    page,
    pages: Math.ceil(total / limit),
    totalEarned: totalEarned[0]?.total || 0
  };
}

/**
 * استبدال نقاط المستخدم مقابل خيار معين
 * يخصم النقاط بشكل atomic، يسجل المعاملة، ويطبق الخصم/الميزة فوراً
 */
async function redeemPoints(userId, option) {
  // جلب الرصيد الحالي
  const user = await User.findById(userId).select('pointsBalance');
  if (!user) throw new Error('المستخدم غير موجود');

  if (user.pointsBalance < option.pointsCost) {
    const err = new Error('رصيد النقاط غير كافٍ');
    err.code = 'INSUFFICIENT_POINTS';
    err.required = option.pointsCost;
    err.available = user.pointsBalance;
    throw err;
  }

  // حساب تاريخ انتهاء الصلاحية
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (option.expiryDays || 30));

  // توليد معرف مسبق لاستخدامه كـ _id و redemptionId (self-reference)
  const txId = new mongoose.Types.ObjectId();

  // الاستبدال النشط الجديد
  const newRedemption = {
    optionId: option.optionId,
    type: option.type,
    value: option.value,
    appliedAt: new Date(),
    expiresAt,
    transactionId: txId,
    isUsed: false
  };

  // خصم النقاط وتطبيق الاستبدال فوراً في عملية واحدة
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { pointsBalance: -option.pointsCost },
      $push: { activeRedemptions: newRedemption }
    },
    { new: true, select: 'pointsBalance activeRedemptions' }
  );

  const transaction = await PointsTransaction.create({
    _id: txId,
    userId,
    type: 'redeem',
    amount: option.pointsCost,
    balance: updatedUser.pointsBalance,
    source: 'redemption',
    redemptionId: txId,
    description: typeof option.name === 'object' ? (option.name.ar || option.name.en) : option.name
  });

  // جلب الاستبدال المضاف للإرجاع
  const appliedRedemption = updatedUser.activeRedemptions.find(
    r => r.transactionId && r.transactionId.toString() === txId.toString()
  );

  return {
    newBalance: updatedUser.pointsBalance,
    pointsDeducted: option.pointsCost,
    transactionId: transaction._id,
    appliedRedemption: {
      optionId: appliedRedemption?.optionId,
      type: appliedRedemption?.type,
      value: appliedRedemption?.value,
      expiresAt: appliedRedemption?.expiresAt,
      appliedAt: appliedRedemption?.appliedAt
    }
  };
}

/**
 * جلب الاستبدالات النشطة للمستخدم (غير منتهية الصلاحية وغير مستخدمة)
 */
async function getActiveRedemptions(userId) {
  const user = await User.findById(userId).select('activeRedemptions');
  if (!user) throw new Error('المستخدم غير موجود');

  const now = new Date();
  return user.activeRedemptions.filter(r => !r.isUsed && r.expiresAt > now);
}

/**
 * تطبيق استبدال على عملية شراء (تحديد الاستبدال كمستخدم)
 */
async function applyRedemption(userId, redemptionId) {
  const user = await User.findById(userId).select('activeRedemptions');
  if (!user) throw new Error('المستخدم غير موجود');

  const now = new Date();
  const redemption = user.activeRedemptions.find(
    r => r._id.toString() === redemptionId && !r.isUsed && r.expiresAt > now
  );

  if (!redemption) {
    const err = new Error('الاستبدال غير موجود أو منتهي الصلاحية');
    err.code = 'REDEMPTION_NOT_FOUND';
    throw err;
  }

  await User.findOneAndUpdate(
    { _id: userId, 'activeRedemptions._id': redemption._id },
    { $set: { 'activeRedemptions.$.isUsed': true, 'activeRedemptions.$.usedAt': now } }
  );

  return { applied: true, redemption };
}

module.exports = {
  awardPoints,
  awardSignupReward,
  awardFirstCourseReward,
  awardJobReward,
  awardFiveCoursesReward,
  getBalance,
  getTransactionHistory,
  getRewardsHistory,
  redeemPoints,
  getActiveRedemptions,
  applyRedemption,
  REWARD_CONFIG
};
