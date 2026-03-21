/**
 * AntiFraudService - منع التلاعب والاحتيال في نظام الإحالة
 * Requirements: 6.1, 6.2, 6.4
 */

const Referral = require('../models/Referral');
const FraudCheck = require('../models/FraudCheck');
const User = require('../models/User');

// حدود الكشف
const FRAUD_LIMITS = {
  sameIpConcurrentMax: 3,
  sameIpMonthlyMax: 10,
  rapidSignupsPerHour: 5,
  inactivityDays: 7
};

// أوزان درجة الشك
const SCORE_WEIGHTS = {
  sameIP: 30,
  sameDevice: 40,
  rapidSignups: 20,
  inactiveReferral: 10
};

/**
 * checkSameIP - فحص نفس IP
 * يمنع: الإحالة الذاتية، اكثر من 3 متزامنة، تجاوز الحد الشهري
 * Requirements: 6.1, 6.4
 */
async function checkSameIP(referrerId, ipAddress) {
  if (!ipAddress) return { flagged: false, flags: [] };

  const flags = [];

  // فحص الإحالة الذاتية: هل المُحال (referrerId) سبق أن أُحيل من نفس IP؟
  const referredFromSameIp = await Referral.findOne({
    referrerId: { $ne: referrerId },
    ipAddress,
    referredUserId: referrerId
  });
  if (referredFromSameIp) {
    flags.push('same_ip_self_referral');
  }

  // فحص الإحالات المتزامنة (pending) من نفس IP
  const concurrentCount = await Referral.countDocuments({
    ipAddress,
    status: 'pending'
  });
  if (concurrentCount >= FRAUD_LIMITS.sameIpConcurrentMax) {
    flags.push('same_ip_concurrent_limit');
  }

  // فحص الحد الشهري
  const monthlyExceeded = await checkMonthlyIPLimit(ipAddress);
  if (monthlyExceeded) {
    flags.push('same_ip_monthly_limit');
  }

  return { flagged: flags.length > 0, flags };
}

/**
 * checkSameDevice - فحص نفس الجهاز
 * يرفض الإحالة إذا كان المحيل والمُحال يستخدمان نفس الجهاز
 * Requirements: 6.2
 */
async function checkSameDevice(referrerId, deviceFingerprint) {
  if (!deviceFingerprint) return { flagged: false, flags: [] };

  const flags = [];

  // هل المُحال (referrerId) سبق أن أُحيل من نفس الجهاز؟
  const sameDeviceAsReferred = await Referral.findOne({
    referrerId: { $ne: referrerId },
    deviceFingerprint,
    referredUserId: referrerId
  });
  if (sameDeviceAsReferred) {
    flags.push('same_device_self_referral');
  }

  // هل المحيل أحال شخصاً آخر من نفس الجهاز؟
  const sameDeviceReferral = await Referral.findOne({
    referrerId,
    deviceFingerprint,
    referredUserId: { $ne: null }
  });
  if (sameDeviceReferral) {
    flags.push('same_device');
  }

  return { flagged: flags.length > 0, flags };
}

/**
 * checkRapidSignups - فحص التسجيل السريع
 * كشف أكثر من 5 إحالات في ساعة واحدة من نفس المصدر
 * Requirements: 6.4
 */
async function checkRapidSignups(ipAddress) {
  if (!ipAddress) return { flagged: false, flags: [], count: 0 };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Referral.countDocuments({
    ipAddress,
    createdAt: { $gte: oneHourAgo }
  });

  if (recentCount >= FRAUD_LIMITS.rapidSignupsPerHour) {
    return { flagged: true, flags: ['rapid_signups'], count: recentCount };
  }

  return { flagged: false, flags: [], count: recentCount };
}

/**
 * checkMonthlyIPLimit - فحص الحد الشهري لنفس IP
 * حد أقصى 10 إحالات شهرياً من نفس IP
 * Requirements: 6.4
 */
async function checkMonthlyIPLimit(ipAddress) {
  if (!ipAddress) return false;

  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const count = await Referral.countDocuments({
    ipAddress,
    createdAt: { $gte: oneMonthAgo }
  });

  return count >= FRAUD_LIMITS.sameIpMonthlyMax;
}

/**
 * checkPatternMatching - تحليل الأنماط المشبوهة
 * Requirements: 6.4
 */
async function checkPatternMatching(referralData) {
  const { referrerId, ipAddress, deviceFingerprint } = referralData;
  const flags = [];

  // نمط: نفس IP مع نفس الجهاز في 24 ساعة
  if (ipAddress && deviceFingerprint) {
    const sameIpAndDevice = await Referral.countDocuments({
      referrerId,
      ipAddress,
      deviceFingerprint,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (sameIpAndDevice >= 2) {
      flags.push('suspicious_pattern_ip_device');
    }
  }

  // نمط: 3+ إحالات في أقل من دقيقة
  if (referrerId) {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const veryRecentCount = await Referral.countDocuments({
      referrerId,
      createdAt: { $gte: oneMinuteAgo }
    });
    if (veryRecentCount >= 3) {
      flags.push('suspicious_pattern_burst');
    }
  }

  return { flagged: flags.length > 0, flags };
}

/**
 * runFullFraudCheck - فحص شامل يجمع كل قواعد الكشف
 * Requirements: 6.1, 6.2, 6.4
 */
async function runFullFraudCheck(referralData) {
  const { referrerId, referredUserId, ipAddress, deviceFingerprint, referralId } = referralData;

  let score = 0;
  const allFlags = [];

  // 1. منع الإحالة الذاتية (نفس المستخدم)
  if (referrerId && referredUserId && referrerId.toString() === referredUserId.toString()) {
    return { allowed: false, status: 'blocked', score: 100, flags: ['self_referral'], reason: 'لا يمكن إحالة نفسك' };
  }

  // 2. فحص نفس IP
  const ipCheck = await checkSameIP(referrerId, ipAddress);
  if (ipCheck.flagged) {
    allFlags.push(...ipCheck.flags);
    score += SCORE_WEIGHTS.sameIP;
  }

  // 3. فحص نفس الجهاز
  const deviceCheck = await checkSameDevice(referrerId, deviceFingerprint);
  if (deviceCheck.flagged) {
    allFlags.push(...deviceCheck.flags);
    score += SCORE_WEIGHTS.sameDevice;
  }

  // 4. فحص التسجيل السريع
  const rapidCheck = await checkRapidSignups(ipAddress);
  if (rapidCheck.flagged) {
    allFlags.push(...rapidCheck.flags);
    score += SCORE_WEIGHTS.rapidSignups;
  }

  // 5. تحليل الأنماط
  const patternCheck = await checkPatternMatching(referralData);
  if (patternCheck.flagged) {
    allFlags.push(...patternCheck.flags);
    score = Math.min(100, score + 10);
  }

  // تحديد الحالة
  let status;
  if (score >= 70) status = 'blocked';
  else if (score >= 40) status = 'suspicious';
  else status = 'clean';

  const result = {
    allowed: status !== 'blocked',
    status,
    score,
    flags: allFlags,
    waitingPeriodDays: status === 'suspicious' ? 7 : 0
  };

  await saveFraudCheck({ userId: referrerId, referralId: referralId || null, score, flags: allFlags, status });

  return result;
}

/**
 * calculateSuspicionScore - حساب درجة الشك (للتوافق مع الكود القديم)
 */
async function calculateSuspicionScore(referralData) {
  const { referrerId, ipAddress, deviceFingerprint } = referralData;
  let score = 0;
  const flags = [];

  if (ipAddress) {
    const ipCheck = await checkSameIP(referrerId, ipAddress);
    if (ipCheck.flagged) { score += SCORE_WEIGHTS.sameIP; flags.push(...ipCheck.flags); }
  }

  if (deviceFingerprint) {
    const deviceCheck = await checkSameDevice(referrerId, deviceFingerprint);
    if (deviceCheck.flagged) { score += SCORE_WEIGHTS.sameDevice; flags.push(...deviceCheck.flags); }
  }

  const rapidCheck = await checkRapidSignups(ipAddress);
  if (rapidCheck.flagged) { score += SCORE_WEIGHTS.rapidSignups; flags.push(...rapidCheck.flags); }

  let status;
  if (score >= 70) status = 'blocked';
  else if (score >= 40) status = 'suspicious';
  else status = 'clean';

  return { score, flags, status };
}

/** checkFraud - يستخدم runFullFraudCheck داخلياً */
async function checkFraud(referralData) {
  return runFullFraudCheck(referralData);
}

/** saveFraudCheck - حفظ نتيجة الفحص */
async function saveFraudCheck({ userId, referralId, score, flags, status }) {
  try {
    await FraudCheck.create({ userId, referralId: referralId || null, suspicionScore: score, flags, status });
  } catch (err) {
    console.error('خطأ في حفظ FraudCheck:', err.message);
  }
}

/** flagSuspicious - وضع علامة مشبوهة */
async function flagSuspicious(userId, referralId, note) {
  return FraudCheck.findOneAndUpdate(
    { userId, referralId: referralId || null },
    { status: 'suspicious', reviewNote: note || 'تم وضع علامة يدوياً' },
    { new: true, upsert: true }
  );
}

/** blockUser - حظر مستخدم */
async function blockUser(userId, adminId, note) {
  await FraudCheck.updateMany(
    { userId },
    { status: 'blocked', reviewedBy: adminId, reviewedAt: new Date(), reviewNote: note || 'تم الحظر بسبب الاحتيال' }
  );
  await User.findByIdAndUpdate(userId, {
    isBlocked: true, blockedAt: new Date(), blockedReason: note || 'انتهاك سياسة الإحالة'
  });
  await Referral.updateMany({ referrerId: userId, status: 'pending' }, { status: 'cancelled' });
  return { success: true, message: 'تم حظر المستخدم وإلغاء إحالاته المعلقة' };
}

/**
 * revokeAllUserRewards - إلغاء جميع مكافآت مستخدم محتال
 * يخصم النقاط المكتسبة من إحالات المستخدم ويلغي جميع إحالاته
 * Requirements: 6.5
 */
async function revokeAllUserRewards(userId, adminId, note) {
  const PointsTransaction = require('../models/PointsTransaction');

  // جلب جميع إحالات المستخدم التي لها مكافآت
  const referrals = await Referral.find({
    referrerId: userId,
    'rewards.0': { $exists: true }
  });

  let totalRevoked = 0;
  const revokedReferralIds = [];

  for (const referral of referrals) {
    const points = (referral.rewards || []).reduce((sum, r) => sum + (r.points || 0), 0);
    if (points <= 0) continue;

    totalRevoked += points;
    revokedReferralIds.push(referral._id);

    // إلغاء المكافآت من الإحالة
    await Referral.findByIdAndUpdate(referral._id, { rewards: [], status: 'cancelled' });
  }

  // خصم النقاط الإجمالية من رصيد المستخدم
  if (totalRevoked > 0) {
    const user = await User.findById(userId).select('pointsBalance');
    const newBalance = Math.max(0, (user?.pointsBalance || 0) - totalRevoked);

    await User.findByIdAndUpdate(userId, { pointsBalance: newBalance });

    await PointsTransaction.create({
      userId,
      type: 'expire',
      amount: -totalRevoked,
      balance: newBalance,
      source: 'admin',
      description: note || 'إلغاء جميع مكافآت الإحالة بسبب الاحتيال'
    });
  }

  // تحديث سجلات FraudCheck
  if (revokedReferralIds.length > 0) {
    await FraudCheck.updateMany(
      { referralId: { $in: revokedReferralIds } },
      {
        status: 'blocked',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNote: note || 'تم إلغاء المكافآت بسبب الاحتيال'
      }
    );
  }

  return {
    success: true,
    totalRevoked,
    revokedReferrals: revokedReferralIds.length,
    message: `تم إلغاء ${totalRevoked} نقطة من ${revokedReferralIds.length} إحالة`
  };
}

/** getSuspiciousReferrals - جلب الإحالات المشبوهة */
async function getSuspiciousReferrals({ page = 1, limit = 20, status = 'suspicious' } = {}) {
  const skip = (page - 1) * limit;
  const query = status === 'all' ? {} : { status };
  const [checks, total] = await Promise.all([
    FraudCheck.find(query)
      .populate('userId', 'name email profilePicture')
      .populate('referralId', 'referralCode source createdAt')
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    FraudCheck.countDocuments(query)
  ]);
  return { checks, total, page, pages: Math.ceil(total / limit) };
}

/** isIpLimitExceeded - للتوافق مع الكود القديم */
async function isIpLimitExceeded(ipAddress) {
  return checkMonthlyIPLimit(ipAddress);
}

module.exports = {
  checkSameIP,
  checkSameDevice,
  checkRapidSignups,
  checkMonthlyIPLimit,
  runFullFraudCheck,
  checkPatternMatching,
  calculateSuspicionScore,
  checkFraud,
  saveFraudCheck,
  flagSuspicious,
  blockUser,
  revokeAllUserRewards,
  getSuspiciousReferrals,
  isIpLimitExceeded,
  FRAUD_LIMITS,
  SCORE_WEIGHTS
};
