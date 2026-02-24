/**
 * reCAPTCHA Utility Functions
 * 
 * دوال مساعدة للتعامل مع reCAPTCHA
 */

/**
 * التحقق من أن reCAPTCHA مفعل
 * @returns {boolean}
 */
export const isRecaptchaEnabled = () => {
  const enabled = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true';
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  return enabled && !!siteKey;
};

/**
 * الحصول على site key
 * @returns {string|null}
 */
export const getRecaptchaSiteKey = () => {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY || null;
};

/**
 * إضافة token إلى form data
 * @param {Object} formData - بيانات النموذج
 * @param {string} token - reCAPTCHA token
 * @returns {Object} form data مع token
 */
export const addRecaptchaToken = (formData, token) => {
  if (!token) {
    return formData;
  }

  return {
    ...formData,
    recaptchaToken: token
  };
};

/**
 * معالجة خطأ reCAPTCHA
 * @param {Error} error - الخطأ
 * @returns {string} رسالة خطأ واضحة
 */
export const handleRecaptchaError = (error) => {
  if (!error) {
    return 'حدث خطأ غير معروف';
  }

  const message = error.message || error.toString();

  // رسائل خطأ مخصصة
  const errorMessages = {
    'reCAPTCHA is not ready yet': 'يرجى الانتظار قليلاً وإعادة المحاولة',
    'reCAPTCHA site key is missing': 'خطأ في الإعداد. يرجى الاتصال بالدعم',
    'Failed to load reCAPTCHA script': 'فشل تحميل نظام الحماية. تحقق من اتصالك بالإنترنت',
    'reCAPTCHA execution failed': 'فشل التحقق. يرجى إعادة المحاولة'
  };

  return errorMessages[message] || 'حدث خطأ في التحقق. يرجى المحاولة مرة أخرى';
};

/**
 * إخفاء badge reCAPTCHA
 * (استخدم فقط إذا كنت تعرض إشعار reCAPTCHA بنفسك)
 */
export const hideRecaptchaBadge = () => {
  const badge = document.querySelector('.grecaptcha-badge');
  if (badge) {
    badge.style.display = 'none';
  }
};

/**
 * إظهار badge reCAPTCHA
 */
export const showRecaptchaBadge = () => {
  const badge = document.querySelector('.grecaptcha-badge');
  if (badge) {
    badge.style.display = 'block';
  }
};

/**
 * تنظيف reCAPTCHA
 * (استخدم عند unmount)
 */
export const cleanupRecaptcha = () => {
  // إزالة السكريبت
  const scripts = document.querySelectorAll('script[src*="recaptcha"]');
  scripts.forEach(script => script.remove());

  // إزالة badge
  const badge = document.querySelector('.grecaptcha-badge');
  if (badge) {
    badge.remove();
  }

  // حذف grecaptcha من window
  if (window.grecaptcha) {
    delete window.grecaptcha;
  }
};
