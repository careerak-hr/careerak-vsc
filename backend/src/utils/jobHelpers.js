/**
 * Job Helper Functions
 * دوال مساعدة للوظائف
 */

/**
 * Check if a job is new (posted within last 3 days)
 * @param {Date} createdAt - Job creation date
 * @returns {boolean} - True if job is new
 */
function isJobNew(createdAt) {
  if (!createdAt) return false;
  
  const now = new Date();
  const jobDate = new Date(createdAt);
  const diffMs = now - jobDate;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays <= 3;
}

/**
 * Check if a job is urgent (expires within 7 days)
 * @param {Date} expiryDate - Job expiry date
 * @returns {boolean} - True if job is urgent
 */
function isJobUrgent(expiryDate) {
  if (!expiryDate) return false;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 && diffDays <= 7;
}

/**
 * Get time since job was posted
 * @param {Date} createdAt - Job creation date
 * @param {string} lang - Language (ar, en, fr)
 * @returns {string} - Formatted time string
 */
function getTimeSincePosted(createdAt, lang = 'ar') {
  if (!createdAt) return '';
  
  const now = new Date();
  const jobDate = new Date(createdAt);
  const diffMs = now - jobDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  const translations = {
    ar: {
      justNow: 'الآن',
      minutesAgo: (n) => `منذ ${n} ${n === 1 ? 'دقيقة' : n === 2 ? 'دقيقتين' : 'دقائق'}`,
      hoursAgo: (n) => `منذ ${n} ${n === 1 ? 'ساعة' : n === 2 ? 'ساعتين' : 'ساعات'}`,
      daysAgo: (n) => `منذ ${n} ${n === 1 ? 'يوم' : n === 2 ? 'يومين' : 'أيام'}`,
      weeksAgo: (n) => `منذ ${n} ${n === 1 ? 'أسبوع' : n === 2 ? 'أسبوعين' : 'أسابيع'}`,
      monthsAgo: (n) => `منذ ${n} ${n === 1 ? 'شهر' : n === 2 ? 'شهرين' : 'أشهر'}`
    },
    en: {
      justNow: 'Just now',
      minutesAgo: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
      hoursAgo: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
      daysAgo: (n) => `${n} day${n !== 1 ? 's' : ''} ago`,
      weeksAgo: (n) => `${n} week${n !== 1 ? 's' : ''} ago`,
      monthsAgo: (n) => `${n} month${n !== 1 ? 's' : ''} ago`
    },
    fr: {
      justNow: 'À l\'instant',
      minutesAgo: (n) => `Il y a ${n} minute${n !== 1 ? 's' : ''}`,
      hoursAgo: (n) => `Il y a ${n} heure${n !== 1 ? 's' : ''}`,
      daysAgo: (n) => `Il y a ${n} jour${n !== 1 ? 's' : ''}`,
      weeksAgo: (n) => `Il y a ${n} semaine${n !== 1 ? 's' : ''}`,
      monthsAgo: (n) => `Il y a ${n} mois`
    }
  };
  
  const t = translations[lang] || translations.ar;
  
  if (diffMinutes < 1) return t.justNow;
  if (diffMinutes < 60) return t.minutesAgo(diffMinutes);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  if (diffDays < 7) return t.daysAgo(diffDays);
  if (diffWeeks < 4) return t.weeksAgo(diffWeeks);
  return t.monthsAgo(diffMonths);
}

/**
 * Add computed fields to job object
 * @param {Object} job - Job object
 * @returns {Object} - Job with computed fields
 */
function addComputedFields(job) {
  const jobObj = job.toObject ? job.toObject() : job;
  
  return {
    ...jobObj,
    isNew: isJobNew(jobObj.createdAt),
    timeSincePosted: {
      ar: getTimeSincePosted(jobObj.createdAt, 'ar'),
      en: getTimeSincePosted(jobObj.createdAt, 'en'),
      fr: getTimeSincePosted(jobObj.createdAt, 'fr')
    }
  };
}

module.exports = {
  isJobNew,
  isJobUrgent,
  getTimeSincePosted,
  addComputedFields
};
