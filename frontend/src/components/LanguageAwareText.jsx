import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * مكون النص الذكي - يطبق الخط المناسب حسب اللغة تلقائياً
 * Language Aware Text Component - Automatically applies appropriate font based on language
 */
const LanguageAwareText = ({ 
  children, 
  className = '', 
  isHeading = false, 
  style = {}, 
  ...props 
}) => {
  const { language } = useAuth();
  
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

  const combinedStyle = {
    fontFamily: getFontFamily(),
    ...style
  };

  const combinedClassName = `${getFontClass()} ${className}`;

  return (
    <span className={combinedClassName} style={combinedStyle} {...props}>
      {children}
    </span>
  );
};

/**
 * مكون العنوان الذكي
 */
export const LanguageAwareHeading = ({ children, className = '', style = {}, ...props }) => (
  <LanguageAwareText 
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
export const LanguageAwareBody = ({ children, className = '', style = {}, ...props }) => (
  <LanguageAwareText 
    isHeading={false} 
    className={className} 
    style={style} 
    {...props}
  >
    {children}
  </LanguageAwareText>
);

export default LanguageAwareText;