/**
 * Performance Optimization Utilities
 * 
 * مجموعة شاملة من الأدوات لتحسين أداء التطبيق
 * الهدف: تحميل الصفحة في أقل من 2 ثانية
 * 
 * @module performanceOptimization
 */

// ============================================
// 1. Lazy Loading للصور
// ============================================

/**
 * تحميل الصور بشكل كسول (lazy loading)
 * يحمل الصور فقط عندما تكون قريبة من viewport
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // تحميل الصور قبل 50px من الظهور
      threshold: 0.01
    });

    // مراقبة جميع الصور مع data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// ============================================
// 2. Debounce & Throttle
// ============================================

/**
 * Debounce - تأخير تنفيذ الدالة حتى يتوقف المستخدم عن الإدخال
 * مفيد للبحث والفلترة
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle - تحديد عدد مرات تنفيذ الدالة في فترة زمنية
 * مفيد للـ scroll events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ============================================
// 3. Memoization للبيانات
// ============================================

/**
 * Cache بسيط للبيانات
 * يخزن النتائج لتجنب إعادة الحسابات
 */
class SimpleCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // نقل العنصر للنهاية (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    // حذف أقدم عنصر إذا وصلنا للحد الأقصى
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const dataCache = new SimpleCache(50);

// ============================================
// 4. Request Batching
// ============================================

/**
 * تجميع الطلبات المتعددة في طلب واحد
 * يقلل عدد الطلبات للخادم
 */
class RequestBatcher {
  constructor(batchDelay = 50) {
    this.queue = [];
    this.batchDelay = batchDelay;
    this.timeout = null;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);
    this.timeout = null;

    try {
      // إرسال جميع الطلبات دفعة واحدة
      const requests = batch.map(item => item.request);
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      });

      const results = await response.json();
      
      // توزيع النتائج
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

export const requestBatcher = new RequestBatcher(50);

// ============================================
// 5. Virtual Scrolling Helper
// ============================================

/**
 * حساب العناصر المرئية فقط في القائمة الطويلة
 * يحسن الأداء بشكل كبير للقوائم الكبيرة
 */
export const calculateVisibleItems = (
  scrollTop,
  containerHeight,
  itemHeight,
  totalItems,
  overscan = 3
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1
  };
};

// ============================================
// 6. Preload Critical Resources
// ============================================

/**
 * تحميل مسبق للموارد الحرجة
 * يحسن وقت التحميل الأولي
 */
export const preloadCriticalResources = (resources) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.type; // 'image', 'script', 'style', 'font'
    link.href = resource.url;
    
    if (resource.type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

// ============================================
// 7. Code Splitting Helper
// ============================================

/**
 * تحميل المكونات بشكل ديناميكي
 * يقلل حجم الحزمة الأولية
 */
export const loadComponent = async (componentPath) => {
  try {
    const module = await import(/* webpackChunkName: "[request]" */ `${componentPath}`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    throw error;
  }
};

// ============================================
// 8. Performance Monitoring
// ============================================

/**
 * قياس أداء الصفحة
 * يساعد في تحديد نقاط الضعف
 */
export const measurePagePerformance = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    const metrics = {};

    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          console.log(`FCP: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
      console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.fid = entry.processingStart - entry.startTime;
        console.log(`FID: ${metrics.fid.toFixed(2)}ms`);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
      metrics.cls = clsScore;
      console.log(`CLS: ${clsScore.toFixed(4)}`);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Time to Interactive (TTI)
    window.addEventListener('load', () => {
      const timing = performance.timing;
      metrics.tti = timing.domInteractive - timing.navigationStart;
      console.log(`TTI: ${metrics.tti}ms`);
      
      // إجمالي وقت التحميل
      metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`Total Load Time: ${metrics.loadTime}ms`);
      
      // تحذير إذا تجاوز 2 ثانية
      if (metrics.loadTime > 2000) {
        console.warn(`⚠️ Page load time (${metrics.loadTime}ms) exceeds 2 seconds target!`);
      } else {
        console.log(`✅ Page load time (${metrics.loadTime}ms) is within 2 seconds target!`);
      }
    });

    return metrics;
  }
  
  return null;
};

// ============================================
// 9. Resource Hints
// ============================================

/**
 * إضافة resource hints للتحسين
 * dns-prefetch, preconnect, prefetch
 */
export const addResourceHints = (hints) => {
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel; // 'dns-prefetch', 'preconnect', 'prefetch'
    link.href = hint.href;
    
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin;
    }
    
    document.head.appendChild(link);
  });
};

// ============================================
// 10. Optimize Animations
// ============================================

/**
 * تحسين الرسوم المتحركة
 * استخدام requestAnimationFrame
 */
export const optimizedAnimation = (callback) => {
  let ticking = false;

  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
};

// ============================================
// 11. Network Information API
// ============================================

/**
 * تكييف الأداء حسب سرعة الشبكة
 */
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData // boolean
    };
  }
  
  return null;
};

/**
 * تحديد ما إذا كان يجب تحميل محتوى عالي الجودة
 */
export const shouldLoadHighQuality = () => {
  const networkInfo = getNetworkInfo();
  
  if (!networkInfo) return true; // افتراضي: تحميل عالي الجودة
  
  // لا تحمل عالي الجودة على شبكات بطيئة أو وضع توفير البيانات
  if (networkInfo.saveData || networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
    return false;
  }
  
  return true;
};

// ============================================
// 12. Prefetch Next Page
// ============================================

/**
 * تحميل مسبق للصفحة التالية
 * يحسن التنقل بين الصفحات
 */
export const prefetchNextPage = (url) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// ============================================
// 13. Service Worker Helper
// ============================================

/**
 * تسجيل Service Worker للتخزين المؤقت
 */
export const registerServiceWorker = async (swPath = '/service-worker.js') => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// ============================================
// 14. Memory Management
// ============================================

/**
 * تنظيف الذاكرة
 * إزالة المستمعين والمراجع غير المستخدمة
 */
export const cleanupMemory = () => {
  // تنظيف الـ cache
  dataCache.clear();
  
  // تنظيف الصور المحملة
  const images = document.querySelectorAll('img.loaded');
  images.forEach(img => {
    if (!img.isConnected) {
      img.src = '';
    }
  });
  
  // اقتراح garbage collection (إذا كان متاحاً)
  if (window.gc) {
    window.gc();
  }
};

// ============================================
// 15. Bundle Size Optimization
// ============================================

/**
 * تحميل المكتبات الكبيرة فقط عند الحاجة
 */
export const loadHeavyLibrary = async (libraryName) => {
  const libraries = {
    'chart': () => import('chart.js'),
    'pdf': () => import('pdfjs-dist'),
    'video': () => import('video.js'),
    // أضف المكتبات الأخرى هنا
  };

  if (libraries[libraryName]) {
    try {
      const module = await libraries[libraryName]();
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load library: ${libraryName}`, error);
      return null;
    }
  }

  return null;
};

// ============================================
// Export All
// ============================================

export default {
  lazyLoadImages,
  debounce,
  throttle,
  dataCache,
  requestBatcher,
  calculateVisibleItems,
  preloadCriticalResources,
  loadComponent,
  measurePagePerformance,
  addResourceHints,
  optimizedAnimation,
  getNetworkInfo,
  shouldLoadHighQuality,
  prefetchNextPage,
  registerServiceWorker,
  cleanupMemory,
  loadHeavyLibrary
};
