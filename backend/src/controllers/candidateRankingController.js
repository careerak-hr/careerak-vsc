/**
 * 🎯 Candidate Ranking Controller
 * معالج طلبات ترتيب المرشحين
 * 
 * المتطلبات: 3.1, 3.2 (ترتيب تلقائي للمرشحين حسب التطابق)
 */

const {
  rankCandidatesForJob,
  getRankedCandidatesFromRecommendations,
  analyzeCandidate,
  suggestProactiveCandidates,
  notifyMatchingCandidates
} = require('../services/candidateRankingService');

/**
 * ترتيب المرشحين لوظيفة معينة
 * POST /api/recommendations/candidates/rank
 */
exports.rankCandidates = async (req, res) => {
  try {
    const { jobId, limit, minScore, saveRecommendations } = req.body;
    
    // التحقق من jobId
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب الوظيفة أو أدمن
    // (يمكن إضافة هذا التحقق لاحقاً)
    
    const result = await rankCandidatesForJob(jobId, {
      limit: limit || 50,
      minScore: minScore || 30,
      saveRecommendations: saveRecommendations !== false
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in rankCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rank candidates',
      error: error.message
    });
  }
};

/**
 * الحصول على المرشحين المرتبين من التوصيات المحفوظة
 * GET /api/recommendations/candidates
 */
exports.getRankedCandidates = async (req, res) => {
  try {
    const companyId = req.user._id; // من middleware المصادقة
    const { limit, minScore } = req.query;
    
    const candidates = await getRankedCandidatesFromRecommendations(companyId, {
      limit: parseInt(limit) || 20,
      minScore: parseInt(minScore) || 30
    });
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
    
  } catch (error) {
    console.error('Error in getRankedCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ranked candidates',
      error: error.message
    });
  }
};

/**
 * الحصول على المرشحين المرتبين لوظيفة معينة
 * GET /api/recommendations/candidates/job/:jobId
 */
exports.getRankedCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit, minScore, refresh } = req.query;
    
    // إذا كان refresh=true، إعادة حساب الترتيب
    if (refresh === 'true') {
      const result = await rankCandidatesForJob(jobId, {
        limit: parseInt(limit) || 50,
        minScore: parseInt(minScore) || 30,
        saveRecommendations: true
      });
      
      return res.status(200).json({
        success: true,
        data: result,
        refreshed: true
      });
    }
    
    // جلب من التوصيات المحفوظة
    const companyId = req.user._id;
    const candidates = await getRankedCandidatesFromRecommendations(companyId, {
      limit: parseInt(limit) || 20,
      minScore: parseInt(minScore) || 30
    });
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
      refreshed: false
    });
    
  } catch (error) {
    console.error('Error in getRankedCandidatesForJob:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ranked candidates for job',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات ترتيب المرشحين
 * GET /api/recommendations/candidates/stats
 */
exports.getCandidateRankingStats = async (req, res) => {
  try {
    const companyId = req.user._id;
    
    const Recommendation = require('../models/Recommendation');
    
    const stats = await Recommendation.aggregate([
      {
        $match: {
          userId: companyId,
          itemType: 'candidate',
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          highScoreCandidates: {
            $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] }
          },
          mediumScoreCandidates: {
            $sum: { $cond: [
              { $and: [{ $gte: ['$score', 40] }, { $lt: ['$score', 70] }] },
              1,
              0
            ]}
          },
          lowScoreCandidates: {
            $sum: { $cond: [{ $lt: ['$score', 40] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalCandidates: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        highScoreCandidates: 0,
        mediumScoreCandidates: 0,
        lowScoreCandidates: 0
      }
    });
    
  } catch (error) {
    console.error('Error in getCandidateRankingStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidate ranking stats',
      error: error.message
    });
  }
};

/**
 * تحليل مرشح مقابل وظيفة (نقاط القوة والضعف)
 * GET /api/recommendations/candidates/:candidateId/analyze/:jobId
 * Requirements: 3.3 (تحليل نقاط القوة والضعف)
 */
exports.analyzeCandidateForJob = async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    
    // التحقق من المعاملات
    if (!candidateId || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID and Job ID are required'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب الوظيفة أو أدمن
    // (يمكن إضافة هذا التحقق لاحقاً)
    
    const analysis = await analyzeCandidate(candidateId, jobId);
    
    res.status(200).json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error in analyzeCandidateForJob:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze candidate',
      error: error.message
    });
  }
};

module.exports = exports;

/**
 * مقارنة جنباً إلى جنب بين مرشحين أو أكثر
 * POST /api/recommendations/candidates/compare
 * Requirements: 3.4 (مقارنة جنباً إلى جنب - side-by-side)
 * 
 * Body: {
 *   candidateIds: ['id1', 'id2', 'id3'],  // 2-5 مرشحين
 *   jobId: 'jobId'
 * }
 */
exports.compareCandidates = async (req, res) => {
  try {
    const { candidateIds, jobId } = req.body;
    
    // التحقق من المعاملات
    if (!candidateIds || !Array.isArray(candidateIds)) {
      return res.status(400).json({
        success: false,
        message: 'candidateIds must be an array'
      });
    }
    
    if (candidateIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 candidates are required for comparison'
      });
    }
    
    if (candidateIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 candidates can be compared at once'
      });
    }
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب الوظيفة أو أدمن
    // (يمكن إضافة هذا التحقق لاحقاً)
    
    const { compareCandidatesSideBySide } = require('../services/candidateRankingService');
    const comparison = await compareCandidatesSideBySide(candidateIds, jobId);
    
    res.status(200).json({
      success: true,
      data: comparison
    });
    
  } catch (error) {
    console.error('Error in compareCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare candidates',
      error: error.message
    });
  }
};

/**
 * اقتراح مرشحين محتملين بشكل استباقي
 * GET /api/recommendations/candidates/proactive
 * Requirements: 3.5 (توصيات استباقية لمرشحين محتملين)
 * 
 * Query params:
 * - limit: عدد المرشحين المقترحين (افتراضي: 20)
 * - minScore: الحد الأدنى للدرجة (افتراضي: 50)
 * - includeNewCandidates: تضمين المرشحين الجدد (افتراضي: true)
 * - includeActiveCandidates: تضمين المرشحين النشطين (افتراضي: true)
 * - daysBack: عدد الأيام للبحث في الوظائف السابقة (افتراضي: 30)
 */
exports.getProactiveCandidateSuggestions = async (req, res) => {
  try {
    const companyId = req.user._id; // من middleware المصادقة
    const { 
      limit, 
      minScore, 
      includeNewCandidates, 
      includeActiveCandidates,
      daysBack 
    } = req.query;
    
    const suggestions = await suggestProactiveCandidates(companyId, {
      limit: parseInt(limit) || 20,
      minScore: parseInt(minScore) || 50,
      includeNewCandidates: includeNewCandidates !== 'false',
      includeActiveCandidates: includeActiveCandidates !== 'false',
      daysBack: parseInt(daysBack) || 30
    });
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    console.error('Error in getProactiveCandidateSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get proactive candidate suggestions',
      error: error.message
    });
  }
};

/**
 * إشعار المرشحين المناسبين عن وظيفة جديدة
 * POST /api/recommendations/candidates/notify
 * Requirements: 3.5 (إشعار المرشحين المناسبين)
 * 
 * Body: {
 *   jobId: 'jobId',
 *   minScore: 60,              // الحد الأدنى للدرجة (افتراضي: 60)
 *   maxNotifications: 50,      // الحد الأقصى للإشعارات (افتراضي: 50)
 *   sendImmediately: true      // إرسال فوري (افتراضي: true)
 * }
 */
exports.notifyMatchingCandidatesForJob = async (req, res) => {
  try {
    const { jobId, minScore, maxNotifications, sendImmediately } = req.body;
    
    // التحقق من jobId
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب الوظيفة أو أدمن
    // (يمكن إضافة هذا التحقق لاحقاً)
    
    const result = await notifyMatchingCandidates(jobId, {
      minScore: minScore || 60,
      maxNotifications: maxNotifications || 50,
      sendImmediately: sendImmediately !== false
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in notifyMatchingCandidatesForJob:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to notify matching candidates',
      error: error.message
    });
  }
};
