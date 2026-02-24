/**
 * Google reCAPTCHA v3 Component
 * 
 * مكون React لتكامل reCAPTCHA v3
 * يعمل بشكل غير مرئي في الخلفية
 */

import { useEffect, useRef } from 'react';

// تحميل سكريبت reCAPTCHA
const loadRecaptchaScript = (siteKey) => {
  return new Promise((resolve, reject) => {
    // التحقق من أن السكريبت غير محمل بالفعل
    if (window.grecaptcha) {
      resolve(window.grecaptcha);
      return;
    }

    // إنشاء عنصر script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // الانتظار حتى يكون grecaptcha جاهز
      const checkReady = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          clearInterval(checkReady);
          window.grecaptcha.ready(() => {
            resolve(window.grecaptcha);
          });
        }
      }, 100);

      // timeout بعد 10 ثواني
      setTimeout(() => {
        clearInterval(checkReady);
        reject(new Error('reCAPTCHA failed to load'));
      }, 10000);
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Hook لاستخدام reCAPTCHA v3
 * @param {string} siteKey - Site key من Google reCAPTCHA
 * @returns {Object} { executeRecaptcha, ready, error }
 */
export const useRecaptchaV3 = (siteKey) => {
  const grecaptchaRef = useRef(null);
  const readyRef = useRef(false);
  const errorRef = useRef(null);

  useEffect(() => {
    // إذا لم يكن site key موجود، لا نحمل
    if (!siteKey) {
      errorRef.current = 'reCAPTCHA site key is missing';
      return;
    }

    // تحميل السكريبت
    loadRecaptchaScript(siteKey)
      .then((grecaptcha) => {
        grecaptchaRef.current = grecaptcha;
        readyRef.current = true;
      })
      .catch((error) => {
        console.error('Failed to load reCAPTCHA:', error);
        errorRef.current = error.message;
      });

    // تنظيف
    return () => {
      // إزالة badge (اختياري)
      const badge = document.querySelector('.grecaptcha-badge');
      if (badge) {
        badge.style.display = 'none';
      }
    };
  }, [siteKey]);

  /**
   * تنفيذ reCAPTCHA والحصول على token
   * @param {string} action - اسم العملية (مثل: register, login)
   * @returns {Promise<string>} token
   */
  const executeRecaptcha = async (action = 'submit') => {
    if (!readyRef.current || !grecaptchaRef.current) {
      throw new Error('reCAPTCHA is not ready yet');
    }

    if (errorRef.current) {
      throw new Error(errorRef.current);
    }

    try {
      const token = await grecaptchaRef.current.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      throw error;
    }
  };

  return {
    executeRecaptcha,
    ready: readyRef.current,
    error: errorRef.current
  };
};

/**
 * مكون RecaptchaV3
 * يحمل reCAPTCHA ويوفر دالة للتنفيذ
 */
const RecaptchaV3 = ({ siteKey, onReady, onError }) => {
  const { executeRecaptcha, ready, error } = useRecaptchaV3(siteKey);

  useEffect(() => {
    if (ready && onReady) {
      onReady(executeRecaptcha);
    }
  }, [ready, onReady, executeRecaptcha]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // لا يعرض شيء (v3 غير مرئي)
  return null;
};

export default RecaptchaV3;
