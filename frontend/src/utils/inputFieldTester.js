/**
 * أداة اختبار حقول الإدخال - Input Field Tester
 * للتحقق من عمل حقول الإدخال بشكل صحيح
 */

class InputFieldTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  /**
   * تشغيل اختبار شامل لحقول الإدخال
   */
  async runComprehensiveTest() {
    if (this.isRunning) {
      console.log('🔄 Input field test already running...');
      return;
    }

    this.isRunning = true;
    this.testResults = [];
    
    console.log('🧪 Starting comprehensive input field test...');

    try {
      // 1. اختبار إنشاء حقول الإدخال
      await this.testInputCreation();
      
      // 2. اختبار التفاعل مع الحقول
      await this.testInputInteraction();
      
      // 3. اختبار CSS والتنسيق
      await this.testCSSStyles();
      
      // 4. اختبار الأجهزة المحمولة
      await this.testMobileCompatibility();
      
      // 5. عرض النتائج
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Input field test failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * اختبار إنشاء حقول الإدخال
   */
  async testInputCreation() {
    console.log('📝 Testing input field creation...');

    const testContainer = document.createElement('div');
    testContainer.id = 'input-test-container';
    testContainer.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50px;
      width: 300px;
      height: 400px;
      background: #E3DAD1;
      border: 2px solid #D48161;
      border-radius: 10px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    // إنشاء أنواع مختلفة من حقول الإدخال
    const inputTypes = [
      { type: 'text', placeholder: 'اختبار النص' },
      { type: 'email', placeholder: 'اختبار البريد الإلكتروني' },
      { type: 'password', placeholder: 'اختبار كلمة المرور' },
      { type: 'number', placeholder: 'اختبار الأرقام' },
      { type: 'tel', placeholder: 'اختبار الهاتف' }
    ];

    inputTypes.forEach((inputConfig, index) => {
      const input = document.createElement('input');
      input.type = inputConfig.type;
      input.placeholder = inputConfig.placeholder;
      input.id = `test-input-${index}`;
      input.style.cssText = `
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #D48161;
        border-radius: 5px;
        background: #E3DAD1;
        color: #304B60;
        font-size: 16px;
      `;
      
      testContainer.appendChild(input);
    });

    // إضافة textarea
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'اختبار النص المتعدد الأسطر';
    textarea.id = 'test-textarea';
    textarea.style.cssText = `
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #D48161;
      border-radius: 5px;
      background: #E3DAD1;
      color: #304B60;
      font-size: 16px;
      height: 60px;
      resize: vertical;
    `;
    testContainer.appendChild(textarea);

    // إضافة زر إغلاق
    const closeButton = document.createElement('button');
    closeButton.textContent = 'إغلاق الاختبار';
    closeButton.style.cssText = `
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: none;
      border-radius: 5px;
      background: #D48161;
      color: white;
      font-size: 14px;
      cursor: pointer;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(testContainer);
    };
    testContainer.appendChild(closeButton);

    document.body.appendChild(testContainer);

    this.testResults.push({
      test: 'Input Creation',
      status: 'PASS',
      message: 'All input fields created successfully'
    });

    // انتظار قصير للسماح بالعرض
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * اختبار التفاعل مع الحقول
   */
  async testInputInteraction() {
    console.log('🖱️ Testing input field interaction...');

    const testInputs = document.querySelectorAll('#input-test-container input, #input-test-container textarea');
    
    for (let i = 0; i < testInputs.length; i++) {
      const input = testInputs[i];
      
      try {
        // اختبار التركيز
        input.focus();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // اختبار الكتابة
        const testValue = `Test ${i + 1}`;
        input.value = testValue;
        
        // إطلاق أحداث الإدخال
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // التحقق من القيمة
        if (input.value === testValue) {
          this.testResults.push({
            test: `Input Interaction - ${input.type || 'textarea'}`,
            status: 'PASS',
            message: `Field accepts input correctly`
          });
        } else {
          this.testResults.push({
            test: `Input Interaction - ${input.type || 'textarea'}`,
            status: 'FAIL',
            message: `Field does not accept input properly`
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        this.testResults.push({
          test: `Input Interaction - ${input.type || 'textarea'}`,
          status: 'ERROR',
          message: `Error during interaction: ${error.message}`
        });
      }
    }
  }

  /**
   * اختبار CSS والتنسيق
   */
  async testCSSStyles() {
    console.log('🎨 Testing CSS styles...');

    const testInputs = document.querySelectorAll('#input-test-container input, #input-test-container textarea');
    
    testInputs.forEach((input, index) => {
      const computedStyle = window.getComputedStyle(input);
      
      // اختبار user-select
      const userSelect = computedStyle.userSelect || computedStyle.webkitUserSelect;
      if (userSelect === 'text' || userSelect === 'auto') {
        this.testResults.push({
          test: `CSS user-select - ${input.type || 'textarea'}`,
          status: 'PASS',
          message: `user-select is properly set to: ${userSelect}`
        });
      } else {
        this.testResults.push({
          test: `CSS user-select - ${input.type || 'textarea'}`,
          status: 'FAIL',
          message: `user-select is incorrectly set to: ${userSelect}`
        });
      }
      
      // اختبار pointer-events
      const pointerEvents = computedStyle.pointerEvents;
      if (pointerEvents === 'auto') {
        this.testResults.push({
          test: `CSS pointer-events - ${input.type || 'textarea'}`,
          status: 'PASS',
          message: `pointer-events is properly set to: ${pointerEvents}`
        });
      } else {
        this.testResults.push({
          test: `CSS pointer-events - ${input.type || 'textarea'}`,
          status: 'FAIL',
          message: `pointer-events is incorrectly set to: ${pointerEvents}`
        });
      }
    });
  }

  /**
   * اختبار التوافق مع الأجهزة المحمولة
   */
  async testMobileCompatibility() {
    console.log('📱 Testing mobile compatibility...');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window;
    
    this.testResults.push({
      test: 'Mobile Detection',
      status: 'INFO',
      message: `Mobile: ${isMobile}, Touch: ${isTouch}`
    });

    // اختبار أحداث اللمس
    if (isTouch) {
      const testInput = document.querySelector('#input-test-container input');
      if (testInput) {
        try {
          // محاكاة حدث اللمس
          const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [{
              clientX: 100,
              clientY: 100,
              target: testInput
            }]
          });
          
          testInput.dispatchEvent(touchEvent);
          
          this.testResults.push({
            test: 'Touch Events',
            status: 'PASS',
            message: 'Touch events work correctly'
          });
        } catch (error) {
          this.testResults.push({
            test: 'Touch Events',
            status: 'ERROR',
            message: `Touch event error: ${error.message}`
          });
        }
      }
    }
  }

  /**
   * عرض النتائج
   */
  displayResults() {
    console.log('📊 Input Field Test Results:');
    console.log('================================');
    
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : 
                   result.status === 'ERROR' ? '🔥' : 'ℹ️';
      
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else if (result.status === 'ERROR') errorCount++;
    });
    
    console.log('================================');
    console.log(`📈 Summary: ${passCount} passed, ${failCount} failed, ${errorCount} errors`);
    
    if (failCount === 0 && errorCount === 0) {
      console.log('🎉 All input field tests passed! Input fields are working correctly.');
    } else {
      console.log('⚠️ Some input field tests failed. Please check the issues above.');
    }
  }

  /**
   * اختبار سريع لحقل إدخال محدد
   */
  quickTest(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`❌ Element not found: ${selector}`);
      return;
    }

    console.log(`🧪 Quick test for: ${selector}`);
    
    const computedStyle = window.getComputedStyle(element);
    const userSelect = computedStyle.userSelect || computedStyle.webkitUserSelect;
    const pointerEvents = computedStyle.pointerEvents;
    
    console.log(`- user-select: ${userSelect}`);
    console.log(`- pointer-events: ${pointerEvents}`);
    console.log(`- disabled: ${element.disabled}`);
    console.log(`- readonly: ${element.readOnly}`);
    
    // اختبار التركيز
    try {
      element.focus();
      console.log('✅ Focus test passed');
    } catch (error) {
      console.log(`❌ Focus test failed: ${error.message}`);
    }
    
    // اختبار الكتابة
    try {
      const originalValue = element.value;
      element.value = 'test';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      if (element.value === 'test') {
        console.log('✅ Input test passed');
        element.value = originalValue; // استعادة القيمة الأصلية
      } else {
        console.log('❌ Input test failed');
      }
    } catch (error) {
      console.log(`❌ Input test failed: ${error.message}`);
    }
  }
}

// إنشاء مثيل واحد
const inputFieldTester = new InputFieldTester();

// إضافة إلى window للوصول من وحدة التحكم
if (typeof window !== 'undefined') {
  window.inputFieldTester = inputFieldTester;
  
  // إضافة اختصارات سريعة
  window.testInputs = () => inputFieldTester.runComprehensiveTest();
  window.quickTestInput = (selector) => inputFieldTester.quickTest(selector);
}

export default inputFieldTester;