import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFontFamily } from '../utils/fontUtils';

/**
 * مكون فرض الخطوط العالمي - يضمن تطبيق الخطوط على كامل التطبيق
 * Global Font Enforcer - Ensures fonts are applied throughout the entire application
 */
const GlobalFontEnforcer = () => {
  const { language } = useAuth();

  useEffect(() => {
    const fontFamily = getFontFamily(language);
    
    // إنشاء CSS قوي لفرض الخطوط
    const styleId = 'global-font-enforcer';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    // CSS قوي جداً لفرض الخطوط على جميع العناصر مع حماية حقول الإدخال
    styleElement.textContent = `
      /* فرض الخط على جميع العناصر بأقوى طريقة ممكنة */
      *, *::before, *::after,
      html, body, #root,
      div, span, p, h1, h2, h3, h4, h5, h6,
      label, ul, ol, li, table, th, td, tr,
      form, fieldset, legend, a, strong, em, i, b,
      .modal, .popup, .dialog, .tooltip,
      [class*="font-"], [class*="text-"],
      [class*="css-"], [class*="emotion-"], [class*="styled-"],
      [role="button"], [role="dialog"], [role="menu"] {
        font-family: ${fontFamily} !important;
      }
      
      /* فرض خاص لحقول الإدخال مع ضمان عملها */
      input, textarea, select, button {
        font-family: ${fontFamily} !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }
      
      /* فرض خاص للأزرار فقط */
      button, [role="button"] {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* فرض خاص للعناصر المتحركة */
      [class*="animate-"], [class*="transition-"],
      [style*="font-family"], [style*="font"] {
        font-family: ${fontFamily} !important;
      }
      
      /* فرض خاص لعناصر Tailwind */
      .font-sans, .font-serif, .font-mono,
      .prose, .prose * {
        font-family: ${fontFamily} !important;
      }
      
      /* فرض خاص للعناصر المخفية */
      [hidden], [style*="display: none"],
      [style*="visibility: hidden"] {
        font-family: ${fontFamily} !important;
      }
    `;
    
    // تنظيف عند تغيير اللغة
    return () => {
      // observer.disconnect();
      if (styleElement) {
        styleElement.remove();
      }
    };
    
  }, [language]);

  return null; // هذا المكون لا يعرض أي شيء
};

export default GlobalFontEnforcer;