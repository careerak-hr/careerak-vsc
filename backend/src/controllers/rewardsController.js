const rewardsService = require('../services/rewardsService');
const { User } = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');

// خيارات الاستبدال الثابتة (من المتطلبات)
const REDEMPTION_OPTIONS = [
  {
    optionId: 'discount_10',
    name: { ar: 'خصم 10% على دورة', en: '10% Course Discount', fr: 'Réduction 10% sur un cours' },
    description: { ar: 'احصل على خصم 10% على أي دورة', en: 'Get 10% off any course', fr: 'Obtenez 10% de réduction sur un cours' },
    pointsCost: 100,
    type: 'discount',
    value: 10,
    isActive: true,
    expiryDays: 30
  },
  {
    optionId: 'discount_25',
    name: { ar: 'خصم 25% على دورة', en: '25% Course Discount', fr: 'Réduction 25% sur un cours' },
    description: { ar: 'احصل على خصم 25% على أي دورة', en: 'Get 25% off any course', fr: 'Obtenez 25% de réduction sur un cours' },
    pointsCost: 250,
    type: 'discount',
    value: 25,
    isActive: true,
    expiryDays: 30
  },
  {
    optionId: 'free_course',
    name: { ar: 'دورة مجانية (حتى 50$)', en: 'Free Course (up to $50)', fr: 'Cours gratuit (jusqu\'à 50$)' },
    description: { ar: 'احصل على دورة مجانية بقيمة حتى 50 دولار', en: 'Get a free course worth up to $50', fr: 'Obtenez un cours gratuit d\'une valeur de 50$' },
    pointsCost: 500,
    type: 'discount',
    value: 100,
    isActive: true,
    expiryDays: 60
  },
  {
    optionId: 'monthly_subscription',
    name: { ar: 'اشتراك شهري مجاني', en: 'Free Monthly Subscription', fr: 'Abonnement mensuel gratuit' },
    description: { ar: 'اشتراك شهري مجاني في المنصة', en: 'One month free platform subscription', fr: 'Un mois d\'abonnement gratuit à la plateforme' },
    pointsCost: 1000,
    type: 'subscription',
    value: 1,
    isActive: true,
    expiryDays: 30
  },
  {
    optionId: 'profile_highlight',
    name: { ar: 'إبراز الملف الشخصي أسبوع', en: 'Profile Highlight (1 week)', fr: 'Mise en avant du profil (1 semaine)' },
    description: { ar: 'إبراز ملفك الشخصي لمدة أسبوع كامل', en: 'Highlight your profile for a full week', fr: 'Mettez en avant votre profil pendant une semaine' },
    pointsCost: 150,
    type: 'feature',
    value: 7,
    isActive: true,
    expiryDays: 7
  },
  {
    optionId: 'premium_badge',
    name: { ar: 'شارة "عضو مميز"', en: '"Premium Member" Badge', fr: 'Badge "Membre Premium"' },
    description: { ar: 'احصل على شارة عضو مميز في ملفك الشخصي', en: 'Get a premium member badge on your profile', fr: 'Obtenez un badge membre premium sur votre profil' },
    pointsCost: 200,
    type: 'feature',
    value: 1,
    isActive: true,
    expiryDays: 90
  }
];

/**
 * GET /rewards/balance
 * جلب رصيد النقاط للمستخدم الحالي
 */
async function getBalance(req, res) {
  try {
    const balance = await rewardsService.getBalance(req.user._id);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /rewards/history
 * سجل معاملات النقاط (كل المعاملات مع فلترة اختيارية)
 * Query params: page, limit, type (earn|redeem|expire), source
 */
async function getHistory(req, res) {
  try {
    const { page = 1, limit = 20, type, source } = req.query;
    const result = await rewardsService.getTransactionHistory(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      source
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /rewards/earned
 * سجل المكافآت المكتسبة فقط مع إجمالي النقاط
 * Query params: page, limit, source
 */
async function getEarnedRewards(req, res) {
  try {
    const { page = 1, limit = 20, source } = req.query;
    const result = await rewardsService.getRewardsHistory(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      source
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /rewards/options
 * جلب خيارات الاستبدال المتاحة
 */
async function getOptions(req, res) {
  try {
    const options = REDEMPTION_OPTIONS.filter(o => o.isActive);
    res.json({ options });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /rewards/redeem/preview
 * معاينة الاستبدال قبل التأكيد - يُرجع تفاصيل الخيار والرصيد بعد الاستبدال
 * Body: { optionId }
 */
async function previewRedemption(req, res) {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId مطلوب' });

    const option = REDEMPTION_OPTIONS.find(o => o.optionId === optionId && o.isActive);
    if (!option) return res.status(404).json({ error: 'خيار الاستبدال غير موجود' });

    const user = await User.findById(req.user._id).select('pointsBalance');
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const canRedeem = user.pointsBalance >= option.pointsCost;

    res.json({
      option: {
        optionId: option.optionId,
        name: option.name,
        description: option.description,
        pointsCost: option.pointsCost,
        type: option.type,
        value: option.value,
        expiryDays: option.expiryDays
      },
      currentBalance: user.pointsBalance,
      balanceAfter: canRedeem ? user.pointsBalance - option.pointsCost : null,
      canRedeem,
      insufficientPoints: canRedeem ? null : option.pointsCost - user.pointsBalance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /rewards/redeem
 * استبدال نقاط - يطبق الخصم/الميزة فوراً
 * Body: { optionId }
 */
async function redeemPoints(req, res) {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId مطلوب' });

    const option = REDEMPTION_OPTIONS.find(o => o.optionId === optionId && o.isActive);
    if (!option) return res.status(404).json({ error: 'خيار الاستبدال غير موجود' });

    const result = await rewardsService.redeemPoints(req.user._id, option);

    res.json({
      success: true,
      optionId: option.optionId,
      optionName: option.name,
      pointsDeducted: result.pointsDeducted,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
      appliedRedemption: result.appliedRedemption
    });
  } catch (err) {
    if (err.code === 'INSUFFICIENT_POINTS') {
      return res.status(400).json({
        error: 'رصيد النقاط غير كافٍ',
        required: err.required,
        available: err.available
      });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /rewards/active-redemptions
 * جلب الاستبدالات النشطة للمستخدم (غير منتهية وغير مستخدمة)
 */
async function getActiveRedemptions(req, res) {
  try {
    const redemptions = await rewardsService.getActiveRedemptions(req.user._id);
    res.json({ redemptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /rewards/apply-redemption
 * تطبيق استبدال على عملية شراء (تحديده كمستخدم)
 * Body: { redemptionId }
 */
async function applyRedemption(req, res) {
  try {
    const { redemptionId } = req.body;
    if (!redemptionId) return res.status(400).json({ error: 'redemptionId مطلوب' });

    const result = await rewardsService.applyRedemption(req.user._id, redemptionId);
    res.json({ success: true, redemption: result.redemption });
  } catch (err) {
    if (err.code === 'REDEMPTION_NOT_FOUND') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /rewards/redemptions
 * سجل الاستبدالات السابقة
 * Query params: page, limit
 */
async function getRedemptions(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [redemptions, total] = await Promise.all([
      PointsTransaction.find({ userId: req.user._id, type: 'redeem' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PointsTransaction.countDocuments({ userId: req.user._id, type: 'redeem' })
    ]);

    const formatted = redemptions.map(r => ({
      _id: r._id,
      optionId: r.redemptionId || null,
      optionName: r.description,
      pointsCost: r.amount,
      status: 'applied',
      createdAt: r.createdAt
    }));

    res.json({
      redemptions: formatted,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getBalance, getHistory, getEarnedRewards, getOptions, previewRedemption, redeemPoints, getRedemptions, getActiveRedemptions, applyRedemption };
