/**
 * مساعد الخطوط - تطبيق الخطوط المناسبة حسب اللغة
 * Font Utility - Apply appropriate fonts based on language
 */

/**
 * الحصول على كلاس الخط المناسب للعناوين حسب اللغة
 * @param {string} language - اللغة المحددة (ar, en, fr)
 * @returns {string} - كلاس CSS للخط
 */
export const getHeadingFontClass = (language) => {
  switch (language) {
    case 'ar':
      return 'font-heading-ar';
    case 'en':
      return 'font-heading-en';
    case 'fr':
      return 'font-heading-fr';
    default:
      return 'font-heading-ar';
  }
};

/**
 * الحصول على كلاس الخط المناسب للنصوص العادية حسب اللغة
 * @param {string} language - اللغة المحددة (ar, en, fr)
 * @returns {string} - كلاس CSS للخط
 */
export const getBodyFontClass = (language) => {
  switch (language) {
    case 'ar':
      return 'font-body-ar';
    case 'en':
      return 'font-body-en';
    case 'fr':
      return 'font-body-fr';
    default:
      return 'font-body-ar';
  }
};

/**
 * الحصول على خاصية font-family المباشرة حسب اللغة
 * @param {string} language - اللغة المحددة (ar, en, fr)
 * @returns {string} - قيمة font-family
 */
export const getFontFamily = (language) => {
  switch (language) {
    case 'ar':
      return "'Amiri', 'Cairo', serif";
    case 'en':
      return "'Cormorant Garamond', serif";
    case 'fr':
      return "'EB Garamond', serif";
    default:
      return "'Amiri', 'Cairo', serif";
  }
};

/**
 * الحصول على كلاس الخط الشامل (عناوين + نصوص) حسب اللغة
 * @param {string} language - اللغة المحددة (ar, en, fr)
 * @param {boolean} isHeading - هل هو عنوان أم نص عادي
 * @returns {string} - كلاس CSS للخط
 */
export const getFontClass = (language, isHeading = false) => {
  return isHeading ? getHeadingFontClass(language) : getBodyFontClass(language);
};

/**
 * تطبيق الخط على عنصر DOM مباشرة
 * @param {HTMLElement} element - العنصر المراد تطبيق الخط عليه
 * @param {string} language - اللغة المحددة
 */
export const applyFontToElement = (element, language) => {
  if (!element) return;
  
  const fontFamily = getFontFamily(language);
  element.style.setProperty('font-family', fontFamily, 'important');
  
  // تطبيق على جميع العناصر الفرعية
  const childElements = element.querySelectorAll('*');
  childElements.forEach(child => {
    child.style.setProperty('font-family', fontFamily, 'important');
  });
};

/**
 * تطبيق الخط على جميع عناصر الصفحة
 * @param {string} language - اللغة المحددة
 */
export const applyFontGlobally = (language) => {
  const fontFamily = getFontFamily(language);
  
  // تطبيق على العناصر الأساسية
  document.documentElement.style.setProperty('font-family', fontFamily, 'important');
  document.body.style.setProperty('font-family', fontFamily, 'important');
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.style.setProperty('font-family', fontFamily, 'important');
  }
  
  // تطبيق على جميع العناصر الموجودة
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    element.style.setProperty('font-family', fontFamily, 'important');
  });
};