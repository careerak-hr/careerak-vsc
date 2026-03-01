/**
 * 🌍 Translations System - أمثلة عملية
 * 
 * هذا الملف يحتوي على أمثلة عملية لاستخدام نظام الترجمة
 */

const { t, tBoth, detectLanguage } = require('../src/utils/translations');

console.log('🌍 Translations System - أمثلة عملية\n');
console.log('='.repeat(60));

// ===== مثال 1: ترجمة بسيطة =====
console.log('\n📝 مثال 1: ترجمة بسيطة');
console.log('-'.repeat(60));

const arabicMessage = t('user.notFound', 'ar');
const englishMessage = t('user.notFound', 'en');

console.log('عربي:', arabicMessage);
console.log('English:', englishMessage);

// ===== مثال 2: ترجمة مع معاملات =====
console.log('\n📝 مثال 2: ترجمة مع معاملات');
console.log('-'.repeat(60));

const count = 5;
const arabicWithParams = t('candidates.filtered', 'ar', { count });
const englishWithParams = t('candidates.filtered', 'en', { count });

console.log('عربي:', arabicWithParams);
console.log('English:', englishWithParams);

// ===== مثال 3: ترجمة مع معاملات متعددة =====
console.log('\n📝 مثال 3: ترجمة مع معاملات متعددة');
console.log('-'.repeat(60));

const years = 3;
const arabicExperience = t('strengths.experience', 'ar', { years });
const englishExperience = t('strengths.experience', 'en', { years });

console.log('عربي:', arabicExperience);
console.log('English:', englishExperience);

// ===== مثال 4: الحصول على كلا اللغتين =====
console.log('\n📝 مثال 4: الحصول على كلا اللغتين');
console.log('-'.repeat(60));

const bothLanguages = tBoth('recommendations.generated');
console.log('Both:', JSON.stringify(bothLanguages, null, 2));

// ===== مثال 5: كشف اللغة من query =====
console.log('\n📝 مثال 5: كشف اللغة من query');
console.log('-'.repeat(60));

const reqWithQuery = { query: { lang: 'en' }, headers: {}, body: {} };
const detectedLang1 = detectLanguage(reqWithQuery);
console.log('Detected from query:', detectedLang1);

// ===== مثال 6: كشف اللغة من header =====
console.log('\n📝 مثال 6: كشف اللغة من header');
console.log('-'.repeat(60));

const reqWithHeader = { 
  query: {}, 
  headers: { 'accept-language': 'en-US,en;q=0.9' }, 
  body: {} 
};
const detectedLang2 = detectLanguage(reqWithHeader);
console.log('Detected from header:', detectedLang2);

// ===== مثال 7: كشف اللغة من body =====
console.log('\n📝 مثال 7: كشف اللغة من body');
console.log('-'.repeat(60));

const reqWithBody = { 
  query: {}, 
  headers: {}, 
  body: { language: 'en' } 
};
const detectedLang3 = detectLanguage(reqWithBody);
console.log('Detected from body:', detectedLang3);

// ===== مثال 8: اللغة الافتراضية =====
console.log('\n📝 مثال 8: اللغة الافتراضية');
console.log('-'.repeat(60));

const reqEmpty = { query: {}, headers: {}, body: {} };
const detectedLang4 = detectLanguage(reqEmpty);
console.log('Default language:', detectedLang4);

// ===== مثال 9: استخدام في Controller =====
console.log('\n📝 مثال 9: استخدام في Controller');
console.log('-'.repeat(60));

function exampleController(req, res) {
  const lang = detectLanguage(req);
  
  // محاكاة response
  const response = {
    success: true,
    message: t('recommendations.generated', lang),
    data: {
      count: 10,
      recommendations: []
    }
  };
  
  return response;
}

const mockReq1 = { query: { lang: 'ar' }, headers: {}, body: {} };
const mockReq2 = { query: { lang: 'en' }, headers: {}, body: {} };

console.log('Arabic response:', JSON.stringify(exampleController(mockReq1, {}), null, 2));
console.log('\nEnglish response:', JSON.stringify(exampleController(mockReq2, {}), null, 2));

// ===== مثال 10: رسائل الخطأ =====
console.log('\n📝 مثال 10: رسائل الخطأ');
console.log('-'.repeat(60));

const errorMessages = {
  ar: {
    userNotFound: t('user.notFound', 'ar'),
    jobNotFound: t('job.notFound', 'ar'),
    recommendationsError: t('recommendations.error', 'ar')
  },
  en: {
    userNotFound: t('user.notFound', 'en'),
    jobNotFound: t('job.notFound', 'en'),
    recommendationsError: t('recommendations.error', 'en')
  }
};

console.log('Error messages:', JSON.stringify(errorMessages, null, 2));

// ===== مثال 11: رسائل النجاح =====
console.log('\n📝 مثال 11: رسائل النجاح');
console.log('-'.repeat(60));

const successMessages = {
  ar: {
    recommendationsGenerated: t('recommendations.generated', 'ar'),
    matchCalculated: t('match.calculated', 'ar'),
    profileAnalyzed: t('profile.analyzed', 'ar')
  },
  en: {
    recommendationsGenerated: t('recommendations.generated', 'en'),
    matchCalculated: t('match.calculated', 'en'),
    profileAnalyzed: t('profile.analyzed', 'en')
  }
};

console.log('Success messages:', JSON.stringify(successMessages, null, 2));

// ===== مثال 12: رسائل الإشعارات =====
console.log('\n📝 مثال 12: رسائل الإشعارات');
console.log('-'.repeat(60));

const notificationCount = 10;
const notificationMessages = {
  ar: t('notifications.sent', 'ar', { count: notificationCount }),
  en: t('notifications.sent', 'en', { count: notificationCount })
};

console.log('Notification messages:', JSON.stringify(notificationMessages, null, 2));

// ===== مثال 13: مستويات اكتمال الملف =====
console.log('\n📝 مثال 13: مستويات اكتمال الملف');
console.log('-'.repeat(60));

const completenessLevels = {
  ar: {
    excellent: t('profileCompleteness.excellent', 'ar'),
    good: t('profileCompleteness.good', 'ar'),
    average: t('profileCompleteness.average', 'ar'),
    poor: t('profileCompleteness.poor', 'ar')
  },
  en: {
    excellent: t('profileCompleteness.excellent', 'en'),
    good: t('profileCompleteness.good', 'en'),
    average: t('profileCompleteness.average', 'en'),
    poor: t('profileCompleteness.poor', 'en')
  }
};

console.log('Completeness levels:', JSON.stringify(completenessLevels, null, 2));

// ===== مثال 14: اقتراحات الملف الشخصي =====
console.log('\n📝 مثال 14: اقتراحات الملف الشخصي');
console.log('-'.repeat(60));

const profileSuggestions = {
  ar: [
    t('profileSuggestions.addSkills', 'ar'),
    t('profileSuggestions.addExperience', 'ar'),
    t('profileSuggestions.addEducation', 'ar'),
    t('profileSuggestions.updateBio', 'ar')
  ],
  en: [
    t('profileSuggestions.addSkills', 'en'),
    t('profileSuggestions.addExperience', 'en'),
    t('profileSuggestions.addEducation', 'en'),
    t('profileSuggestions.updateBio', 'en')
  ]
};

console.log('Profile suggestions:', JSON.stringify(profileSuggestions, null, 2));

// ===== مثال 15: سيناريو كامل =====
console.log('\n📝 مثال 15: سيناريو كامل - API Response');
console.log('-'.repeat(60));

function getRecommendationsAPI(req) {
  const lang = detectLanguage(req);
  
  // محاكاة بيانات
  const recommendations = [
    { id: 1, title: 'مطور ويب', matchScore: 85 },
    { id: 2, title: 'مصمم واجهات', matchScore: 78 }
  ];
  
  return {
    success: true,
    message: t('recommendations.generated', lang),
    data: {
      recommendations,
      total: recommendations.length,
      metadata: {
        generatedAt: new Date().toISOString(),
        language: lang
      }
    }
  };
}

const arabicRequest = { query: { lang: 'ar' }, headers: {}, body: {} };
const englishRequest = { query: { lang: 'en' }, headers: {}, body: {} };

console.log('\nArabic API Response:');
console.log(JSON.stringify(getRecommendationsAPI(arabicRequest), null, 2));

console.log('\nEnglish API Response:');
console.log(JSON.stringify(getRecommendationsAPI(englishRequest), null, 2));

// ===== الخلاصة =====
console.log('\n' + '='.repeat(60));
console.log('✅ جميع الأمثلة تعمل بنجاح!');
console.log('='.repeat(60));
