/**
 * Profile Analysis Routes
 * مسارات API لتحليل الملف الشخصي
 */

const express = require('express');
const router = express.Router();
const profileAnalysisController = require('../controllers/profileAnalysisController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/ai/profile-analysis/:userId
 * @desc    الحصول على تحليل شامل للملف الشخصي
 * @access  Private (المستخدم نفسه أو Admin)
 */
router.get('/:userId', protect, profileAnalysisController.getProfileAnalysis);

/**
 * @route   GET /api/ai/profile-analysis/:userId/comparison
 * @desc    مقارنة الملف الشخصي مع ملفات ناجحة
 * @access  Private (المستخدم نفسه أو Admin)
 */
router.get('/:userId/comparison', protect, profileAnalysisController.getProfileComparison);

/**
 * @route   GET /api/ai/profile-analysis/:userId/completeness
 * @desc    حساب درجة اكتمال الملف فقط
 * @access  Private (المستخدم نفسه أو Admin)
 */
router.get('/:userId/completeness', protect, profileAnalysisController.getCompletenessScore);

module.exports = router;
