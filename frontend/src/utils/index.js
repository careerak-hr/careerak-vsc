// تصدير أدوات الخطوط
export { 
  getHeadingFontClass, 
  getBodyFontClass, 
  getFontFamily, 
  getFontClass,
  applyFontToElement,
  applyFontGlobally
} from './fontUtils';

// تصدير أدوات اختبار الخطوط (للتطوير فقط)
export { 
  testFontApplication, 
  testExpectedFonts, 
  generateFontReport 
} from './fontTester';

// تصدير أدوات اختبار النظام الصوتي (للتطوير فقط)
export {
  runAudioSystemTest,
  testLoginScenario,
  startAudioMonitoring
} from './audioTester';

// تصدير مدير الخروج من التطبيق
export { default as appExitManager } from './appExitManager';

// تصدير أدوات اختبار نظام الخروج (للتطوير فقط)
export {
  runExitSystemTest,
  simulateAgeCheckScenario,
  testGoodbyePageCreation,
  showExitSystemInfo
} from './exitTester';

// تصدير أدوات اختبار تحليل السيرة الذاتية (للتطوير فقط)
export {
  generateMockCVData,
  simulateCVAnalysis,
  testDataMerging,
  runCVAnalysisTest,
  testDifferentFileTypes
} from './cvAnalyzerTester';

// تصدير أدوات تحسين النصوص البديلة لـ SEO
export {
  generateSEOAltText,
  validateSEOAltText,
  optimizeAltTextForSEO,
  auditImagesForSEO,
  logSEOAuditResults,
  SEOAltTextTemplates
} from './seoAltTextOptimizer';

// تصدير توصيات تحسين النصوص البديلة
export {
  imageAltTextRecommendations,
  generateOptimizationReport,
  seoAltTextBestPractices,
  quickReferenceGuide
} from './optimizeAllImageAltText';

// تصدير الأدوات الأخرى
export { default as resetSettings } from './resetSettings';