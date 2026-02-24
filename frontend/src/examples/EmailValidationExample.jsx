import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

/**
 * Email Validation Example Component
 * 
 * يوضح كيفية استخدام API للتحقق من البريد الإلكتروني
 * 
 * الميزات:
 * - التحقق من صحة الصيغة
 * - اكتشاف الأخطاء الشائعة
 * - التحقق من وجود البريد في قاعدة البيانات
 * - Debounced validation (500ms)
 * - أيقونات حالة (loading, success, error)
 * - اقتراحات تصحيح الأخطاء
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

function EmailValidationExample() {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState(null);
  const [checking, setChecking] = useState(false);

  // Debounced validation
  useEffect(() => {
    // إعادة تعيين الحالة إذا كان الحقل فارغاً
    if (!email) {
      setValidation(null);
      return;
    }

    // تأخير التحقق لمدة 500ms
    const timer = setTimeout(async () => {
      setChecking(true);
      
      try {
        const response = await fetch('/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setValidation(data);
      } catch (error) {
        console.error('Error checking email:', error);
        setValidation({
          success: false,
          valid: false,
          error: 'حدث خطأ في الاتصال',
          errorEn: 'Connection error',
        });
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  // تطبيق الاقتراح
  const applySuggestion = () => {
    if (validation?.suggestion) {
      setEmail(validation.suggestion);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        التحقق من البريد الإلكتروني
      </h2>

      {/* Input Field */}
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`
            w-full px-4 py-3 pr-12 border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${validation?.valid === false ? 'border-red-500' : 'border-gray-300'}
            ${validation?.valid === true ? 'border-green-500' : ''}
          `}
          placeholder="أدخل البريد الإلكتروني"
          dir="ltr"
        />

        {/* Status Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {checking && (
            <Loader className="animate-spin text-blue-500" size={20} />
          )}
          {!checking && validation?.valid === true && (
            <CheckCircle className="text-green-500" size={20} />
          )}
          {!checking && validation?.valid === false && (
            <XCircle className="text-red-500" size={20} />
          )}
        </div>
      </div>

      {/* Validation Messages */}
      <div className="mt-3 min-h-[60px]">
        {/* Success Message */}
        {validation?.valid === true && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            <span>{validation.message}</span>
          </div>
        )}

        {/* Error Messages */}
        {validation?.valid === false && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle size={16} />
              <span>{validation.error}</span>
            </div>

            {/* Suggestion */}
            {validation.suggestion && (
              <button
                onClick={applySuggestion}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                {validation.suggestion}
              </button>
            )}

            {/* Login Link */}
            {validation.action === 'login' && (
              <a
                href="/login"
                className="block text-blue-600 hover:text-blue-800 text-sm underline"
              >
                تسجيل الدخول
              </a>
            )}
          </div>
        )}

        {/* Checking State */}
        {checking && (
          <div className="text-gray-500 text-sm">
            جاري التحقق من البريد الإلكتروني...
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          أمثلة للاختبار:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• test@example.com - بريد صحيح</li>
          <li>• test@gmial.com - خطأ إملائي</li>
          <li>• notanemail - بريد غير صحيح</li>
          <li>• existing@example.com - بريد مستخدم</li>
        </ul>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && validation && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <pre>{JSON.stringify(validation, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default EmailValidationExample;
