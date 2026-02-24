/**
 * Security Score Routes
 * مسارات API لـ Security Score
 */

const express = require('express');
const router = express.Router();
const { getSecurityScore, getRecommendations } = require('../controllers/securityScoreController');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية - تتطلب authentication
router.use(protect);

/**
 * @route   GET /api/security-score
 * @desc    الحصول على Security Score الكامل
 * @access  Private
 */
router.get('/', getSecurityScore);

/**
 * @route   GET /api/security-score/recommendations
 * @desc    الحصول على التوصيات فقط
 * @access  Private
 */
router.get('/recommendations', getRecommendations);

module.exports = router;
