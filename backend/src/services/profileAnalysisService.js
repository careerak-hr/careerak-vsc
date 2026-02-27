/**
 * Profile Analysis Service
 * خدمة تحليل الملف الشخصي الشامل
 * 
 * Features:
 * - حساب درجة اكتمال الملف (0-100%)
 * - تحليل نقاط القوة والضعف
 * - توليد اقتراحات محددة للتحسين
 * - تحديد فجوات المهارات
 * - تتبع التقدم بمرور الوقت
 */

const { Individual } = require('../models/User');

/**
 * حساب درجة اكتمال الملف الشخصي
 * @param {Object} user - كائن المستخدم
 * @returns {Object} - { score, details }
 */
const calculateCompletenessScore = (user) => {
  const fields = {
    // معلومات أساسية (20%)
    basic: {
      weight: 20,
      fields: ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'gender', 'birthDate']
    },
    // التعليم (15%)
    education: {
      weight: 15,
      fields: ['educationList']
    },
    // الخبرة (20%)
    experience: {
      weight: 20,
      fields: ['experienceList']
    },
    // المهارات (20%)
    skills: {
      weight: 20,
      fields: ['computerSkills', 'softwareSkills', 'languages', 'otherSkills']
    },
    // التدريب (10%)
    training: {
      weight: 10,
      fields: ['trainingList']
    },
    // معلومات إضافية (15%)
    additional: {
      weight: 15,
      fields: ['specialization', 'interests', 'bio', 'cvFile', 'profileImage']
    }
  };

  const scores = {};
  let totalScore = 0;

  Object.keys(fields).forEach(category => {
    const { weight, fields: fieldList } = fields[category];
    let filledFields = 0;
    let totalFields = fieldList.length;

    fieldList.forEach(field => {
      const value = user[field];
      
      if (Array.isArray(value)) {
        // للمصفوفات: تحقق من وجود عناصر
        if (value && value.length > 0) {
          filledFields++;
        }
      } else if (typeof value === 'object' && value !== null) {
        // للكائنات: تحقق من وجود خصائص
        if (Object.keys(value).length > 0) {
          filledFields++;
        }
      } else {
        // للقيم البسيطة: تحقق من عدم الفراغ
        if (value !== null && value !== undefined && value !== '') {
          filledFields++;
        }
      }
    });

    const categoryScore = (filledFields / totalFields) * weight;
    scores[category] = {
      score: Math.round(categoryScore),
      filled: filledFields,
      total: totalFields,
      percentage: Math.round((filledFields / totalFields) * 100)
    };
    
    totalScore += categoryScore;
  });

  return {
    score: Math.round(totalScore),
    details: scores,
    level: getCompletenessLevel(Math.round(totalScore))
  };
};

/**
 * تحديد مستوى الاكتمال
 */
const getCompletenessLevel = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'very_poor';
};

/**
 * تحليل نقاط القوة في الملف الشخصي
 */
const analyzeStrengths = (user) => {
  const strengths = [];

  // خبرة واسعة
  if (user.experienceList && user.experienceList.length >= 3) {
    strengths.push({
      category: 'experience',
      title: 'خبرة مهنية واسعة',
      description: `لديك ${user.experienceList.length} وظائف سابقة`,
      impact: 'high'
    });
  }

  // تعليم قوي
  if (user.educationList && user.educationList.length >= 2) {
    strengths.push({
      category: 'education',
      title: 'مؤهلات تعليمية متعددة',
      description: `لديك ${user.educationList.length} مؤهلات تعليمية`,
      impact: 'high'
    });
  }

  // مهارات متنوعة
  const totalSkills = (user.computerSkills?.length || 0) + 
                      (user.softwareSkills?.length || 0) + 
                      (user.otherSkills?.length || 0);
  if (totalSkills >= 5) {
    strengths.push({
      category: 'skills',
      title: 'مهارات متنوعة',
      description: `لديك ${totalSkills} مهارة مختلفة`,
      impact: 'high'
    });
  }

  // لغات متعددة
  if (user.languages && user.languages.length >= 2) {
    strengths.push({
      category: 'languages',
      title: 'متعدد اللغات',
      description: `تتحدث ${user.languages.length} لغات`,
      impact: 'medium'
    });
  }

  // تدريب مستمر
  if (user.trainingList && user.trainingList.length >= 3) {
    strengths.push({
      category: 'training',
      title: 'التطوير المستمر',
      description: `أكملت ${user.trainingList.length} دورات تدريبية`,
      impact: 'medium'
    });
  }

  return strengths;
};

/**
 * تحليل نقاط الضعف والفجوات
 */
const analyzeWeaknesses = (user, completenessScore) => {
  const weaknesses = [];

  // معلومات أساسية ناقصة
  if (completenessScore.details.basic.percentage < 75) {
    weaknesses.push({
      category: 'basic',
      title: 'معلومات أساسية ناقصة',
      description: 'أكمل معلوماتك الشخصية الأساسية',
      impact: 'high',
      missingFields: getMissingBasicFields(user)
    });
  }

  // لا يوجد خبرة
  if (!user.experienceList || user.experienceList.length === 0) {
    weaknesses.push({
      category: 'experience',
      title: 'لا توجد خبرة مهنية',
      description: 'أضف خبراتك المهنية السابقة',
      impact: 'high'
    });
  }

  // لا يوجد تعليم
  if (!user.educationList || user.educationList.length === 0) {
    weaknesses.push({
      category: 'education',
      title: 'لا توجد مؤهلات تعليمية',
      description: 'أضف مؤهلاتك التعليمية',
      impact: 'high'
    });
  }

  // مهارات قليلة
  const totalSkills = (user.computerSkills?.length || 0) + 
                      (user.softwareSkills?.length || 0);
  if (totalSkills < 3) {
    weaknesses.push({
      category: 'skills',
      title: 'مهارات قليلة',
      description: 'أضف المزيد من مهاراتك التقنية',
      impact: 'high'
    });
  }

  // لا يوجد CV
  if (!user.cvFile) {
    weaknesses.push({
      category: 'cv',
      title: 'لا توجد سيرة ذاتية',
      description: 'ارفع سيرتك الذاتية بصيغة PDF',
      impact: 'medium'
    });
  }

  // لا توجد صورة شخصية
  if (!user.profileImage) {
    weaknesses.push({
      category: 'profile',
      title: 'لا توجد صورة شخصية',
      description: 'أضف صورة شخصية احترافية',
      impact: 'low'
    });
  }

  return weaknesses;
};

/**
 * الحصول على الحقول الأساسية المفقودة
 */
const getMissingBasicFields = (user) => {
  const basicFields = {
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    country: 'الدولة',
    city: 'المدينة',
    gender: 'الجنس',
    birthDate: 'تاريخ الميلاد'
  };

  const missing = [];
  Object.keys(basicFields).forEach(field => {
    if (!user[field] || user[field] === '') {
      missing.push({
        field,
        label: basicFields[field]
      });
    }
  });

  return missing;
};

/**
 * توليد اقتراحات محددة للتحسين
 */
const generateSuggestions = (user, completenessScore, weaknesses) => {
  const suggestions = [];

  // اقتراحات بناءً على نقاط الضعف
  weaknesses.forEach(weakness => {
    suggestions.push({
      category: weakness.category,
      priority: weakness.impact,
      title: weakness.title,
      description: weakness.description,
      action: getActionForWeakness(weakness),
      estimatedImpact: calculateImpact(weakness.impact)
    });
  });

  // اقتراحات إضافية
  if (completenessScore.score < 100) {
    // اقتراح إضافة تخصص
    if (!user.specialization) {
      suggestions.push({
        category: 'specialization',
        priority: 'medium',
        title: 'حدد تخصصك',
        description: 'إضافة تخصصك يساعد في الحصول على وظائف مناسبة',
        action: 'أضف تخصصك المهني',
        estimatedImpact: 15
      });
    }

    // اقتراح إضافة اهتمامات
    if (!user.interests || user.interests.length === 0) {
      suggestions.push({
        category: 'interests',
        priority: 'low',
        title: 'أضف اهتماماتك',
        description: 'الاهتمامات تساعد في إيجاد فرص مناسبة',
        action: 'أضف 3-5 اهتمامات على الأقل',
        estimatedImpact: 10
      });
    }

    // اقتراح إضافة نبذة
    if (!user.bio || user.bio.length < 50) {
      suggestions.push({
        category: 'bio',
        priority: 'medium',
        title: 'اكتب نبذة عنك',
        description: 'نبذة جيدة تزيد من فرص التوظيف بنسبة 40%',
        action: 'اكتب نبذة مختصرة (100-200 كلمة)',
        estimatedImpact: 20
      });
    }
  }

  // ترتيب حسب الأولوية
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * الحصول على الإجراء المطلوب لنقطة ضعف
 */
const getActionForWeakness = (weakness) => {
  const actions = {
    basic: 'انتقل إلى الإعدادات وأكمل معلوماتك الأساسية',
    experience: 'أضف خبراتك المهنية من صفحة الملف الشخصي',
    education: 'أضف مؤهلاتك التعليمية من صفحة الملف الشخصي',
    skills: 'أضف مهاراتك التقنية والبرمجية',
    cv: 'ارفع سيرتك الذاتية بصيغة PDF',
    profile: 'أضف صورة شخصية احترافية'
  };

  return actions[weakness.category] || 'أكمل هذا القسم';
};

/**
 * حساب التأثير المتوقع
 */
const calculateImpact = (priority) => {
  const impacts = {
    high: 30,
    medium: 20,
    low: 10
  };

  return impacts[priority] || 10;
};

/**
 * تحليل شامل للملف الشخصي
 */
const analyzeProfile = async (userId) => {
  try {
    const user = await Individual.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // حساب درجة الاكتمال
    const completenessScore = calculateCompletenessScore(user);

    // تحليل نقاط القوة
    const strengths = analyzeStrengths(user);

    // تحليل نقاط الضعف
    const weaknesses = analyzeWeaknesses(user, completenessScore);

    // توليد الاقتراحات
    const suggestions = generateSuggestions(user, completenessScore, weaknesses);

    // حساب درجة القوة الإجمالية
    const strengthScore = calculateStrengthScore(strengths, weaknesses);

    return {
      userId: user._id,
      completenessScore: completenessScore.score,
      completenessLevel: completenessScore.level,
      completenessDetails: completenessScore.details,
      strengthScore,
      strengths,
      weaknesses,
      suggestions,
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('Error analyzing profile:', error);
    throw error;
  }
};

/**
 * حساب درجة القوة الإجمالية
 */
const calculateStrengthScore = (strengths, weaknesses) => {
  const strengthPoints = strengths.reduce((sum, s) => {
    return sum + (s.impact === 'high' ? 20 : 10);
  }, 0);

  const weaknessPoints = weaknesses.reduce((sum, w) => {
    return sum + (w.impact === 'high' ? 15 : w.impact === 'medium' ? 10 : 5);
  }, 0);

  const score = Math.max(0, Math.min(100, 50 + strengthPoints - weaknessPoints));
  return Math.round(score);
};

/**
 * مقارنة الملف الشخصي مع ملفات ناجحة في نفس المجال
 * @param {Object} user - المستخدم الحالي
 * @returns {Object} - نتائج المقارنة
 */
const compareWithSuccessfulProfiles = async (user) => {
  try {
    // البحث عن مستخدمين ناجحين في نفس التخصص
    const successfulProfiles = await Individual.find({
      _id: { $ne: user._id }, // استبعاد المستخدم الحالي
      specialization: user.specialization,
      $or: [
        { 'experienceList.2': { $exists: true } }, // لديهم 3+ خبرات
        { 'educationList.1': { $exists: true } }   // لديهم 2+ مؤهلات
      ]
    })
    .select('firstName lastName specialization experienceList educationList computerSkills softwareSkills languages trainingList')
    .limit(50); // أخذ عينة من 50 ملف ناجح

    if (successfulProfiles.length === 0) {
      return {
        hasComparison: false,
        message: 'لا توجد ملفات ناجحة كافية للمقارنة في تخصصك'
      };
    }

    // حساب المتوسطات للملفات الناجحة
    const averages = calculateAverages(successfulProfiles);

    // مقارنة المستخدم مع المتوسطات
    const comparison = {
      hasComparison: true,
      totalSuccessfulProfiles: successfulProfiles.length,
      
      experience: {
        user: user.experienceList?.length || 0,
        average: averages.experience,
        status: getComparisonStatus(user.experienceList?.length || 0, averages.experience),
        recommendation: getExperienceRecommendation(user.experienceList?.length || 0, averages.experience)
      },
      
      education: {
        user: user.educationList?.length || 0,
        average: averages.education,
        status: getComparisonStatus(user.educationList?.length || 0, averages.education),
        recommendation: getEducationRecommendation(user.educationList?.length || 0, averages.education)
      },
      
      skills: {
        user: (user.computerSkills?.length || 0) + (user.softwareSkills?.length || 0),
        average: averages.skills,
        status: getComparisonStatus(
          (user.computerSkills?.length || 0) + (user.softwareSkills?.length || 0),
          averages.skills
        ),
        recommendation: getSkillsRecommendation(
          (user.computerSkills?.length || 0) + (user.softwareSkills?.length || 0),
          averages.skills
        )
      },
      
      languages: {
        user: user.languages?.length || 0,
        average: averages.languages,
        status: getComparisonStatus(user.languages?.length || 0, averages.languages),
        recommendation: getLanguagesRecommendation(user.languages?.length || 0, averages.languages)
      },
      
      training: {
        user: user.trainingList?.length || 0,
        average: averages.training,
        status: getComparisonStatus(user.trainingList?.length || 0, averages.training),
        recommendation: getTrainingRecommendation(user.trainingList?.length || 0, averages.training)
      },
      
      // المهارات الأكثر شيوعاً بين الناجحين
      topSkills: getTopSkills(successfulProfiles),
      
      // المهارات المفقودة لدى المستخدم
      missingSkills: getMissingSkills(user, successfulProfiles),
      
      // التقييم الإجمالي
      overallScore: calculateOverallComparisonScore(user, averages)
    };

    return comparison;
  } catch (error) {
    console.error('Error comparing with successful profiles:', error);
    return {
      hasComparison: false,
      error: 'حدث خطأ أثناء المقارنة'
    };
  }
};

/**
 * حساب المتوسطات للملفات الناجحة
 */
const calculateAverages = (profiles) => {
  const totals = profiles.reduce((acc, profile) => {
    return {
      experience: acc.experience + (profile.experienceList?.length || 0),
      education: acc.education + (profile.educationList?.length || 0),
      skills: acc.skills + ((profile.computerSkills?.length || 0) + (profile.softwareSkills?.length || 0)),
      languages: acc.languages + (profile.languages?.length || 0),
      training: acc.training + (profile.trainingList?.length || 0)
    };
  }, { experience: 0, education: 0, skills: 0, languages: 0, training: 0 });

  const count = profiles.length;
  return {
    experience: Math.round((totals.experience / count) * 10) / 10,
    education: Math.round((totals.education / count) * 10) / 10,
    skills: Math.round((totals.skills / count) * 10) / 10,
    languages: Math.round((totals.languages / count) * 10) / 10,
    training: Math.round((totals.training / count) * 10) / 10
  };
};

/**
 * تحديد حالة المقارنة
 */
const getComparisonStatus = (userValue, averageValue) => {
  const ratio = userValue / averageValue;
  if (ratio >= 1.2) return 'excellent'; // أعلى بـ 20%+
  if (ratio >= 0.9) return 'good';      // قريب من المتوسط
  if (ratio >= 0.6) return 'fair';      // أقل قليلاً
  return 'needs_improvement';           // أقل بكثير
};

/**
 * توصيات الخبرة
 */
const getExperienceRecommendation = (userValue, averageValue) => {
  if (userValue >= averageValue) {
    return 'خبرتك المهنية ممتازة مقارنة بالناجحين في مجالك';
  }
  const diff = Math.ceil(averageValue - userValue);
  return `أضف ${diff} خبرة${diff > 1 ? ' أخرى' : ''} على الأقل لتصل للمتوسط`;
};

/**
 * توصيات التعليم
 */
const getEducationRecommendation = (userValue, averageValue) => {
  if (userValue >= averageValue) {
    return 'مؤهلاتك التعليمية جيدة مقارنة بالناجحين';
  }
  const diff = Math.ceil(averageValue - userValue);
  return `أضف ${diff} مؤهل${diff > 1 ? ' آخر' : ''} (دبلوم، شهادة، إلخ)`;
};

/**
 * توصيات المهارات
 */
const getSkillsRecommendation = (userValue, averageValue) => {
  if (userValue >= averageValue) {
    return 'مهاراتك التقنية ممتازة';
  }
  const diff = Math.ceil(averageValue - userValue);
  return `أضف ${diff} مهارة${diff > 1 ? ' أخرى' : ''} تقنية على الأقل`;
};

/**
 * توصيات اللغات
 */
const getLanguagesRecommendation = (userValue, averageValue) => {
  if (userValue >= averageValue) {
    return 'إتقانك للغات جيد';
  }
  const diff = Math.ceil(averageValue - userValue);
  return `تعلم ${diff} لغة${diff > 1 ? ' أخرى' : ''} لتحسين فرصك`;
};

/**
 * توصيات التدريب
 */
const getTrainingRecommendation = (userValue, averageValue) => {
  if (userValue >= averageValue) {
    return 'دوراتك التدريبية ممتازة';
  }
  const diff = Math.ceil(averageValue - userValue);
  return `أكمل ${diff} دورة${diff > 1 ? ' أخرى' : ''} تدريبية على الأقل`;
};

/**
 * الحصول على أكثر المهارات شيوعاً
 */
const getTopSkills = (profiles) => {
  const skillsCount = {};
  
  profiles.forEach(profile => {
    const allSkills = [
      ...(profile.computerSkills || []),
      ...(profile.softwareSkills || [])
    ];
    
    allSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      skillsCount[skillLower] = (skillsCount[skillLower] || 0) + 1;
    });
  });

  // ترتيب حسب الشيوعية
  const sorted = Object.entries(skillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / profiles.length) * 100)
    }));

  return sorted;
};

/**
 * الحصول على المهارات المفقودة
 */
const getMissingSkills = (user, profiles) => {
  const userSkills = [
    ...(user.computerSkills || []),
    ...(user.softwareSkills || [])
  ].map(s => s.toLowerCase());

  const topSkills = getTopSkills(profiles);
  
  // المهارات الشائعة التي لا يمتلكها المستخدم
  const missing = topSkills
    .filter(({ skill, percentage }) => 
      !userSkills.includes(skill) && percentage >= 30 // شائعة بنسبة 30%+
    )
    .slice(0, 5)
    .map(({ skill, percentage }) => ({
      skill,
      popularity: percentage,
      priority: percentage >= 50 ? 'high' : 'medium'
    }));

  return missing;
};

/**
 * حساب النتيجة الإجمالية للمقارنة
 */
const calculateOverallComparisonScore = (user, averages) => {
  const scores = [
    Math.min(100, ((user.experienceList?.length || 0) / averages.experience) * 100),
    Math.min(100, ((user.educationList?.length || 0) / averages.education) * 100),
    Math.min(100, (((user.computerSkills?.length || 0) + (user.softwareSkills?.length || 0)) / averages.skills) * 100),
    Math.min(100, ((user.languages?.length || 0) / averages.languages) * 100),
    Math.min(100, ((user.trainingList?.length || 0) / averages.training) * 100)
  ];

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
};

module.exports = {
  calculateCompletenessScore,
  analyzeStrengths,
  analyzeWeaknesses,
  generateSuggestions,
  analyzeProfile,
  compareWithSuccessfulProfiles
};
