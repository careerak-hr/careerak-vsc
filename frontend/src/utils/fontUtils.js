/**
 * دوال مساعدة للخطوط
 * Font Utility Functions
 * توفر دوال لتطبيق الخطوط برمجياً على العناصر
 */

/**
 * الحصول على الخط المناسب حسب اللغة
 * @param {string} language - اللغة (ar, en, fr)
 * @returns {string} - اسم الخط
 */
export const getFontFamily = (language) => {
  switch (language) {
    case 'ar':
      return '"Amiri", "Cairo", serif';
    case 'fr':
      return '"EB Garamond", serif';
    case 'en':
    default:
      return '"Cormorant Garamond", serif';
  }
};

/**
 * تطبيق الخط على عنصر محدد
 * @param {HTMLElement} element - العنصر المراد تطبيق الخط عليه
 * @param {string} language - اللغة
 */
export const applyFontToElement = (element, language) => {
  if (!element) return;
  
  const fontFamily = getFontFamily(language);
  element.style.fontFamily = fontFamily;
  
  // تطبيق على جميع الأطفال
  const children = element.querySelectorAll('*');
  children.forEach(child => {
    child.style.fontFamily = fontFamily;
  });
};

/**
 * تطبيق الخط على جميع العناصر في الصفحة
 * @param {string} language - اللغة
 */
export const applyFontToAll = (language) => {
  const fontFamily = getFontFamily(language);
  
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
};

/**
 * تطبيق الخط على عناصر محددة بواسطة selector
 * @param {string} selector - CSS selector
 * @param {string} language - اللغة
 */
export const applyFontToSelector = (selector, language) => {
  const fontFamily = getFontFamily(language);
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.style.fontFamily = fontFamily;
    // تطبيق على جميع الأطفال
    const children = element.querySelectorAll('*');
    children.forEach(child => {
      child.style.fontFamily = fontFamily;
    });
  });
};

/**
 * إنشاء style tag عالمي لتطبيق الخط
 * @param {string} language - اللغة
 * @returns {HTMLStyleElement} - عنصر style
 */
export const createGlobalFontStyle = (language) => {
  const fontFamily = getFontFamily(language);
  const styleId = 'global-font-style';
  
  // إزالة style القديم إن وجد
  const oldStyle = document.getElementById(styleId);
  if (oldStyle) {
    oldStyle.remove();
  }
  
  // إنشاء style جديد
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    * {
      font-family: ${fontFamily} !important;
    }
    
    html, body, #root {
      font-family: ${fontFamily} !important;
    }
    
    input, textarea, select, button, option, label {
      font-family: ${fontFamily} !important;
    }
    
    .modal, .popup, .dialog, .tooltip, .dropdown, .menu {
      font-family: ${fontFamily} !important;
    }
    
    [role="dialog"], [role="menu"], [role="tooltip"], [role="alert"] {
      font-family: ${fontFamily} !important;
    }
  `;
  
  document.head.appendChild(style);
  return style;
};

/**
 * مراقبة التغييرات في DOM وتطبيق الخط على العناصر الجديدة
 * @param {string} language - اللغة
 * @returns {MutationObserver} - المراقب
 */
export const observeDOMChanges = (language) => {
  const fontFamily = getFontFamily(language);
  
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
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * تطبيق الخط على العناصر الديناميكية (modals, popups, etc.)
 * @param {string} language - اللغة
 */
export const applyFontToDynamicElements = (language) => {
  const fontFamily = getFontFamily(language);
  
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
      // تطبيق على جميع الأطفال
      const children = element.querySelectorAll('*');
      children.forEach(child => {
        child.style.fontFamily = fontFamily;
      });
    });
  });
};

/**
 * تطبيق lang attribute على html
 * @param {string} language - اللغة
 */
export const applyLangAttribute = (language) => {
  document.documentElement.lang = language;
  document.body.lang = language;
};

/**
 * تطبيق الخط بشكل شامل (يجمع جميع الدوال)
 * @param {string} language - اللغة
 */
export const applyFontComprehensive = (language) => {
  applyFontToAll(language);
  applyFontToDynamicElements(language);
  applyLangAttribute(language);
  createGlobalFontStyle(language);
};

export default {
  getFontFamily,
  applyFontToElement,
  applyFontToAll,
  applyFontToSelector,
  createGlobalFontStyle,
  observeDOMChanges,
  applyFontToDynamicElements,
  applyLangAttribute,
  applyFontComprehensive
};
