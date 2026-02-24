import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// Simple SVG Icons
const CheckCircle = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircle = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const Loader = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

/**
 * EmailValidator Component
 * 
 * مكون للتحقق من صحة البريد الإلكتروني مع debounced validation
 * 
 * الميزات:
 * - التحقق من صحة الصيغة (client-side)
 * - التحقق من الوجود في قاعدة البيانات (server-side)
 * - Debounced validation (500ms)
 * - أيقونات حالة (loading, success, error)
 * - اقتراحات تصحيح الأخطاء
 * - رابط تسجيل الدخول إذا كان البريد موجود
 * - دعم متعدد اللغات
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7
 * 
 * @param {Object} props
 * @param {string} props.value - قيمة البريد الإلكتروني
 * @param {Function} props.onChange - دالة تغيير القيمة
 * @param {string} props.placeholder - النص التوضيحي
 * @param {string} props.className - CSS classes إضافية
 * @param {boolean} props.required - هل الحقل مطلوب
 * @param {boolean} props.disabled - هل الحقل معطل
 * @param {number} props.debounceDelay - تأخير التحقق بالميلي ثانية (افتراضي: 500)
 */
function EmailValidator({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  disabled = false,
  debounceDelay = 500,
}) {
  const { language } = useApp();
  const [validation, setValidation] = useState(null);
  const [checking, setChecking] = useState(false);

  // Debounced validation
  useEffect(() => {
    // إعادة تعيين الحالة إذا كان الحقل فارغاً
    if (!value) {
      setValidation(null);
      return;
    }

    // تأخير التحقق (debounce)
    const timer = setTimeout(async () => {
      setChecking(true);

      try {
        // التحقق من صحة الصيغة أولاً (client-side)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setValidation({
            success: true,
            valid: false,
            error: getTranslation('invalidFormat'),
          });
          setChecking(false);
          return;
        }

        // التحقق عبر API (server-side)
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/auth/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: value }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setValidation(data);
      } catch (error) {
        console.error('Error checking email:', error);
        setValidation({
          success: false,
          valid: false,
          error: getTranslation('connectionError'),
        });
      } finally {
        setChecking(false);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [value, debounceDelay]);

  // الحصول على الترجمة
  const getTranslation = (key) => {
    const translations = {
      ar: {
        invalidFormat: 'البريد الإلكتروني غير صحيح',
        connectionError: 'حدث خطأ في الاتصال',
        checking: 'جاري التحقق...',
        available: 'البريد الإلكتروني متاح',
        alreadyExists: 'هذا البريد مستخدم بالفعل',
        loginLink: 'تسجيل الدخول',
        didYouMean: 'هل تقصد',
      },
      en: {
        invalidFormat: 'Invalid email format',
        connectionError: 'Connection error',
        checking: 'Checking...',
        available: 'Email is available',
        alreadyExists: 'This email is already in use',
        loginLink: 'Login',
        didYouMean: 'Did you mean',
      },
      fr: {
        invalidFormat: 'Format d\'email invalide',
        connectionError: 'Erreur de connexion',
        checking: 'Vérification...',
        available: 'Email disponible',
        alreadyExists: 'Cet email est déjà utilisé',
        loginLink: 'Connexion',
        didYouMean: 'Vouliez-vous dire',
      },
    };

    return translations[language]?.[key] || translations.ar[key];
  };

  // تطبيق الاقتراح
  const applySuggestion = () => {
    if (validation?.suggestion) {
      onChange(validation.suggestion);
    }
  };

  // تحديد لون الإطار
  const getBorderColor = () => {
    if (!validation) return 'border-[#D4816180]'; // نحاسي باهت (افتراضي)
    if (validation.valid === false) return 'border-red-500';
    if (validation.valid === true) return 'border-green-500';
    return 'border-[#D4816180]';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-3 pr-12 border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#304B60]
            transition-colors duration-200
            ${getBorderColor()}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          placeholder={placeholder || getTranslation('invalidFormat')}
          required={required}
          disabled={disabled}
          dir="ltr"
          autoComplete="email"
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
      <div className="mt-2 min-h-[24px]">
        {/* Checking State */}
        {checking && (
          <div className="text-gray-500 text-sm">
            {getTranslation('checking')}
          </div>
        )}

        {/* Success Message */}
        {!checking && validation?.valid === true && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            <span>
              {validation.message || getTranslation('available')}
            </span>
          </div>
        )}

        {/* Error Messages */}
        {!checking && validation?.valid === false && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle size={16} />
              <span>
                {validation.error || getTranslation('alreadyExists')}
              </span>
            </div>

            {/* Suggestion */}
            {validation.suggestion && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {getTranslation('didYouMean')}:
                </span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="text-[#304B60] hover:text-[#D48161] underline transition-colors"
                >
                  {validation.suggestion}
                </button>
              </div>
            )}

            {/* Login Link */}
            {validation.action === 'login' && (
              <a
                href="/login"
                className="inline-block text-[#304B60] hover:text-[#D48161] text-sm underline transition-colors"
              >
                {getTranslation('loginLink')}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailValidator;
