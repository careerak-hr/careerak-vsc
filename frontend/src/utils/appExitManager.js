/**
 * مدير الخروج من التطبيق - نظام شامل للخروج النهائي
 * App Exit Manager - Comprehensive system for final app exit
 */

import { App } from '@capacitor/app';

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
      if (window.audioManager) {
        await window.audioManager.stopAll();
        console.log('🎵 Audio stopped before exit');
      }

      // في Capacitor، نحاول الخروج المباشر
      if (window.Capacitor) {
        console.log('📱 Attempting Capacitor app exit...');
        await App.exitApp();
        console.log('✅ App exited successfully via Capacitor');
        return;
      }

      // في المتصفح، نحاول عدة طرق للخروج
      console.log('🌐 Running in browser, attempting browser exit...');
      await this.handleBrowserExit();
      
    } catch (capacitorError) {
      console.log('⚠️ Capacitor exit failed, trying browser alternatives...', capacitorError);
      
      // في المتصفح، نحاول عدة طرق للخروج
      await this.handleBrowserExit();
    }
  }

  /**
   * التعامل مع الخروج في المتصفح
   */
  async handleBrowserExit() {
    try {
      // الطريقة 1: محاولة إغلاق النافذة
      if (this.canCloseWindow()) {
        console.log('🌐 Attempting to close browser window...');
        window.close();
        
        // انتظار قليل للتحقق من نجاح الإغلاق
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // إذا لم تُغلق النافذة، ننتقل للطريقة التالية
        if (!window.closed) {
          console.log('🌐 Window close failed, creating goodbye page...');
          this.createGoodbyePage();
        }
      } else {
        // إذا لم نستطع إغلاق النافذة، ننشئ صفحة الوداع مباشرة
        console.log('🌐 Cannot close window, creating goodbye page...');
        this.createGoodbyePage();
      }
      
    } catch (error) {
      console.error('❌ Browser exit failed:', error);
      
      // الطريقة الأخيرة: التوجه لصفحة فارغة
      this.redirectToBlankPage();
    }
  }

  /**
   * التحقق من إمكانية إغلاق النافذة
   */
  canCloseWindow() {
    // يمكن إغلاق النافذة إذا تم فتحها بـ JavaScript أو في بعض المتصفحات
    return window.opener !== null || window.history.length <= 1;
  }

  /**
   * إنشاء صفحة وداع مخصصة
   */
  createGoodbyePage() {
    // الحصول على اللغة الحالية
    const language = localStorage.getItem('lang') || 'ar';
    const isRTL = language === 'ar';
    
    // النصوص حسب اللغة
    const texts = {
      ar: {
        title: 'وداعاً',
        message: 'شكراً لزيارتك تطبيق كاريرك',
        subtitle: 'يمكنك إغلاق هذه النافذة الآن أو العودة للصفحة الرئيسية',
        closeButton: 'إغلاق النافذة',
        homeButton: 'العودة للرئيسية'
      },
      en: {
        title: 'Goodbye',
        message: 'Thank you for visiting Careerak app',
        subtitle: 'You can close this window now or return to the homepage',
        closeButton: 'Close Window',
        homeButton: 'Back to Home'
      },
      fr: {
        title: 'Au revoir',
        message: 'Merci d\'avoir visité l\'application Careerak',
        subtitle: 'Vous pouvez fermer cette fenêtre maintenant ou retourner à l\'accueil',
        closeButton: 'Fermer la fenêtre',
        homeButton: 'Retour à l\'accueil'
      }
    };

    const text = texts[language] || texts.ar;
    const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif" :
                      language === 'en' ? "'Cormorant Garamond', serif" :
                      "'EB Garamond', serif";

    // إنشاء HTML للصفحة
    const goodbyeHTML = `
      <!DOCTYPE html>
      <html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${text.title} - Careerak</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${fontFamily};
            background: linear-gradient(135deg, #E3DAD1 0%, #CFC5BA 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #304B60;
            padding: 2rem;
          }
          
          .goodbye-container {
            background: rgba(255, 255, 255, 0.9);
            padding: 3rem;
            border-radius: 2rem;
            box-shadow: 0 20px 40px rgba(48, 75, 96, 0.1);
            max-width: 500px;
            width: 100%;
            border: 3px solid #304B60;
          }
          
          .goodbye-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: wave 2s ease-in-out infinite;
          }
          
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
          
          .goodbye-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #304B60;
          }
          
          .goodbye-message {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: #304B60;
            opacity: 0.8;
          }
          
          .goodbye-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
            color: #304B60;
            opacity: 0.6;
          }
          
          .button-container {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .goodbye-button {
            background: #304B60;
            color: #D48161;
            padding: 1rem 2rem;
            border: none;
            border-radius: 1rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            min-width: 150px;
          }
          
          .goodbye-button:hover {
            background: #1A365D;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(48, 75, 96, 0.3);
          }
          
          .goodbye-button:active {
            transform: translateY(0);
          }
          
          .home-button {
            background: #C97A3D;
            color: white;
          }
          
          .home-button:hover {
            background: #A8612E;
          }
          
          @media (max-width: 480px) {
            .goodbye-container {
              padding: 2rem;
            }
            
            .goodbye-title {
              font-size: 2rem;
            }
            
            .goodbye-message {
              font-size: 1.1rem;
            }
            
            .button-container {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        <div class="goodbye-container">
          <div class="goodbye-icon">👋</div>
          <h1 class="goodbye-title">${text.title}</h1>
          <p class="goodbye-message">${text.message}</p>
          <p class="goodbye-subtitle">${text.subtitle}</p>
          <div class="button-container">
            <button class="goodbye-button" onclick="closeWindow()">
              ${text.closeButton}
            </button>
            <button class="goodbye-button home-button" onclick="goHome()">
              ${text.homeButton}
            </button>
          </div>
        </div>
        
        <script>
          function closeWindow() {
            try {
              // في Capacitor، نحاول الخروج من التطبيق
              if (window.Capacitor) {
                if (window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
                  window.Capacitor.Plugins.App.exitApp();
                  return;
                }
              }
              
              // في المتصفح، نحاول إغلاق النافذة
              window.close();
              
              // إذا لم ينجح الإغلاق، نعرض رسالة
              setTimeout(() => {
                if (!window.closed) {
                  alert('${language === 'ar' ? 'لا يمكن إغلاق النافذة تلقائياً. يرجى إغلاقها يدوياً.' : 
                         language === 'en' ? 'Cannot close window automatically. Please close it manually.' :
                         'Impossible de fermer la fenêtre automatiquement. Veuillez la fermer manuellement.'}');
                }
              }, 500);
              
            } catch (e) {
              console.error('Close window error:', e);
              alert('${language === 'ar' ? 'لا يمكن إغلاق النافذة تلقائياً. يرجى إغلاقها يدوياً.' : 
                     language === 'en' ? 'Cannot close window automatically. Please close it manually.' :
                     'Impossible de fermer la fenêtre automatiquement. Veuillez la fermer manuellement.'}');
            }
          }
          
          function goHome() {
            // التوجه لصفحة تسجيل الدخول بدلاً من الصفحة الرئيسية
            window.location.href = '/login';
          }
          
          // إزالة الإغلاق التلقائي لإعطاء المستخدم الخيار
          // setTimeout(() => {
          //   try {
          //     window.close();
          //   } catch (e) {
          //     console.log('Auto-close failed');
          //   }
          // }, 5000);
        </script>
      </body>
      </html>
    `;

    // استبدال محتوى الصفحة
    document.open();
    document.write(goodbyeHTML);
    document.close();
  }

  /**
   * التوجه لصفحة فارغة كحل أخير
   */
  redirectToBlankPage() {
    console.log('🌐 Redirecting to blank page as last resort...');
    
    try {
      window.location.href = 'about:blank';
    } catch (error) {
      console.error('❌ Failed to redirect to blank page:', error);
      
      // كحل أخير جداً، نخفي محتوى الصفحة
      document.body.style.display = 'none';
      document.title = 'Careerak - Closed';
    }
  }

  /**
   * الحصول على حالة الخروج
   */
  getExitStatus() {
    return {
      isExiting: this.isExiting,
      canCloseWindow: this.canCloseWindow(),
      platform: this.detectPlatform()
    };
  }

  /**
   * اكتشاف المنصة
   */
  detectPlatform() {
    if (window.Capacitor) {
      return window.Capacitor.getPlatform();
    }
    
    return 'web';
  }
}

// إنشاء مثيل واحد فقط (Singleton)
const appExitManager = new AppExitManager();

// تصدير المثيل
export default appExitManager;

// تصدير للاستخدام في وحدة تحكم المتصفح (للتطوير)
if (typeof window !== 'undefined') {
  window.appExitManager = appExitManager;
  console.log('🚪 AppExitManager available at window.appExitManager');
}