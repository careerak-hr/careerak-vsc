/**
 * إصلاح عام لحقول الإدخال - يعمل على جميع الصفحات
 * Global Input Fields Fix - Works on all pages
 */

import { initializeInputFieldsForcer } from './inputFieldsForcer';
import { initializeEmergencySystem } from './inputFieldsEmergencyForcer';
import { runQuickInputTest, startContinuousMonitoring } from './quickInputTest';

/**
 * تشغيل النظام العام لإصلاح حقول الإدخال
 */
export const initializeGlobalInputFieldsFix = () => {
  console.log('🌍 Initializing GLOBAL Input Fields Fix System...');
  
  // تشغيل النظام الأساسي
  const forcer = initializeInputFieldsForcer();
  
  // تشغيل النظام الطارئ
  const emergency = initializeEmergencySystem();
  
  // بدء المراقبة المستمرة
  const monitoring = startContinuousMonitoring();
  
  // تشغيل اختبار سريع بعد ثانيتين
  setTimeout(() => {
    runQuickInputTest();
  }, 2000);
  
  // إضافة CSS عام مباشرة إلى الـ head
  const globalStyle = document.createElement('style');
  globalStyle.id = 'global-input-fix';
  globalStyle.textContent = `
    /* إصلاح عام لجميع حقول الإدخال */
    input, textarea, select {
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
    
    select {
      cursor: pointer !important;
    }
    
    /* إزالة أي قيود */
    input:disabled, textarea:disabled, select:disabled {
      pointer-events: auto !important;
      opacity: 1 !important;
    }
    
    input[readonly], textarea[readonly] {
      pointer-events: auto !important;
      cursor: text !important;
    }
    
    /* إصلاح للحقول داخل أي عنصر */
    * input, * textarea, * select {
      pointer-events: auto !important;
      z-index: 2147483647 !important;
    }
  `;
  
  if (!document.getElementById('global-input-fix')) {
    document.head.appendChild(globalStyle);
  }
  
  // مراقبة تغييرات الصفحة
  const pageObserver = new MutationObserver(() => {
    setTimeout(() => {
      // إعادة تطبيق الإصلاحات عند تغيير الصفحة
      if (window.forceAllInputFields) {
        window.forceAllInputFields();
      }
      if (window.emergencyForceAllFields) {
        window.emergencyForceAllFields();
      }
    }, 100);
  });
  
  pageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // إضافة وظائف عامة للنافذة
  window.forceAllInputFields = () => {
    document.querySelectorAll('input, textarea, select').forEach(element => {
      element.style.setProperty('pointer-events', 'auto', 'important');
      element.style.setProperty('z-index', '2147483647', 'important');
      element.disabled = false;
      element.readOnly = false;
    });
  };
  
  window.emergencyForceAllFields = () => {
    document.querySelectorAll('input, textarea, select').forEach(element => {
      element.style.setProperty('pointer-events', 'auto', 'important');
      element.style.setProperty('touch-action', 'manipulation', 'important');
      element.style.setProperty('z-index', '2147483647', 'important');
      element.style.setProperty('cursor', element.tagName.toLowerCase() === 'select' ? 'pointer' : 'text', 'important');
      element.disabled = false;
      element.readOnly = false;
    });
  };
  
  // تشغيل الإصلاحات كل ثانية
  const globalInterval = setInterval(() => {
    window.forceAllInputFields();
  }, 1000);
  
  console.log('🌍 GLOBAL Input Fields Fix System activated - النظام العام مُفعل');
  
  return {
    forcer,
    emergency,
    monitoring,
    pageObserver,
    globalInterval,
    cleanup: () => {
      if (forcer && forcer.cleanup) {
        forcer.cleanup();
      }
      if (emergency && emergency.cleanup) {
        emergency.cleanup();
      }
      if (monitoring && monitoring.stop) {
        monitoring.stop();
      }
      pageObserver.disconnect();
      clearInterval(globalInterval);
      
      // إزالة الـ CSS العام
      const style = document.getElementById('global-input-fix');
      if (style) {
        style.remove();
      }
      
      // إزالة الوظائف العامة
      delete window.forceAllInputFields;
      delete window.emergencyForceAllFields;
      
      console.log('🛑 Global system cleaned up');
    }
  };
};

// تشغيل النظام العام عند تحميل الملف
if (typeof window !== 'undefined') {
  // تشغيل فوري
  document.addEventListener('DOMContentLoaded', initializeGlobalInputFieldsFix);
  
  // تشغيل إضافي عند تحميل النافذة
  window.addEventListener('load', initializeGlobalInputFieldsFix);
  
  // تشغيل فوري إذا كان DOM جاهزاً
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalInputFieldsFix);
  } else {
    initializeGlobalInputFieldsFix();
  }
}

export default initializeGlobalInputFieldsFix;