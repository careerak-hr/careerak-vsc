const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getMyCode, trackReferral, getMyReferrals, getStats } = require('../controllers/referralController');
const { getPersonalStats, getMonthlyTrend, getEarningsBySource, getROI } = require('../controllers/referralAnalyticsController');
const { exportMyReferrals } = require('../controllers/referralExportController');

// جميع المسارات تتطلب تسجيل الدخول
router.use(auth);

router.get('/my-code', getMyCode);           // جلب كود ورابط الإحالة
router.post('/track', trackReferral);         // تتبع إحالة جديدة
router.get('/my-referrals', getMyReferrals); // قائمة الإحالات
router.get('/stats', getStats);              // إحصائيات الإحالات

// لوحة الإحصائيات الشخصية - Requirements: 7.1, 7.2, 7.3
router.get('/analytics/personal', getPersonalStats);   // الإحصائيات الكاملة
router.get('/analytics/trend', getMonthlyTrend);       // الاتجاه الشهري
router.get('/analytics/earnings', getEarningsBySource); // توزيع النقاط
router.get('/analytics/roi', getROI);                  // معدل الاستبدال

// تصدير التقارير - Requirements: 7.4
// GET /api/referrals/export?format=pdf|excel
router.get('/export', exportMyReferrals);

module.exports = router;
