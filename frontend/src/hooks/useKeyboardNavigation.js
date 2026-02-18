import { useEffect, useRef } from 'react';

/**
 * Hook للتنقل بالكيبورد
 * Requirements: 8.2, 8.3, 8.4
 * 
 * - تركيز تلقائي على أول حقل
 * - دعم Tab للتنقل
 * - إرسال بـ Enter
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    autoFocusFirst = true,
    submitOnEnter = true,
    onSubmit = null
  } = options;

  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  // تركيز تلقائي على أول حقل (Requirement 8.2)
  useEffect(() => {
    if (autoFocusFirst && firstInputRef.current) {
      // تأخير بسيط للتأكد من تحميل الصفحة
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocusFirst]);

  // معالجة Enter للإرسال (Requirement 8.4)
  useEffect(() => {
    if (!submitOnEnter || !formRef.current) return;

    const handleKeyDown = (e) => {
      // Enter في حقل input (ليس textarea)
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        
        // إذا كان الحقل الأخير، نرسل النموذج
        const inputs = Array.from(formRef.current.querySelectorAll('input, select, textarea'));
        const currentIndex = inputs.indexOf(e.target);
        const isLastInput = currentIndex === inputs.length - 1;

        if (isLastInput && onSubmit) {
          onSubmit();
        } else {
          // الانتقال للحقل التالي
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
    };

    const form = formRef.current;
    form.addEventListener('keydown', handleKeyDown);

    return () => {
      form.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitOnEnter, onSubmit]);

  return {
    formRef,
    firstInputRef
  };
};

/**
 * Hook لإدارة التركيز على الحقول
 */
export const useFocusManagement = () => {
  const focusNextField = (currentElement) => {
    const form = currentElement.closest('form');
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const currentIndex = inputs.indexOf(currentElement);
    const nextInput = inputs[currentIndex + 1];

    if (nextInput) {
      nextInput.focus();
    }
  };

  const focusPreviousField = (currentElement) => {
    const form = currentElement.closest('form');
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const currentIndex = inputs.indexOf(currentElement);
    const previousInput = inputs[currentIndex - 1];

    if (previousInput) {
      previousInput.focus();
    }
  };

  const focusFirstField = (formElement) => {
    const firstInput = formElement?.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  };

  return {
    focusNextField,
    focusPreviousField,
    focusFirstField
  };
};

/**
 * Hook لمعالجة اختصارات الكيبورد
 */
export const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Key
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }

      // مفاتيح خاصة
      if (shortcuts[e.key]) {
        shortcuts[e.key](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
