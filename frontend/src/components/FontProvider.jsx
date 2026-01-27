import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFontClass } from '../utils/fontUtils';

/**
 * مزود الخطوط - يطبق الخطوط المناسبة على الجسم الرئيسي للصفحة
 * Font Provider - Applies appropriate fonts to the main body
 */
const FontProvider = ({ children }) => {
  const { language } = useAuth();

  useEffect(() => {
    // تطبيق الخط على الجسم الرئيسي للصفحة
    const bodyFontClass = getFontClass(language, false);
    
    // إزالة جميع كلاسات الخطوط السابقة
    document.body.classList.remove(
      'font-body-ar', 'font-body-en', 'font-body-fr',
      'font-heading-ar', 'font-heading-en', 'font-heading-fr'
    );
    
    // إضافة الكلاس الجديد
    document.body.classList.add(bodyFontClass);
    
    // تطبيق الخط مباشرة على الجسم
    const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif" :
                      language === 'en' ? "'Cormorant Garamond', serif" :
                      "'EB Garamond', serif";
    
    document.body.style.fontFamily = fontFamily;
    
  }, [language]);

  return <>{children}</>;
};

export default FontProvider;