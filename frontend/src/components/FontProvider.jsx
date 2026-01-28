import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFontClass, applyFontGlobally } from '../utils/fontUtils';

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
      'font-heading-ar', 'font-heading-en', 'font-heading-fr',
      'font-arabic', 'font-english', 'font-french'
    );
    
    // إضافة الكلاس الجديد
    document.body.classList.add(bodyFontClass);
    
    // تطبيق الخط على جميع عناصر الصفحة
    applyFontGlobally(language);
    
  }, [language]);

  return <>{children}</>;
};

export default FontProvider;