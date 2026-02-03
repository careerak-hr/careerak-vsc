/**
 * 📊 نظام التحليلات المتقدم لـ Careerak
 * يتتبع سلوك المستخدمين ويقدم رؤى قيمة لتحسين التطبيق
 */

class AdvancedAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.userJourney = [];
    this.performanceMetrics = {};
    
    this.initializeTracking();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeTracking() {
    // تتبع الأداء
    this.trackPerformance();
    
    // تتبع الأخطاء
    this.trackErrors();
    
    // تتبع التفاعل
    this.trackUserInteractions();
    
    // تتبع الشبكة
    this.trackNetworkStatus();
  }

  /**
   * تتبع الأحداث المخصصة
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language
      }
    };

    this.events.push(event);
    this.sendEventToServer(event);
    
    console.log(`📊 Event tracked: ${eventName}`, properties);
  }

  /**
   * تتبع رحلة المستخدم
   */
  trackUserJourney(step, metadata = {}) {
    const journeyStep = {
      step,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.startTime,
      metadata,
      sessionId: this.sessionId
    };

    this.userJourney.push(journeyStep);
    
    // تحليل الرحلة في الوقت الفعلي
    this.analyzeJourneyStep(journeyStep);
  }

  /**
   * تتبع أداء التطبيق
   */
  trackPerformance() {
    // تتبع أوقات التحميل
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      this.performanceMetrics.pageLoad = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcpConnection: perfData.connectEnd - perfData.connectStart,
        serverResponse: perfData.responseEnd - perfData.requestStart
      };

      this.trackEvent('page_performance', this.performanceMetrics.pageLoad);
    });

    // تتبع استخدام الذاكرة (إذا كان متاحاً)
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.performanceMetrics.memory = memoryInfo;
      }, 30000); // كل 30 ثانية
    }

    // تتبع FPS
    this.trackFPS();
  }

  /**
   * تتبع معدل الإطارات (FPS)
   */
  trackFPS() {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = (currentTime) => {
      frames++;
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        this.performanceMetrics.fps = fps;
        
        // إرسال تحذير إذا كان الأداء ضعيف
        if (fps < 30) {
          this.trackEvent('performance_warning', { fps, type: 'low_fps' });
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * تتبع الأخطاء
   */
  trackErrors() {
    // أخطاء JavaScript
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // أخطاء Promise
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    // أخطاء الشبكة
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      
      try {
        const response = await originalFetch(...args);
        
        // تتبع طلبات API
        this.trackEvent('api_request', {
          url: args[0],
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: Date.now() - startTime,
          success: response.ok
        });
        
        return response;
      } catch (error) {
        this.trackEvent('network_error', {
          url: args[0],
          method: args[1]?.method || 'GET',
          error: error.message,
          duration: Date.now() - startTime
        });
        throw error;
      }
    };
  }

  /**
   * تتبع تفاعل المستخدم
   */
  trackUserInteractions() {
    // النقرات
    document.addEventListener('click', (event) => {
      const element = event.target;
      const elementInfo = {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        text: element.textContent?.substring(0, 50),
        xpath: this.getXPath(element)
      };

      this.trackEvent('user_click', elementInfo);
    });

    // التمرير
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackEvent('user_scroll', {
          scrollY: window.scrollY,
          scrollPercentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
        });
      }, 250);
    });

    // تغيير الصفحة
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        this.trackEvent('page_change', {
          from: currentPath,
          to: window.location.pathname
        });
        currentPath = window.location.pathname;
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * تتبع حالة الشبكة
   */
  trackNetworkStatus() {
    // حالة الاتصال
    window.addEventListener('online', () => {
      this.trackEvent('network_status', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.trackEvent('network_status', { status: 'offline' });
    });

    // معلومات الاتصال (إذا كانت متاحة)
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.trackEvent('network_info', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });

      connection.addEventListener('change', () => {
        this.trackEvent('network_change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      });
    }
  }

  /**
   * تحليل سلوك المستخدم
   */
  analyzeUserBehavior() {
    const analysis = {
      sessionDuration: Date.now() - this.startTime,
      totalEvents: this.events.length,
      uniquePages: [...new Set(this.events.map(e => e.properties.url))].length,
      mostUsedFeatures: this.getMostUsedFeatures(),
      userEngagement: this.calculateEngagement(),
      conversionFunnel: this.analyzeConversionFunnel(),
      dropOffPoints: this.identifyDropOffPoints()
    };

    return analysis;
  }

  /**
   * تحديد الميزات الأكثر استخداماً
   */
  getMostUsedFeatures() {
    const featureUsage = {};
    
    this.events.forEach(event => {
      if (event.name === 'user_click') {
        const feature = this.identifyFeature(event.properties);
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      }
    });

    return Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  /**
   * حساب مستوى التفاعل
   */
  calculateEngagement() {
    const sessionDuration = Date.now() - this.startTime;
    const clickEvents = this.events.filter(e => e.name === 'user_click').length;
    const scrollEvents = this.events.filter(e => e.name === 'user_scroll').length;
    
    return {
      duration: sessionDuration,
      clicksPerMinute: (clickEvents / (sessionDuration / 60000)).toFixed(2),
      scrollsPerMinute: (scrollEvents / (sessionDuration / 60000)).toFixed(2),
      engagementScore: this.calculateEngagementScore()
    };
  }

  /**
   * تحليل قمع التحويل
   */
  analyzeConversionFunnel() {
    const funnelSteps = [
      'page_load',
      'user_registration_start',
      'user_registration_complete',
      'job_search',
      'job_application_start',
      'job_application_complete'
    ];

    const funnelData = {};
    
    funnelSteps.forEach(step => {
      funnelData[step] = this.events.filter(e => e.name === step).length;
    });

    return funnelData;
  }

  /**
   * تحديد نقاط التسرب
   */
  identifyDropOffPoints() {
    const pageViews = {};
    const exitPoints = {};
    
    this.userJourney.forEach((step, index) => {
      pageViews[step.step] = (pageViews[step.step] || 0) + 1;
      
      // إذا كانت آخر خطوة في الرحلة
      if (index === this.userJourney.length - 1) {
        exitPoints[step.step] = (exitPoints[step.step] || 0) + 1;
      }
    });

    const dropOffRates = {};
    Object.keys(pageViews).forEach(page => {
      dropOffRates[page] = ((exitPoints[page] || 0) / pageViews[page] * 100).toFixed(2);
    });

    return dropOffRates;
  }

  /**
   * إنشاء تقرير شامل
   */
  generateReport() {
    const report = {
      sessionInfo: {
        sessionId: this.sessionId,
        duration: Date.now() - this.startTime,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString()
      },
      userBehavior: this.analyzeUserBehavior(),
      performance: this.performanceMetrics,
      events: this.events,
      userJourney: this.userJourney,
      technicalInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    return report;
  }

  /**
   * إرسال التقرير للخادم
   */
  async sendReport() {
    const report = this.generateReport();
    
    try {
      await fetch('/api/analytics/session-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      
      console.log('📊 Analytics report sent successfully');
    } catch (error) {
      console.error('❌ Failed to send analytics report:', error);
      
      // حفظ محلياً للإرسال لاحقاً
      this.saveReportLocally(report);
    }
  }

  // Helper methods
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getXPath(element) {
    if (element.id) return `id("${element.id}")`;
    if (element === document.body) return 'html/body';
    
    let ix = 0;
    const siblings = element.parentNode?.childNodes || [];
    
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        return `${this.getXPath(element.parentNode)}/${element.tagName.toLowerCase()}[${ix + 1}]`;
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }

  identifyFeature(clickProperties) {
    const { className, id, tagName } = clickProperties;
    
    // تحديد الميزة بناءً على العنصر المنقور
    if (className?.includes('login')) return 'login';
    if (className?.includes('register')) return 'registration';
    if (className?.includes('job')) return 'job_search';
    if (className?.includes('profile')) return 'profile';
    if (className?.includes('course')) return 'courses';
    if (tagName === 'BUTTON') return 'button_interaction';
    if (tagName === 'INPUT') return 'form_interaction';
    
    return 'general_interaction';
  }

  calculateEngagementScore() {
    const duration = Date.now() - this.startTime;
    const events = this.events.length;
    const pages = [...new Set(this.events.map(e => e.properties.url))].length;
    
    // خوارزمية بسيطة لحساب نقاط التفاعل
    let score = 0;
    score += Math.min(duration / 60000, 10) * 10; // مدة الجلسة (حد أقصى 100 نقطة)
    score += Math.min(events / 10, 5) * 10; // عدد الأحداث (حد أقصى 50 نقطة)
    score += Math.min(pages, 5) * 10; // عدد الصفحات (حد أقصى 50 نقطة)
    
    return Math.round(score);
  }

  analyzeJourneyStep(step) {
    // تحليل فوري لخطوة الرحلة
    const timeSpent = step.timeFromStart;
    
    if (timeSpent > 300000) { // أكثر من 5 دقائق
      this.trackEvent('long_session', { duration: timeSpent });
    }
    
    // تحديد إذا كان المستخدم عالق في صفحة معينة
    const sameStepCount = this.userJourney.filter(s => s.step === step.step).length;
    if (sameStepCount > 3) {
      this.trackEvent('user_stuck', { step: step.step, count: sameStepCount });
    }
  }

  async sendEventToServer(event) {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // حفظ الحدث محلياً للإرسال لاحقاً
      this.saveEventLocally(event);
    }
  }

  saveEventLocally(event) {
    const savedEvents = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
    savedEvents.push(event);
    localStorage.setItem('pending_analytics', JSON.stringify(savedEvents.slice(-100)));
  }

  saveReportLocally(report) {
    const savedReports = JSON.parse(localStorage.getItem('pending_reports') || '[]');
    savedReports.push(report);
    localStorage.setItem('pending_reports', JSON.stringify(savedReports.slice(-10)));
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const analytics = new AdvancedAnalytics();

// تصدير الكلاس للاستخدام المتقدم
export default AdvancedAnalytics;