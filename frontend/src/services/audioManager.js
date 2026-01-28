/**
 * مدير الصوت الموحد - نظام شامل لإدارة الموسيقى والأصوات
 * Unified Audio Manager - Comprehensive system for managing music and sounds
 */

class AudioManager {
  constructor() {
    this.musicAudio = null;
    this.introAudio = null;
    this.isInitialized = false;
    this.isMusicPlaying = false;
    this.isIntroPlaying = false;
    this.currentPage = null;
    this.settings = {
      audioEnabled: false,
      musicEnabled: false
    };
    
    // حالات الصفحات التي تحتاج موسيقى
    this.musicPages = ['/login', '/auth'];
    this.introPages = ['/entry'];
    
    console.log('🎵 AudioManager initialized');
  }

  /**
   * تهيئة النظام الصوتي
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🎵 AudioManager already initialized');
      return;
    }

    try {
      // إنشاء عناصر الصوت
      this.musicAudio = new Audio();
      this.musicAudio.src = `${process.env.PUBLIC_URL || ''}/Music.mp3`;
      this.musicAudio.loop = true;
      this.musicAudio.volume = 0.3;
      this.musicAudio.preload = 'auto';

      this.introAudio = new Audio();
      this.introAudio.src = `${process.env.PUBLIC_URL || ''}/intro.mp3`;
      this.introAudio.volume = 0.7;
      this.introAudio.preload = 'auto';

      // إضافة مستمعي الأحداث
      this.musicAudio.addEventListener('ended', () => {
        console.log('🎵 Music ended (should not happen with loop)');
        this.isMusicPlaying = false;
      });

      this.musicAudio.addEventListener('pause', () => {
        console.log('🎵 Music paused');
        this.isMusicPlaying = false;
      });

      this.musicAudio.addEventListener('play', () => {
        console.log('🎵 Music started playing');
        this.isMusicPlaying = true;
      });

      this.introAudio.addEventListener('ended', () => {
        console.log('🎵 Intro ended');
        this.isIntroPlaying = false;
      });

      this.introAudio.addEventListener('pause', () => {
        console.log('🎵 Intro paused');
        this.isIntroPlaying = false;
      });

      this.introAudio.addEventListener('play', () => {
        console.log('🎵 Intro started playing');
        this.isIntroPlaying = true;
      });

      // معالجة الأخطاء
      this.musicAudio.addEventListener('error', (e) => {
        console.error('🎵 Music audio error:', e);
      });

      this.introAudio.addEventListener('error', (e) => {
        console.error('🎵 Intro audio error:', e);
      });

      this.isInitialized = true;
      console.log('🎵 AudioManager initialized successfully');
      
      // تحديث الإعدادات من localStorage
      this.updateSettings();
      
    } catch (error) {
      console.error('🎵 Failed to initialize AudioManager:', error);
    }
  }

  /**
   * تحديث الإعدادات من localStorage
   */
  updateSettings() {
    const audioConsent = localStorage.getItem('audioConsent');
    const audioEnabled = localStorage.getItem('audio_enabled');
    const musicEnabled = localStorage.getItem('musicEnabled');

    this.settings.audioEnabled = audioConsent === 'true' || audioEnabled === 'true';
    this.settings.musicEnabled = musicEnabled === 'true';

    console.log('🎵 Settings updated:', this.settings);
  }

  /**
   * تحديث الصفحة الحالية وإدارة الصوت تبعاً لها
   */
  async updatePage(pathname) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`🎵 Page changed to: ${pathname}`);
    this.currentPage = pathname;
    
    // تحديث الإعدادات
    this.updateSettings();
    
    // إيقاف جميع الأصوات أولاً
    await this.stopAll();
    
    // تشغيل الصوت المناسب للصفحة
    if (this.settings.audioEnabled) {
      if (this.introPages.includes(pathname)) {
        await this.playIntro();
      } else if (this.musicPages.some(page => pathname.startsWith(page))) {
        if (this.settings.musicEnabled) {
          await this.playMusic();
        }
      }
    }
  }

  /**
   * تشغيل المقدمة
   */
  async playIntro() {
    if (!this.isInitialized || !this.settings.audioEnabled || this.isIntroPlaying) {
      return;
    }

    try {
      console.log('🎵 Playing intro...');
      
      // إيقاف الموسيقى إذا كانت تعمل
      await this.stopMusic();
      
      // تشغيل المقدمة
      this.introAudio.currentTime = 0;
      await this.introAudio.play();
      
    } catch (error) {
      console.error('🎵 Failed to play intro:', error);
    }
  }

  /**
   * تشغيل الموسيقى الخلفية
   */
  async playMusic() {
    if (!this.isInitialized || !this.settings.audioEnabled || !this.settings.musicEnabled || this.isMusicPlaying) {
      return;
    }

    try {
      console.log('🎵 Playing background music...');
      
      // إيقاف المقدمة إذا كانت تعمل
      await this.stopIntro();
      
      // تشغيل الموسيقى
      this.musicAudio.currentTime = 0;
      await this.musicAudio.play();
      
    } catch (error) {
      console.error('🎵 Failed to play music:', error);
    }
  }

  /**
   * إيقاف الموسيقى
   */
  async stopMusic() {
    if (this.musicAudio && this.isMusicPlaying) {
      console.log('🎵 Stopping music...');
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  /**
   * إيقاف المقدمة
   */
  async stopIntro() {
    if (this.introAudio && this.isIntroPlaying) {
      console.log('🎵 Stopping intro...');
      this.introAudio.pause();
      this.introAudio.currentTime = 0;
      this.isIntroPlaying = false;
    }
  }

  /**
   * إيقاف جميع الأصوات
   */
  async stopAll() {
    console.log('🎵 Stopping all audio...');
    await this.stopMusic();
    await this.stopIntro();
  }

  /**
   * تحديث إعدادات الصوت
   */
  async updateAudioSettings(audioEnabled, musicEnabled) {
    console.log(`🎵 Updating audio settings: audio=${audioEnabled}, music=${musicEnabled}`);
    
    this.settings.audioEnabled = audioEnabled;
    this.settings.musicEnabled = musicEnabled;

    // إذا تم تعطيل الصوت، أوقف كل شيء
    if (!audioEnabled) {
      await this.stopAll();
      return;
    }

    // إذا تم تعطيل الموسيقى فقط، أوقف الموسيقى
    if (!musicEnabled) {
      await this.stopMusic();
      return;
    }

    // إعادة تقييم الصفحة الحالية
    if (this.currentPage) {
      await this.updatePage(this.currentPage);
    }
  }

  /**
   * التعامل مع تغيير حالة التطبيق (خلفية/مقدمة)
   */
  handleAppStateChange(isActive) {
    if (!this.isInitialized) return;

    if (isActive) {
      console.log('🎵 App became active');
      // إعادة تقييم الصفحة الحالية
      if (this.currentPage) {
        this.updatePage(this.currentPage);
      }
    } else {
      console.log('🎵 App went to background');
      // إيقاف جميع الأصوات عند الانتقال للخلفية
      this.stopAll();
    }
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    console.log('🎵 Cleaning up AudioManager...');
    
    this.stopAll();
    
    if (this.musicAudio) {
      this.musicAudio.removeEventListener('ended', () => {});
      this.musicAudio.removeEventListener('pause', () => {});
      this.musicAudio.removeEventListener('play', () => {});
      this.musicAudio.removeEventListener('error', () => {});
      this.musicAudio = null;
    }
    
    if (this.introAudio) {
      this.introAudio.removeEventListener('ended', () => {});
      this.introAudio.removeEventListener('pause', () => {});
      this.introAudio.removeEventListener('play', () => {});
      this.introAudio.removeEventListener('error', () => {});
      this.introAudio = null;
    }
    
    this.isInitialized = false;
    this.isMusicPlaying = false;
    this.isIntroPlaying = false;
  }

  /**
   * الحصول على حالة النظام الصوتي
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isMusicPlaying: this.isMusicPlaying,
      isIntroPlaying: this.isIntroPlaying,
      currentPage: this.currentPage,
      settings: { ...this.settings }
    };
  }
}

// إنشاء مثيل واحد فقط (Singleton)
const audioManager = new AudioManager();

// تصدير المثيل
export default audioManager;

// تصدير للاستخدام في وحدة تحكم المتصفح (للتطوير)
if (typeof window !== 'undefined') {
  window.audioManager = audioManager;
  console.log('🎵 AudioManager available at window.audioManager');
}