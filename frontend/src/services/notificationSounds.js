/**
 * نظام الإشعارات الصوتية
 * Notification Sounds System
 * 
 * يستخدم soundGenerator كحل مؤقت لحين إضافة ملفات MP3
 */

import soundGenerator from '../utils/soundGenerator';

class NotificationSoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    
    // خريطة الأصوات حسب نوع الإشعار
    this.soundMap = {
      // أصوات الأفراد
      jobAccepted: 'applause',
      jobRejected: 'error',
      newJobMatch: 'opportunity',
      applicationSubmitted: 'success',
      profileUpdated: 'notification',
      messageReceived: 'messagePop',
      courseEnrolled: 'congratulations',
      achievementUnlocked: 'applause',
      
      // أصوات الشركات
      newApplication: 'cashRegister',
      candidateShortlisted: 'bell',
      interviewScheduled: 'notification',
      jobPosted: 'success',
      profileViewed: 'messagePop',
      
      // أصوات عامة
      success: 'success',
      error: 'error',
      warning: 'alert',
      info: 'notification',
      message: 'messagePop'
    };
    
    console.log('🔔 NotificationSoundManager initialized');
  }

  /**
   * تفعيل/تعطيل الأصوات
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`🔔 Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * تعيين مستوى الصوت
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume set to ${this.volume}`);
  }

  /**
   * تشغيل صوت إشعار
   * @param {string} notificationType - نوع الإشعار
   */
  play(notificationType) {
    if (!this.enabled) {
      console.log('🔇 Sounds disabled, skipping');
      return;
    }

    const soundType = this.soundMap[notificationType] || 'notification';
    console.log(`🔔 Playing sound: ${soundType} for ${notificationType}`);

    try {
      // تشغيل الصوت المناسب
      switch (soundType) {
        case 'success':
          soundGenerator.playSuccess();
          break;
        case 'error':
          soundGenerator.playError();
          break;
        case 'notification':
          soundGenerator.playNotification();
          break;
        case 'alert':
          soundGenerator.playAlert();
          break;
        case 'applause':
          soundGenerator.playApplause();
          break;
        case 'bell':
          soundGenerator.playBell();
          break;
        case 'cashRegister':
          soundGenerator.playCashRegister();
          break;
        case 'messagePop':
          soundGenerator.playMessagePop();
          break;
        case 'congratulations':
          soundGenerator.playCongratulations();
          break;
        case 'opportunity':
          soundGenerator.playOpportunity();
          break;
        default:
          soundGenerator.playNotification();
      }
    } catch (error) {
      console.error('❌ Failed to play notification sound:', error);
    }
  }

  /**
   * تشغيل صوت نجاح
   */
  playSuccess() {
    this.play('success');
  }

  /**
   * تشغيل صوت خطأ
   */
  playError() {
    this.play('error');
  }

  /**
   * تشغيل صوت تنبيه
   */
  playWarning() {
    this.play('warning');
  }

  /**
   * تشغيل صوت معلومة
   */
  playInfo() {
    this.play('info');
  }

  /**
   * تشغيل صوت رسالة
   */
  playMessage() {
    this.play('message');
  }

  /**
   * الحصول على قائمة الأصوات المتاحة
   */
  getAvailableSounds() {
    return Object.keys(this.soundMap);
  }

  /**
   * اختبار جميع الأصوات
   */
  async testAll() {
    console.log('🎵 Testing all notification sounds...');
    const sounds = this.getAvailableSounds();
    
    for (let i = 0; i < sounds.length; i++) {
      const sound = sounds[i];
      console.log(`Testing: ${sound}`);
      this.play(sound);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ All sounds tested');
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    soundGenerator.cleanup();
    console.log('🗑️ NotificationSoundManager cleaned up');
  }
}

// إنشاء مثيل واحد
const notificationSoundManager = new NotificationSoundManager();

// تصدير المثيل
export default notificationSoundManager;

// إضافة للـ window للاختبار
if (typeof window !== 'undefined') {
  window.notificationSoundManager = notificationSoundManager;
  console.log('🔔 NotificationSoundManager available at window.notificationSoundManager');
  console.log('💡 Try: window.notificationSoundManager.testAll()');
}
