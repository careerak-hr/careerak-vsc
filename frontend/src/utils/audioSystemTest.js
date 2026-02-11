/**
 * 🧪 نظام اختبار شامل للصوتيات في التطبيق
 * Audio System Testing Utility
 */

import audioManager from '../services/audioManager';
import notificationSoundManager from '../services/notificationSounds';

/**
 * اختبار النظام الصوتي الكامل
 */
export const runAudioSystemTest = async () => {
  console.log('🧪 ========================================');
  console.log('🧪 Starting Audio System Test');
  console.log('🧪 ========================================');

  try {
    // 1. اختبار تهيئة audioManager
    console.log('\n📋 Test 1: AudioManager Initialization');
    await audioManager.initialize();
    const status = audioManager.getStatus();
    console.log('✅ AudioManager Status:', status);

    // 2. اختبار تحميل الإعدادات
    console.log('\n📋 Test 2: Settings Loading');
    audioManager.updateSettings();
    console.log('✅ Settings loaded:', audioManager.settings);

    // 3. اختبار ملفات الصوت
    console.log('\n📋 Test 3: Audio Files Check');
    const musicExists = await checkAudioFile('/Music.mp3');
    const introExists = await checkAudioFile('/intro.mp3');
    console.log(`${musicExists ? '✅' : '❌'} Music.mp3`);
    console.log(`${introExists ? '✅' : '❌'} intro.mp3`);

    // 4. اختبار أصوات الإشعارات
    console.log('\n📋 Test 4: Notification Sounds');
    const availableSounds = notificationSoundManager.getAvailableSounds();
    console.log('✅ Available notification sounds:', availableSounds);

    // 5. اختبار تشغيل الموسيقى (إذا كانت مفعلة)
    console.log('\n📋 Test 5: Music Playback Test');
    if (audioManager.settings.audioEnabled && audioManager.settings.musicEnabled) {
      console.log('🎵 Attempting to play music...');
      await audioManager.playMusic();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await audioManager.stopMusic();
      console.log('✅ Music playback test completed');
    } else {
      console.log('⚠️ Audio/Music disabled in settings');
    }

    // 6. اختبار حالة التطبيق
    console.log('\n📋 Test 6: App State Management');
    console.log('Testing pause/resume...');
    audioManager.handleAppStateChange(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    audioManager.handleAppStateChange(true);
    console.log('✅ App state management test completed');

    console.log('\n🧪 ========================================');
    console.log('🧪 Audio System Test Completed Successfully');
    console.log('🧪 ========================================');

    return {
      success: true,
      audioManagerInitialized: status.isInitialized,
      musicFileExists: musicExists,
      introFileExists: introExists,
      settings: audioManager.settings,
      availableSounds
    };

  } catch (error) {
    console.error('❌ Audio System Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * فحص وجود ملف صوتي
 */
const checkAudioFile = async (path) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
    audio.addEventListener('error', () => resolve(false), { once: true });
    audio.src = path;
  });
};

/**
 * اختبار صوت إشعار محدد
 */
export const testNotificationSound = async (userType = 'individual', eventType = 'success') => {
  console.log(`🔊 Testing notification sound: ${userType}:${eventType}`);
  try {
    await notificationSoundManager.testSound(userType, eventType);
    console.log('✅ Notification sound test completed');
    return true;
  } catch (error) {
    console.error('❌ Notification sound test failed:', error);
    return false;
  }
};

/**
 * اختبار جميع أصوات الإشعارات
 */
export const testAllNotificationSounds = async () => {
  console.log('🧪 Testing all notification sounds...');
  
  const sounds = notificationSoundManager.getAvailableSounds();
  const results = {
    individuals: {},
    companies: {},
    general: {}
  };

  // اختبار أصوات الأفراد
  console.log('\n👤 Testing Individual Sounds:');
  for (const sound of sounds.individuals) {
    const success = await testNotificationSound('individual', sound);
    results.individuals[sound] = success;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // اختبار أصوات الشركات
  console.log('\n🏢 Testing Company Sounds:');
  for (const sound of sounds.companies) {
    const success = await testNotificationSound('company', sound);
    results.companies[sound] = success;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // اختبار الأصوات العامة
  console.log('\n🌐 Testing General Sounds:');
  for (const sound of sounds.general) {
    const success = await testNotificationSound('general', sound);
    results.general[sound] = success;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All notification sounds tested');
  return results;
};

/**
 * مراقبة حالة النظام الصوتي
 */
export const startAudioMonitoring = () => {
  console.log('🔍 Starting audio system monitoring...');
  
  const interval = setInterval(() => {
    const status = audioManager.getStatus();
    console.log('🎵 Audio Status:', {
      music: status.isMusicPlaying ? '▶️' : '⏸️',
      intro: status.isIntroPlaying ? '▶️' : '⏸️',
      page: status.currentPage,
      visible: status.isPageVisible ? '👁️' : '🙈',
      active: status.isAppActive ? '✅' : '❌'
    });
  }, 5000);

  console.log('✅ Audio monitoring started (every 5 seconds)');
  console.log('To stop: clearInterval(' + interval + ')');
  
  return interval;
};

/**
 * إيقاف المراقبة
 */
export const stopAudioMonitoring = (intervalId) => {
  clearInterval(intervalId);
  console.log('🛑 Audio monitoring stopped');
};

/**
 * تصدير للاستخدام في console
 */
if (typeof window !== 'undefined') {
  window.audioSystemTest = {
    run: runAudioSystemTest,
    testNotification: testNotificationSound,
    testAll: testAllNotificationSounds,
    startMonitoring: startAudioMonitoring,
    stopMonitoring: stopAudioMonitoring,
    getStatus: () => audioManager.getStatus()
  };
  console.log('🧪 Audio System Test available at: window.audioSystemTest');
}

export default {
  runAudioSystemTest,
  testNotificationSound,
  testAllNotificationSounds,
  startAudioMonitoring,
  stopAudioMonitoring
};
