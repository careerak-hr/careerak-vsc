// 📊 مراقبة الأداء مع fallback كامل (بدون web-vitals)
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.errors = [];
    this.userActions = [];
    this.apiCalls = [];
    this.startTime = Date.now();
    
    this.initFallbackMetrics();
    this.initErrorTracking();
    this.initUserActionTracking();
  }

  // 📊 مقاييس بديلة إذا لم تكن web-vitals متاحة
  initFallbackMetrics() {
    // استخدام Performance API المدمج
    if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics['FCP'] = {
            value: navigation.loadEventEnd - navigation.fetchStart,
            rating: 'needs-improvement',
            timestamp: Date.now()
          };
          
          this.metrics['LCP'] = {
            value: navigation.loadEventEnd - navigation.fetchStart,
            rating: 'needs-improvement',
            timestamp: Date.now()
          };
        }
      }, 1000);
    }
  }

  // 🚨 تتبع الأخطاء
  initErrorTracking() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          type: 'JavaScript Error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'Unhandled Promise Rejection',
          message: event.reason?.message || 'Unknown promise rejection',
          stack: event.reason?.stack,
          timestamp: Date.now(),
          url: window.location.href
        });
      });
    }
  }

  // 👤 تتبع إجراءات المستخدم
  initUserActionTracking() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // تتبع النقرات
      document.addEventListener('click', (event) => {
        this.logUserAction({
          type: 'click',
          element: event.target.tagName,
          className: event.target.className,
          id: event.target.id,
          text: event.target.textContent?.substring(0, 50),
          timestamp: Date.now(),
          url: window.location.href
        });
      });

      // تتبع تغيير الصفحات
      let currentPath = window.location.pathname;
      const observer = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
          this.logPageView(window.location.pathname, currentPath);
          currentPath = window.location.pathname;
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // 📝 تسجيل الأخطاء
  logError(error) {
    this.errors.push(error);
    
    // الاحتفاظ بآخر 50 خطأ فقط
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    // إرسال الأخطاء الحرجة فوراً
    if (this.isCriticalError(error)) {
      this.sendErrorReport(error);
    }

    console.error('Performance Monitor - Error logged:', error);
  }

  // 👤 تسجيل إجراءات المستخدم
  logUserAction(action) {
    this.userActions.push(action);
    
    // الاحتفاظ بآخر 100 إجراء فقط
    if (this.userActions.length > 100) {
      this.userActions = this.userActions.slice(-100);
    }
  }

  // 📄 تسجيل عرض الصفحات
  logPageView(newPath, oldPath) {
    if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
      const pageView = {
        type: 'page_view',
        from: oldPath,
        to: newPath,
        timestamp: Date.now(),
        loadTime: performance.now()
      };
      
      this.userActions.push(pageView);
      this.sendPageView(pageView);
    }
  }

  // 🌐 تتبع استدعاءات API
  trackApiCall(method, url, duration, status, error = null) {
    const apiCall = {
      method,
      url,
      duration,
      status,
      error,
      timestamp: Date.now()
    };
    
    this.apiCalls.push(apiCall);
    
    // الاحتفاظ بآخر 100 استدعاء فقط
    if (this.apiCalls.length > 100) {
      this.apiCalls = this.apiCalls.slice(-100);
    }

    // تحذير للاستدعاءات البطيئة
    if (duration > 3000) {
      this.logError({
        type: 'Slow API Call',
        message: `API call to ${url} took ${duration}ms`,
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }

  // 🔍 فحص الأخطاء الحرجة
  isCriticalError(error) {
    const criticalPatterns = [
      /network error/i,
      /failed to fetch/i,
      /unauthorized/i,
      /server error/i,
      /timeout/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.type)
    );
  }

  // 📊 إرسال المقاييس
  sendMetric(metric) {
    // يمكن إرسالها إلى Google Analytics أو خدمة أخرى
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', metric.name, {
      //   value: Math.round(metric.value),
      //   metric_rating: metric.rating
      // });
    }
  }

  // 🚨 إرسال تقرير الأخطاء
  sendErrorReport(error) {
    if (process.env.NODE_ENV === 'production') {
      // يمكن إرسالها إلى Sentry أو خدمة أخرى
      console.error('Critical error reported:', error);
    }
  }

  // 📄 إرسال عرض الصفحة
  sendPageView(pageView) {
    if (process.env.NODE_ENV === 'production') {
      // gtag('config', 'GA_MEASUREMENT_ID', {
      //   page_path: pageView.to
      // });
    }
  }

  // 📈 الحصول على تقرير الأداء
  getPerformanceReport() {
    const now = Date.now();
    const sessionDuration = now - this.startTime;
    
    return {
      session: {
        duration: sessionDuration,
        startTime: this.startTime,
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      },
      metrics: this.metrics,
      errors: {
        count: this.errors.length,
        recent: this.errors.slice(-5),
        critical: this.errors.filter(e => this.isCriticalError(e))
      },
      userActions: {
        count: this.userActions.length,
        recent: this.userActions.slice(-10)
      },
      apiCalls: {
        count: this.apiCalls.length,
        averageTime: this.getAverageApiTime(),
        slowCalls: this.apiCalls.filter(call => call.duration > 3000),
        errorRate: this.getApiErrorRate()
      },
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo()
    };
  }

  // ⏱️ متوسط وقت API
  getAverageApiTime() {
    if (this.apiCalls.length === 0) return 0;
    const totalTime = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(totalTime / this.apiCalls.length);
  }

  // 📊 معدل أخطاء API
  getApiErrorRate() {
    if (this.apiCalls.length === 0) return 0;
    const errorCalls = this.apiCalls.filter(call => call.status >= 400);
    return Math.round((errorCalls.length / this.apiCalls.length) * 100);
  }

  // 💾 معلومات الذاكرة
  getMemoryInfo() {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  // 🌐 معلومات الاتصال
  getConnectionInfo() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // 🧹 تنظيف البيانات
  clearData() {
    this.errors = [];
    this.userActions = [];
    this.apiCalls = [];
    this.metrics = {};
  }

  // 💾 حفظ التقرير محلياً
  saveReportLocally() {
    const report = this.getPerformanceReport();
    localStorage.setItem('performance_report', JSON.stringify(report));
    return report;
  }
}

// إنشاء مثيل واحد للمراقب
const performanceMonitor = new PerformanceMonitor();

// تصدير المراقب والدوال المساعدة
export default performanceMonitor;

export const trackApiCall = (method, url, duration, status, error) => {
  performanceMonitor.trackApiCall(method, url, duration, status, error);
};

export const logError = (error) => {
  performanceMonitor.logError(error);
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

// إضافة المراقب إلى window للوصول من الكونسول
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
  window.getPerformanceReport = getPerformanceReport;
}