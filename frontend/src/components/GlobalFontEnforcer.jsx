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
    
    // CSS قوي جداً لفرض الخطوط على جميع العناصر
    styleElement.textContent = `
      /* فرض الخط على جميع العناصر بأقوى طريقة ممكنة */
      *, *::before, *::after,
      html, body, #root,
      div, span, p, h1, h2, h3, h4, h5, h6,
      input, textarea, select, button, label,
      ul, ol, li, table, th, td, tr,
      form, fieldset, legend, a, strong, em, i, b,
      .modal, .popup, .dialog, .tooltip,
      [class*="font-"], [class*="text-"],
      [class*="css-"], [class*="emotion-"], [class*="styled-"],
      [role="button"], [role="dialog"], [role="menu"] {
        font-family: ${fontFamily} !important;
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
    
    // تطبيق مباشر على العناصر الموجودة
    const applyFontToElements = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        element.style.setProperty('font-family', fontFamily, 'important');
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
            
            // تطبيق على جميع العناصر الفرعية
            const childElements = node.querySelectorAll('*');
            childElements.forEach(child => {
              child.style.setProperty('font-family', fontFamily, 'important');
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