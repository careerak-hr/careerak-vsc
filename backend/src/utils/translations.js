/**
 * 🌍 Translations Utility
 * نظام الترجمة المركزي لدعم العربية والإنجليزية
 * 
 * يوفر ترجمات لجميع الرسائل في نظام التوصيات الذكية
 */

const translations = {
  // ===== رسائل عامة =====
  general: {
    success: {
      ar: 'تم بنجاح',
      en: 'Success'
    },
    error: {
      ar: 'حدث خطأ',
      en: 'An error occurred'
    },
    notFound: {
      ar: 'غير موجود',
      en: 'Not found'
    },
    invalidRequest: {
      ar: 'طلب غير صالح',
      en: 'Invalid request'
    }
  },

  // ===== رسائل المستخدم =====
  user: {
    notFound: {
      ar: 'المستخدم غير موجود',
      en: 'User not found'
    },
    profileIncomplete: {
      ar: 'الملف الشخصي غير مكتمل',
      en: 'Profile incomplete'
    }
  },

  // ===== رسائل الوظائف =====
  job: {
    notFound: {
      ar: 'الوظيفة غير موجودة',
      en: 'Job not found'
    },
    noJobsAvailable: {
      ar: 'لا توجد وظائف متاحة حالياً',
      en: 'No jobs available at the moment'
    }
  },

  // ===== رسائل التوصيات =====
  recommendations: {
    generated: {
      ar: 'تم توليد التوصيات بنجاح',
      en: 'Recommendations generated successfully'
    },
    error: {
      ar: 'حدث خطأ في توليد التوصيات',
      en: 'Error generating recommendations'
    },
    noRecommendations: {
      ar: 'لا توجد توصيات متاحة',
      en: 'No recommendations available'
    },
    saved: {
      ar: 'تم جلب التوصيات المحفوظة',
      en: 'Saved recommendations retrieved'
    },
    newGenerated: {
      ar: 'تم توليد توصيات جديدة',
      en: 'New recommendations generated'
    },
    errorSaved: {
      ar: 'حدث خطأ في جلب التوصيات المحفوظة',
      en: 'Error retrieving saved recommendations'
    }
  },

  // ===== رسائل التطابق =====
  match: {
    calculated: {
      ar: 'تم حساب درجة التطابق بنجاح',
      en: 'Match score calculated successfully'
    },
    error: {
      ar: 'حدث خطأ في حساب درجة التطابق',
      en: 'Error calculating match score'
    }
  },

  // ===== رسائل تحليل الملف الشخصي =====
  profile: {
    analyzed: {
      ar: 'تم تحليل الملف الشخصي بنجاح',
      en: 'Profile analyzed successfully'
    },
    error: {
      ar: 'حدث خطأ في تحليل الملف الشخصي',
      en: 'Error analyzing profile'
    }
  },

  // ===== رسائل التفاعل =====
  feedback: {
    recorded: {
      ar: 'تم تسجيل التفاعل بنجاح',
      en: 'Feedback recorded successfully'
    },
    error: {
      ar: 'حدث خطأ في تسجيل التفاعل',
      en: 'Error recording feedback'
    }
  },

  // ===== رسائل فجوات المهارات =====
  skillGaps: {
    analyzed: {
      ar: 'تم تحليل فجوات المهارات بنجاح',
      en: 'Skill gaps analyzed successfully'
    },
    error: {
      ar: 'حدث خطأ في تحليل فجوات المهارات',
      en: 'Error analyzing skill gaps'
    },
    noTargetJobs: {
      ar: 'لا توجد وظائف متاحة للتحليل',
      en: 'No jobs available for analysis'
    }
  },

  // ===== رسائل توصيات الدورات =====
  courses: {
    generated: {
      ar: 'تم توليد توصيات الدورات بنجاح',
      en: 'Course recommendations generated successfully'
    },
    quickGenerated: {
      ar: 'تم توليد توصيات سريعة للدورات',
      en: 'Quick course recommendations generated'
    },
    default: {
      ar: 'توصيات الدورات العامة',
      en: 'General course recommendations'
    },
    error: {
      ar: 'حدث خطأ في جلب توصيات الدورات',
      en: 'Error retrieving course recommendations'
    },
    noTargetJobs: {
      ar: 'لم يتم العثور على وظائف مستهدفة',
      en: 'No target jobs found'
    }
  },

  // ===== رسائل فلترة المرشحين =====
  candidates: {
    filtered: {
      ar: 'تم العثور على {count} مرشح مطابق',
      en: 'Found {count} matching candidates'
    },
    noMatches: {
      ar: 'لم يتم العثور على مرشحين مطابقين للمعايير المحددة',
      en: 'No candidates found matching the specified criteria'
    },
    error: {
      ar: 'حدث خطأ في فلترة المرشحين',
      en: 'Error filtering candidates'
    },
    missingCriteria: {
      ar: 'يجب تحديد معيار واحد على الأقل للفلترة (jobId، skills، minExperience، أو location)',
      en: 'At least one filter criterion must be specified (jobId, skills, minExperience, or location)'
    }
  },

  // ===== رسائل الإشعارات =====
  notifications: {
    sent: {
      ar: 'تم إرسال {count} إشعار فوري بنجاح',
      en: '{count} notifications sent successfully'
    },
    noMatches: {
      ar: 'لم يتم العثور على مستخدمين بتطابق أعلى من {score}%',
      en: 'No users found with match score above {score}%'
    },
    noActiveUsers: {
      ar: 'لا يوجد مستخدمون نشطون',
      en: 'No active users'
    },
    error: {
      ar: 'حدث خطأ في إرسال الإشعارات',
      en: 'Error sending notifications'
    },
    missingJobId: {
      ar: 'يجب تحديد معرف الوظيفة (jobId)',
      en: 'Job ID (jobId) must be specified'
    },
    candidateMatch: {
      ar: 'تم إرسال الإشعار بنجاح',
      en: 'Notification sent successfully'
    },
    missingIds: {
      ar: 'يجب تحديد معرف المرشح (candidateId) ومعرف الوظيفة (jobId)',
      en: 'Candidate ID (candidateId) and Job ID (jobId) must be specified'
    },
    updateSent: {
      ar: 'تم إرسال إشعار التحديث بنجاح',
      en: 'Update notification sent successfully'
    },
    invalidUpdateType: {
      ar: 'نوع تحديث غير صالح',
      en: 'Invalid update type'
    },
    missingUpdateType: {
      ar: 'يجب تحديد نوع التحديث (updateType)',
      en: 'Update type (updateType) must be specified'
    }
  },

  // ===== رسائل الدقة =====
  accuracy: {
    retrieved: {
      ar: 'تم جلب دقة التوصيات بنجاح',
      en: 'Recommendation accuracy retrieved successfully'
    },
    systemRetrieved: {
      ar: 'تم جلب دقة النظام بنجاح',
      en: 'System accuracy retrieved successfully'
    },
    improvementTracked: {
      ar: 'تم تتبع تحسن الدقة بنجاح',
      en: 'Accuracy improvement tracked successfully'
    },
    error: {
      ar: 'حدث خطأ في جلب دقة التوصيات',
      en: 'Error retrieving recommendation accuracy'
    },
    systemError: {
      ar: 'حدث خطأ في جلب دقة النظام',
      en: 'Error retrieving system accuracy'
    },
    improvementError: {
      ar: 'حدث خطأ في تتبع تحسن الدقة',
      en: 'Error tracking accuracy improvement'
    }
  },

  // ===== مستويات اكتمال الملف =====
  profileCompleteness: {
    excellent: {
      ar: 'ممتاز',
      en: 'Excellent'
    },
    good: {
      ar: 'جيد',
      en: 'Good'
    },
    average: {
      ar: 'متوسط',
      en: 'Average'
    },
    poor: {
      ar: 'ضعيف',
      en: 'Poor'
    }
  },

  // ===== أنواع نقاط القوة =====
  strengths: {
    skills: {
      ar: 'لديك مجموعة متنوعة من المهارات',
      en: 'You have a diverse set of skills'
    },
    experience: {
      ar: 'لديك {years} سنوات من الخبرة',
      en: 'You have {years} years of experience'
    },
    education: {
      ar: 'مؤهلك التعليمي ({degree}) قوي',
      en: 'Your educational qualification ({degree}) is strong'
    }
  },

  // ===== مجالات التحسين =====
  improvements: {
    skills: {
      ar: 'يمكنك تحسين فرصك بتعلم هذه المهارات',
      en: 'You can improve your chances by learning these skills'
    },
    experience: {
      ar: 'متوسط الخبرة المطلوبة {avg} سنوات، لديك {current}',
      en: 'Average required experience is {avg} years, you have {current}'
    }
  },

  // ===== اقتراحات الملف الشخصي =====
  profileSuggestions: {
    addSkills: {
      ar: 'أضف 3 مهارات على الأقل لتحسين فرصك',
      en: 'Add at least 3 skills to improve your chances'
    },
    addExperience: {
      ar: 'فكر في مشاريع تطوعية أو تدريب عملي لاكتساب الخبرة',
      en: 'Consider volunteer projects or internships to gain experience'
    },
    addEducation: {
      ar: 'أضف مؤهلك التعليمي لتحسين مصداقية ملفك',
      en: 'Add your educational qualification to improve your profile credibility'
    },
    updateBio: {
      ar: 'أكتب وصفاً شخصياً مختصراً (50 حرف على الأقل)',
      en: 'Write a brief personal description (at least 50 characters)'
    }
  }
};

/**
 * الحصول على ترجمة بناءً على المفتاح واللغة
 * @param {string} key - مفتاح الترجمة (مثل: 'user.notFound')
 * @param {string} lang - اللغة ('ar' أو 'en')
 * @param {object} params - معاملات للاستبدال في النص
 * @returns {string} - النص المترجم
 */
function t(key, lang = 'ar', params = {}) {
  try {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value[k];
      if (!value) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    let text = value[lang] || value.ar || key;
    
    // استبدال المعاملات
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  } catch (error) {
    console.error(`Error getting translation for key: ${key}`, error);
    return key;
  }
}

/**
 * الحصول على كائن ترجمة كامل (عربي وإنجليزي)
 * @param {string} key - مفتاح الترجمة
 * @param {object} params - معاملات للاستبدال
 * @returns {object} - {ar: string, en: string}
 */
function tBoth(key, params = {}) {
  return {
    ar: t(key, 'ar', params),
    en: t(key, 'en', params)
  };
}

/**
 * تحديد اللغة من headers أو query
 * @param {object} req - Express request object
 * @returns {string} - 'ar' أو 'en'
 */
function detectLanguage(req) {
  // من query parameter
  if (req.query && req.query.lang) {
    return req.query.lang === 'en' ? 'en' : 'ar';
  }
  
  // من header
  if (req.headers && req.headers['accept-language']) {
    const lang = req.headers['accept-language'].toLowerCase();
    if (lang.includes('en')) return 'en';
  }
  
  // من body
  if (req.body && req.body.language) {
    return req.body.language === 'en' ? 'en' : 'ar';
  }
  
  // افتراضي: عربي
  return 'ar';
}

module.exports = {
  t,
  tBoth,
  detectLanguage,
  translations
};
