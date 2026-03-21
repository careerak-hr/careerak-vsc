/**
 * CompanyReferralController - متحكم إحالة الشركات
 * لوحة تحكم منفصلة لإحالات الشركات
 * Requirements: 5.1, 5.2, 5.3
 */

const companyReferralService = require('../services/companyReferralService');

/**
 * GET /company-referrals/discount
 * جلب نسبة الخصم المتاحة للشركة بناءً على عدد إحالاتها المكتملة
 * Requirement 5.4
 */
async function getCompanyDiscount(req, res) {
  try {
    const result = await companyReferralService.getCompanyDiscountRate(req.user._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /company-referrals/apply-discount-by-referrals
 * تطبيق الخصم التلقائي على باقة توظيف بناءً على عدد الإحالات المكتملة
 * Requirement 5.4
 */
async function applyDiscountByReferrals(req, res) {
  try {
    const { packagePrice } = req.body;

    if (packagePrice === undefined || packagePrice === null) {
      return res.status(400).json({ error: 'سعر الباقة مطلوب' });
    }
    if (typeof packagePrice !== 'number' || packagePrice <= 0) {
      return res.status(400).json({ error: 'سعر الباقة يجب أن يكون رقماً موجباً' });
    }

    const result = await companyReferralService.applyJobPackageDiscountByReferrals(
      req.user._id,
      packagePrice
    );

    res.json({ message: 'تم حساب الخصم بنجاح', ...result });
  } catch (err) {
    if (err.message.includes('لا يوجد خصم متاح') || err.message.includes('الشركة غير موجودة')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /company-referrals/my-code
 * جلب كود ورابط الإحالة الخاص بالشركة
 */
async function getMyReferralCode(req, res) {
  try {
    const code = await companyReferralService.generateCompanyReferralCode(req.user._id);
    const link = companyReferralService.buildCompanyReferralLink(code);
    res.json({ code, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /company-referrals/track
 * تتبع إحالة شركة جديدة (يُستدعى عند تسجيل شركة باستخدام كود إحالة)
 */
async function trackReferral(req, res) {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ error: 'كود الإحالة مطلوب' });
    }

    const referral = await companyReferralService.trackCompanyReferral(
      referralCode,
      req.user._id,
      req.ip
    );

    if (!referral) {
      return res.status(400).json({ error: 'كود الإحالة غير صالح أو تم استخدامه مسبقاً' });
    }

    // منح نقاط التسجيل تلقائياً (غير متزامن - لا يعطل الاستجابة)
    setImmediate(async () => {
      try {
        await companyReferralService.awardCompanyPoints(
          referral.referrerCompanyId,
          'company_signup'
        );
      } catch (err) {
        console.error('❌ خطأ في منح نقاط إحالة الشركة:', err.message);
      }
    });

    res.status(201).json({ message: 'تم تسجيل إحالة الشركة بنجاح', referral });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /company-referrals/my-referrals
 * قائمة الشركات التي أحالتها الشركة الحالية
 */
async function getMyReferrals(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await companyReferralService.getCompanyReferrals(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /company-referrals/stats
 * إحصائيات إحالات الشركة - لوحة التحكم الخاصة (Requirement 5.3)
 */
async function getStats(req, res) {
  try {
    const stats = await companyReferralService.getCompanyReferralStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /company-referrals/apply-discount
 * تطبيق خصم على باقة توظيف باستخدام نقاط الشركة (Requirement 5.4)
 */
async function applyDiscount(req, res) {
  try {
    const { packagePrice, pointsToUse } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (packagePrice === undefined || packagePrice === null) {
      return res.status(400).json({ error: 'سعر الباقة مطلوب' });
    }
    if (pointsToUse === undefined || pointsToUse === null) {
      return res.status(400).json({ error: 'عدد النقاط المراد استخدامها مطلوب' });
    }

    // التحقق من أن القيم أرقام موجبة
    if (typeof packagePrice !== 'number' || packagePrice <= 0) {
      return res.status(400).json({ error: 'سعر الباقة يجب أن يكون رقماً موجباً' });
    }
    if (typeof pointsToUse !== 'number' || pointsToUse <= 0) {
      return res.status(400).json({ error: 'عدد النقاط يجب أن يكون رقماً موجباً' });
    }

    const result = await companyReferralService.applyJobPackageDiscount(
      req.user._id,
      packagePrice,
      pointsToUse
    );

    res.json({
      message: 'تم تطبيق الخصم بنجاح',
      ...result
    });
  } catch (err) {
    // أخطاء منطقية (رصيد غير كافٍ، نقاط غير صحيحة)
    if (
      err.message.includes('رصيد النقاط غير كافٍ') ||
      err.message.includes('مضاعفاً للعدد 100') ||
      err.message.includes('الشركة غير موجودة')
    ) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMyReferralCode, trackReferral, getMyReferrals, getStats, applyDiscount, getCompanyDiscount, applyDiscountByReferrals };
