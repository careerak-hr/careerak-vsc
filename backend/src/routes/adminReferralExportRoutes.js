/**
 * Admin Referral Export Routes
 * مسارات تصدير تقارير الإحالات الإدارية - Requirements: 7.4
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { exportAdminReferrals } = require('../controllers/referralExportController');
const { getAdminConversionStats } = require('../controllers/referralAnalyticsController');

// التحقق من صلاحية الأدمن
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') return next();
  return res.status(403).json({ error: 'غير مسموح لك بالدخول هنا' });
};

/**
 * GET /admin/referrals/export?format=pdf|excel
 * تصدير تقرير الإحالات الإداري الشامل
 */
router.get('/export', auth, isAdmin, exportAdminReferrals);

/**
 * GET /admin/referrals/analytics/conversion
 * معدل التحويل والنجاح على مستوى البرنامج كله
 * Requirements: 7.3, 7.4
 */
router.get('/analytics/conversion', auth, isAdmin, getAdminConversionStats);

module.exports = router;
