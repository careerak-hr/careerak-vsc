/**
 * إصلاحات خاصة بـ Android WebView لحقول الإدخال
 * Android WebView Input Fields Fix
 */

export const initAndroidInputFix = () => {
  // التحقق من أننا في بيئة Capacitor على Android
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
    console.log('🤖 Android detected - applying input fixes');
    
    // منع سحب التركيز من الحقول
    let focusedElement = null;
    
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
        input.style.zIndex = '9999';
        input.style.position = 'relative';
        
        if (input.tagName === 'SELECT') {
          input.style.cursor = 'pointer';
          input.style.webkitUserSelect = 'none';
          input.style.userSelect = 'none';
        } else {
          input.style.cursor = 'text';
        }
        
        // منع فقدان التركيز
        input.addEventListener('focus', (e) => {
          console.log('🎯 Input focused:', input.type, input.name);
          focusedElement = input;
          document.body.classList.add('input-focused');
          
          // منع أي محاولة لسحب التركيز
          setTimeout(() => {
            if (document.activeElement !== input) {
              console.log('🔄 Re-focusing input');
              input.focus();
            }
          }, 50);
        });
        
        input.addEventListener('blur', (e) => {
          console.log('😵 Input blurred:', input.type, input.name);
          
          // إزالة class بعد تأخير قصير
          setTimeout(() => {
            if (document.activeElement !== input) {
              document.body.classList.remove('input-focused');
              focusedElement = null;
            }
          }, 200);
          
          // إذا فقد التركيز بسرعة، أعد التركيز
          setTimeout(() => {
            if (focusedElement === input && document.activeElement !== input) {
              console.log('🔄 Restoring focus to input');
              input.focus();
              document.body.classList.add('input-focused');
            }
          }, 100);
        });
        
        // إضافة event listeners خاصة بـ Android
        input.addEventListener('touchstart', (e) => {
          console.log('👆 Touch start on input');
          e.stopPropagation();
          focusedElement = input;
        }, { passive: false });
        
        input.addEventListener('touchend', (e) => {
          console.log('👆 Touch end on input');
          e.stopPropagation();
          e.preventDefault();
          
          // التركيز على الحقل مع تأخير
          setTimeout(() => {
            input.focus();
            focusedElement = input;
          }, 150);
        }, { passive: false });
        
        // إصلاح خاص للقوائم المنسدلة
        if (input.tagName === 'SELECT') {
          input.addEventListener('touchend', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            // فتح القائمة المنسدلة
            setTimeout(() => {
              input.click();
              input.focus();
            }, 150);
          }, { passive: false });
        }
      });
    };
    
    // منع أي عنصر آخر من سحب التركيز
    document.addEventListener('touchstart', (e) => {
      const target = e.target;
      if (focusedElement && 
          target !== focusedElement && 
          !target.matches('input, select, textarea, button, a, [role="button"]')) {
        console.log('🚫 Preventing focus loss');
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false, capture: true });
    
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