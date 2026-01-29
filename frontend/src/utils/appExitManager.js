/**
 * مدير الخروج من التطبيق - نسخة مبسطة وآمنة
 * App Exit Manager - Simplified and Safe Version
 */

class AppExitManager {
  constructor() {
    this.isExiting = false;
    console.log('🚪 AppExitManager initialized');
  }

  /**
   * الخروج النهائي من التطبيق
   * @param {string} reason - سبب الخروج للتسجيل
   */
  async exitApp(reason = 'User requested exit') {
    if (this.isExiting) {
      console.log('🚪 Exit already in progress...');
      return;
    }

    this.isExiting = true;
    console.log(`🚪 Exiting app: ${reason}`);

    try {
      // إيقاف جميع الأصوات أولاً
      if (window.audioManager && window.audioManager.stopAll) {
        await window.audioManager.stopAll();
        console.log('🎵 Audio stopped before exit');
      }

      // في Capacitor، نحاول الخروج المباشر
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        console.log('📱 Attempting Capacitor app exit...');
        await window.Capacitor.Plugins.App.exitApp();
        console.log('✅ App exited successfully via Capacitor');
        return;
      }

      // في المتصفح، نحاول إغلاق النافذة
      console.log('🌐 Running in browser, attempting browser exit...');
      this.handleBrowserExit();
      
    } catch (error) {
      console.error('❌ Exit failed:', error);
      this.handleBrowserExit();
    }
  }

  /**
   * معالجة الخروج في المتصفح
   */
  handleBrowserExit() {
    try {
      // محاولة إغلاق النافذة
      window.close();
      
      // إذا لم ينجح الإغلاق، نعرض رسالة
      setTimeout(() => {
        if (!window.closed) {
          const message = 'لا يمكن إغلاق النافذة تلقائياً. يرجى إغلاقها يدوياً.';
          console.log('⚠️', message);
          // يمكن إضافة UI notification هنا بدلاً من alert
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Close window error:', error);
      const message = 'لا يمكن إغلاق النافذة تلقائياً. يرجى إغلاقها يدوياً.';
      console.log('⚠️', message);
    }
  }

  /**
   * التحقق من إمكانية إغلاق النافذة
   */
  canCloseWindow() {
    // في Capacitor، يمكن دائماً الخروج
    if (window.Capacitor) {
      return true;
    }

    // في المتصفح، يعتمد على كيفية فتح النافذة
    try {
      return window.opener !== null || window.history.length === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * اكتشاف المنصة
   */
  detectPlatform() {
    if (window.Capacitor) {
      return 'capacitor';
    }
    
    if (navigator.userAgent.includes('Electron')) {
      return 'electron';
    }
    
    return 'browser';
  }

  /**
   * الحصول على حالة الخروج
   */
  getExitStatus() {
    return {
      isExiting: this.isExiting,
      platform: this.detectPlatform(),
      canClose: this.canCloseWindow()
    };
  }
}

// إنشاء مثيل واحد
const appExitManager = new AppExitManager();

// إضافة إلى window للوصول العام
window.appExitManager = appExitManager;

export default appExitManager;