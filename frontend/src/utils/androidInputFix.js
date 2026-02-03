/**
 * إصلاحات خاصة بـ Android WebView لحقول الإدخال
 * Android WebView Input Fields Fix
 */

export const initAndroidInputFix = () => {
  // التحقق من أننا في بيئة Capacitor على Android
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
    console.log('🤖 Android detected - applying input fixes');
    
    // إصلاح حقول الإدخال
    const fixInputs = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], select');
      
      inputs.forEach(input => {
        // إزالة أي قيود
        input.style.pointerEvents = 'auto';
        input.style.webkitUserSelect = 'text';
        input.style.userSelect = 'text';
        input.style.webkitTouchCallout = 'default';
        input.style.webkitTapHighlightColor = 'rgba(0,0,0,0.1)';
        input.style.touchAction = 'manipulation';
        
        if (input.tagName === 'SELECT') {
          input.style.cursor = 'pointer';
          input.style.webkitUserSelect = 'none';
          input.style.userSelect = 'none';
        } else {
          input.style.cursor = 'text';
        }
        
        // إضافة event listeners خاصة بـ Android
        input.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        }, { passive: true });
        
        input.addEventListener('touchend', (e) => {
          e.stopPropagation();
          // التركيز على الحقل
          setTimeout(() => {
            input.focus();
          }, 100);
        }, { passive: true });
        
        // إصلاح خاص للقوائم المنسدلة
        if (input.tagName === 'SELECT') {
          input.addEventListener('touchend', (e) => {
            e.stopPropagation();
            // فتح القائمة المنسدلة
            setTimeout(() => {
              input.click();
            }, 100);
          }, { passive: true });
        }
      });
    };
    
    // تطبيق الإصلاح فوراً
    fixInputs();
    
    // تطبيق الإصلاح عند تغيير المحتوى
    const observer = new MutationObserver(fixInputs);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // تطبيق الإصلاح عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', fixInputs);
    
    // تطبيق الإصلاح عند ظهور لوحة المفاتيح
    window.addEventListener('keyboardWillShow', fixInputs);
    window.addEventListener('keyboardDidShow', fixInputs);
    
    return {
      cleanup: () => {
        observer.disconnect();
      }
    };
  }
  
  return { cleanup: () => {} };
};

export default initAndroidInputFix;