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
    
    // تطبيق مباشر على العناصر الموجودة مع حماية حقول الإدخال
    const applyFontToElements = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        element.style.setProperty('font-family', fontFamily, 'important');
        
        // ضمان عمل حقول الإدخال
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.style.setProperty('-webkit-user-select', 'text', 'important');
          element.style.setProperty('-moz-user-select', 'text', 'important');
          element.style.setProperty('-ms-user-select', 'text', 'important');
          element.style.setProperty('user-select', 'text', 'important');
          element.style.setProperty('pointer-events', 'auto', 'important');
          element.style.setProperty('touch-action', 'manipulation', 'important');
        }
      });
    };
    
    // تطبيق فوري
    applyFontToElements();
    
    // مراقب للعناصر الجديدة
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // تطبيق على العنصر الجديد
            node.style.setProperty('font-family', fontFamily, 'important');
            
            // ضمان عمل حقول الإدخال الجديدة
            if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
              node.style.setProperty('-webkit-user-select', 'text', 'important');
              node.style.setProperty('-moz-user-select', 'text', 'important');
              node.style.setProperty('-ms-user-select', 'text', 'important');
              node.style.setProperty('user-select', 'text', 'important');
              node.style.setProperty('pointer-events', 'auto', 'important');
              node.style.setProperty('touch-action', 'manipulation', 'important');
            }
            
            // تطبيق على جميع العناصر الفرعية
            const childElements = node.querySelectorAll('*');
            childElements.forEach(child => {
              child.style.setProperty('font-family', fontFamily, 'important');
              
              // ضمان عمل حقول الإدخال الفرعية
              if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA') {
                child.style.setProperty('-webkit-user-select', 'text', 'important');
                child.style.setProperty('-moz-user-select', 'text', 'important');
                child.style.setProperty('-ms-user-select', 'text', 'important');
                child.style.setProperty('user-select', 'text', 'important');
                child.style.setProperty('pointer-events', 'auto', 'important');
                child.style.setProperty('touch-action', 'manipulation', 'important');
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // تنظيف عند تغيير اللغة
    return () => {
      observer.disconnect();
    };
    
  }, [language]);

  return null; // هذا المكون لا يعرض أي شيء
};

export default GlobalFontEnforcer;