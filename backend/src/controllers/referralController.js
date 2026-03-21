const referralService = require('../services/referralService');
const rewardsService = require('../services/rewardsService');

/**
 * GET /referrals/my-code
 * جلب كود ورابط الإحالة الخاص بالمستخدم
 */
async function getMyCode(req, res) {
  try {
    const code = await referralService.getOrCreateReferralCode(req.user._id);
    const link = referralService.buildReferralLink(code);
    res.json({ code, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /referrals/track
 * تتبع إحالة جديدة (يُستدعى عند تسجيل مستخدم جديد)
 */
async function trackReferral(req, res) {
  try {
    const { referralCode, source, deviceFingerprint } = req.body;
    if (!referralCode) return res.status(400).json({ error: 'كود الإحالة مطلوب' });

    // استخراج IP مع دعم البروكسي (x-forwarded-for)
    const ipAddress =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.ip;

    const referral = await referralService.trackReferral({
      referralCode,
      referredUserId: req.user._id,
      ipAddress,
      deviceFingerprint: deviceFingerprint || req.headers['x-device-fingerprint'],
      source
    });

    if (!referral) {
      return res.status(400).json({ error: 'كود الإحالة غير صالح أو تم استخدامه مسبقاً' });
    }

    // منح نقاط التسجيل تلقائياً (غير متزامن - لا يعطل الاستجابة)
    setImmediate(async () => {
      try {
        await rewardsService.awardSignupReward(referral);
      } catch (err) {
        console.error('❌ خطأ في منح نقاط التسجيل:', err.message);
      }
    });

    res.status(201).json({ message: 'تم تسجيل الإحالة بنجاح', referral });
  } catch (err) {
    if (err.code === 'FRAUD_DETECTED') {
      return res.status(403).json({
        error: 'تم رفض الإحالة بسبب نشاط مشبوه',
        fraudResult: err.fraudResult
      });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /referrals/my-referrals
 * جلب قائمة الإحالات الخاصة بالمستخدم
 */
async function getMyReferrals(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await referralService.getUserReferrals(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /referrals/stats
 * إحصائيات الإحالات للمستخدم
 */
async function getStats(req, res) {
  try {
    const stats = await referralService.getReferralStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMyCode, trackReferral, getMyReferrals, getStats };
