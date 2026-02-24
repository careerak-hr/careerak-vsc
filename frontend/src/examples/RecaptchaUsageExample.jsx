/**
 * مثال استخدام reCAPTCHA v3 في صفحة التسجيل
 * 
 * يوضح كيفية تكامل reCAPTCHA مع نموذج التسجيل
 */

import React, { useState } from 'react';
import RecaptchaV3, { useRecaptchaV3 } from '../components/auth/RecaptchaV3';
import {
  isRecaptchaEnabled,
  getRecaptchaSiteKey,
  addRecaptchaToken,
  handleRecaptchaError
} from '../utils/recaptcha';

/**
 * مثال 1: استخدام Hook مباشرة
 */
function RegisterFormWithHook() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // استخدام hook
  const { executeRecaptcha, ready, error: recaptchaError } = useRecaptchaV3(
    getRecaptchaSiteKey()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let dataToSend = { ...formData };

      // إذا كان reCAPTCHA مفعل
      if (isRecaptchaEnabled() && ready) {
        // الحصول على token
        const token = await executeRecaptcha('register');
        
        // إضافة token إلى البيانات
        dataToSend = addRecaptchaToken(dataToSend, token);
      }

      // إرسال الطلب
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'فشل التسجيل');
      }

      // نجاح
      console.log('تم التسجيل بنجاح:', result);
      
    } catch (err) {
      console.error('خطأ في التسجيل:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">التسجيل</h2>

      {/* عرض خطأ reCAPTCHA */}
      {recaptchaError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {handleRecaptchaError({ message: recaptchaError })}
        </div>
      )}

      {/* عرض خطأ عام */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || (isRecaptchaEnabled() && !ready)}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>
      </form>

      {/* إشعار reCAPTCHA */}
      {isRecaptchaEnabled() && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          هذا الموقع محمي بواسطة reCAPTCHA وتطبق{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            سياسة الخصوصية
          </a>{' '}
          و{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            شروط الخدمة
          </a>{' '}
          من Google.
        </p>
      )}
    </div>
  );
}

/**
 * مثال 2: استخدام Component مع callback
 */
function RegisterFormWithComponent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executeRecaptcha, setExecuteRecaptcha] = useState(null);

  const handleRecaptchaReady = (execute) => {
    setExecuteRecaptcha(() => execute);
  };

  const handleRecaptchaError = (error) => {
    console.error('reCAPTCHA error:', error);
    setError('فشل تحميل نظام الحماية. يرجى إعادة تحميل الصفحة.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let dataToSend = { ...formData };

      // إذا كان reCAPTCHA مفعل
      if (isRecaptchaEnabled() && executeRecaptcha) {
        // الحصول على token
        const token = await executeRecaptcha('register');
        
        // إضافة token إلى البيانات
        dataToSend = addRecaptchaToken(dataToSend, token);
      }

      // إرسال الطلب
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'فشل التسجيل');
      }

      // نجاح
      console.log('تم التسجيل بنجاح:', result);
      
    } catch (err) {
      console.error('خطأ في التسجيل:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* تحميل reCAPTCHA */}
      {isRecaptchaEnabled() && (
        <RecaptchaV3
          siteKey={getRecaptchaSiteKey()}
          onReady={handleRecaptchaReady}
          onError={handleRecaptchaError}
        />
      )}

      <h2 className="text-2xl font-bold mb-6">التسجيل</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* نفس الحقول */}
        <button
          type="submit"
          disabled={loading || (isRecaptchaEnabled() && !executeRecaptcha)}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل'}
        </button>
      </form>

      {/* إشعار reCAPTCHA */}
      {isRecaptchaEnabled() && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          هذا الموقع محمي بواسطة reCAPTCHA
        </p>
      )}
    </div>
  );
}

/**
 * مثال 3: استخدام شرطي (فقط عند الحاجة)
 */
function RegisterFormConditional() {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // إذا فشل 3 مرات، نطلب CAPTCHA
    if (attemptCount >= 3) {
      setShowCaptcha(true);
    }

    // ... باقي المنطق
  };

  return (
    <div>
      {/* النموذج */}
      
      {/* CAPTCHA يظهر فقط عند الحاجة */}
      {showCaptcha && isRecaptchaEnabled() && (
        <RecaptchaV3
          siteKey={getRecaptchaSiteKey()}
          onReady={(execute) => {
            // استخدام execute
          }}
        />
      )}
    </div>
  );
}

export default RegisterFormWithHook;
export { RegisterFormWithComponent, RegisterFormConditional };
