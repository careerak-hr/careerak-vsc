/**
 * اختبار سريع لحقول الإدخال - تشخيص فوري
 * Quick Input Test - Instant Diagnosis
 */

/**
 * اختبار سريع شامل
 */
export const runQuickInputTest = () => {
  console.group('🔍 QUICK INPUT FIELDS TEST - اختبار سريع لحقول الإدخال');
  
  // البحث عن جميع الحقول
  const inputs = document.querySelectorAll('input, textarea, select');
  console.log(`📊 Found ${inputs.length} input fields`);
  
  if (inputs.length === 0) {
    console.warn('❌ No input fields found on this page!');
    console.groupEnd();
    return;
  }
  
  let workingFields = 0;
  let brokenFields = 0;
  const brokenFieldsDetails = [];
  
  inputs.forEach((field, index) => {
    const computedStyle = window.getComputedStyle(field);
    const isWorking = computedStyle.pointerEvents === 'auto' && 
                     computedStyle.visibility === 'visible' && 
                     parseFloat(computedStyle.opacity) > 0.5 &&
                     !field.disabled &&
                     !field.readOnly;
    
    if (isWorking) {
      workingFields++;
    } else {
      brokenFields++;
      brokenFieldsDetails.push({
        index,
        tag: field.tagName,
        type: field.type || 'N/A',
        id: field.id || 'no-id',
        className: field.className || 'no-class',
        pointerEvents: computedStyle.pointerEvents,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        disabled: field.disabled,
        readOnly: field.readOnly
      });
    }
  });
  
  console.log(`✅ Working fields: ${workingFields}`);
  console.log(`❌ Broken fields: ${brokenFields}`);
  console.log(`📈 Success rate: ${Math.round((workingFields / inputs.length) * 100)}%`);
  
  if (brokenFields > 0) {
    console.group('❌ Broken Fields Details:');
    brokenFieldsDetails.forEach(field => {
      console.log(`Field ${field.index}: ${field.tag}#${field.id}`, field);
    });
    console.groupEnd();
    
    console.log('🚨 Running emergency fix...');
    emergencyFixAllFields();
  } else {
    console.log('🎉 All fields are working perfectly!');
  }
  
  console.groupEnd();
  
  return {
    total: inputs.length,
    working: workingFields,
    broken: brokenFields,
    successRate: Math.round((workingFields / inputs.length) * 100),
    brokenDetails: brokenFieldsDetails
  };
};

/**
 * إصلاح طارئ فوري
 */
export const emergencyFixAllFields = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(field => {
    // إجبار الخصائص الأساسية
    field.style.setProperty('pointer-events', 'auto', 'important');
    field.style.setProperty('touch-action', 'manipulation', 'important');
    field.style.setProperty('z-index', '2147483647', 'important');
    field.style.setProperty('position', 'relative', 'important');
    field.style.setProperty('opacity', '1', 'important');
    field.style.setProperty('visibility', 'visible', 'important');
    field.style.setProperty('cursor', field.tagName.toLowerCase() === 'select' ? 'pointer' : 'text', 'important');
    
    // إزالة القيود
    field.disabled = false;
    field.readOnly = false;
    
    // إضافة مستمع نقر
    field.addEventListener('click', function() {
      this.focus();
    }, { once: false });
  });
  
  console.log('🚨 Emergency fix applied to all fields');
};

/**
 * مراقبة مستمرة للحقول
 */
export const startContinuousMonitoring = () => {
  console.log('🔄 Starting continuous monitoring...');
  
  const monitor = setInterval(() => {
    const result = runQuickInputTest();
    if (result.broken > 0) {
      console.warn(`⚠️ Found ${result.broken} broken fields! Applying fix...`);
      emergencyFixAllFields();
    }
  }, 2000);
  
  return {
    stop: () => {
      clearInterval(monitor);
      console.log('🛑 Continuous monitoring stopped');
    }
  };
};

/**
 * إضافة أدوات للوحة التحكم
 */
if (typeof window !== 'undefined') {
  window.quickInputTest = runQuickInputTest;
  window.emergencyFixFields = emergencyFixAllFields;
  window.startInputMonitoring = startContinuousMonitoring;
  
  // تشغيل الاختبار عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runQuickInputTest, 1000);
  });
  
  // تشغيل الاختبار عند النقر في أي مكان
  document.addEventListener('click', () => {
    setTimeout(runQuickInputTest, 100);
  });
}

export default {
  runQuickInputTest,
  emergencyFixAllFields,
  startContinuousMonitoring
};