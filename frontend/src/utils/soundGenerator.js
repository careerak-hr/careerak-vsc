/**
 * مولد الأصوات البسيطة باستخدام Web Audio API
 * Simple Sound Generator using Web Audio API
 * 
 * هذا حل مؤقت لحين إضافة ملفات MP3 حقيقية
 */

class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
  }

  /**
   * تهيئة Audio Context
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('🎵 SoundGenerator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error);
    }
  }

  /**
   * تشغيل نغمة بسيطة
   * @param {number} frequency - التردد بالهرتز
   * @param {number} duration - المدة بالثواني
   * @param {string} type - نوع الموجة (sine, square, sawtooth, triangle)
   * @param {number} volume - مستوى الصوت (0-1)
   */
  playTone(frequency = 440, duration = 0.2, type = 'sine', volume = 0.3) {
    if (!this.isInitialized) this.init();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.value = volume;

      const now = this.audioContext.currentTime;
      oscillator.start(now);
      oscillator.stop(now + duration);

      // Fade out للحصول على صوت أنعم
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    } catch (error) {
      console.error('❌ Failed to play tone:', error);
    }
  }

  /**
   * صوت نجاح (Success)
   */
  playSuccess() {
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 100); // E5
  }

  /**
   * صوت خطأ (Error)
   */
  playError() {
    this.playTone(200, 0.3, 'sawtooth', 0.2);
  }

  /**
   * صوت إشعار (Notification)
   */
  playNotification() {
    this.playTone(800, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(1000, 0.1, 'sine', 0.25), 100);
  }

  /**
   * صوت تنبيه (Alert)
   */
  playAlert() {
    this.playTone(1000, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(800, 0.15, 'square', 0.2), 150);
  }

  /**
   * صوت تصفيق (Applause) - محاكاة بسيطة
   */
  playApplause() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(Math.random() * 200 + 300, 0.05, 'square', 0.1);
      }, i * 50);
    }
  }

  /**
   * صوت جرس (Bell)
   */
  playBell() {
    this.playTone(1046.50, 0.3, 'sine', 0.3); // C6
  }

  /**
   * صوت نقود (Cash Register) - محاكاة
   */
  playCashRegister() {
    this.playTone(400, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(600, 0.15, 'sine', 0.25), 100);
  }

  /**
   * صوت رسالة (Message Pop)
   */
  playMessagePop() {
    this.playTone(600, 0.08, 'sine', 0.2);
  }

  /**
   * صوت تهنئة (Congratulations)
   */
  playCongratulations() {
    const notes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.25), index * 150);
    });
  }

  /**
   * صوت فرصة (Opportunity)
   */
  playOpportunity() {
    this.playTone(880, 0.15, 'sine', 0.25);
    setTimeout(() => this.playTone(1046.50, 0.2, 'sine', 0.3), 150);
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
      console.log('🗑️ SoundGenerator cleaned up');
    }
  }
}

// إنشاء مثيل واحد
const soundGenerator = new SoundGenerator();

// تصدير المثيل
export default soundGenerator;

// إضافة للـ window للاختبار
if (typeof window !== 'undefined') {
  window.soundGenerator = soundGenerator;
  console.log('🎵 SoundGenerator available at window.soundGenerator');
}
