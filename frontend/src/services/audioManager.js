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
    this.introPages = []; // Entry page manages its own audio
    this.lastMusicPage = null; // لتتبع آخر صفحة موسيقى
    
    // متغيرات لإدارة حالة التطبيق
    this.isAppActive = true;
    this.isPageVisible = true;
    this.wasMusicPlayingBeforePause = false;
    this.wasIntroPlayingBeforePause = false;
    
    console.log('🎵 AudioManager initialized');
    
    // إضافة مستمعي أحداث حالة الصفحة
    this.setupVisibilityListeners();
  }

  /**
   * إعداد مستمعي أحداث رؤية الصفحة وحالة التطبيق
   */
  setupVisibilityListeners() {
    // مراقبة تغيير رؤية الصفحة (قفل الشاشة، تبديل التطبيقات، إلخ)
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      console.log(`🎵 Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`);
      this.handleVisibilityChange();
    });

    // مراقبة أحداث النافذة
    window.addEventListener('blur', () => {
      console.log('🎵 Window lost focus');
      this.handleWindowBlur();
    });

    window.addEventListener('focus', () => {
      console.log('🎵 Window gained focus');
      this.handleWindowFocus();
    });

    // مراقبة أحداث الصفحة
    window.addEventListener('pagehide', () => {
      console.log('🎵 Page hide event');
      this.handlePageHide();
    });

    window.addEventListener('pageshow', () => {
      console.log('🎵 Page show event');
      this.handlePageShow();
    });

    // مراقبة أحداث التطبيق على الأجهزة المحمولة
    window.addEventListener('beforeunload', () => {
      console.log('🎵 Before unload event');
      this.handleAppExit();
    });
  }

  /**
   * معالجة تغيير رؤية الصفحة
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // الصفحة أصبحت مخفية (قفل الشاشة، تبديل التطبيق، إلخ)
      this.pauseAllAudio();
    } else {
      // الصفحة أصبحت مرئية مرة أخرى
      this.resumeAllAudio();
    }
  }

  /**
   * معالجة فقدان التركيز
   */
  handleWindowBlur() {
    this.pauseAllAudio();
  }

  /**
   * معالجة استعادة التركيز
   */
  handleWindowFocus() {
    // تأخير بسيط للتأكد من استقرار الحالة
    setTimeout(() => {
      if (this.isPageVisible) {
        this.resumeAllAudio();
      }
    }, 100);
  }

  /**
   * معالجة إخفاء الصفحة
   */
  handlePageHide() {
    this.pauseAllAudio();
  }

  /**
   * معالجة إظهار الصفحة
   */
  handlePageShow() {
    setTimeout(() => {
      if (this.isPageVisible) {
        this.resumeAllAudio();
      }
    }, 100);
  }

  /**
   * معالجة الخروج من التطبيق
   */
  handleAppExit() {
    console.log('🎵 App is exiting - stopping all audio permanently');
    this.stopAll();
    this.wasMusicPlayingBeforePause = false;
    this.wasIntroPlayingBeforePause = false;
  }

  /**
   * إيقاف مؤقت لجميع الأصوات
   */
  pauseAllAudio() {
    console.log('🎵 Pausing all audio due to app state change');
    
    // حفظ الحالة الحالية
    this.wasMusicPlayingBeforePause = this.isMusicPlaying;
    this.wasIntroPlayingBeforePause = this.isIntroPlaying;
    
    // إيقاف مؤقت للأصوات
    if (this.musicAudio && this.isMusicPlaying) {
      this.musicAudio.pause();
      console.log('🎵 Music paused');
    }
    
    if (this.introAudio && this.isIntroPlaying) {
      this.introAudio.pause();
      console.log('🎵 Intro paused');
    }
  }

  /**
   * استئناف جميع الأصوات
   */
  async resumeAllAudio() {
    console.log('🎵 Resuming audio after app state change');
    
    // التحقق من الإعدادات أولاً
    this.updateSettings();
    
    if (!this.settings.audioEnabled) {
      console.log('🎵 Audio disabled, not resuming');
      return;
    }
    
    try {
      // استئناف الموسيقى إذا كانت تعمل قبل الإيقاف
      if (this.wasMusicPlayingBeforePause && this.settings.musicEnabled && this.musicAudio) {
        const needsMusic = this.musicPages.some(page => this.currentPage?.startsWith(page));
        if (needsMusic) {
          await this.musicAudio.play();
          console.log('🎵 Music resumed');
        }
      }
      
      // استئناف المقدمة إذا كانت تعمل قبل الإيقاف
      if (this.wasIntroPlayingBeforePause && this.introAudio) {
        const needsIntro = this.introPages.includes(this.currentPage);
        if (needsIntro) {
          await this.introAudio.play();
          console.log('🎵 Intro resumed');
        }
      }
    } catch (error) {
      console.error('🎵 Failed to resume audio:', error);
    }
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
      console.log('🎵 Initializing AudioManager...');
      
      // تحديث الإعدادات أولاً
      this.updateSettings();
      
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
        // إعادة التشغيل تلقائياً
        if (this.settings.musicEnabled && this.settings.audioEnabled) {
          console.log('🎵 Restarting music after unexpected end');
          this.playMusic();
        }
      });

      this.musicAudio.addEventListener('pause', () => {
        console.log('🎵 Music paused');
        this.isMusicPlaying = false;
      });

      this.musicAudio.addEventListener('play', () => {
        console.log('🎵 Music started playing');
        this.isMusicPlaying = true;
      });
      
      // معالجة انقطاع التشغيل
      this.musicAudio.addEventListener('stalled', () => {
        console.warn('🎵 Music stalled - attempting recovery');
        if (this.isMusicPlaying && this.settings.musicEnabled) {
          setTimeout(() => {
            this.musicAudio.play().catch(e => console.error('🎵 Recovery failed:', e));
          }, 500);
        }
      });
      
      this.musicAudio.addEventListener('waiting', () => {
        console.log('🎵 Music waiting for data...');
      });
      
      this.musicAudio.addEventListener('canplaythrough', () => {
        console.log('🎵 Music can play through');
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
        console.error('🎵 Error details:', {
          code: e.target?.error?.code,
          message: e.target?.error?.message
        });
      });

      this.introAudio.addEventListener('error', (e) => {
        console.error('🎵 Intro audio error:', e);
      });

      this.isInitialized = true;
      console.log('🎵 AudioManager initialized successfully');
      
      // محاولة تحميل الملفات مسبقاً
      try {
        await this.musicAudio.load();
        console.log('🎵 Music file preloaded');
      } catch (e) {
        console.warn('🎵 Could not preload music:', e);
      }
      
    } catch (error) {
      console.error('🎵 Failed to initialize AudioManager:', error);
    }
  }

  /**
   * تحديث الإعدادات من localStorage و Preferences
   */
  async updateSettings() {
    // قراءة من localStorage أولاً (أسرع)
    let audioEnabled = localStorage.getItem('audio_enabled') === 'true';
    let musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    
    // إذا لم تكن موجودة في localStorage، جرّب audioConsent
    if (!audioEnabled) {
      audioEnabled = localStorage.getItem('audioConsent') === 'true';
    }

    this.settings.audioEnabled = audioEnabled;
    this.settings.musicEnabled = musicEnabled;

    console.log('🎵 Settings updated:', this.settings);
    
    // التأكد من التزامن مع localStorage
    if (audioEnabled) {
      localStorage.setItem('audio_enabled', 'true');
      localStorage.setItem('audioConsent', 'true');
    }
    if (musicEnabled) {
      localStorage.setItem('musicEnabled', 'true');
    }
  }

  /**
   * تحديث الصفحة الحالية وإدارة الصوت تبعاً لها
   */
  async updatePage(pathname) {
    // التأكد من التهيئة أولاً
    if (!this.isInitialized) {
      console.log('🎵 AudioManager not initialized yet, initializing now...');
      await this.initialize();
    }

    console.log(`🎵 Page changed to: ${pathname}`);
    
    // إذا كانت نفس الصفحة، لا نفعل شيئاً
    if (this.currentPage === pathname) {
      console.log('🎵 Same page, no audio change needed');
      return;
    }
    
    const previousPage = this.currentPage;
    this.currentPage = pathname;
    
    // تحديث الإعدادات
    await this.updateSettings();
    
    console.log('🎵 Current settings:', this.settings);
    
    // صفحة Entry تدير صوتها بنفسها، لا نتدخل
    if (pathname === '/entry') {
      console.log('🎵 Entry page manages its own audio - stopping all AudioManager sounds');
      await this.stopAll();
      this.lastMusicPage = null;
      this.wasMusicPlayingBeforePause = false;
      this.wasIntroPlayingBeforePause = false;
      return;
    }
    
    if (this.settings.audioEnabled && this.isPageVisible && this.isAppActive) {
      // التحقق من الصفحات التي تحتاج موسيقى
      const needsMusic = this.musicPages.some(page => pathname.startsWith(page));
      const previousNeedsMusic = previousPage ? this.musicPages.some(page => previousPage.startsWith(page)) : false;
      
      console.log(`🎵 Page music check: needsMusic=${needsMusic}, previousNeedsMusic=${previousNeedsMusic}, musicEnabled=${this.settings.musicEnabled}`);
      
      if (needsMusic && this.settings.musicEnabled) {
        // إذا كانت الصفحة السابقة والحالية تحتاجان موسيقى، استمر في التشغيل
        if (previousNeedsMusic && this.isMusicPlaying) {
          console.log('🎵 Both pages need music, continuing current playback...');
          this.lastMusicPage = pathname;
          return;
        }
        
        // إذا لم تكن الموسيقى تعمل، ابدأ تشغيلها
        if (!this.isMusicPlaying) {
          console.log('🎵 Starting music for this page...');
          await this.playMusic();
          this.lastMusicPage = pathname;
        }
      } else {
        // إذا لم نعد في صفحة موسيقى، أوقف الموسيقى
        if (this.isMusicPlaying) {
          console.log('🎵 Stopping music - not a music page');
          await this.stopMusic();
        }
        this.lastMusicPage = null;
      }
      
      // إيقاف المقدمة إذا كانت تعمل ولسنا في صفحة مقدمة
      if (!this.introPages.includes(pathname) && this.isIntroPlaying) {
        await this.stopIntro();
      }
      
      if (this.introPages.includes(pathname)) {
        await this.playIntro();
      }
    } else {
      console.log('🎵 Audio disabled or page not visible - stopping all');
      // إذا كان الصوت معطلاً أو الصفحة غير مرئية، أوقف كل شيء
      await this.stopAll();
    }
  }

  /**
   * تشغيل المقدمة
   */
  async playIntro() {
    if (!this.isInitialized || !this.settings.audioEnabled || this.isIntroPlaying || !this.isPageVisible) {
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
    if (!this.isInitialized || !this.settings.audioEnabled || !this.settings.musicEnabled || !this.isPageVisible) {
      console.log('🎵 Music not enabled, not initialized, or page not visible');
      return;
    }

    // إذا كانت الموسيقى تعمل بالفعل، لا نعيد تشغيلها
    if (this.isMusicPlaying) {
      console.log('🎵 Music already playing, not restarting');
      return;
    }

    try {
      console.log('🎵 Playing background music...');
      
      // إيقاف المقدمة إذا كانت تعمل
      await this.stopIntro();
      
      // تشغيل الموسيقى من البداية
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
      this.wasMusicPlayingBeforePause = false;
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
      this.wasIntroPlayingBeforePause = false;
    }
  }

  /**
   * إيقاف جميع الأصوات
   */
  async stopAll() {
    console.log('🎵 Stopping all audio...');
    await this.stopMusic();
    await this.stopIntro();
    this.wasMusicPlayingBeforePause = false;
    this.wasIntroPlayingBeforePause = false;
  }

  /**
   * تحديث إعدادات الصوت
   */
  async updateAudioSettings(audioEnabled, musicEnabled) {
    console.log(`🎵 Updating audio settings: audio=${audioEnabled}, music=${musicEnabled}`);
    
    const previousSettings = { ...this.settings };
    this.settings.audioEnabled = audioEnabled;
    this.settings.musicEnabled = musicEnabled;

    // إذا تم تعطيل الصوت، أوقف كل شيء
    if (!audioEnabled) {
      await this.stopAll();
      return;
    }

    // إذا تم تعطيل الموسيقى فقط، أوقف الموسيقى
    if (!musicEnabled && this.isMusicPlaying) {
      await this.stopMusic();
      return;
    }

    // إذا تم تفعيل الموسيقى وكنا في صفحة تحتاج موسيقى ولم تكن تعمل
    if (musicEnabled && !previousSettings.musicEnabled && this.currentPage && this.isPageVisible) {
      const needsMusic = this.musicPages.some(page => this.currentPage.startsWith(page));
      if (needsMusic && !this.isMusicPlaying) {
        await this.playMusic();
        this.lastMusicPage = this.currentPage;
      }
    }
  }

  /**
   * التعامل مع تغيير حالة التطبيق (خلفية/مقدمة) - Capacitor
   */
  handleAppStateChange(isActive) {
    if (!this.isInitialized) return;

    this.isAppActive = isActive;
    console.log(`🎵 App state changed: ${isActive ? 'active' : 'inactive'}`);

    if (isActive) {
      console.log('🎵 App became active');
      // تأخير بسيط للتأكد من استقرار الحالة
      setTimeout(() => {
        if (this.isPageVisible) {
          this.resumeAllAudio();
        }
      }, 200);
    } else {
      console.log('🎵 App went to background/inactive');
      // إيقاف مؤقت لجميع الأصوات عند الانتقال للخلفية
      this.pauseAllAudio();
    }
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    console.log('🎵 Cleaning up AudioManager...');
    
    this.stopAll();
    
    // إزالة مستمعي الأحداث
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('pagehide', this.handlePageHide);
    window.removeEventListener('pageshow', this.handlePageShow);
    window.removeEventListener('beforeunload', this.handleAppExit);
    
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
    this.currentPage = null;
    this.lastMusicPage = null;
    this.isAppActive = true;
    this.isPageVisible = true;
    this.wasMusicPlayingBeforePause = false;
    this.wasIntroPlayingBeforePause = false;
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
      lastMusicPage: this.lastMusicPage,
      isAppActive: this.isAppActive,
      isPageVisible: this.isPageVisible,
      wasMusicPlayingBeforePause: this.wasMusicPlayingBeforePause,
      wasIntroPlayingBeforePause: this.wasIntroPlayingBeforePause,
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