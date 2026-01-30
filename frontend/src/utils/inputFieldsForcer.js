/**
 * مُجبر حقول الإدخال - يضمن عمل جميع الحقول برمجياً
 * Input Fields Forcer - Ensures all input fields work programmatically
 */

/**
 * إجبار حقل إدخال واحد على العمل - نسخة محدثة وأقوى
 * Force a single input field to work - Updated and stronger version
 */
export const forceInputField = (element) => {
  if (!element) return;
  
  // إجبار الخصائص الأساسية بقوة مضاعفة
  element.style.setProperty('pointer-events', 'auto', 'important');
  element.style.setProperty('touch-action', 'manipulation', 'important');
  element.style.setProperty('-webkit-user-select', 'text', 'important');
  element.style.setProperty('user-select', 'text', 'important');
  element.style.setProperty('cursor', element.tagName.toLowerCase() === 'select' ? 'pointer' : 'text', 'important');
  element.style.setProperty('z-index', '999999', 'important');
  element.style.setProperty('position', 'relative', 'important');
  element.style.setProperty('isolation', 'isolate', 'important');
  element.style.setProperty('opacity', '1', 'important');
  element.style.setProperty('visibility', 'visible', 'important');
  element.style.setProperty('display', 'block', 'important');
  
  // إزالة أي تأثيرات قد تعيق التفاعل
  element.style.setProperty('transform', 'none', 'important');
  element.style.setProperty('filter', 'none', 'important');
  element.style.setProperty('backdrop-filter', 'none', 'important');
  element.style.setProperty('clip', 'auto', 'important');
  element.style.setProperty('clip-path', 'none', 'important');
  element.style.setProperty('mask', 'none', 'important');
  element.style.setProperty('-webkit-mask', 'none', 'important');
  element.style.setProperty('overflow', 'visible', 'important');
  
  // ضمان الخط المناسب
  element.style.setProperty('font-size', '16px', 'important');
  element.style.setProperty('line-height', '1.4', 'important');
  
  // إزالة خاصية disabled و readonly إذا كانت موجودة
  element.disabled = false;
  element.readOnly = false;
  
  // إضافة خصائص HTML
  element.setAttribute('data-input-forced', 'true');
  
  // إضافة مستمعي الأحداث لضمان التفاعل
  const events = ['touchstart', 'touchend', 'click', 'focus', 'mousedown', 'mouseup'];
  
  events.forEach(eventType => {
    element.addEventListener(eventType, (e) => {
      e.stopPropagation();
      
      // إعادة تطبيق الخصائص عند كل حدث
      element.style.setProperty('pointer-events', 'auto', 'important');
      element.style.setProperty('z-index', '999999', 'important');
      
      if (eventType === 'touchend' || eventType === 'click') {
        setTimeout(() => {
          element.focus();
        }, 10);
      }
    }, { passive: false, capture: true });
  });
  
  // إضافة خصائص إضافية للأجهزة المحمولة
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    element.style.setProperty('-webkit-touch-callout', 'default', 'important');
    element.style.setProperty('-webkit-text-size-adjust', '100%', 'important');
    element.style.setProperty('text-size-adjust', '100%', 'important');
  }
  
  // إضافة خصائص خاصة بـ iOS
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    element.style.setProperty('-webkit-user-modify', 'read-write', 'important');
  }
  
  // إجبار التركيز إذا كان الحقل مخفياً
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.pointerEvents === 'none' || computedStyle.visibility === 'hidden') {
    // إعادة تطبيق الخصائص بقوة
    setTimeout(() => forceInputField(element), 100);
  }
};

/**
 * إجبار جميع حقول الإدخال في الصفحة على العمل - نسخة محدثة
 * Force all input fields on the page to work - Updated version
 */
export const forceAllInputFields = () => {
  // البحث عن جميع حقول الإدخال بطرق متعددة
  const inputSelectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="password"]',
    'input[type="tel"]',
    'input[type="date"]',
    'input[type="number"]',
    'textarea',
    'select',
    '.auth-input',
    '.auth-select',
    '[class*="input"]',
    '[class*="field"]',
    '[class*="auth"]'
  ];
  
  // إجبار الحقول باستخدام كل selector
  inputSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
          forceInputField(element);
        }
      });
    } catch (e) {
      console.warn(`Error forcing fields with selector ${selector}:`, e);
    }
  });
  
  // البحث عن الحقول بطريقة مختلفة - جميع العناصر
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      forceInputField(element);
    }
  });
  
  // إجبار خاص للحقول داخل الـ forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(forceInputField);
  });
  
  console.log('🔧 All input fields forced to work - تم إجبار جميع الحقول على العمل');
};

/**
 * مراقب الطفرات لإجبار الحقول الجديدة على العمل
 * Mutation observer to force new fields to work
 */
export const startInputFieldsObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // فحص العقدة نفسها
          if (node.matches && (
            node.matches('input') || 
            node.matches('textarea') || 
            node.matches('select') ||
            node.matches('.auth-input') ||
            node.matches('.auth-select')
          )) {
            forceInputField(node);
          }
          
          // فحص العقد الفرعية
          const inputs = node.querySelectorAll('input, textarea, select, .auth-input, .auth-select');
          inputs.forEach(forceInputField);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * إجبار حقول الإدخال عند تحميل الصفحة - نسخة محدثة وأقوى
 * Force input fields on page load - Updated and stronger version
 */
export const initializeInputFieldsForcer = () => {
  console.log('🚀 Initializing ULTIMATE Input Fields Forcer...');
  
  // إجبار الحقول الموجودة فوراً
  forceAllInputFields();
  
  // بدء مراقبة الحقول الجديدة
  const observer = startInputFieldsObserver();
  
  // إعادة إجبار الحقول كل نصف ثانية للتأكد المطلق
  const interval = setInterval(() => {
    forceAllInputFields();
  }, 500);
  
  // إجبار الحقول عند تغيير حجم النافذة
  const resizeHandler = () => {
    setTimeout(forceAllInputFields, 100);
  };
  window.addEventListener('resize', resizeHandler);
  
  // إجبار الحقول عند التركيز على النافذة
  const focusHandler = () => {
    setTimeout(forceAllInputFields, 50);
  };
  window.addEventListener('focus', focusHandler);
  
  // إجبار الحقول عند النقر في أي مكان
  const clickHandler = (e) => {
    setTimeout(forceAllInputFields, 10);
    
    // إذا كان النقر على حقل إدخال، أجبره فوراً
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
      forceInputField(e.target);
    }
  };
  document.addEventListener('click', clickHandler, true);
  
  // إجبار الحقول عند اللمس
  const touchHandler = (e) => {
    setTimeout(forceAllInputFields, 10);
    
    // إذا كان اللمس على حقل إدخال، أجبره فوراً
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
      forceInputField(e.target);
    }
  };
  document.addEventListener('touchstart', touchHandler, { passive: true, capture: true });
  
  // إجبار الحقول عند تحميل المحتوى
  const loadHandler = () => {
    setTimeout(forceAllInputFields, 100);
  };
  window.addEventListener('load', loadHandler);
  document.addEventListener('DOMContentLoaded', loadHandler);
  
  // إجبار الحقول عند تغيير التاريخ/الوقت (للحقول الديناميكية)
  const intervalForcer = setInterval(() => {
    // فحص إضافي للحقول المخفية أو المعطلة
    const hiddenInputs = document.querySelectorAll('input[style*="pointer-events: none"], input[style*="visibility: hidden"], select[style*="pointer-events: none"], textarea[style*="pointer-events: none"]');
    hiddenInputs.forEach(forceInputField);
  }, 1000);
  
  console.log('🔧 ULTIMATE Input Fields Forcer initialized - جميع حقول الإدخال مُجبرة على العمل بقوة مضاعفة');
  
  return {
    observer,
    interval,
    intervalForcer,
    cleanup: () => {
      observer.disconnect();
      clearInterval(interval);
      clearInterval(intervalForcer);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('focus', focusHandler);
      document.removeEventListener('click', clickHandler, true);
      document.removeEventListener('touchstart', touchHandler);
      window.removeEventListener('load', loadHandler);
      document.removeEventListener('DOMContentLoaded', loadHandler);
      console.log('🛑 Input Fields Forcer cleaned up');
    }
  };
};

/**
 * إصلاح طارئ لحقل معين
 * Emergency fix for a specific field
 */
export const emergencyFixField = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (field) {
    forceInputField(field);
    
    // إضافة مستمع خاص للحقل
    const fixField = () => forceInputField(field);
    field.addEventListener('focus', fixField);
    field.addEventListener('blur', fixField);
    field.addEventListener('click', fixField);
    field.addEventListener('touchstart', fixField, { passive: true });
    
    console.log(`🚨 Emergency fix applied to field: ${fieldId}`);
  }
};

// تصدير افتراضي
export default {
  forceInputField,
  forceAllInputFields,
  startInputFieldsObserver,
  initializeInputFieldsForcer,
  emergencyFixField
};