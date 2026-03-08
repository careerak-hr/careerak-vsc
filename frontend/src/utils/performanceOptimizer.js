/**
 * ⚡ أداة تحسين الأداء والسرعة المتقدمة
 * تحسن أداء التطبيق وتقلل أوقات التحميل بشكل كبير
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.lazyLoadObserver = null;
    this.performanceMetrics = {};
    this.initialized = false;
  }

  initializeOptimizations() {
    if (this.initialized) return;

    this.setupServiceWorker();
    this.setupImageOptimization();
    this.setupLazyLoading();
    this.setupResourcePreloading();
    this.setupMemoryManagement();
    this.setupNetworkOptimization();

    this.initialized = true;
  }

  /**
   * إعداد Service Worker للتخزين المؤقت المتقدم
   */
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Use the correct path: /service-worker.js instead of /sw.js
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registered successfully');
        
        // تحديث تلقائي للـ Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * تحسين الصور التلقائي
   */
  setupImageOptimization() {
    // تحويل الصور إلى WebP تلقائياً
    this.optimizeImages();
    
    // ضغط الصور قبل الرفع
    this.setupImageCompression();
    
    // تحميل تدريجي للصور
    this.setupProgressiveImageLoading();
  }

  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      const originalSrc = img.dataset.src;
      
      // تحقق من دعم WebP
      if (this.supportsWebP()) {
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        img.src = webpSrc;
        
        // fallback للصورة الأصلية
        img.onerror = () => {
          img.src = originalSrc;
        };
      } else {
        img.src = originalSrc;
      }
    });
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * إعداد التحميل التدريجي (Lazy Loading)
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target);
            this.lazyLoadObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // مراقبة العناصر القابلة للتحميل التدريجي
      document.querySelectorAll('[data-lazy]').forEach(element => {
        this.lazyLoadObserver.observe(element);
      });
    }
  }

  loadElement(element) {
    if (element.tagName === 'IMG') {
      element.src = element.dataset.src;
      element.classList.add('loaded');
    } else if (element.tagName === 'IFRAME') {
      element.src = element.dataset.src;
    } else {
      // تحميل محتوى ديناميكي
      this.loadDynamicContent(element);
    }
  }

  loadDynamicContent(element) {
    // Basic implementation for dynamic content
    console.log('Loading dynamic content for:', element);
  }

  setupImageCompression() {
    // Placeholder for image compression logic
  }

  setupProgressiveImageLoading() {
    // Placeholder for progressive loading logic
  }

  /**
   * تحميل مسبق للموارد المهمة
   */
  setupResourcePreloading() {
    // تحميل مسبق للصفحات المحتملة
    this.preloadCriticalPages();
    
    // تحميل مسبق للخطوط
    this.preloadFonts();
    
    // تحميل مسبق للـ API calls
    this.preloadAPIData();
  }

  preloadCriticalPages() {
    const criticalPages = ['/profile', '/job-postings', '/courses'];
    
    criticalPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }

  preloadFonts() {
    const fonts = [
      '/assets/fonts/amiri/Amiri-Regular.woff2',
      '/assets/fonts/cormorant-garamond/CormorantGaramond-Regular.woff2'
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      document.head.appendChild(link);
    });
  }

  preloadAPIData() {
    // Placeholder for API preloading
  }

  /**
   * إدارة الذاكرة المتقدمة
   */
  setupMemoryManagement() {
    // تنظيف الذاكرة دورياً
    setInterval(() => {
      this.cleanupMemory();
    }, 300000); // كل 5 دقائق

    // مراقبة استخدام الذاكرة
    this.monitorMemoryUsage();
    
    // تنظيف عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      this.cleanupMemory();
    });
  }

  cleanupMemory() {
    // تنظيف الكاش القديم
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 دقيقة

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }

    // تنظيف DOM العناصر غير المستخدمة
    this.cleanupUnusedElements();
    
    // إجبار garbage collection (إذا كان متاحاً)
    if (window.gc) {
      window.gc();
    }

    console.log('Sweep: Memory cleanup completed');
  }

  cleanupUnusedElements() {
    // Implementation for cleaning up detached DOM nodes or other resources
  }

  monitorMemoryUsage() {
    if (window.performance && performance.memory) {
      setInterval(() => {
        const memInfo = performance.memory;
        const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          console.warn('⚠️ High memory usage detected:', usagePercent.toFixed(2) + '%');
          this.cleanupMemory();
        }
        
        this.performanceMetrics.memoryUsage = usagePercent;
      }, 10000); // كل 10 ثواني
    }
  }

  /**
   * تحسين الشبكة والـ API calls
   */
  setupNetworkOptimization() {
    // تجميع طلبات API
    this.setupRequestBatching();
    
    // إعادة المحاولة الذكية
    this.setupSmartRetry();
    
    // ضغط البيانات
    this.setupDataCompression();
  }

  setupRequestBatching() {
    this.batchQueue = [];
    this.batchTimeout = null;

    this.batchRequest = (url, options) => {
      return new Promise((resolve, reject) => {
        this.batchQueue.push({ url, options, resolve, reject });
        
        if (this.batchTimeout) {
          clearTimeout(this.batchTimeout);
        }
        
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, 50); // تجميع الطلبات لمدة 50ms
      });
    };
  }

  async processBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // تجميع الطلبات المتشابهة
    const groupedRequests = this.groupSimilarRequests(batch);
    
    for (const group of groupedRequests) {
      try {
        const results = await this.executeBatchRequest(group);
        group.forEach((request, index) => {
          request.resolve(results[index]);
        });
      } catch (error) {
        group.forEach(request => {
          request.reject(error);
        });
      }
    }
  }

  groupSimilarRequests(requests) {
    // Basic implementation: group by URL
    const groups = new Map();
    requests.forEach(req => {
      const group = groups.get(req.url) || [];
      group.push(req);
      groups.set(req.url, group);
    });
    return Array.from(groups.values());
  }

  async executeBatchRequest(group) {
    // Placeholder for actual batch request execution
    return group.map(() => ({ success: true }));
  }

  setupSmartRetry() {
    // Placeholder for smart retry logic
  }

  setupDataCompression() {
    // Placeholder for data compression logic
  }

  /**
   * ضغط البيانات قبل الإرسال
   */
  async compressData(data) {
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(JSON.stringify(data)));
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    }
    
    return JSON.stringify(data);
  }

  /**
   * تحسين الرسوم المتحركة
   */
  optimizeAnimations() {
    // استخدام requestAnimationFrame للرسوم المتحركة
    this.animationQueue = [];
    this.isAnimating = false;

    this.addAnimation = (callback) => {
      this.animationQueue.push(callback);
      if (!this.isAnimating) {
        this.processAnimations();
      }
    };

    this.processAnimations = () => {
      this.isAnimating = true;
      
      const processFrame = () => {
        const startTime = performance.now();
        
        while (this.animationQueue.length > 0 && (performance.now() - startTime) < 16) {
          const animation = this.animationQueue.shift();
          animation();
        }
        
        if (this.animationQueue.length > 0) {
          requestAnimationFrame(processFrame);
        } else {
          this.isAnimating = false;
        }
      };
      
      requestAnimationFrame(processFrame);
    };
  }

  /**
   * تحسين التمرير (Scroll Optimization)
   */
  optimizeScrolling() {
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }

  handleScroll() {
    // تحديث العناصر المرئية فقط
    const viewportHeight = window.innerHeight;

    document.querySelectorAll('[data-scroll-optimize]').forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < viewportHeight && rect.bottom > 0;
      
      if (isVisible && !element.dataset.scrollActive) {
        element.dataset.scrollActive = 'true';
        this.activateElement(element);
      } else if (!isVisible && element.dataset.scrollActive) {
        element.dataset.scrollActive = 'false';
        this.deactivateElement(element);
      }
    });
  }

  activateElement(element) {
    console.log('Activating element:', element);
  }

  deactivateElement(element) {
    console.log('Deactivating element:', element);
  }

  /**
   * تحسين الأحداث (Event Optimization)
   */
  optimizeEvents() {
    // تجميع الأحداث المتشابهة
    this.eventQueue = new Map();
    
    this.throttledEvent = (eventName, callback, delay = 100) => {
      if (this.eventQueue.has(eventName)) {
        clearTimeout(this.eventQueue.get(eventName));
      }
      
      const timeoutId = setTimeout(() => {
        callback();
        this.eventQueue.delete(eventName);
      }, delay);
      
      this.eventQueue.set(eventName, timeoutId);
    };
  }

  /**
   * تقرير الأداء المفصل
   */
  generatePerformanceReport() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    
    if (!navigation) return { error: 'Navigation timing not available' };

    return {
      pageLoad: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      },
      
      resources: {
        totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        totalRequests: resources.length,
        slowestResource: resources.reduce((slowest, resource) => 
          resource.duration > (slowest?.duration || 0) ? resource : slowest, null
        )
      },
      
      memory: this.performanceMetrics.memoryUsage,
      
      optimizations: {
        cacheHitRate: this.calculateCacheHitRate(),
        lazyLoadedElements: document.querySelectorAll('[data-lazy].loaded').length
      }
    };
  }

  // Helper methods
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  calculateCacheHitRate() {
    const totalRequests = this.performanceMetrics.totalRequests || 1;
    const cacheHits = this.performanceMetrics.cacheHits || 0;
    return cacheHits / totalRequests;
  }

  showUpdateNotification() {
    // إظهار إشعار للمستخدم بوجود تحديث
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('تحديث متاح', {
        body: 'يتوفر إصدار جديد من التطبيق. انقر لإعادة التحميل.',
        icon: '/logo.jpg',
        tag: 'app-update'
      });
    }
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const performanceOptimizer = new PerformanceOptimizer();

// تصدير الكلاس للاستخدام المتقدم
export default PerformanceOptimizer;
