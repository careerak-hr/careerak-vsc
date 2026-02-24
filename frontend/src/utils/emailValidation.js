/**
 * Email Validation Utility
 * 
 * أداة للتحقق من صحة البريد الإلكتروني
 * 
 * الميزات:
 * - التحقق من صحة الصيغة (client-side)
 * - التحقق من الوجود في قاعدة البيانات (server-side)
 * - اكتشاف الأخطاء الشائعة
 * - دعم متعدد اللغات
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

/**
 * التحقق من صحة صيغة البريد الإلكتروني (client-side)
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - true إذا كانت الصيغة صحيحة
 */
export function isValidEmailFormat(email) {
  if (!email) return false;
  
  // Regex pattern للتحقق من صحة البريد
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من البريد الإلكتروني عبر API (server-side)
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {Promise<Object>} - نتيجة التحقق
 * 
 * @example
 * const result = await checkEmailAvailability('user@example.com');
 * if (result.valid) {
 *   console.log('البريد متاح');
 * } else {
 *   console.log('خطأ:', result.error);
 * }
 */
export async function checkEmailAvailability(email) {
  try {
    // التحقق من الصيغة أولاً (client-side)
    if (!isValidEmailFormat(email)) {
      return {
        success: true,
        valid: false,
        error: 'البريد الإلكتروني غير صحيح',
        errorEn: 'Invalid email format',
      };
    }

    // التحقق عبر API (server-side)
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking email:', error);
    return {
      success: false,
      valid: false,
      error: 'حدث خطأ في الاتصال',
      errorEn: 'Connection error',
      details: error.message,
    };
  }
}

/**
 * React Hook للتحقق من البريد الإلكتروني مع debounce
 * 
 * @param {string} email - البريد الإلكتروني
 * @param {number} delay - التأخير بالميلي ثانية (افتراضي: 500)
 * @returns {Object} - { validation, checking }
 * 
 * @example
 * const { validation, checking } = useEmailValidation(email, 500);
 */
export function useEmailValidation(email, delay = 500) {
  const [validation, setValidation] = React.useState(null);
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    // إعادة تعيين إذا كان فارغاً
    if (!email) {
      setValidation(null);
      return;
    }

    // Debounce
    const timer = setTimeout(async () => {
      setChecking(true);
      const result = await checkEmailAvailability(email);
      setValidation(result);
      setChecking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [email, delay]);

  return { validation, checking };
}

/**
 * الحصول على رسالة الخطأ المترجمة
 * 
 * @param {Object} validation - نتيجة التحقق
 * @param {string} language - اللغة (ar, en, fr)
 * @returns {string} - رسالة الخطأ
 */
export function getValidationMessage(validation, language = 'ar') {
  if (!validation) return '';

  if (validation.valid) {
    return language === 'ar' 
      ? validation.message || 'البريد الإلكتروني متاح'
      : validation.messageEn || 'Email is available';
  }

  return language === 'ar'
    ? validation.error || 'خطأ في التحقق'
    : validation.errorEn || 'Validation error';
}

/**
 * الحصول على لون الحالة
 * 
 * @param {Object} validation - نتيجة التحقق
 * @returns {string} - اسم اللون (green, red, gray)
 */
export function getValidationColor(validation) {
  if (!validation) return 'gray';
  return validation.valid ? 'green' : 'red';
}

/**
 * الحصول على أيقونة الحالة
 * 
 * @param {Object} validation - نتيجة التحقق
 * @param {boolean} checking - هل يتم التحقق الآن
 * @returns {string} - اسم الأيقونة (check, x, loader)
 */
export function getValidationIcon(validation, checking) {
  if (checking) return 'loader';
  if (!validation) return null;
  return validation.valid ? 'check' : 'x';
}

/**
 * تنسيق البريد الإلكتروني (lowercase + trim)
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {string} - البريد المنسق
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * استخراج النطاق من البريد الإلكتروني
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {string} - النطاق (مثل: gmail.com)
 */
export function extractDomain(email) {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1];
}

/**
 * التحقق من أن النطاق من النطاقات الشائعة
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - true إذا كان من النطاقات الشائعة
 */
export function isCommonDomain(email) {
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'live.com',
    'msn.com',
  ];
  
  const domain = extractDomain(email);
  return commonDomains.includes(domain);
}

/**
 * الحصول على اقتراحات النطاقات الشائعة
 * 
 * @returns {Array<string>} - قائمة النطاقات
 */
export function getCommonDomains() {
  return [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'live.com',
    'msn.com',
  ];
}

/**
 * التحقق من أن البريد disposable (مؤقت)
 * 
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - true إذا كان مؤقتاً
 */
export function isDisposableEmail(email) {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
  ];
  
  const domain = extractDomain(email);
  return disposableDomains.includes(domain);
}

export default {
  isValidEmailFormat,
  checkEmailAvailability,
  useEmailValidation,
  getValidationMessage,
  getValidationColor,
  getValidationIcon,
  normalizeEmail,
  extractDomain,
  isCommonDomain,
  getCommonDomains,
  isDisposableEmail,
};
