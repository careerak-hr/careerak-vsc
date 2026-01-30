/**
 * مُختبر حقول الإدخال - للتأكد من عمل جميع الحقول
 * Input Fields Tester - To ensure all fields are working
 */

/**
 * اختبار حقل إدخال واحد
 * Test a single input field
 */
export const testInputField = (element) => {
  if (!element) return { success: false, error: 'Element not found' };
  
  const results = {
    element: element.tagName.toLowerCase(),
    id: element.id || 'no-id',
    className: element.className || 'no-class',
    tests: {}
  };
  
  // اختبار pointer-events
  const computedStyle = window.getComputedStyle(element);
  results.tests.pointerEvents = {
    value: computedStyle.pointerEvents,
    passed: computedStyle.pointerEvents === 'auto'
  };
  
  // اختبار user-select
  results.tests.userSelect = {
    value: computedStyle.userSelect || computedStyle.webkitUserSelect,
    passed: (computedStyle.userSelect === 'text' || computedStyle.webkitUserSelect === 'text')
  };
  
  // اختبار z-index
  results.tests.zIndex = {
    value: computedStyle.zIndex,
    passed: computedStyle.zIndex !== 'auto' && parseInt(computedStyle.zIndex) > 0
  };
  
  // اختبار visibility
  results.tests.visibility = {
    value: computedStyle.visibility,
    passed: computedStyle.visibility === 'visible'
  };
  
  // اختبار opacity
  results.tests.opacity = {
    value: computedStyle.opacity,
    passed: parseFloat(computedStyle.opacity) > 0.5
  };
  
  // اختبار cursor
  results.tests.cursor = {
    value: computedStyle.cursor,
    passed: computedStyle.cursor === 'text' || computedStyle.cursor === 'pointer'
  };
  
  // اختبار disabled
  results.tests.disabled = {
    value: element.disabled,
    passed: !element.disabled
  };
  
  // اختبار readonly
  results.tests.readonly = {
    value: element.readOnly,
    passed: !element.readOnly
  };
  
  // حساب النتيجة الإجمالية
  const passedTests = Object.values(results.tests).filter(test => test.passed).length;
  const totalTests = Object.keys(results.tests).length;
  results.score = `${passedTests}/${totalTests}`;
  results.success = passedTests === totalTests;
  
  return results;
};

/**
 * اختبار جميع حقول الإدخال في الصفحة
 * Test all input fields on the page
 */
export const testAllInputFields = () => {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="password"]',
    'input[type="tel"]',
    'input[type="date"]',
    'input[type="number"]',
    'textarea',
    'select'
  ];
  
  const results = {
    timestamp: new Date().toISOString(),
    totalFields: 0,
    workingFields: 0,
    brokenFields: 0,
    fields: []
  };
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const testResult = testInputField(element);
      results.fields.push(testResult);
      results.totalFields++;
      
      if (testResult.success) {
        results.workingFields++;
      } else {
        results.brokenFields++;
      }
    });
  });
  
  results.successRate = results.totalFields > 0 ? 
    `${Math.round((results.workingFields / results.totalFields) * 100)}%` : '0%';
  
  return results;
};

/**
 * طباعة تقرير مفصل عن حالة الحقول
 * Print detailed report about fields status
 */
export const printFieldsReport = () => {
  const results = testAllInputFields();
  
  console.group('🔍 Input Fields Test Report - تقرير اختبار حقول الإدخال');
  console.log(`📊 Total Fields: ${results.totalFields}`);
  console.log(`✅ Working Fields: ${results.workingFields}`);
  console.log(`❌ Broken Fields: ${results.brokenFields}`);
  console.log(`📈 Success Rate: ${results.successRate}`);
  
  if (results.brokenFields > 0) {
    console.group('❌ Broken Fields Details:');
    results.fields.filter(field => !field.success).forEach(field => {
      console.group(`${field.element}#${field.id} (${field.score})`);
      Object.entries(field.tests).forEach(([testName, test]) => {
        if (!test.passed) {
          console.log(`❌ ${testName}: ${test.value}`);
        }
      });
      console.groupEnd();
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return results;
};

/**
 * مراقب مستمر لحالة الحقول
 * Continuous monitor for fields status
 */
export const startFieldsMonitor = (intervalMs = 5000) => {
  console.log('🔄 Starting continuous fields monitor...');
  
  const monitor = setInterval(() => {
    const results = testAllInputFields();
    if (results.brokenFields > 0) {
      console.warn(`⚠️ Found ${results.brokenFields} broken fields! Running emergency fix...`);
      
      // تشغيل الإصلاح الطارئ
      import('./inputFieldsForcer').then(({ forceAllInputFields }) => {
        forceAllInputFields();
      });
    }
  }, intervalMs);
  
  return {
    stop: () => {
      clearInterval(monitor);
      console.log('🛑 Fields monitor stopped');
    }
  };
};

/**
 * اختبار سريع للحقول
 * Quick test for fields
 */
export const quickTest = () => {
  const results = testAllInputFields();
  const status = results.brokenFields === 0 ? '✅ ALL GOOD' : `❌ ${results.brokenFields} BROKEN`;
  console.log(`🚀 Quick Test: ${status} (${results.successRate})`);
  return results.brokenFields === 0;
};

// إضافة اختصارات للوحة التحكم
if (typeof window !== 'undefined') {
  window.testInputFields = testAllInputFields;
  window.printFieldsReport = printFieldsReport;
  window.quickTestFields = quickTest;
  window.startFieldsMonitor = startFieldsMonitor;
}

export default {
  testInputField,
  testAllInputFields,
  printFieldsReport,
  startFieldsMonitor,
  quickTest
};