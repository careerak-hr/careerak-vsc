/**
 * CV Parser Controller
 * معالج طلبات تحليل السيرة الذاتية
 */

const cvParserService = require('../services/cvParserService');
const cvQualityAnalyzer = require('../services/cvQualityAnalyzer');
const cvImprovementSuggestions = require('../services/cvImprovementSuggestions');
const User = require('../models/User');

/**
 * تحليل CV مرفوع
 * POST /api/cv/parse
 */
exports.parseCV = async (req, res) => {
  try {
    // التحقق من وجود ملف
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;

    // التحقق من نوع الملف
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOCX, TXT',
      });
    }

    // تحليل CV
    const result = await cvParserService.parseCV(buffer, mimetype);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'فشل تحليل السيرة الذاتية',
        error: result.error,
      });
    }

    // حفظ المعلومات في ملف المستخدم (اختياري)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'cvAnalysis': {
            skills: result.data.skills,
            experience: result.data.experience,
            education: result.data.education,
            totalExperience: result.data.totalExperience,
            analyzedAt: result.data.extractedAt,
          },
        },
      });
    }

    res.json({
      success: true,
      message: 'تم تحليل السيرة الذاتية بنجاح',
      data: result.data,
      stats: result.stats,
    });
  } catch (error) {
    console.error('خطأ في تحليل CV:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحليل السيرة الذاتية',
      error: error.message,
    });
  }
};

/**
 * استخراج المهارات فقط من CV
 * POST /api/cv/extract-skills
 */
exports.extractSkills = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;
    const text = await cvParserService.extractText(buffer, mimetype);
    const skills = cvParserService.extractSkills(text);

    res.json({
      success: true,
      skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('خطأ في استخراج المهارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استخراج المهارات',
      error: error.message,
    });
  }
};

/**
 * استخراج الخبرات فقط من CV
 * POST /api/cv/extract-experience
 */
exports.extractExperience = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;
    const text = await cvParserService.extractText(buffer, mimetype);
    const experience = cvParserService.extractExperience(text);
    const totalExperience = cvParserService.calculateTotalExperience(experience);

    res.json({
      success: true,
      experience,
      totalExperience,
      count: experience.length,
    });
  } catch (error) {
    console.error('خطأ في استخراج الخبرات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استخراج الخبرات',
      error: error.message,
    });
  }
};

/**
 * استخراج التعليم فقط من CV
 * POST /api/cv/extract-education
 */
exports.extractEducation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;
    const text = await cvParserService.extractText(buffer, mimetype);
    const education = cvParserService.extractEducation(text);

    res.json({
      success: true,
      education,
      count: education.length,
    });
  } catch (error) {
    console.error('خطأ في استخراج التعليم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استخراج التعليم',
      error: error.message,
    });
  }
};

/**
 * الحصول على تحليل CV المحفوظ للمستخدم
 * GET /api/cv/analysis
 */
exports.getCVAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cvAnalysis');

    if (!user || !user.cvAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على تحليل سيرة ذاتية',
      });
    }

    res.json({
      success: true,
      data: user.cvAnalysis,
    });
  } catch (error) {
    console.error('خطأ في جلب تحليل CV:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تحليل السيرة الذاتية',
      error: error.message,
    });
  }
};

/**
 * تحليل جودة السيرة الذاتية
 * POST /api/cv/analyze-quality
 * Requirements: 4.3, 4.4
 */
exports.analyzeQuality = async (req, res) => {
  try {
    // التحقق من وجود ملف
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;

    // التحقق من نوع الملف
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOCX, TXT',
      });
    }

    // تحليل CV أولاً
    const parsedCV = await cvParserService.parseCV(buffer, mimetype);

    if (!parsedCV.success) {
      return res.status(500).json({
        success: false,
        message: 'فشل تحليل السيرة الذاتية',
        error: parsedCV.error,
      });
    }

    // تحليل الجودة
    const qualityAnalysis = cvQualityAnalyzer.analyzeQuality(parsedCV);

    // حفظ التحليل في ملف المستخدم (اختياري)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'cvAnalysis': {
            skills: parsedCV.data.skills,
            experience: parsedCV.data.experience,
            education: parsedCV.data.education,
            totalExperience: parsedCV.data.totalExperience,
            analyzedAt: parsedCV.data.extractedAt,
          },
          'cvQualityScore': qualityAnalysis.overallScore,
          'cvQualityAnalysis': qualityAnalysis,
        },
      });
    }

    res.json({
      success: true,
      message: 'تم تحليل جودة السيرة الذاتية بنجاح',
      data: {
        parsed: parsedCV.data,
        stats: parsedCV.stats,
        quality: qualityAnalysis,
      },
    });
  } catch (error) {
    console.error('خطأ في تحليل جودة CV:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحليل جودة السيرة الذاتية',
      error: error.message,
    });
  }
};

/**
 * الحصول على تحليل جودة CV المحفوظ للمستخدم
 * GET /api/cv/quality-analysis
 */
exports.getQualityAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cvQualityAnalysis cvQualityScore');

    if (!user || !user.cvQualityAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على تحليل جودة السيرة الذاتية',
      });
    }

    res.json({
      success: true,
      data: {
        score: user.cvQualityScore,
        analysis: user.cvQualityAnalysis,
      },
    });
  } catch (error) {
    console.error('خطأ في جلب تحليل جودة CV:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تحليل جودة السيرة الذاتية',
      error: error.message,
    });
  }
};

/**
 * الحصول على اقتراحات تحسين السيرة الذاتية
 * POST /api/cv/improvement-suggestions
 * Requirements: 4.3, 4.5
 */
exports.getImprovementSuggestions = async (req, res) => {
  try {
    // التحقق من وجود ملف
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء رفع ملف السيرة الذاتية',
      });
    }

    const { buffer, mimetype } = req.file;

    // التحقق من نوع الملف
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOCX, TXT',
      });
    }

    // تحليل CV أولاً
    const parsedCV = await cvParserService.parseCV(buffer, mimetype);

    if (!parsedCV.success) {
      return res.status(500).json({
        success: false,
        message: 'فشل تحليل السيرة الذاتية',
        error: parsedCV.error,
      });
    }

    // تحليل الجودة
    const qualityAnalysis = cvQualityAnalyzer.analyzeQuality(parsedCV);

    // توليد اقتراحات التحسين
    const improvementSuggestions = cvImprovementSuggestions.generateImprovementSuggestions(
      parsedCV,
      qualityAnalysis
    );

    // حفظ التحليل والاقتراحات في ملف المستخدم (اختياري)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'cvAnalysis': {
            skills: parsedCV.data.skills,
            experience: parsedCV.data.experience,
            education: parsedCV.data.education,
            totalExperience: parsedCV.data.totalExperience,
            analyzedAt: parsedCV.data.extractedAt,
          },
          'cvQualityScore': qualityAnalysis.overallScore,
          'cvQualityAnalysis': qualityAnalysis,
          'cvImprovementSuggestions': improvementSuggestions,
        },
      });
    }

    res.json({
      success: true,
      message: 'تم توليد اقتراحات التحسين بنجاح',
      data: {
        parsed: {
          skills: parsedCV.data.skills,
          experience: parsedCV.data.experience,
          education: parsedCV.data.education,
          totalExperience: parsedCV.data.totalExperience,
        },
        stats: parsedCV.stats,
        quality: {
          overallScore: qualityAnalysis.overallScore,
          rating: qualityAnalysis.rating,
          scores: qualityAnalysis.scores,
        },
        improvements: improvementSuggestions,
      },
    });
  } catch (error) {
    console.error('خطأ في توليد اقتراحات التحسين:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء توليد اقتراحات التحسين',
      error: error.message,
    });
  }
};

/**
 * الحصول على اقتراحات التحسين المحفوظة للمستخدم
 * GET /api/cv/improvement-suggestions
 */
exports.getSavedImprovementSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cvImprovementSuggestions cvQualityScore');

    if (!user || !user.cvImprovementSuggestions) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على اقتراحات تحسين محفوظة',
      });
    }

    res.json({
      success: true,
      data: {
        qualityScore: user.cvQualityScore,
        improvements: user.cvImprovementSuggestions,
      },
    });
  } catch (error) {
    console.error('خطأ في جلب اقتراحات التحسين:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب اقتراحات التحسين',
      error: error.message,
    });
  }
};
