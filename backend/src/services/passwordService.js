const zxcvbn = require('zxcvbn');

/**
 * حساب قوة كلمة المرور باستخدام zxcvbn
 * @param {string} password - كلمة المرور المراد فحصها
 * @returns {Object} - معلومات قوة كلمة المرور
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'none',
      labelAr: 'لا شيء',
      color: '#9ca3af',
      percentage: 0,
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      },
      feedback: [],
      feedbackAr: [],
      crackTime: 'فوراً',
      crackTimeAr: 'فوراً'
    };
  }

  // استخدام zxcvbn لحساب القوة
  const result = zxcvbn(password);

  // تسميات القوة
  const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
  const labelsAr = ['ضعيف', 'ضعيف', 'متوسط', 'جيد', 'قوي'];
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#eab308', '#10b981'];

  // التحقق من المتطلبات
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // ترجمة النصائح للعربية
  const feedbackAr = result.feedback.suggestions.map(suggestion => {
    const translations = {
      'Use a few words, avoid common phrases': 'استخدم كلمات متعددة، تجنب العبارات الشائعة',
      'No need for symbols, digits, or uppercase letters': 'لا حاجة للرموز أو الأرقام أو الأحرف الكبيرة',
      'Add another word or two. Uncommon words are better.': 'أضف كلمة أو اثنتين. الكلمات غير الشائعة أفضل.',
      'Capitalization doesn\'t help very much': 'الأحرف الكبيرة لا تساعد كثيراً',
      'All-uppercase is almost as easy to guess as all-lowercase': 'الأحرف الكبيرة فقط سهلة التخمين مثل الصغيرة',
      'Reversed words aren\'t much harder to guess': 'الكلمات المعكوسة ليست أصعب في التخمين',
      'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'الاستبدالات المتوقعة مثل @ بدلاً من a لا تساعد كثيراً'
    };
    return translations[suggestion] || suggestion;
  });

  // ترجمة وقت الاختراق
  const crackTimeDisplay = result.crack_times_display.offline_slow_hashing_1e4_per_second;
  const crackTimeAr = translateCrackTime(crackTimeDisplay);

  return {
    score: result.score,
    label: labels[result.score],
    labelAr: labelsAr[result.score],
    color: colors[result.score],
    percentage: (result.score / 4) * 100,
    requirements,
    feedback: result.feedback.suggestions,
    feedbackAr,
    crackTime: crackTimeDisplay,
    crackTimeAr,
    warning: result.feedback.warning,
    // معلومات إضافية من zxcvbn
    guesses: result.guesses,
    guessesLog10: result.guesses_log10,
    sequence: result.sequence
  };
}

/**
 * ترجمة وقت الاختراق للعربية
 * @param {string} crackTime - وقت الاختراق بالإنجليزية
 * @returns {string} - وقت الاختراق بالعربية
 */
function translateCrackTime(crackTime) {
  const translations = {
    'instant': 'فوراً',
    'less than a second': 'أقل من ثانية',
    'seconds': 'ثوانٍ',
    'minutes': 'دقائق',
    'hours': 'ساعات',
    'days': 'أيام',
    'months': 'أشهر',
    'years': 'سنوات',
    'centuries': 'قرون'
  };

  let translated = crackTime;
  Object.keys(translations).forEach(key => {
    translated = translated.replace(key, translations[key]);
  });

  return translated;
}

/**
 * التحقق من استيفاء جميع متطلبات كلمة المرور
 * @param {string} password - كلمة المرور
 * @returns {boolean} - هل تستوفي جميع المتطلبات
 */
function meetsAllRequirements(password) {
  if (!password) return false;

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  return Object.values(requirements).every(req => req === true);
}

/**
 * توليد كلمة مرور قوية عشوائية
 * @param {number} length - طول كلمة المرور (افتراضي: 14)
 * @returns {string} - كلمة مرور قوية
 */
function generateStrongPassword(length = 14) {
  // التأكد من أن الطول لا يقل عن 12
  if (length < 12) length = 12;
  if (length > 32) length = 32;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  // استخدام نفس الرموز الخاصة المستخدمة في التحقق
  const special = '!@#$%^&*(),.?":{}|<>';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // ضمان وجود حرف واحد على الأقل من كل نوع
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // ملء الباقي عشوائياً
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // خلط الأحرف بشكل عشوائي (Fisher-Yates shuffle)
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

module.exports = {
  calculatePasswordStrength,
  meetsAllRequirements,
  generateStrongPassword
};
