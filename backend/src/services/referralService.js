const crypto = require('crypto');
const { User } = require('../models/User');
const Referral = require('../models/Referral');
const antiFraudService = require('./antiFraudService');

/**
 * توليد كود إحالة فريد (6-8 أحرف)
 */
function generateCode(length = 7) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون أحرف مشابهة (0,O,1,I)
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * توليد كود فريد مع التحقق من عدم التكرار
 */
async function generateUniqueCode() {
  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    code = generateCode();
    const existing = await User.findOne({ referralCode: code });
    exists = !!existing;
    attempts++;
  }

  if (exists) {
    // زيادة الطول إذا استنفدنا المحاولات
    code = generateCode(8);
  }

  return code;
}

/**
 * الحصول على كود الإحالة للمستخدم (أو إنشاؤه إذا لم يكن موجوداً)
 */
async function getOrCreateReferralCode(userId) {
  const user = await User.findById(userId).select('referralCode');
  if (!user) throw new Error('المستخدم غير موجود');

  if (user.referralCode) {
    return user.referralCode;
  }

  const code = await generateUniqueCode();
  await User.findByIdAndUpdate(userId, { referralCode: code });
  return code;
}

/**
 * بناء رابط الإحالة الكامل
 */
function buildReferralLink(code) {
  const baseUrl = process.env.FRONTEND_URL || 'https://careerak.com';
  return `${baseUrl}/register?ref=${code}`;
}

/**
 * تتبع إحالة جديدة عند تسجيل مستخدم باستخدام كود إحالة
 * يشمل فحص الاحتيال تلقائياً
 */
async function trackReferral({ referralCode, referredUserId, ipAddress, deviceFingerprint, source = 'direct' }) {
  // البحث عن المحيل
  const referrer = await User.findOne({ referralCode }).select('_id');
  if (!referrer) return null;

  // منع الإحالة الذاتية
  if (referrer._id.toString() === referredUserId.toString()) {
    return null;
  }

  // التحقق من عدم وجود إحالة سابقة لنفس المستخدم المُحال
  const existingReferral = await Referral.findOne({ referredUserId });
  if (existingReferral) return existingReferral;

  // فحص الاحتيال قبل إنشاء الإحالة
  const fraudResult = await antiFraudService.runFullFraudCheck({
    referrerId: referrer._id,
    referredUserId,
    ipAddress,
    deviceFingerprint
  });

  if (!fraudResult.allowed) {
    const err = new Error('تم رفض الإحالة بسبب نشاط مشبوه');
    err.fraudResult = fraudResult;
    err.code = 'FRAUD_DETECTED';
    throw err;
  }

  const referral = await Referral.create({
    referralCode,
    referrerId: referrer._id,
    referredUserId,
    status: 'pending',
    source,
    ipAddress,
    deviceFingerprint
  });

  // تحديث referralId في سجل الاحتيال
  if (fraudResult.status !== 'clean') {
    await antiFraudService.saveFraudCheck({
      userId: referrer._id,
      referralId: referral._id,
      score: fraudResult.score,
      flags: fraudResult.flags,
      status: fraudResult.status
    });
  }

  return referral;
}

/**
 * جلب إحالات المستخدم
 */
async function getUserReferrals(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [referrals, total] = await Promise.all([
    Referral.find({ referrerId: userId })
      .populate('referredUserId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Referral.countDocuments({ referrerId: userId })
  ]);

  return { referrals, total, page, pages: Math.ceil(total / limit) };
}

/**
 * إحصائيات الإحالات للمستخدم
 */
async function getReferralStats(userId) {
  const [total, completed, pending] = await Promise.all([
    Referral.countDocuments({ referrerId: userId }),
    Referral.countDocuments({ referrerId: userId, status: 'completed' }),
    Referral.countDocuments({ referrerId: userId, status: 'pending' })
  ]);

  return { total, completed, pending, cancelled: total - completed - pending };
}

module.exports = {
  getOrCreateReferralCode,
  buildReferralLink,
  trackReferral,
  getUserReferrals,
  getReferralStats,
  generateUniqueCode
};
