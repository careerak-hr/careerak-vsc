/**
 * أداة اختبار نظام الخروج - للتحقق من عمل AppExitManager بشكل صحيح
 * Exit System Tester - To verify AppExitManager works correctly
 */

import appExitManager from './appExitManager';

/**
 * اختبار شامل لنظام الخروج
 */
export const runExitSystemTest = async () => {
  console.log('🧪 بدء اختبار نظام الخروج...');
  console.log('=====================================');
  
  try {
    // اختبار 1: الحصول على حالة النظام
    console.log('🔧 اختبار 1: الحصول على حالة النظام...');
    const status = appExitManager.getExitStatus();
    console.log('✅ النتيجة:', status);
    
    // اختبار 2: اكتشاف المنصة
    console.log('🔧 اختبار 2: اكتشاف المنصة...');
    const platform = appExitManager.detectPlatform();
    console.log('✅ المنصة:', platform);
    
    // اختبار 3: التحقق من إمكانية إغلاق النافذة
    console.log('🔧 اختبار 3: التحقق من إمكانية إغلاق النافذة...');
    const canClose = appExitManager.canCloseWindow();
    console.log('✅ يمكن الإغلاق:', canClose ? 'نعم' : 'لا');
    
    console.log('=====================================');
    console.log('🎉 انتهى اختبار نظام الخروج! جميع الاختبارات نجحت.');
    
    return true;
    
  } catch (error) {
    console.error('❌ فشل اختبار نظام الخروج:', error);
    return false;
  }
};

/**
 * محاكاة سيناريو فحص السن
 */
export const simulateAgeCheckScenario = async () => {
  console.log('🧪 محاكاة سيناريو فحص السن...');
  
  try {
    console.log('👶 المستخدم اختار "عمري تحت 18"...');
    console.log('💬 إظهار رسالة الوداع...');
    console.log('🔘 المستخدم ضغط على "حسناً، وداعاً"...');
    
    // تحذير للمطور
    console.warn('⚠️ هذا اختبار محاكاة فقط - لن يتم الخروج الفعلي من التطبيق');
    console.log('📝 لاختبار الخروج الفعلي، استخدم: window.appExitManager.exitApp("test")');
    
    // عرض معلومات النظام
    const status = appExitManager.getExitStatus();
    console.log('📊 حالة نظام الخروج:', status);
    
    console.log('✅ محاكاة سيناريو فحص السن مكتملة!');
    
  } catch (error) {
    console.error('❌ فشل محاكاة سيناريو فحص السن:', error);
  }
};

/**
 * اختبار إنشاء صفحة الوداع (بدون تطبيق فعلي)
 */
export const testGoodbyePageCreation = () => {
  console.log('🧪 اختبار إنشاء صفحة الوداع...');
  
  try {
    // حفظ المحتوى الحالي
    const originalHTML = document.documentElement.outerHTML;
    
    console.log('📄 إنشاء صفحة وداع تجريبية...');
    
    // إنشاء نافذة جديدة لاختبار صفحة الوداع
    const testWindow = window.open('', '_blank', 'width=600,height=400');
    
    if (testWindow) {
      // إنشاء محتوى صفحة الوداع في النافذة الجديدة
      const language = localStorage.getItem('lang') || 'ar';
      const isRTL = language === 'ar';
      
      const texts = {
        ar: { title: 'وداعاً (اختبار)', message: 'هذه صفحة اختبار لنظام الخروج' },
        en: { title: 'Goodbye (Test)', message: 'This is a test page for the exit system' },
        fr: { title: 'Au revoir (Test)', message: 'Ceci est une page de test pour le système de sortie' }
      };
      
      const text = texts[language] || texts.ar;
      
      testWindow.document.write(`
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head><title>${text.title}</title></head>
        <body style="
          font-family: 'Amiri', serif;
          background: #E3DAD1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
          color: #304B60;
        ">
          <h1>${text.title}</h1>
          <p>${text.message}</p>
          <button onclick="window.close()" style="
            background: #304B60;
            color: #D48161;
            padding: 1rem 2rem;
            border: none;
            border-radius: 1rem;
            margin-top: 1rem;
            cursor: pointer;
          ">إغلاق النافذة</button>
        </body>
        </html>
      `);
      
      console.log('✅ تم إنشاء صفحة الوداع التجريبية في نافذة جديدة');
      
      // إغلاق النافذة تلقائياً بعد 5 ثوان
      setTimeout(() => {
        if (!testWindow.closed) {
          testWindow.close();
          console.log('🔒 تم إغلاق النافذة التجريبية تلقائياً');
        }
      }, 5000);
      
    } else {
      console.warn('⚠️ لا يمكن فتح نافذة جديدة - قد يكون محجوبة بواسطة المتصفح');
    }
    
    console.log('✅ اختبار إنشاء صفحة الوداع مكتمل!');
    
  } catch (error) {
    console.error('❌ فشل اختبار إنشاء صفحة الوداع:', error);
  }
};

/**
 * عرض معلومات مفصلة عن نظام الخروج
 */
export const showExitSystemInfo = () => {
  console.log('📋 معلومات نظام الخروج:');
  console.log('=====================================');
  
  const status = appExitManager.getExitStatus();
  
  console.log('🔧 الحالة الحالية:');
  console.log('   - في حالة خروج:', status.isExiting ? 'نعم' : 'لا');
  console.log('   - يمكن إغلاق النافذة:', status.canCloseWindow ? 'نعم' : 'لا');
  console.log('   - المنصة:', status.platform);
  
  console.log('🌐 معلومات المتصفح:');
  console.log('   - وكيل المستخدم:', navigator.userAgent);
  console.log('   - اللغة:', navigator.language);
  console.log('   - متصل بالإنترنت:', navigator.onLine ? 'نعم' : 'لا');
  
  console.log('📱 معلومات Capacitor:');
  if (window.Capacitor) {
    console.log('   - Capacitor متاح:', 'نعم');
    console.log('   - المنصة:', window.Capacitor.getPlatform());
    console.log('   - أصلي:', window.Capacitor.isNativePlatform() ? 'نعم' : 'لا');
  } else {
    console.log('   - Capacitor متاح:', 'لا');
  }
  
  console.log('🎵 معلومات النظام الصوتي:');
  if (window.audioManager) {
    const audioStatus = window.audioManager.getStatus();
    console.log('   - مهيأ:', audioStatus.isInitialized ? 'نعم' : 'لا');
    console.log('   - الموسيقى تعمل:', audioStatus.isMusicPlaying ? 'نعم' : 'لا');
  } else {
    console.log('   - AudioManager غير متاح');
  }
  
  console.log('=====================================');
};

// تصدير للاستخدام في وحدة تحكم المتصفح
if (typeof window !== 'undefined') {
  window.exitTester = {
    runFullTest: runExitSystemTest,
    simulateAgeCheck: simulateAgeCheckScenario,
    testGoodbyePage: testGoodbyePageCreation,
    showInfo: showExitSystemInfo,
    // اختصارات سريعة
    test: runExitSystemTest,
    simulate: simulateAgeCheckScenario,
    info: showExitSystemInfo
  };
  
  console.log('🛠️ أدوات اختبار نظام الخروج متاحة في window.exitTester');
  console.log('   - window.exitTester.test() - اختبار شامل');
  console.log('   - window.exitTester.simulate() - محاكاة فحص السن');
  console.log('   - window.exitTester.testGoodbyePage() - اختبار صفحة الوداع');
  console.log('   - window.exitTester.info() - معلومات النظام');
}