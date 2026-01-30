/**
 * مُجبر طارئ لحقول الإدخال - التدخل المباشر في DOM
 * Emergency Input Fields Forcer - Direct DOM Intervention
 */

/**
 * إجبار طارئ لحقل واحد - يتجاوز جميع القيود
 */
export const emergencyForceField = (element) => {
  if (!element) return;
  
  // إزالة جميع الخصائص المقيدة
  element.removeAttribute('disabled');
  element.removeAttribute('readonly');
  element.disabled = false;
  element.readOnly = false;
  
  // إجبار الخصائص بطرق متعددة
  const forceProperty = (prop, value) => {
    try {
      element.style[prop] = value;
      element.style.setProperty(prop, value, 'important');
      element.setAttribute('style', element.getAttribute('style') + `; ${prop}: ${value} !important;`);
    } catch (e) {
      console.warn(`Could not set ${prop}:`, e);
    }
  };
  
  // تطبيق الخصائص الأساسية
  forceProperty('pointer-events', 'auto');
  forceProperty('touch-action', 'manipulation');
  forceProperty('-webkit-user-select', 'text');
  forceProperty('user-select', 'text');
  forceProperty('cursor', element.tagName.toLowerCase() === 'select' ? 'pointer' : 'text');
  forceProperty('z-index', '2147483647');
  forceProperty('position', 'relative');
  forceProperty('isolation', 'isolate');
  forceProperty('opacity', '1');
  forceProperty('visibility', 'visible');
  forceProperty('display', 'block');
  
  // إزالة التأثيرات المقيدة
  forceProperty('transform', 'none');
  forceProperty('filter', 'none');
  forceProperty('backdrop-filter', 'none');
  forceProperty('clip', 'auto');
  forceProperty('clip-path', 'none');
  forceProperty('mask', 'none');
  forceProperty('-webkit-mask', 'none');
  forceProperty('overflow', 'visible');
  
  // إضافة كلاسات CSS مخصصة
  element.classList.add('emergency-forced-input');
  element.setAttribute('data-emergency-forced', 'true');
  
  // إضافة مستمعي أحداث قوية
  const forceEvents = ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'focus', 'blur'];
  
  forceEvents.forEach(eventType => {
    element.addEventListener(eventType, function(e) {
      // إعادة تطبيق الخصائص عند كل حدث
      this.style.setProperty('pointer-events', 'auto', 'important');
      this.style.setProperty('z-index', '2147483647', 'important');
      this.disabled = false;
      this.readOnly = false;
      
      if (eventType === 'click' || eventType === 'touchend') {
        setTimeout(() => {
          this.focus();
        }, 10);
      }
    }, { passive: false, capture: true });
  });
  
  // مراقب خاص للحقل
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly') {
          element.disabled = false;
          element.readOnly = false;
        }
        if (mutation.attributeName === 'style') {
          emergencyForceField(element);
        }
      }
    });
  });
  
  observer.observe(element, {
    attributes: true,
    attributeFilter: ['disabled', 'readonly', 'style', 'class']
  });
  
  // حفظ المراقب في الحقل للتنظيف لاحقاً
  element._emergencyObserver = observer;
};

/**
 * إجبار طارئ لجميع الحقول
 */
export const emergencyForceAllFields = () => {
  // البحث الشامل عن جميع الحقول
  const allInputs = document.querySelectorAll('input, textarea, select');
  allInputs.forEach(emergencyForceField);
  
  // البحث بالكلاسات
  const classSelectors = ['.auth-input', '.auth-select', '[class*="input"]', '[class*="field"]'];
  classSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
          emergencyForceField(element);
        }
      });
    } catch (e) {
      console.warn(`Error with selector ${selector}:`, e);
    }
  });
  
  console.log('🚨 Emergency force applied to all fields - تم تطبيق الإجبار الطارئ على جميع الحقول');
};

/**
 * مراقب طارئ للحقول الجديدة
 */
export const startEmergencyObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // فحص العقدة نفسها
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT') {
            emergencyForceField(node);
          }
          
          // فحص العقد الفرعية
          const inputs = node.querySelectorAll('input, textarea, select');
          inputs.forEach(emergencyForceField);
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
 * تشغيل النظام الطارئ
 */
export const initializeEmergencySystem = () => {
  console.log('🚨 Initializing EMERGENCY Input Fields System...');
  
  // تطبيق الإجبار الطارئ فوراً
  emergencyForceAllFields();
  
  // بدء المراقبة الطارئة
  const observer = startEmergencyObserver();
  
  // إعادة تطبيق الإجبار كل 200ms
  const rapidInterval = setInterval(emergencyForceAllFields, 200);
  
  // مراقبة تغييرات الـ DOM
  const domObserver = new MutationObserver(() => {
    setTimeout(emergencyForceAllFields, 10);
  });
  
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'disabled', 'readonly']
  });
  
  // إضافة CSS طارئ مباشرة
  const emergencyStyle = document.createElement('style');
  emergencyStyle.id = 'emergency-input-fix';
  emergencyStyle.textContent = `
    .emergency-forced-input {
      pointer-events: auto !important;
      touch-action: manipulation !important;
      -webkit-user-select: text !important;
      user-select: text !important;
      z-index: 2147483647 !important;
      position: relative !important;
      opacity: 1 !important;
      visibility: visible !important;
      cursor: text !important;
    }
    
    select.emergency-forced-input {
      cursor: pointer !important;
    }
    
    input, textarea, select {
      pointer-events: auto !important;
      z-index: 2147483647 !important;
    }
  `;
  
  if (!document.getElementById('emergency-input-fix')) {
    document.head.appendChild(emergencyStyle);
  }
  
  console.log('🚨 EMERGENCY System activated - النظام الطارئ مُفعل');
  
  return {
    observer,
    domObserver,
    rapidInterval,
    cleanup: () => {
      observer.disconnect();
      domObserver.disconnect();
      clearInterval(rapidInterval);
      
      // تنظيف المراقبين من الحقول
      document.querySelectorAll('[data-emergency-forced="true"]').forEach(element => {
        if (element._emergencyObserver) {
          element._emergencyObserver.disconnect();
        }
      });
      
      // إزالة الـ CSS الطارئ
      const style = document.getElementById('emergency-input-fix');
      if (style) {
        style.remove();
      }
      
      console.log('🛑 Emergency system cleaned up');
    }
  };
};

/**
 * إصلاح فوري لحقل معين
 */
export const instantFieldFix = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (field) {
    emergencyForceField(field);
    
    // إضافة مراقبة خاصة
    const checkField = () => {
      if (field.style.pointerEvents === 'none' || field.disabled || field.readOnly) {
        emergencyForceField(field);
      }
    };
    
    setInterval(checkField, 100);
    
    console.log(`🚨 Instant fix applied to field: ${fieldId}`);
  }
};

// تصدير افتراضي
export default {
  emergencyForceField,
  emergencyForceAllFields,
  startEmergencyObserver,
  initializeEmergencySystem,
  instantFieldFix
};