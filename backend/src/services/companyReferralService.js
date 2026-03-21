/**
 * CompanyReferralService - نظام إحالة الشركات
 * مكافآت خاصة بالشركات أعلى من مكافآت المستخدمين العاديين
 * Requirements: 5.1, 5.2, 5.3
 */

const crypto = require('crypto');
const { User } = require('../models/User');
const CompanyReferral = require('../models/CompanyReferral');
const PointsTransaction = require('../models/PointsTransaction');

// مكافآت الشركات - أعلى من مكافآت المستخدمين العاديين (Requirement 5.2)
const COMPANY_REWARD_CONFIG = {
  company_signup: 500,       // إحالة شركة: 500 نقطة
  first_job_post: 300,       // نشر أول وظيفة: 300 نقطة إضافية
  successful_hire: 400,      // توظيف ناجح: 400 نقطة إضافية
  annual_subscription: 1000  // اشتراك سنوي: 1000 نقطة
};

const EVENT_LABELS = {
  company_signup: 'مكافأة إحالة شركة - تسجيل جديد',
  first_job_post: 'مكافأة إحالة شركة - نشر أول وظيفة',
  successful_hire: 'مكافأة إحالة شركة - توظيف ناجح',
  annual_subscription: 'مكافأة إحالة شركة - اشتراك سنوي'
};

/**
 * توليد كود إحالة فريد للشركة (8 أحرف مع بادئة CO)
 */
function generateCompanyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CO'; // بادئة تميز كود الشركة
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * توليد كود فريد مع التحقق من عدم التكرار
 */
async function generateUniqueCompanyCode() {
  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    code = generateCompanyCode();
    const existing = await CompanyReferral.findOne({ referralCode: code });
    exists = !!existing;
    attempts++;
  }

  return code;
}

/**
 * توليد كود إحالة للشركة (أو جلبه إذا كان موجوداً)
 * Requirement 5.1 - نظام إحالة منفصل للشركات
 */
async function generateCompanyReferralCode(companyId) {
  // التحقق من وجود الشركة
  const company = await User.findById(companyId).select('role companyReferralCode');
  if (!company) throw new Error('الشركة غير موجودة');

  // إرجاع الكود الموجود إذا كان متاحاً
  const existing = await CompanyReferral.findOne({ referrerCompanyId: companyId });
  if (existing) return existing.referralCode;

  // توليد كود جديد
  const code = await generateUniqueCompanyCode();

  await CompanyReferral.create({
    referralCode: code,
    referrerCompanyId: companyId,
    status: 'pending'
  });

  return code;
}

/**
 * بناء رابط الإحالة للشركة
 */
function buildCompanyReferralLink(code) {
  const baseUrl = process.env.FRONTEND_URL || 'https://careerak.com';
  return `${baseUrl}/register?company-ref=${code}`;
}

/**
 * تتبع إحالة شركة جديدة
 * Requirement 5.1
 */
async function trackCompanyReferral(referralCode, referredCompanyId, ipAddress) {
  // البحث عن سجل الإحالة بالكود
  const referralRecord = await CompanyReferral.findOne({ referralCode });
  if (!referralRecord) return null;

  // منع الإحالة الذاتية
  if (referralRecord.referrerCompanyId.toString() === referredCompanyId.toString()) {
    return null;
  }

  // التحقق من عدم وجود إحالة سابقة لنفس الشركة المُحالة
  const existingReferral = await CompanyReferral.findOne({ referredCompanyId });
  if (existingReferral) return existingReferral;

  // تحديث سجل الإحالة بمعلومات الشركة المُحالة
  const updated = await CompanyReferral.findByIdAndUpdate(
    referralRecord._id,
    {
      referredCompanyId,
      ipAddress,
      status: 'pending'
    },
    { new: true }
  );

  return updated;
}

/**
 * منح نقاط للشركة حسب الحدث
 * Requirement 5.2 - مكافآت أعلى للشركات
 */
async function awardCompanyPoints(companyId, eventType) {
  const points = COMPANY_REWARD_CONFIG[eventType];
  if (!points) throw new Error(`نوع الحدث غير معروف: ${eventType}`);

  // البحث عن سجل الإحالة المرتبط بهذه الشركة (كمحيل)
  const referralRecord = await CompanyReferral.findOne({ referrerCompanyId: companyId });

  // التحقق من عدم منح هذه المكافأة مسبقاً (لنفس الحدث)
  if (referralRecord) {
    const alreadyAwarded = referralRecord.rewards?.some(r => r.type === eventType);
    if (alreadyAwarded) {
      return { alreadyAwarded: true, eventType };
    }
  }

  // تحديث رصيد النقاط بشكل atomic
  const company = await User.findByIdAndUpdate(
    companyId,
    { $inc: { pointsBalance: points } },
    { new: true, select: 'pointsBalance' }
  );

  if (!company) throw new Error('الشركة غير موجودة');

  // تسجيل المعاملة
  await PointsTransaction.create({
    userId: companyId,
    type: 'earn',
    amount: points,
    balance: company.pointsBalance,
    source: `company_referral_${eventType}`,
    referralId: referralRecord?._id || null,
    description: EVENT_LABELS[eventType]
  });

  // تسجيل المكافأة في سجل الإحالة
  if (referralRecord) {
    await CompanyReferral.findByIdAndUpdate(referralRecord._id, {
      $push: {
        rewards: {
          type: eventType,
          points,
          awardedAt: new Date()
        }
      }
    });

    // تحديث حالة الإحالة إلى مكتملة عند أول مكافأة
    if (eventType === 'company_signup') {
      await CompanyReferral.findByIdAndUpdate(referralRecord._id, {
        status: 'completed',
        completedAt: new Date()
      });
    }
  }

  return {
    companyId,
    eventType,
    pointsAwarded: points,
    newBalance: company.pointsBalance
  };
}

/**
 * إحصائيات إحالات الشركة
 * Requirement 5.3 - لوحة تحكم خاصة بإحالات الشركات
 */
async function getCompanyReferralStats(companyId) {
  const [total, completed, pending] = await Promise.all([
    CompanyReferral.countDocuments({ referrerCompanyId: companyId }),
    CompanyReferral.countDocuments({ referrerCompanyId: companyId, status: 'completed' }),
    CompanyReferral.countDocuments({ referrerCompanyId: companyId, status: 'pending' })
  ]);

  // إجمالي النقاط المكتسبة من إحالات الشركات
  const pointsData = await PointsTransaction.aggregate([
    {
      $match: {
        userId: companyId,
        source: { $regex: /^company_referral_/ }
      }
    },
    { $group: { _id: null, totalPoints: { $sum: '$amount' } } }
  ]);

  // توزيع المكافآت حسب النوع
  const rewardBreakdown = await CompanyReferral.aggregate([
    { $match: { referrerCompanyId: companyId } },
    { $unwind: { path: '$rewards', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$rewards.type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$rewards.points' }
      }
    }
  ]);

  return {
    total,
    completed,
    pending,
    cancelled: total - completed - pending,
    totalPointsEarned: pointsData[0]?.totalPoints || 0,
    rewardBreakdown
  };
}

/**
 * قائمة إحالات الشركة مع التفاصيل
 * Requirement 5.3
 */
async function getCompanyReferrals(companyId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [referrals, total] = await Promise.all([
    CompanyReferral.find({ referrerCompanyId: companyId })
      .populate('referredCompanyId', 'companyName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CompanyReferral.countDocuments({ referrerCompanyId: companyId })
  ]);

  return { referrals, total, page, pages: Math.ceil(total / limit) };
}

/**
 * حساب نسبة الخصم بناءً على عدد الإحالات المكتملة
 * Requirement 5.4 - خصومات على باقات التوظيف
 *
 * - 1-2 إحالة مكتملة: 10% خصم
 * - 3-5 إحالات مكتملة: 20% خصم
 * - 6+ إحالات مكتملة: 30% خصم
 *
 * @param {string} companyId - معرف الشركة
 * @returns {{ discountPercent, completedReferrals, tier }}
 */
async function getCompanyDiscountRate(companyId) {
  const completedReferrals = await CompanyReferral.countDocuments({
    referrerCompanyId: companyId,
    status: 'completed'
  });

  let discountPercent = 0;
  let tier = 'none';

  if (completedReferrals >= 6) {
    discountPercent = 30;
    tier = 'gold';
  } else if (completedReferrals >= 3) {
    discountPercent = 20;
    tier = 'silver';
  } else if (completedReferrals >= 1) {
    discountPercent = 10;
    tier = 'bronze';
  }

  return { discountPercent, completedReferrals, tier };
}

/**
 * تطبيق خصم تلقائي على باقة توظيف بناءً على عدد الإحالات المكتملة
 * Requirement 5.4 - خصومات على باقات التوظيف
 *
 * @param {string} companyId - معرف الشركة
 * @param {number} packagePrice - سعر الباقة الأصلي
 * @returns {{ discountAmount, finalPrice, discountPercent, completedReferrals, tier }}
 */
async function applyJobPackageDiscountByReferrals(companyId, packagePrice) {
  const company = await User.findById(companyId).select('_id');
  if (!company) throw new Error('الشركة غير موجودة');

  const { discountPercent, completedReferrals, tier } = await getCompanyDiscountRate(companyId);

  if (discountPercent === 0) {
    throw new Error('لا يوجد خصم متاح. يجب أن يكون لديك إحالة مكتملة واحدة على الأقل');
  }

  const discountAmount = parseFloat(((packagePrice * discountPercent) / 100).toFixed(2));
  const finalPrice = parseFloat((packagePrice - discountAmount).toFixed(2));

  return {
    discountAmount,
    finalPrice,
    discountPercent,
    completedReferrals,
    tier,
    originalPrice: packagePrice
  };
}

/**
 * تطبيق خصم على باقة توظيف باستخدام نقاط الشركة
 * Requirement 5.4 - خصومات على باقات التوظيف
 *
 * قاعدة الخصم: كل 100 نقطة = 10% خصم، حد أقصى 50%
 *
 * @param {string} companyId - معرف الشركة
 * @param {number} packagePrice - سعر الباقة الأصلي
 * @param {number} pointsToUse - عدد النقاط المراد استخدامها
 * @returns {{ discountAmount, finalPrice, pointsUsed, newBalance }}
 */
async function applyJobPackageDiscount(companyId, packagePrice, pointsToUse) {
  // التحقق من وجود الشركة ورصيدها
  const company = await User.findById(companyId).select('pointsBalance');
  if (!company) throw new Error('الشركة غير موجودة');

  // التحقق من كفاية الرصيد
  if (company.pointsBalance < pointsToUse) {
    throw new Error(`رصيد النقاط غير كافٍ. الرصيد الحالي: ${company.pointsBalance} نقطة`);
  }

  // التحقق من أن النقاط المستخدمة مضاعف 100
  if (pointsToUse % 100 !== 0) {
    throw new Error('يجب أن تكون النقاط المستخدمة مضاعفاً للعدد 100');
  }

  // حساب نسبة الخصم (كل 100 نقطة = 10%، حد أقصى 50%)
  const discountPercent = Math.min((pointsToUse / 100) * 10, 50);

  // حساب مبلغ الخصم والسعر النهائي
  const discountAmount = parseFloat(((packagePrice * discountPercent) / 100).toFixed(2));
  const finalPrice = parseFloat((packagePrice - discountAmount).toFixed(2));

  // خصم النقاط من رصيد الشركة بشكل atomic
  const updatedCompany = await User.findByIdAndUpdate(
    companyId,
    { $inc: { pointsBalance: -pointsToUse } },
    { new: true, select: 'pointsBalance' }
  );

  // تسجيل معاملة استخدام النقاط
  await PointsTransaction.create({
    userId: companyId,
    type: 'redeem',
    amount: -pointsToUse,
    balance: updatedCompany.pointsBalance,
    source: 'redemption',
    description: `خصم ${discountPercent}% على باقة توظيف بقيمة ${packagePrice} (استخدام ${pointsToUse} نقطة)`
  });

  return {
    discountAmount,
    finalPrice,
    pointsUsed: pointsToUse,
    newBalance: updatedCompany.pointsBalance,
    discountPercent
  };
}

module.exports = {
  generateCompanyReferralCode,
  buildCompanyReferralLink,
  trackCompanyReferral,
  awardCompanyPoints,
  getCompanyReferralStats,
  getCompanyReferrals,
  getCompanyDiscountRate,
  applyJobPackageDiscountByReferrals,
  applyJobPackageDiscount,
  COMPANY_REWARD_CONFIG
};
