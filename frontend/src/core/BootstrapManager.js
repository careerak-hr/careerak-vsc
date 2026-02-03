/**
 * Bootstrap Manager - طبقة إدارة دورة حياة التطبيق
 * Lifecycle Management Layer
 * 
 * المسؤوليات:
 * - تهيئة النظام
 * - إدارة دورة الحياة
 * - تنظيف الموارد
 * - تنسيق الخدمات
 */

class BootstrapManager {
  constructor() {
    this.isInitialized = false;
    this.services = new Map();
    this.cleanupTasks = [];
    this.initPromise = null;
  }

  /**
   * تهيئة التطبيق
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._performInit();
    return this.initPromise;
  }

  async _performInit() {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 Bootstrap Manager: Initializing application...');

    try {
      // 1. تهيئة الخدمات الأساسية
      await this._initCoreServices();

      // 2. تهيئة المراقبة
      await this._initMonitoring();

      // 3. تهيئة تتبع الجلسة
      await this._initSessionTracking();

      // 4. تهيئة أدوات التطوير (حسب البيئة)
      await this._initDevTools();

      // 5. تهيئة خدمات إضافية
      await this._initAdditionalServices();

      this.isInitialized = true;
      console.log('✅ Bootstrap Manager: Application initialized successfully');

    } catch (error) {
      console.error('❌ Bootstrap Manager: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * تهيئة الخدمات الأساسية
   */
  async _initCoreServices() {
    console.log('🔧 Initializing core services...');

    // تهيئة API Discovery
    try {
      const { discoverBestServer } = await import('../services/api');
      const apiUrl = await discoverBestServer();
      
      this.services.set('apiUrl', apiUrl);
      console.log('📡 API Server discovered:', apiUrl);
      
    } catch (error) {
      console.error('❌ API Discovery failed:', error);
      // لا نرمي الخطأ هنا لأن التطبيق يمكن أن يعمل بدون API
    }
  }

  /**
   * تهيئة نظام المراقبة
   */
  async _initMonitoring() {
    console.log('📊 Initializing monitoring system...');

    try {
      const monitoring = await import('../utils/monitoring');
      const performanceMonitor = monitoring.default;
      
      if (performanceMonitor) {
        this.services.set('performanceMonitor', performanceMonitor);
        
        // إعداد حفظ التقارير الدوري
        const reportInterval = setInterval(() => {
          if (performanceMonitor.saveReportLocally) {
            performanceMonitor.saveReportLocally();
          }
        }, 5 * 60 * 1000); // كل 5 دقائق

        this.cleanupTasks.push(() => clearInterval(reportInterval));
        console.log('✅ Performance monitoring initialized');
      }
    } catch (error) {
      console.warn('⚠️ Performance monitoring not available:', error.message);
    }
  }

  /**
   * تهيئة تتبع الجلسة
   */
  async _initSessionTracking() {
    console.log('👤 Initializing session tracking...');

    const performanceMonitor = this.services.get('performanceMonitor');
    const apiUrl = this.services.get('apiUrl');

    // تسجيل بداية الجلسة
    if (performanceMonitor && performanceMonitor.logUserAction) {
      performanceMonitor.logUserAction({
        type: 'session_start',
        url: window.location.href,
        timestamp: Date.now(),
        apiUrl: apiUrl || 'unknown'
      });
    }

    // جمع معلومات الجلسة
    const sessionInfo = this._collectSessionInfo();
    this.services.set('sessionInfo', sessionInfo);
    
    console.log('📋 Session info collected:', sessionInfo);

    // إعداد معالج إغلاق التطبيق
    const handleBeforeUnload = () => {
      this._handleSessionEnd();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    this.cleanupTasks.push(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
  }

  /**
   * جمع معلومات الجلسة
   */
  _collectSessionInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: Date.now()
    };
  }

  /**
   * تهيئة أدوات التطوير (حسب البيئة)
   */
  async _initDevTools() {
    // أدوات التطوير محذوفة - لا حاجة لها في الإنتاج
    console.log('🏭 Production mode: Development tools skipped');
  }

  /**
   * تهيئة خدمات إضافية
   */
  async _initAdditionalServices() {
    console.log('🔌 Initializing additional services...');

    // تحميل الأدوات المساعدة (فقط في التطوير)
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ Loading development utilities...');
      
      try {
        // تحميل الأدوات المساعدة بشكل ديناميكي
        const utilityPromises = [
          import('../utils/resetSettings').catch(() => null),
          import('../utils/fontTester').catch(() => null),
          import('../utils/audioTester').catch(() => null),
          import('../utils/appExitManager').catch(() => null),
          import('../utils/exitTester').catch(() => null),
          import('../utils/cvAnalyzerTester').catch(() => null)
        ];
        
        const results = await Promise.allSettled(utilityPromises);
        const loadedCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Development utilities loaded: ${loadedCount}/6`);
      } catch (error) {
        console.warn('⚠️ Some development utilities not available:', error.message);
      }
    } else {
      console.log('🏭 Production mode: Development utilities skipped');
    }
  }

  /**
   * معالجة نهاية الجلسة
   */
  _handleSessionEnd() {
    console.log('👋 Handling session end...');

    const performanceMonitor = this.services.get('performanceMonitor');
    
    if (performanceMonitor) {
      // حفظ تقرير الأداء النهائي
      if (performanceMonitor.saveReportLocally) {
        performanceMonitor.saveReportLocally();
      }

      // تسجيل نهاية الجلسة
      if (performanceMonitor.logUserAction) {
        performanceMonitor.logUserAction({
          type: 'session_end',
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * الحصول على خدمة معينة
   */
  getService(name) {
    return this.services.get(name);
  }

  /**
   * التحقق من حالة التهيئة
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * تنظيف الموارد وإنهاء التطبيق
   */
  async destroy() {
    console.log('🧹 Bootstrap Manager: Cleaning up resources...');

    // تنفيذ مهام التنظيف
    for (const cleanup of this.cleanupTasks) {
      try {
        await cleanup();
      } catch (error) {
        console.error('❌ Cleanup task failed:', error);
      }
    }

    // معالجة نهاية الجلسة
    this._handleSessionEnd();

    // مسح الخدمات
    this.services.clear();
    this.cleanupTasks = [];
    this.isInitialized = false;
    this.initPromise = null;

    console.log('✅ Bootstrap Manager: Cleanup completed');
  }

  /**
   * إعادة تشغيل التطبيق
   */
  async restart() {
    await this.destroy();
    await this.init();
  }

  /**
   * الحصول على معلومات حالة النظام
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      services: Array.from(this.services.keys()),
      cleanupTasks: this.cleanupTasks.length,
      sessionInfo: this.services.get('sessionInfo'),
      apiUrl: this.services.get('apiUrl')
    };
  }
}

// إنشاء مثيل واحد (Singleton)
const bootstrapManager = new BootstrapManager();

// إضافة إلى window للتشخيص (فقط في التطوير)
if (process.env.NODE_ENV === 'development') {
  window.bootstrapManager = bootstrapManager;
}

export default bootstrapManager;