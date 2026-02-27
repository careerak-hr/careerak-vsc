/**
 * Profile Analysis Controller
 * معالج طلبات تحليل الملف الشخصي
 */

const ProfileAnalysis = require('../models/ProfileAnalysis');
const { analyzeProfile, compareWithSuccessfulProfiles } = require('../services/profileAnalysisService');

/**
 * تحليل الملف الشخصي للمستخدم الحالي
 * GET /api/profile-analysis/analyze
 */
exports.analyzeMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // تحليل الملف الشخصي
    const analysis = await analyzeProfile(userId);

    // حفظ النتائج
    const savedAnalysis = await ProfileAnalysis.create(analysis);

    res.status(200).json({
      success: true,
      message: 'تم تحليل الملف الشخصي بنجاح',
      data: savedAnalysis
    });
  } catch (error) {
    console.error('Error in analyzeMyProfile:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحليل الملف الشخصي',
      error: error.message
    });
  }
};

/**
 * الحصول على آخر تحليل للملف الشخصي
 * GET /api/profile-analysis/latest
 */
exports.getLatestAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;

    const analysis = await ProfileAnalysis
      .findOne({ userId })
      .sort({ analyzedAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على تحليل سابق'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in getLatestAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التحليل',
      error: error.message
    });
  }
};

/**
 * الحصول على تاريخ التحليلات
 * GET /api/profile-analysis/history
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const analyses = await ProfileAnalysis
      .find({ userId })
      .sort({ analyzedAt: -1 })
      .limit(parseInt(limit))
      .select('completenessScore strengthScore analyzedAt');

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error('Error in getAnalysisHistory:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التاريخ',
      error: error.message
    });
  }
};

/**
 * تحديد اقتراح كمكتمل
 * PATCH /api/profile-analysis/suggestions/:suggestionId/complete
 */
exports.completeSuggestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { suggestionId } = req.params;

    // الحصول على آخر تحليل
    const analysis = await ProfileAnalysis
      .findOne({ userId })
      .sort({ analyzedAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على تحليل'
      });
    }

    // البحث عن الاقتراح
    const suggestion = analysis.suggestions.id(suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الاقتراح'
      });
    }

    // تحديد كمكتمل
    suggestion.completed = true;
    suggestion.completedAt = new Date();

    await analysis.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديد الاقتراح كمكتمل',
      data: suggestion
    });
  } catch (error) {
    console.error('Error in completeSuggestion:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الاقتراح',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات التقدم
 * GET /api/profile-analysis/progress
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // الحصول على أول وآخر تحليل
    const [firstAnalysis, latestAnalysis] = await Promise.all([
      ProfileAnalysis.findOne({ userId }).sort({ analyzedAt: 1 }),
      ProfileAnalysis.findOne({ userId }).sort({ analyzedAt: -1 })
    ]);

    if (!firstAnalysis || !latestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد بيانات كافية لحساب التقدم'
      });
    }

    // حساب التحسن
    const completenessImprovement = latestAnalysis.completenessScore - firstAnalysis.completenessScore;
    const strengthImprovement = latestAnalysis.strengthScore - firstAnalysis.strengthScore;

    // حساب الاقتراحات المكتملة
    const totalSuggestions = latestAnalysis.suggestions.length;
    const completedSuggestions = latestAnalysis.suggestions.filter(s => s.completed).length;
    const completionRate = totalSuggestions > 0 
      ? Math.round((completedSuggestions / totalSuggestions) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        current: {
          completenessScore: latestAnalysis.completenessScore,
          strengthScore: latestAnalysis.strengthScore,
          analyzedAt: latestAnalysis.analyzedAt
        },
        initial: {
          completenessScore: firstAnalysis.completenessScore,
          strengthScore: firstAnalysis.strengthScore,
          analyzedAt: firstAnalysis.analyzedAt
        },
        improvement: {
          completeness: completenessImprovement,
          strength: strengthImprovement
        },
        suggestions: {
          total: totalSuggestions,
          completed: completedSuggestions,
          completionRate
        }
      }
    });
  } catch (error) {
    console.error('Error in getProgress:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حساب التقدم',
      error: error.message
    });
  }
};

/**
 * مقارنة الملف الشخصي مع ملفات ناجحة
 * GET /api/profile-analysis/compare-with-successful
 */
exports.compareWithSuccessful = async (req, res) => {
  try {
    const user = req.user;

    // التحقق من وجود تخصص
    if (!user.specialization) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد تخصصك أولاً للمقارنة مع ملفات ناجحة'
      });
    }

    // إجراء المقارنة
    const comparison = await compareWithSuccessfulProfiles(user);

    res.status(200).json({
      success: true,
      message: 'تمت المقارنة بنجاح',
      data: comparison
    });
  } catch (error) {
    console.error('Error in compareWithSuccessful:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء المقارنة',
      error: error.message
    });
  }
};

module.exports = exports;
