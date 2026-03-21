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
      // Task 9.1.4: Initialize error tracking with backend integration
      await this._initErrorTracking();
      
      // تهيئة فورية بدون تأخير
      this.isInitialized = true;
      console.log('✅ Bootstrap Manager: Application initialized instantly');

    } catch (error) {
      console.error('❌ Bootstrap Manager: Initialization failed:', error);
      this.isInitialized = true;
    }
  }

  /**
   * تهيئة نظام تتبع الأخطاء
   * Task 9.1.4: Integrate error logging with backend
   */
  async _initErrorTracking() {
    console.log('🔍 Initializing error tracking...');

    try {
      const { initErrorTracking, setUserContext } = await import('../utils/errorTracking');
      
      // Initialize with custom service (Careerak backend)
      initErrorTracking({
        service: 'custom',
        enabled: true,
        environment: import.meta.env.MODE || 'production',
        release: '1.0.0',
        sampleRate: 1.0, // Track all errors
        ignoreErrors: [
          'ResizeObserver loop',
          'Non-Error promise rejection',
        ],
      });

      this.services.set('errorTracking', { initErrorTracking, setUserContext });
      console.log('✅ Error tracking initialized with backend integration');

      // Set user context if user is logged in
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserContext({
            id: user._id,
            email: user.email,
            username: user.name,
            role: user.role,
          });
          console.log('✅ User context set for error tracking');
        } catch (err) {
          console.warn('⚠️ Failed to set user context:', err);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error tracking initialization failed:', error.message);
    }
  }

  /**
   * تهيئة الخدمات الأساسية
   */
  async _initCoreServices() {
    console.log('🔧 Initializing core services...');

    // تهيئة API Discovery مع timeout
    try {
      const { discoverBestServer } = await import('../services/api');
      
      // إضافة timeout للتأكد من عدم التعليق
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API discovery timeout')), 5000)
      );
      
      const apiUrl = await Promise.race([
        discoverBestServer(),
        timeoutPromise
      ]);
      
      this.services.set('apiUrl', apiUrl);
      console.log('📡 API Server discovered:', apiUrl);
      
    } catch (error) {
      console.error('❌ API Discovery failed:', error);
      // استخدام URL افتراضي
      const fallbackUrl = 'https://careerak-vsc.vercel.app';
      this.services.set('apiUrl', fallbackUrl);
      console.log('📡 Using fallback API URL:', fallbackUrl);
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
    if (import.meta.env.DEV) {
      console.log('🛠️ Loading development utilities...');
      
      try {
        // تحميل الأدوات المساعدة بشكل ديناميكي
        const utilityPromises = [
          import('../utils/resetSettings').catch(() => null),
          import('../utils/appExitManager').catch(() => null)
        ];
        
        const results = await Promise.allSettled(utilityPromises);
        const loadedCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Development utilities loaded: ${loadedCount}/2`);
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
if (import.meta.env.DEV) {
  window.bootstrapManager = bootstrapManager;
}

export default bootstrapManager;