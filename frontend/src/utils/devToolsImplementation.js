import React from 'react';
import ReactDOM from 'react-dom';

// تحميل الأدوات بشكل آمن
let performanceMonitor = null;
let getPerformanceReport = null;
let PerformanceDashboard = null;

try {
  const monitoring = require('./monitoring');
  performanceMonitor = monitoring.default;
  getPerformanceReport = monitoring.getPerformanceReport;
} catch (error) {
  console.warn('Performance monitoring not available in devTools');
}

try {
  PerformanceDashboard = require('../components/PerformanceDashboard').default;
} catch (error) {
  console.warn('PerformanceDashboard component not available');
}

// 🛠️ أدوات التطوير والتشخيص
class DevTools {
  constructor() {
    this.dashboardContainer = null;
    this.isDashboardVisible = false;
    
    this.initDevTools();
  }

  // 🚀 تهيئة أدوات التطوير
  initDevTools() {
    // إضافة أدوات إلى window للوصول من الكونسول
    window.devTools = {
      // 📊 مراقبة الأداء
      performance: {
        getReport: () => getPerformanceReport ? getPerformanceReport() : null,
        showDashboard: () => this.showPerformanceDashboard(),
        hideDashboard: () => this.hidePerformanceDashboard(),
        clearData: () => performanceMonitor ? performanceMonitor.clearData() : null,
        saveReport: () => performanceMonitor ? performanceMonitor.saveReportLocally() : null
      },

      // 🧪 اختبارات الأداء
      tests: {
        // اختبار سرعة الاستجابة
        responseTime: async (url = '/api/health', iterations = 5) => {
          console.log(`🧪 اختبار سرعة الاستجابة لـ ${url} (${iterations} مرات)`);
          const times = [];
          
          for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            try {
              await fetch(url);
              const end = performance.now();
              times.push(end - start);
            } catch (error) {
              console.error(`خطأ في المحاولة ${i + 1}:`, error);
            }
          }
          
          const average = times.reduce((a, b) => a + b, 0) / times.length;
          const min = Math.min(...times);
          const max = Math.max(...times);
          
          console.log(`📊 النتائج:`, {
            average: `${average.toFixed(2)}ms`,
            min: `${min.toFixed(2)}ms`,
            max: `${max.toFixed(2)}ms`,
            times: times.map(t => `${t.toFixed(2)}ms`)
          });
          
          return { average, min, max, times };
        },

        // اختبار الذاكرة
        memoryUsage: () => {
          if ('memory' in performance) {
            const memory = performance.memory;
            console.log('💾 استخدام الذاكرة:', {
              used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
              total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
              limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
              percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
            });
            return memory;
          } else {
            console.warn('معلومات الذاكرة غير متاحة في هذا المتصفح');
            return null;
          }
        },

        // اختبار تحميل الصور
        imageLoadTest: (imageUrl) => {
          return new Promise((resolve, reject) => {
            const start = performance.now();
            const img = new Image();
            
            img.onload = () => {
              const loadTime = performance.now() - start;
              console.log(`🖼️ تم تحميل الصورة في ${loadTime.toFixed(2)}ms`);
              resolve({ loadTime, width: img.width, height: img.height });
            };
            
            img.onerror = () => {
              const loadTime = performance.now() - start;
              console.error(`❌ فشل تحميل الصورة بعد ${loadTime.toFixed(2)}ms`);
              reject(new Error('فشل تحميل الصورة'));
            };
            
            img.src = imageUrl;
          });
        },

        // اختبار حقول الإدخال
        inputFields: async () => {
          try {
            const inputTester = await import('./inputFieldTester');
            return inputTester.default.runComprehensiveTest();
          } catch (error) {
            console.error('❌ فشل تحميل أداة اختبار حقول الإدخال:', error);
          }
        },

        // اختبار سريع لحقل إدخال محدد
        quickInputTest: async (selector) => {
          try {
            const inputTester = await import('./inputFieldTester');
            return inputTester.default.quickTest(selector);
          } catch (error) {
            console.error('❌ فشل تحميل أداة اختبار حقول الإدخال:', error);
          }
        }
      },

      // 🔍 أدوات التشخيص
      diagnostics: {
        // فحص حالة التطبيق
        healthCheck: async () => {
          console.log('🏥 فحص حالة التطبيق...');
          
          const checks = {
            localStorage: this.checkLocalStorage(),
            sessionStorage: this.checkSessionStorage(),
            indexedDB: this.checkIndexedDB(),
            webWorkers: this.checkWebWorkers(),
            serviceWorker: await this.checkServiceWorker(),
            geolocation: this.checkGeolocation(),
            camera: await this.checkCamera(),
            notifications: this.checkNotifications()
          };
          
          console.table(checks);
          return checks;
        },

        // فحص الأخطاء الحالية
        checkErrors: () => {
          if (!getPerformanceReport) return null;
          
          const report = getPerformanceReport();
          console.log('🚨 تقرير الأخطاء:', {
            totalErrors: report.errors.count,
            criticalErrors: report.errors.critical.length,
            recentErrors: report.errors.recent
          });
          return report.errors;
        },

        // فحص أداء API
        checkApiPerformance: () => {
          if (!getPerformanceReport) return null;
          
          const report = getPerformanceReport();
          console.log('🌐 أداء API:', report.apiCalls);
          return report.apiCalls;
        }
      },

      // 🧹 أدوات التنظيف
      cleanup: {
        clearAllData: () => {
          localStorage.clear();
          sessionStorage.clear();
          if (performanceMonitor && performanceMonitor.clearData) {
            performanceMonitor.clearData();
          }
          console.log('🧹 تم مسح جميع البيانات');
        },
        
        clearPerformanceData: () => {
          if (performanceMonitor && performanceMonitor.clearData) {
            performanceMonitor.clearData();
          }
          console.log('📊 تم مسح بيانات الأداء');
        },
        
        clearStorageData: () => {
          localStorage.clear();
          sessionStorage.clear();
          console.log('💾 تم مسح بيانات التخزين');
        }
      }
    };

    // إضافة اختصارات لوحة المفاتيح
    this.initKeyboardShortcuts();
    
    // طباعة رسالة ترحيب للمطورين
    this.printWelcomeMessage();
  }

  // ⌨️ اختصارات لوحة المفاتيح
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl + Shift + P = إظهار لوحة الأداء
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.togglePerformanceDashboard();
      }
      
      // Ctrl + Shift + D = تشخيص سريع
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        window.devTools.diagnostics.healthCheck();
      }
      
      // Ctrl + Shift + C = مسح البيانات
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        // استخدام window.confirm بدلاً من confirm المباشر
        if (window.confirm('هل تريد مسح جميع بيانات التطبيق؟')) {
          window.devTools.cleanup.clearAllData();
          window.location.reload();
        }
      }
      
      // Ctrl + Shift + I = اختبار حقول الإدخال
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        window.devTools.tests.inputFields();
      }
    });
  }

  // 📊 إظهار/إخفاء لوحة الأداء
  togglePerformanceDashboard() {
    if (this.isDashboardVisible) {
      this.hidePerformanceDashboard();
    } else {
      this.showPerformanceDashboard();
    }
  }

  showPerformanceDashboard() {
    if (!PerformanceDashboard) {
      console.warn('Performance Dashboard not available');
      return;
    }
    
    if (!this.dashboardContainer) {
      this.dashboardContainer = document.createElement('div');
      document.body.appendChild(this.dashboardContainer);
    }
    
    this.isDashboardVisible = true;
    
    ReactDOM.render(
      React.createElement(PerformanceDashboard, {
        isVisible: true,
        onClose: () => this.hidePerformanceDashboard()
      }),
      this.dashboardContainer
    );
  }

  hidePerformanceDashboard() {
    if (this.dashboardContainer) {
      ReactDOM.unmountComponentAtNode(this.dashboardContainer);
      this.isDashboardVisible = false;
    }
  }

  // 🔍 فحوصات التشخيص
  checkLocalStorage() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return '✅ متاح';
    } catch (e) {
      return '❌ غير متاح';
    }
  }

  checkSessionStorage() {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return '✅ متاح';
    } catch (e) {
      return '❌ غير متاح';
    }
  }

  checkIndexedDB() {
    return 'indexedDB' in window ? '✅ متاح' : '❌ غير متاح';
  }

  checkWebWorkers() {
    return 'Worker' in window ? '✅ متاح' : '❌ غير متاح';
  }

  async checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration ? '✅ مسجل' : '⚠️ غير مسجل';
      } catch (e) {
        return '❌ خطأ';
      }
    }
    return '❌ غير متاح';
  }

  checkGeolocation() {
    return 'geolocation' in navigator ? '✅ متاح' : '❌ غير متاح';
  }

  async checkCamera() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return '✅ متاح';
      } catch (e) {
        return '⚠️ مرفوض';
      }
    }
    return '❌ غير متاح';
  }

  checkNotifications() {
    if ('Notification' in window) {
      return `✅ ${Notification.permission}`;
    }
    return '❌ غير متاح';
  }

  // 👋 رسالة ترحيب للمطورين
  printWelcomeMessage() {
    console.log(`
%c🚀 CareerAK Developer Tools
%c
أدوات التطوير متاحة في window.devTools

📊 الأداء:
  • window.devTools.performance.getReport() - تقرير الأداء
  • window.devTools.performance.showDashboard() - لوحة الأداء

🧪 الاختبارات:
  • window.devTools.tests.responseTime() - اختبار سرعة الاستجابة
  • window.devTools.tests.memoryUsage() - اختبار الذاكرة
  • window.devTools.tests.inputFields() - اختبار حقول الإدخال
  • window.devTools.tests.quickInputTest(selector) - اختبار سريع لحقل محدد

🔍 التشخيص:
  • window.devTools.diagnostics.healthCheck() - فحص الحالة
  • window.devTools.diagnostics.checkErrors() - فحص الأخطاء

⌨️ اختصارات لوحة المفاتيح:
  • Ctrl + Shift + P - لوحة الأداء
  • Ctrl + Shift + D - تشخيص سريع
  • Ctrl + Shift + I - اختبار حقول الإدخال
  • Ctrl + Shift + C - مسح البيانات

🧹 التنظيف:
  • window.devTools.cleanup.clearAllData() - مسح جميع البيانات
    `, 
    'color: #304B60; font-size: 16px; font-weight: bold;',
    'color: #666; font-size: 12px;'
    );
  }
}

// إنشاء مثيل من أدوات التطوير
const devTools = new DevTools();

export default devTools;