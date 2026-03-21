/**
 * Company Referral Routes - مسارات إحالة الشركات
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getMyReferralCode,
  trackReferral,
  getMyReferrals,
  getStats,
  applyDiscount,
  getCompanyDiscount,
  applyDiscountByReferrals
} = require('../controllers/companyReferralController');

// جميع المسارات تتطلب تسجيل الدخول
router.use(auth);

router.get('/my-code', getMyReferralCode);                          // جلب كود ورابط الإحالة
router.post('/track', trackReferral);                               // تتبع إحالة شركة جديدة
router.get('/my-referrals', getMyReferrals);                       // قائمة الشركات المُحالة
router.get('/stats', getStats);                                     // إحصائيات إحالات الشركة
router.post('/apply-discount', applyDiscount);                     // تطبيق خصم بالنقاط (Requirement 5.4)
router.get('/discount', getCompanyDiscount);                       // جلب نسبة الخصم بناءً على الإحالات (Requirement 5.4)
router.post('/apply-discount-by-referrals', applyDiscountByReferrals); // تطبيق خصم تلقائي بناءً على الإحالات (Requirement 5.4)

module.exports = router;
