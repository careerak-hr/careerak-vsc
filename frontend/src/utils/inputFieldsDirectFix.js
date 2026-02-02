/**
 * حل مباشر وبسيط لمشكلة حقول الإدخال المقفلة
 * Direct and Simple Solution for Locked Input Fields Issue
 */

export const enableInputFields = () => {
  // إجبار تفعيل جميع حقول الإدخال
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    // إزالة أي خصائص تمنع التفاعل
    input.style.pointerEvents = 'auto';
    input.style.touchAction = 'manipulation';
    input.style.userSelect = 'text';
    input.style.webkitUserSelect = 'text';
    input.style.mozUserSelect = 'text';
    input.style.msUserSelect = 'text';
    input.style.cursor = input.tagName === 'SELECT' ? 'pointer' : 'text';
    input.style.zIndex = '99999';
    input.style.position = 'relative';
    
    // إزالة أي خصائص disabled أو readonly
    input.removeAttribute('disabled');
    input.removeAttribute('readonly');
    
    // ضمان إمكانية التركيز
    if (input.tabIndex < 0) {
      input.tabIndex = 0;
    }
  });
};

export const initializeDirectFix = () => {
  // تطبيق الإصلاح فوراً
  enableInputFields();
  
  // تطبيق الإصلاح عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableInputFields);
  }
  
  // تطبيق الإصلاح عند تغيير المحتوى
  const observer = new MutationObserver(() => {
    enableInputFields();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'readonly', 'style', 'class']
  });
  
  // تطبيق الإصلاح بشكل دوري كإجراء احتياطي
  const interval = setInterval(enableInputFields, 1000);
  
  return {
    cleanup: () => {
      observer.disconnect();
      clearInterval(interval);
    }
  };
};

export default initializeDirectFix;