import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * مكون إجبار الخطوط العالمي
 * يضمن تطبيق الخط الصحيح على جميع عناصر التطبيق حسب اللغة المختارة
 */
const GlobalFontEnforcer = () => {
  const { language } = useApp();

  useEffect(() => {
    // تحديد الخط المناسب حسب اللغة
    let fontFamily;
    switch (language) {
      case 'ar':
        fontFamily = '"Amiri", "Cairo", serif';
        break;
      case 'fr':
        fontFamily = '"EB Garamond", serif';
        break;
      case 'en':
      default:
        fontFamily = '"Cormorant Garamond", serif';
        break;
    }

    // تطبيق الخط على العناصر الأساسية
    const applyFont = () => {
      // تطبيق على html و body
      document.documentElement.style.fontFamily = fontFamily;
      document.body.style.fontFamily = fontFamily;
      
      // تطبيق على root
      const root = document.getElementById('root');
      if (root) {
        root.style.fontFamily = fontFamily;
      }

      // تطبيق على جميع العناصر
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        element.style.fontFamily = fontFamily;
      });

      // تطبيق على العناصر الديناميكية (modals, popups, tooltips)
      const dynamicSelectors = [
        '.modal', '.popup', '.dialog', '.tooltip',
        '.dropdown', '.menu', '.overlay',
        '[role="dialog"]', '[role="menu"]', '[role="tooltip"]',
        '[role="popup"]', '[role="alert"]', '[role="alertdialog"]',
        '.MuiDialog-root', '.MuiPopover-root', '.MuiMenu-root',
        '.ant-modal', '.ant-popover', '.ant-dropdown',
        '[class*="Modal"]', '[class*="Popup"]', '[class*="Dialog"]'
      ];

      dynamicSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.fontFamily = fontFamily;
          // تطبيق على جميع الأطفال أيضاً
          const children = element.querySelectorAll('*');
          children.forEach(child => {
            child.style.fontFamily = fontFamily;
          });
        });
      });

      // تطبيق على عناصر النماذج
      const formElements = document.querySelectorAll(
        'input, textarea, select, button, label, option'
      );
      formElements.forEach(element => {
        element.style.fontFamily = fontFamily;
      });

      // تطبيق على العناصر النصية
      const textElements = document.querySelectorAll(
        'p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th'
      );
      textElements.forEach(element => {
        element.style.fontFamily = fontFamily;
      });
    };

    // تطبيق الخط فوراً
    applyFont();

    // إعادة تطبيق الخط عند إضافة عناصر جديدة
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              node.style.fontFamily = fontFamily;
              // تطبيق على جميع الأطفال
              const children = node.querySelectorAll('*');
              children.forEach(child => {
                child.style.fontFamily = fontFamily;
              });
            }
          });
        }
      });
    });

    // مراقبة التغييرات في DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // تطبيق الخط بشكل دوري للتأكد
    const intervalId = setInterval(applyFont, 1000);

    // تنظيف
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [language]);

  // تطبيق lang attribute على html
  useEffect(() => {
    document.documentElement.lang = language;
    document.body.lang = language;
  }, [language]);

  return null;
};

export default GlobalFontEnforcer;
