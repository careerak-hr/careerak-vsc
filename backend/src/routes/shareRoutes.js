const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/shares
 * @desc    Record a share event
 * @access  Optional auth (user may or may not be logged in)
 * Req 13, 15
 */
router.post('/', auth, shareController.recordShare);

/**
 * @route   GET /api/shares/analytics/summary
 * @desc    Summary of total shares by content type
 * @access  Public
 */
router.get('/analytics/summary', shareController.getAnalyticsSummary);

/**
 * @route   GET /api/shares/analytics/by-platform
 * @desc    Shares grouped by platform
 * @access  Public
 */
router.get('/analytics/by-platform', shareController.getAnalyticsByPlatform);

/**
 * @route   GET /api/shares/analytics/top-content
 * @desc    Top 10 most shared content items
 * @access  Public
 */
router.get('/analytics/top-content', shareController.getTopContent);

/**
 * @route   GET /api/shares/analytics/export
 * @desc    Export analytics data as CSV or JSON (admin only)
 * @access  Private (Admin)
 * Req 15
 */
router.get('/analytics/export', auth, shareController.exportAnalytics);

/**
 * @route   GET /api/shares/analytics
 * @desc    Get share analytics
 * @access  Public
 * Req 15
 */
router.get('/analytics', shareController.getAnalytics);

/**
 * @route   GET /api/shares/:contentType/:contentId
 * @desc    Get share count for a specific content item
 * @access  Public
 * Req 15
 */
router.get('/:contentType/:contentId', shareController.getShareCount);

/**
 * @route   POST /api/jobs/:id/share
 * @desc    تسجيل مشاركة وظيفة
 * @access  Private (يتطلب تسجيل دخول)
 */
router.post('/jobs/:id/share', auth, shareController.trackJobShare);

/**
 * @route   GET /api/jobs/:id/share-stats
 * @desc    الحصول على إحصائيات المشاركة لوظيفة
 * @access  Public
 */
router.get('/jobs/:id/share-stats', shareController.getJobShareStats);

/**
 * @route   GET /api/users/me/share-stats
 * @desc    الحصول على إحصائيات المشاركة للمستخدم الحالي
 * @access  Private
 */
router.get('/users/me/share-stats', auth, shareController.getUserShareStats);

/**
 * @route   GET /api/analytics/most-shared-jobs
 * @desc    الحصول على أكثر الوظائف مشاركة
 * @access  Public
 */
router.get('/analytics/most-shared-jobs', shareController.getMostSharedJobs);

/**
 * @route   GET /api/analytics/share-trends
 * @desc    الحصول على اتجاهات المشاركة
 * @access  Public
 */
router.get('/analytics/share-trends', shareController.getShareTrends);

/**
 * @route   DELETE /api/analytics/cleanup-shares
 * @desc    حذف سجلات المشاركة القديمة (للأدمن فقط)
 * @access  Private (Admin only)
 */
router.delete('/analytics/cleanup-shares', auth, shareController.cleanupOldShares);

module.exports = router;
