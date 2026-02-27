/**
 * 🎯 Candidate Ranking Routes
 * مسارات API لترتيب المرشحين
 * 
 * المتطلبات: 3.1, 3.2 (ترتيب تلقائي للمرشحين حسب التطابق)
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const candidateRankingController = require('../controllers/candidateRankingController');

/**
 * @route   POST /api/recommendations/candidates/rank
 * @desc    ترتيب المرشحين لوظيفة معينة
 * @access  Private (HR/Admin)
 */
router.post(
  '/rank',
  protect,
  candidateRankingController.rankCandidates
);

/**
 * @route   GET /api/recommendations/candidates
 * @desc    الحصول على المرشحين المرتبين من التوصيات المحفوظة
 * @access  Private (HR/Admin)
 */
router.get(
  '/',
  protect,
  candidateRankingController.getRankedCandidates
);

/**
 * @route   GET /api/recommendations/candidates/job/:jobId
 * @desc    الحصول على المرشحين المرتبين لوظيفة معينة
 * @access  Private (HR/Admin)
 * @query   refresh=true لإعادة حساب الترتيب
 */
router.get(
  '/job/:jobId',
  protect,
  candidateRankingController.getRankedCandidatesForJob
);

/**
 * @route   GET /api/recommendations/candidates/stats
 * @desc    الحصول على إحصائيات ترتيب المرشحين
 * @access  Private (HR/Admin)
 */
router.get(
  '/stats',
  protect,
  candidateRankingController.getCandidateRankingStats
);

/**
 * @route   GET /api/recommendations/candidates/:candidateId/analyze/:jobId
 * @desc    تحليل مرشح مقابل وظيفة (نقاط القوة والضعف)
 * @access  Private (HR/Admin)
 * Requirements: 3.3 (تحليل نقاط القوة والضعف)
 */
router.get(
  '/:candidateId/analyze/:jobId',
  protect,
  candidateRankingController.analyzeCandidateForJob
);

/**
 * @route   POST /api/recommendations/candidates/compare
 * @desc    مقارنة جنباً إلى جنب بين مرشحين أو أكثر (2-5 مرشحين)
 * @access  Private (HR/Admin)
 * Requirements: 3.4 (مقارنة جنباً إلى جنب - side-by-side)
 * @body    { candidateIds: ['id1', 'id2'], jobId: 'jobId' }
 */
router.post(
  '/compare',
  protect,
  candidateRankingController.compareCandidates
);

/**
 * @route   GET /api/recommendations/candidates/proactive
 * @desc    اقتراح مرشحين محتملين بشكل استباقي
 * @access  Private (HR/Admin)
 * Requirements: 3.5 (توصيات استباقية لمرشحين محتملين)
 * @query   limit - عدد المرشحين المقترحين (افتراضي: 20)
 * @query   minScore - الحد الأدنى للدرجة (افتراضي: 50)
 * @query   includeNewCandidates - تضمين المرشحين الجدد (افتراضي: true)
 * @query   includeActiveCandidates - تضمين المرشحين النشطين (افتراضي: true)
 * @query   daysBack - عدد الأيام للبحث في الوظائف السابقة (افتراضي: 30)
 */
router.get(
  '/proactive',
  protect,
  candidateRankingController.getProactiveCandidateSuggestions
);

/**
 * @route   POST /api/recommendations/candidates/notify
 * @desc    إشعار المرشحين المناسبين عن وظيفة جديدة
 * @access  Private (HR/Admin)
 * Requirements: 3.5 (إشعار المرشحين المناسبين)
 * @body    { jobId, minScore, maxNotifications, sendImmediately }
 */
router.post(
  '/notify',
  protect,
  candidateRankingController.notifyMatchingCandidatesForJob
);

module.exports = router;
