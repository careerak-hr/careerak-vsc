/**
 * أداة اختبار الخطوط - للتحقق من تطبيق الخطوط بشكل صحيح
 * Font Tester Utility - To verify fonts are applied correctly
 */

/**
 * اختبار تطبيق الخطوط على العناصر
 * @param {string} language - اللغة المراد اختبارها
 */
export const testFontApplication = (language = 'ar') => {
  console.log(`🔍 اختبار تطبيق الخطوط للغة: ${language}`);
  
  // اختبار العناصر الأساسية
  const elementsToTest = [
    document.documentElement,
    document.body,
    document.getElementById('root')
  ];
  
  elementsToTest.forEach((element, index) => {
    if (element) {
      const computedStyle = getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      console.log(`📝 العنصر ${index + 1}: ${fontFamily}`);
    }
  });
  
  // اختبار عينة من العناصر
  const sampleElements = document.querySelectorAll('div, span, p, h1, h2, h3, button, input');
  const sampleSize = Math.min(5, sampleElements.length);
  
  console.log(`🎯 اختبار عينة من ${sampleSize} عناصر:`);
  for (let i = 0; i < sampleSize; i++) {
    const element = sampleElements[i];
    const computedStyle = getComputedStyle(element);
    const fontFamily = computedStyle.fontFamily;
    console.log(`   ${element.tagName}: ${fontFamily}`);
  }
};

/**
 * اختبار الخطوط المتوقعة حسب اللغة
 * @param {string} language - اللغة
 */
export const testExpectedFonts = (language = 'ar') => {
  const expectedFonts = {
    ar: 'Amiri',
    en: 'Cormorant Garamond',
    fr: 'EB Garamond'
  };
  
  const expectedFont = expectedFonts[language] || expectedFonts.ar;
  console.log(`🎯 الخط المتوقع للغة ${language}: ${expectedFont}`);
  
  // اختبار الجسم الرئيسي
  const bodyFont = getComputedStyle(document.body).fontFamily;
  const isCorrect = bodyFont.includes(expectedFont);
  
  console.log(`📊 خط الجسم الحالي: ${bodyFont}`);
  console.log(`✅ هل الخط صحيح؟ ${isCorrect ? 'نعم' : 'لا'}`);
  
  return isCorrect;
};

/**
 * تقرير شامل عن حالة الخطوط
 */
export const generateFontReport = () => {
  console.log('📋 تقرير شامل عن حالة الخطوط:');
  console.log('=====================================');
  
  // معلومات أساسية
  const bodyFont = getComputedStyle(document.body).fontFamily;
  const rootFont = getComputedStyle(document.documentElement).fontFamily;
  
  console.log(`🏠 خط الجسم: ${bodyFont}`);
  console.log(`🌐 خط الجذر: ${rootFont}`);
  
  // إحصائيات العناصر
  const allElements = document.querySelectorAll('*');
  const fontCounts = {};
  
  allElements.forEach(element => {
    const font = getComputedStyle(element).fontFamily;
    fontCounts[font] = (fontCounts[font] || 0) + 1;
  });
  
  console.log('📊 إحصائيات الخطوط:');
  Object.entries(fontCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([font, count]) => {
      console.log(`   ${font}: ${count} عنصر`);
    });
  
  console.log('=====================================');
};

// تصدير للاستخدام في وحدة تحكم المتصفح
if (typeof window !== 'undefined') {
  window.fontTester = {
    test: testFontApplication,
    expected: testExpectedFonts,
    report: generateFontReport
  };
  
  console.log('🛠️ أدوات اختبار الخطوط متاحة في window.fontTester');
  console.log('   - window.fontTester.test("ar") - اختبار الخطوط');
  console.log('   - window.fontTester.expected("ar") - اختبار الخط المتوقع');
  console.log('   - window.fontTester.report() - تقرير شامل');
}