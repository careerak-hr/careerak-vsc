const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/jobs/:id/share
 * @desc    تسجيل مشاركة وظيفة
 * @access  Private (يتطلب تسجيل دخول)
 */
router.post('/jobs/:id/share', authenticate, shareController.trackJobShare);

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
router.get('/users/me/share-stats', authenticate, shareController.getUserShareStats);

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
router.delete('/analytics/cleanup-shares', authenticate, shareController.cleanupOldShares);

module.exports = router;
