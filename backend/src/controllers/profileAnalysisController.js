/**
 * Profile Analysis Controller
 * معالج طلبات تحليل الملف الشخصي
 */

const profileAnalysisService = require('../services/profileAnalysisService');
const { Individual } = require('../models/User');

/**
 * الحصول على تحليل الملف الشخصي
 * GET /api/ai/profile-analysis/:userId
 */
const getProfileAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;

    // التحقق من أن المستخدم يطلب ملفه الخاص أو أنه أدمن
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // تحليل الملف الشخصي
    const analysis = await profileAnalysisService.analyzeProfile(userId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in getProfileAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze profile',
      error: error.message
    });
  }
};

/**
 * مقارنة الملف الشخصي مع ملفات ناجحة
 * GET /api/ai/profile-analysis/:userId/comparison
 */
const getProfileComparison = async (req, res) => {
  try {
    const { userId } = req.params;

    // التحقق من أن المستخدم يطلب ملفه الخاص أو أنه أدمن
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // الحصول على المستخدم
    const user = await Individual.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // مقارنة مع ملفات ناجحة
    const comparison = await profileAnalysisService.compareWithSuccessfulProfiles(user);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error in getProfileComparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare profile',
      error: error.message
    });
  }
};

/**
 * حساب درجة اكتمال الملف فقط
 * GET /api/ai/profile-analysis/:userId/completeness
 */
const getCompletenessScore = async (req, res) => {
  try {
    const { userId } = req.params;

    // التحقق من أن المستخدم يطلب ملفه الخاص أو أنه أدمن
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // الحصول على المستخدم
    const user = await Individual.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // حساب درجة الاكتمال
    const completenessScore = profileAnalysisService.calculateCompletenessScore(user);

    res.json({
      success: true,
      data: completenessScore
    });
  } catch (error) {
    console.error('Error in getCompletenessScore:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate completeness score',
      error: error.message
    });
  }
};

module.exports = {
  getProfileAnalysis,
  getProfileComparison,
  getCompletenessScore
};
