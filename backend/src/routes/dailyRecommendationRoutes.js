/**
 * 🤖 Daily Recommendation Routes
 * مسارات التوصيات اليومية
 * 
 * المتطلبات: 7.2, 7.3 (تحديث يومي، قسم "جديد لك")
 * Task: 12.2 تحديث يومي
 */

const express = require('express');
const router = express.Router();
const dailyRecommendationController = require('../controllers/dailyRecommendationController');
const { protect } = require('../middleware/auth');

// ===== مسارات المستخدمين =====

/**
 * @route   GET /api/recommendations/new
 * @desc    جلب التوصيات الجديدة (قسم "جديد لك")
 * @access  Private (User)
 */
router.get('/new', protect, dailyRecommendationController.getNewRecommendations);

/**
 * @route   PATCH /api/recommendations/:id/seen
 * @desc    تحديد توصية كمشاهدة
 * @access  Private (User)
 */
router.patch('/:id/seen', protect, dailyRecommendationController.markRecommendationAsSeen);

// ===== مسارات الأدمن =====

/**
 * @route   POST /api/recommendations/daily-update
 * @desc    تشغيل التحديث اليومي يدوياً
 * @access  Private (Admin)
 */
router.post('/daily-update', protect, dailyRecommendationController.runDailyUpdate);

/**
 * @route   GET /api/recommendations/daily-update/status
 * @desc    الحصول على حالة التحديث اليومي
 * @access  Private (Admin)
 */
router.get('/daily-update/status', protect, dailyRecommendationController.getDailyUpdateStatus);

/**
 * @route   POST /api/recommendations/daily-update/schedule
 * @desc    بدء/إيقاف جدولة التحديث اليومي
 * @access  Private (Admin)
 */
router.post('/daily-update/schedule', protect, dailyRecommendationController.toggleDailyUpdateSchedule);

module.exports = router;
