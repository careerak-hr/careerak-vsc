// 🔊 نظام أصوات الإشعارات المتقدم لتطبيق Careerak
// يحتوي على أصوات مختلفة للأفراد والشركات حسب نوع الإشعار

class NotificationSoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
    this.volume = 0.7;
    this.loadSounds();
  }

  // تحميل جميع الأصوات
  loadSounds() {
    // أصوات الأفراد (Individuals)
    this.sounds.individuals = {
      jobAccepted: this.createAudio('/sounds/individuals/applause.mp3', 'تصفيق عند قبول طلب توظيف'),
      jobRejected: this.createAudio('/sounds/individuals/gentle-notification.mp3', 'صوت لطيف عند رفض طلب'),
      courseCompleted: this.createAudio('/sounds/individuals/congratulations.mp3', 'تهانينا عند إتمام دورة'),
      courseEnrolled: this.createAudio('/sounds/individuals/success-chime.mp3', 'صوت نجاح عند التسجيل في دورة'),
      newJobPosted: this.createAudio('/sounds/individuals/opportunity-bell.mp3', 'جرس فرصة عند نشر وظيفة جديدة'),
      profileViewed: this.createAudio('/sounds/individuals/soft-ping.mp3', 'صوت لطيف عند مشاهدة الملف الشخصي'),
      messageReceived: this.createAudio('/sounds/individuals/message-pop.mp3', 'صوت رسالة جديدة'),
      interviewScheduled: this.createAudio('/sounds/individuals/important-chime.mp3', 'صوت مهم لموعد مقابلة'),
      certificateEarned: this.createAudio('/sounds/individuals/achievement.mp3', 'صوت إنجاز عند الحصول على شهادة')
    };

    // أصوات الشركات (Companies/HR)
    this.sounds.companies = {
      paymentReceived: this.createAudio('/sounds/companies/cash-register.mp3', 'صوت فلوس عند استلام دفعة'),
      paymentSent: this.createAudio('/sounds/companies/money-transfer.mp3', 'صوت تحويل مالي'),
      newApplication: this.createAudio('/sounds/companies/professional-notification.mp3', 'صوت مهني لطلب جديد'),
      candidateShortlisted: this.createAudio('/sounds/companies/selection-sound.mp3', 'صوت اختيار مرشح'),
      jobPostExpired: this.createAudio('/sounds/companies/gentle-reminder.mp3', 'تذكير لطيف لانتهاء إعلان'),
      subscriptionRenewal: this.createAudio('/sounds/companies/business-chime.mp3', 'صوت تجاري للاشتراك'),
      reportGenerated: this.createAudio('/sounds/companies/document-ready.mp3', 'صوت جاهزية تقرير'),
      teamUpdate: this.createAudio('/sounds/companies/team-notification.mp3', 'إشعار فريق العمل'),
      contractSigned: this.createAudio('/sounds/companies/success-fanfare.mp3', 'صوت احتفالي لتوقيع عقد')
    };

    // أصوات عامة (General)
    this.sounds.general = {
      systemUpdate: this.createAudio('/sounds/general/system-notification.mp3', 'تحديث النظام'),
      maintenance: this.createAudio('/sounds/general/maintenance-alert.mp3', 'تنبيه صيانة'),
      welcome: this.createAudio('/sounds/general/welcome-sound.mp3', 'صوت ترحيب'),
      error: this.createAudio('/sounds/general/error-sound.mp3', 'صوت خطأ'),
      success: this.createAudio('/sounds/general/success-sound.mp3', 'صوت نجاح عام')
    };
  }

  // إنشاء عنصر صوتي
  createAudio(src, description) {
    try {
      const audio = new Audio();
      audio.src = src;
      audio.volume = this.volume;
      audio.preload = 'auto';
      audio.description = description;
      
      // معالجة الأخطاء
      audio.addEventListener('error', (e) => {
        console.warn(`⚠️ Failed to load notification sound: ${src} (${description})`);
      });

      return audio;
    } catch (error) {
      console.error('Failed to create audio element:', error);
      return null;
    }
  }

  // تشغيل صوت حسب نوع المستخدم والحدث
  async playSound(userType, eventType, fallbackToGeneral = true) {
    if (!this.isEnabled) {
      console.log('🔇 Notification sounds are disabled');
      return;
    }

    try {
      let audio = null;

      // البحث عن الصوت المناسب
      if (userType === 'Employee' || userType === 'individual') {
        audio = this.sounds.individuals[eventType];
      } else if (userType === 'HR' || userType === 'company') {
        audio = this.sounds.companies[eventType];
      }

      // إذا لم يوجد صوت مخصص، استخدم الصوت العام
      if (!audio && fallbackToGeneral) {
        audio = this.sounds.general[eventType] || this.sounds.general.success;
      }

      if (audio) {
        console.log(`🔊 Playing notification sound: ${audio.description}`);
        await audio.play();
      } else {
        console.warn(`⚠️ No sound found for ${userType}:${eventType}`);
      }

    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  // تفعيل/تعطيل الأصوات
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`🔊 Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  // تعديل مستوى الصوت
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // تطبيق المستوى الجديد على جميع الأصوات
    Object.values(this.sounds).forEach(category => {
      Object.values(category).forEach(audio => {
        if (audio) audio.volume = this.volume;
      });
    });
    
    console.log(`🔊 Notification volume set to: ${Math.round(this.volume * 100)}%`);
  }

  // اختبار صوت
  async testSound(userType = 'individual', eventType = 'success') {
    console.log(`🧪 Testing notification sound: ${userType}:${eventType}`);
    await this.playSound(userType, eventType);
  }

  // الحصول على قائمة الأصوات المتاحة
  getAvailableSounds() {
    return {
      individuals: Object.keys(this.sounds.individuals),
      companies: Object.keys(this.sounds.companies),
      general: Object.keys(this.sounds.general)
    };
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
const notificationSoundManager = new NotificationSoundManager();

// تصدير للاستخدام في باقي التطبيق
export default notificationSoundManager;

// تصدير دوال مساعدة
export const playNotificationSound = (userType, eventType) => {
  return notificationSoundManager.playSound(userType, eventType);
};

export const setNotificationSoundsEnabled = (enabled) => {
  notificationSoundManager.setEnabled(enabled);
};

export const setNotificationVolume = (volume) => {
  notificationSoundManager.setVolume(volume);
};

export const testNotificationSound = (userType, eventType) => {
  return notificationSoundManager.testSound(userType, eventType);
};