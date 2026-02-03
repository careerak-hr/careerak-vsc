/**
 * إصلاح جذري لمشكلة حقول الإدخال على Android
 * Radical fix for Android input fields issue
 */

export const initAndroidInputFix = () => {
  console.log('🤖 Initializing Android input fix...');
  
  // إصلاح جذري: إعادة إنشاء الحقول بـ vanilla JavaScript
  const replaceInputs = () => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
    
    inputs.forEach(originalInput => {
      // إنشاء حقل جديد
      const newInput = document.createElement('input');
      
      // نسخ جميع الخصائص
      newInput.type = originalInput.type;
      newInput.name = originalInput.name;
      newInput.placeholder = originalInput.placeholder;
      newInput.value = originalInput.value;
      newInput.className = originalInput.className;
      newInput.style.cssText = originalInput.style.cssText;
      
      // إضافة خصائص Android
      newInput.style.pointerEvents = 'auto';
      newInput.style.webkitUserSelect = 'text';
      newInput.style.userSelect = 'text';
      newInput.style.webkitTouchCallout = 'default';
      newInput.style.touchAction = 'manipulation';
      newInput.style.webkitAppearance = 'none';
      newInput.style.appearance = 'none';
      
      // إضافة event listeners مباشرة
      newInput.addEventListener('input', (e) => {
        console.log('📝 Input changed:', e.target.value);
        // تحديث React state إذا وُجد
        const reactProps = originalInput._valueTracker;
        if (reactProps) {
          reactProps.setValue(e.target.value);
        }
        
        // إطلاق حدث React
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', { writable: false, value: newInput });
        originalInput.dispatchEvent(event);
      });
      
      newInput.addEventListener('change', (e) => {
        console.log('🔄 Input change:', e.target.value);
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', { writable: false, value: newInput });
        originalInput.dispatchEvent(event);
      });
      
      newInput.addEventListener('focus', (e) => {
        console.log('🎯 New input focused');
        e.stopPropagation();
      });
      
      newInput.addEventListener('blur', (e) => {
        console.log('😵 New input blurred');
      });
      
      // استبدال الحقل الأصلي
      originalInput.parentNode.replaceChild(newInput, originalInput);
      
      console.log('✅ Replaced input:', newInput.type, newInput.name);
    });
  };
  
  // إصلاح القوائم المنسدلة
  const replaceSelects = () => {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(originalSelect => {
      const newSelect = document.createElement('select');
      
      // نسخ الخصائص
      newSelect.name = originalSelect.name;
      newSelect.className = originalSelect.className;
      newSelect.style.cssText = originalSelect.style.cssText;
      newSelect.innerHTML = originalSelect.innerHTML;
      newSelect.value = originalSelect.value;
      
      // إضافة خصائص Android
      newSelect.style.pointerEvents = 'auto';
      newSelect.style.cursor = 'pointer';
      newSelect.style.webkitAppearance = 'menulist';
      newSelect.style.appearance = 'menulist';
      
      // إضافة event listeners
      newSelect.addEventListener('change', (e) => {
        console.log('📋 Select changed:', e.target.value);
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', { writable: false, value: newSelect });
        originalSelect.dispatchEvent(event);
      });
      
      newSelect.addEventListener('focus', (e) => {
        console.log('🎯 New select focused');
      });
      
      // استبدال القائمة الأصلية
      originalSelect.parentNode.replaceChild(newSelect, originalSelect);
      
      console.log('✅ Replaced select:', newSelect.name);
    });
  };
  
  // تطبيق الإصلاح بعد تحميل الصفحة
  const applyFix = () => {
    console.log('� Applying Android input fix...');
    setTimeout(() => {
      replaceInputs();
      replaceSelects();
    }, 1000);
  };
  
  // تطبيق الإصلاح عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFix);
  } else {
    applyFix();
  }
  
  // تطبيق الإصلاح عند تغيير المسار (React Router)
  let currentPath = window.location.pathname;
  const checkPathChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      console.log('🛣️ Path changed, reapplying fix...');
      setTimeout(applyFix, 500);
    }
  };
  
  setInterval(checkPathChange, 1000);
  
  return {
    cleanup: () => {
      console.log('🧹 Cleaning up Android input fix');
    }
  };
};

export default initAndroidInputFix;

export default initAndroidInputFix;