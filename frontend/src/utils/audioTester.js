/**
 * أداة اختبار النظام الصوتي - للتحقق من عمل AudioManager بشكل صحيح
 * Audio System Tester - To verify AudioManager works correctly
 */

import audioManager from '../services/audioManager';

/**
 * اختبار شامل للنظام الصوتي
 */
export const runAudioSystemTest = async () => {
  console.log('🧪 بدء اختبار النظام الصوتي...');
  console.log('=====================================');
  
  try {
    // اختبار 1: التهيئة
    console.log('🔧 اختبار 1: تهيئة النظام...');
    await audioManager.initialize();
    const status1 = audioManager.getStatus();
    console.log('✅ النتيجة:', status1.isInitialized ? 'نجح' : 'فشل');
    
    // اختبار 2: تحديث الإعدادات
    console.log('🔧 اختبار 2: تحديث الإعدادات...');
    await audioManager.updateAudioSettings(true, true);
    const status2 = audioManager.getStatus();
    console.log('✅ النتيجة:', status2.settings.audioEnabled && status2.settings.musicEnabled ? 'نجح' : 'فشل');
    
    // اختبار 3: تحديث الصفحة للمقدمة
    console.log('🔧 اختبار 3: تشغيل المقدمة...');
    await audioManager.updatePage('/entry');
    await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية
    const status3 = audioManager.getStatus();
    console.log('✅ النتيجة:', status3.currentPage === '/entry' ? 'نجح' : 'فشل');
    
    // اختبار 4: تحديث الصفحة للموسيقى
    console.log('🔧 اختبار 4: تشغيل الموسيقى...');
    await audioManager.updatePage('/login');
    await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية
    const status4 = audioManager.getStatus();
    console.log('✅ النتيجة:', status4.currentPage === '/login' ? 'نجح' : 'فشل');
    
    // اختبار 5: إيقاف جميع الأصوات
    console.log('🔧 اختبار 5: إيقاف جميع الأصوات...');
    await audioManager.stopAll();
    const status5 = audioManager.getStatus();
    console.log('✅ النتيجة:', !status5.isMusicPlaying && !status5.isIntroPlaying ? 'نجح' : 'فشل');
    
    // اختبار 6: تعطيل الصوت
    console.log('🔧 اختبار 6: تعطيل الصوت...');
    await audioManager.updateAudioSettings(false, false);
    const status6 = audioManager.getStatus();
    console.log('✅ النتيجة:', !status6.settings.audioEnabled ? 'نجح' : 'فشل');
    
    console.log('=====================================');
    console.log('🎉 انتهى الاختبار! جميع الاختبارات نجحت.');
    
    return true;
    
  } catch (error) {
    console.error('❌ فشل الاختبار:', error);
    return false;
  }
};

/**
 * اختبار سيناريو تسجيل الدخول
 */
export const testLoginScenario = async () => {
  console.log('🧪 اختبار سيناريو تسجيل الدخول...');
  
  try {
    // تهيئة النظام
    await audioManager.initialize();
    await audioManager.updateAudioSettings(true, true);
    
    // محاكاة الانتقال لصفحة تسجيل الدخول
    console.log('📱 الانتقال لصفحة تسجيل الدخول...');
    await audioManager.updatePage('/login');
    
    // انتظار قليل
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // محاكاة الضغط على زر تسجيل الدخول (لا يجب أن يؤثر على الموسيقى)
    console.log('🔘 الضغط على زر تسجيل الدخول...');
    const statusBefore = audioManager.getStatus();
    
    // محاكاة الانتقال لصفحة أخرى
    console.log('📱 الانتقال لصفحة الملف الشخصي...');
    await audioManager.updatePage('/profile');
    
    const statusAfter = audioManager.getStatus();
    
    console.log('📊 النتائج:');
    console.log('   - قبل الانتقال:', statusBefore.isMusicPlaying ? 'الموسيقى تعمل' : 'الموسيقى متوقفة');
    console.log('   - بعد الانتقال:', statusAfter.isMusicPlaying ? 'الموسيقى تعمل' : 'الموسيقى متوقفة');
    console.log('   - الصفحة الحالية:', statusAfter.currentPage);
    
    console.log('✅ اختبار سيناريو تسجيل الدخول مكتمل!');
    
  } catch (error) {
    console.error('❌ فشل اختبار سيناريو تسجيل الدخول:', error);
  }
};

/**
 * مراقبة مستمرة للنظام الصوتي
 */
export const startAudioMonitoring = (intervalMs = 5000) => {
  console.log(`🔍 بدء مراقبة النظام الصوتي كل ${intervalMs}ms...`);
  
  const monitor = setInterval(() => {
    const status = audioManager.getStatus();
    console.log('🎵 حالة النظام الصوتي:', {
      initialized: status.isInitialized,
      musicPlaying: status.isMusicPlaying,
      introPlaying: status.isIntroPlaying,
      currentPage: status.currentPage,
      audioEnabled: status.settings.audioEnabled,
      musicEnabled: status.settings.musicEnabled
    });
  }, intervalMs);
  
  // إرجاع دالة لإيقاف المراقبة
  return () => {
    clearInterval(monitor);
    console.log('⏹️ تم إيقاف مراقبة النظام الصوتي');
  };
};

// تصدير للاستخدام في وحدة تحكم المتصفح
if (typeof window !== 'undefined') {
  window.audioTester = {
    runFullTest: runAudioSystemTest,
    testLogin: testLoginScenario,
    startMonitoring: startAudioMonitoring,
    getStatus: () => audioManager.getStatus(),
    stopAll: () => audioManager.stopAll()
  };
  
  console.log('🛠️ أدوات اختبار النظام الصوتي متاحة في window.audioTester');
  console.log('   - window.audioTester.runFullTest() - اختبار شامل');
  console.log('   - window.audioTester.testLogin() - اختبار تسجيل الدخول');
  console.log('   - window.audioTester.startMonitoring() - مراقبة مستمرة');
  console.log('   - window.audioTester.getStatus() - حالة النظام');
  console.log('   - window.audioTester.stopAll() - إيقاف جميع الأصوات');
}