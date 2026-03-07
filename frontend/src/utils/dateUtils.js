/**
 * دوال مساعدة للتعامل مع التواريخ
 */

/**
 * تحويل تاريخ إلى صيغة نسبية (منذ X أيام، منذ أسبوع، إلخ)
 * @param {Date|string} date - التاريخ المراد تحويله
 * @param {string} lang - اللغة (ar, en, fr)
 * @returns {string} - النص النسبي
 */
export function getRelativeTime(date, lang = 'ar') {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const translations = {
    ar: {
      justNow: 'الآن',
      minutesAgo: (n) => n === 1 ? 'منذ دقيقة' : n === 2 ? 'منذ دقيقتين' : `منذ ${n} دقائق`,
      hoursAgo: (n) => n === 1 ? 'منذ ساعة' : n === 2 ? 'منذ ساعتين' : `منذ ${n} ساعات`,
      daysAgo: (n) => n === 1 ? 'منذ يوم' : n === 2 ? 'منذ يومين' : `منذ ${n} أيام`,
      weeksAgo: (n) => n === 1 ? 'منذ أسبوع' : n === 2 ? 'منذ أسبوعين' : `منذ ${n} أسابيع`,
      monthsAgo: (n) => n === 1 ? 'منذ شهر' : n === 2 ? 'منذ شهرين' : `منذ ${n} أشهر`,
      yearsAgo: (n) => n === 1 ? 'منذ سنة' : n === 2 ? 'منذ سنتين' : `منذ ${n} سنوات`,
    },
    en: {
      justNow: 'Just now',
      minutesAgo: (n) => n === 1 ? '1 minute ago' : `${n} minutes ago`,
      hoursAgo: (n) => n === 1 ? '1 hour ago' : `${n} hours ago`,
      daysAgo: (n) => n === 1 ? '1 day ago' : `${n} days ago`,
      weeksAgo: (n) => n === 1 ? '1 week ago' : `${n} weeks ago`,
      monthsAgo: (n) => n === 1 ? '1 month ago' : `${n} months ago`,
      yearsAgo: (n) => n === 1 ? '1 year ago' : `${n} years ago`,
    },
    fr: {
      justNow: 'À l\'instant',
      minutesAgo: (n) => n === 1 ? 'Il y a 1 minute' : `Il y a ${n} minutes`,
      hoursAgo: (n) => n === 1 ? 'Il y a 1 heure' : `Il y a ${n} heures`,
      daysAgo: (n) => n === 1 ? 'Il y a 1 jour' : `Il y a ${n} jours`,
      weeksAgo: (n) => n === 1 ? 'Il y a 1 semaine' : `Il y a ${n} semaines`,
      monthsAgo: (n) => n === 1 ? 'Il y a 1 mois' : `Il y a ${n} mois`,
      yearsAgo: (n) => n === 1 ? 'Il y a 1 an' : `Il y a ${n} ans`,
    }
  };

  const t = translations[lang] || translations.ar;

  if (diffSeconds < 60) {
    return t.justNow;
  } else if (diffMinutes < 60) {
    return t.minutesAgo(diffMinutes);
  } else if (diffHours < 24) {
    return t.hoursAgo(diffHours);
  } else if (diffDays < 7) {
    return t.daysAgo(diffDays);
  } else if (diffWeeks < 4) {
    return t.weeksAgo(diffWeeks);
  } else if (diffMonths < 12) {
    return t.monthsAgo(diffMonths);
  } else {
    return t.yearsAgo(diffYears);
  }
}

/**
 * تحديد ما إذا كانت الوظيفة جديدة (< 3 أيام)
 * @param {Date|string} date - تاريخ النشر
 * @returns {boolean}
 */
export function isNewJob(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 3;
}

/**
 * تحديد ما إذا كانت الوظيفة عاجلة (< 7 أيام متبقية)
 * @param {Date|string} expiryDate - تاريخ انتهاء الوظيفة
 * @returns {boolean}
 */
export function isUrgentJob(expiryDate) {
  if (!expiryDate) return false;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
}

/**
 * تنسيق تاريخ بصيغة قابلة للقراءة
 * @param {Date|string} date - التاريخ
 * @param {string} lang - اللغة
 * @returns {string}
 */
export function formatDate(date, lang = 'ar') {
  const d = new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const locales = {
    ar: 'ar-SA',
    en: 'en-US',
    fr: 'fr-FR'
  };
  
  return d.toLocaleDateString(locales[lang] || locales.ar, options);
}

/**
 * تنسيق تاريخ ووقت بصيغة قابلة للقراءة
 * @param {Date|string} date - التاريخ
 * @param {string} lang - اللغة
 * @returns {string}
 */
export function formatDateTime(date, lang = 'ar') {
  const d = new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const locales = {
    ar: 'ar-SA',
    en: 'en-US',
    fr: 'fr-FR'
  };
  
  return d.toLocaleDateString(locales[lang] || locales.ar, options);
}
