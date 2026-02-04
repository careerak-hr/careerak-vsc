import React, { useEffect, useRef } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

/**
 * مكون النص الذكي - يطبق الخط المناسب حسب اللغة تلقائياً
 * Language Aware Text Component - Automatically applies appropriate font based on language
 */
const LanguageAwareText = ({ 
  children, 
  className = '', 
  isHeading = false, 
  style = {}, 
  as: Component = 'span',
  ...props 
}) => {
  const { language } = useAppSettings(); // Correctly use AppSettingsContext
  const elementRef = useRef(null);
  
  // تحديد الخط المناسب حسب اللغة
  const getFontFamily = () => {
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

  // تحديد كلاس الخط
  const getFontClass = () => {
    const base = language === 'ar' ? 'font-arabic' : 
                 language === 'en' ? 'font-english' : 
                 'font-french';
    
    return isHeading ? `${base} font-bold` : base;
  };

  useEffect(() => {
    // تطبيق الخط مباشرة على العنصر وجميع عناصره الفرعية
    if (elementRef.current) {
      const fontFamily = getFontFamily();
      elementRef.current.style.fontFamily = fontFamily;
      
      // تطبيق على جميع العناصر الفرعية
      const childElements = elementRef.current.querySelectorAll('*');
      childElements.forEach(child => {
        child.style.fontFamily = fontFamily;
      });
    }
  }, [language]);

  const combinedStyle = {
    fontFamily: getFontFamily(),
    ...style
  };

  const combinedClassName = `${getFontClass()} ${className}`;

  return (
    <Component 
      ref={elementRef}
      className={combinedClassName} 
      style={combinedStyle} 
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * مكون العنوان الذكي
 */
export const LanguageAwareHeading = ({ children, className = '', style = {}, as = 'h2', ...props }) => (
  <LanguageAwareText 
    as={as}
    isHeading={true} 
    className={className} 
    style={style} 
    {...props}
  >
    {children}
  </LanguageAwareText>
);

/**
 * مكون النص العادي الذكي
 */
export const LanguageAwareBody = ({ children, className = '', style = {}, as = 'p', ...props }) => (
  <LanguageAwareText 
    as={as}
    isHeading={false} 
    className={className} 
    style={style} 
    {...props}
  >
    {children}
  </LanguageAwareText>
);

export default LanguageAwareText;
