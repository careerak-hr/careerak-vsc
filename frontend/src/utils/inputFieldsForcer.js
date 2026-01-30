/**
 * مُجبر حقول الإدخال - يضمن عمل جميع الحقول برمجياً
 * Input Fields Forcer - Ensures all input fields work programmatically
 */

/**
 * إجبار حقل إدخال واحد على العمل
 * Force a single input field to work
 */
export const forceInputField = (element) => {
  if (!element) return;
  
  // إجبار الخصائص الأساسية
  element.style.pointerEvents = 'auto';
  element.style.touchAction = 'manipulation';
  element.style.webkitUserSelect = 'text';
  element.style.userSelect = 'text';
  element.style.cursor = element.tagName.toLowerCase() === 'select' ? 'pointer' : 'text';
  element.style.zIndex = '9999';
  element.style.position = 'relative';
  element.style.isolation = 'isolate';
  element.style.opacity = '1';
  element.style.visibility = 'visible';
  element.style.display = 'block';
  
  // إزالة أي تأثيرات قد تعيق التفاعل
  element.style.transform = 'none';
  element.style.filter = 'none';
  element.style.backdropFilter = 'none';
  
  // ضمان الخط المناسب
  element.style.fontSize = '16px';
  element.style.lineHeight = '1.4';
  
  // إضافة مستمعي الأحداث لضمان التفاعل
  element.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    e.stopPropagation();
    element.focus();
  }, { passive: true });
  
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    element.focus();
  });
  
  // إضافة خصائص إضافية للأجهزة المحمولة
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    element.style.webkitTouchCallout = 'default';
    element.style.webkitTextSizeAdjust = '100%';
    element.style.textSizeAdjust = '100%';
  }
  
  // إضافة خصائص خاصة بـ iOS
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    element.style.webkitUserModify = 'read-write';
  }
};

/**
 * إجبار جميع حقول الإدخال في الصفحة على العمل
 * Force all input fields on the page to work
 */
export const forceAllInputFields = () => {
  // البحث عن جميع حقول الإدخال
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
    '[class*="field"]'
  ];
  
  inputSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(forceInputField);
  });
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
 * إجبار حقول الإدخال عند تحميل الصفحة
 * Force input fields on page load
 */
export const initializeInputFieldsForcer = () => {
  // إجبار الحقول الموجودة
  forceAllInputFields();
  
  // بدء مراقبة الحقول الجديدة
  const observer = startInputFieldsObserver();
  
  // إعادة إجبار الحقول كل ثانية للتأكد
  const interval = setInterval(() => {
    forceAllInputFields();
  }, 1000);
  
  // إجبار الحقول عند تغيير حجم النافذة
  window.addEventListener('resize', forceAllInputFields);
  
  // إجبار الحقول عند التركيز على النافذة
  window.addEventListener('focus', forceAllInputFields);
  
  // إجبار الحقول عند النقر في أي مكان
  document.addEventListener('click', forceAllInputFields);
  
  // إجبار الحقول عند اللمس
  document.addEventListener('touchstart', forceAllInputFields, { passive: true });
  
  console.log('🔧 Input Fields Forcer initialized - جميع حقول الإدخال مُجبرة على العمل');
  
  return {
    observer,
    interval,
    cleanup: () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('resize', forceAllInputFields);
      window.removeEventListener('focus', forceAllInputFields);
      document.removeEventListener('click', forceAllInputFields);
      document.removeEventListener('touchstart', forceAllInputFields);
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