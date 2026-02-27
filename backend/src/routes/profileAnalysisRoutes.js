/**
 * Profile Analysis Routes
 * مسارات API لتحليل الملف الشخصي
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const profileAnalysisController = require('../controllers/profileAnalysisController');

// جميع المسارات تتطلب authentication
router.use(protect);

/**
 * @route   GET /api/profile-analysis/analyze
 * @desc    تحليل الملف الشخصي للمستخدم الحالي
 * @access  Private
 */
router.get('/analyze', profileAnalysisController.analyzeMyProfile);

/**
 * @route   GET /api/profile-analysis/latest
 * @desc    الحصول على آخر تحليل
 * @access  Private
 */
router.get('/latest', profileAnalysisController.getLatestAnalysis);

/**
 * @route   GET /api/profile-analysis/history
 * @desc    الحصول على تاريخ التحليلات
 * @access  Private
 * @query   limit - عدد النتائج (افتراضي: 10)
 */
router.get('/history', profileAnalysisController.getAnalysisHistory);

/**
 * @route   PATCH /api/profile-analysis/suggestions/:suggestionId/complete
 * @desc    تحديد اقتراح كمكتمل
 * @access  Private
 */
router.patch('/suggestions/:suggestionId/complete', profileAnalysisController.completeSuggestion);

/**
 * @route   GET /api/profile-analysis/progress
 * @desc    الحصول على إحصائيات التقدم
 * @access  Private
 */
router.get('/progress', profileAnalysisController.getProgress);

/**
 * @route   GET /api/profile-analysis/compare-with-successful
 * @desc    مقارنة الملف الشخصي مع ملفات ناجحة في نفس المجال
 * @access  Private
 */
router.get('/compare-with-successful', profileAnalysisController.compareWithSuccessful);

module.exports = router;
