/**
 * Progress Saver Utility
 * حفظ واسترجاع تقدم التسجيل في localStorage
 * 
 * Requirements: 6.1, 6.2, 6.6, 6.7
 */

const STORAGE_KEY = 'careerak_registration_progress';
const EXPIRY_DAYS = 7;

/**
 * حساب تاريخ انتهاء الصلاحية
 */
const getExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + EXPIRY_DAYS);
  return date.toISOString();
};

/**
 * التحقق من انتهاء الصلاحية
 */
const isExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
};

/**
 * حفظ التقدم في localStorage
 * @param {number} step - رقم الخطوة الحالية
 * @param {object} data - بيانات النموذج
 */
export const saveProgress = (step, data) => {
  try {
    // إزالة كلمة المرور من البيانات (Requirement 6.7)
    const sanitizedData = {
      ...data,
      password: undefined,
      confirmPassword: undefined
    };

    const progress = {
      step,
      data: sanitizedData,
      savedAt: new Date().toISOString(),
      expiresAt: getExpiryDate()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    console.log('✅ Progress saved:', { step, savedAt: progress.savedAt });
    
    return true;
  } catch (error) {
    console.error('❌ Error saving progress:', error);
    return false;
  }
};

/**
 * تحميل التقدم المحفوظ
 * @returns {object|null} - التقدم المحفوظ أو null
 */
export const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      return null;
    }

    const progress = JSON.parse(saved);

    // التحقق من انتهاء الصلاحية (Requirement 6.6)
    if (isExpired(progress.expiresAt)) {
      console.log('⏰ Progress expired, clearing...');
      clearProgress();
      return null;
    }

    console.log('✅ Progress loaded:', { 
      step: progress.step, 
      savedAt: progress.savedAt,
      expiresAt: progress.expiresAt
    });

    return progress;
  } catch (error) {
    console.error('❌ Error loading progress:', error);
    return null;
  }
};

/**
 * مسح التقدم المحفوظ
 */
export const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Progress cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing progress:', error);
    return false;
  }
};

/**
 * التحقق من وجود تقدم محفوظ
 * @returns {boolean}
 */
export const hasProgress = () => {
  const progress = loadProgress();
  return progress !== null;
};

/**
 * الحصول على معلومات التقدم المحفوظ
 * @returns {object|null}
 */
export const getProgressInfo = () => {
  const progress = loadProgress();
  
  if (!progress) {
    return null;
  }

  return {
    step: progress.step,
    savedAt: progress.savedAt,
    expiresAt: progress.expiresAt,
    daysRemaining: Math.ceil(
      (new Date(progress.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
    )
  };
};

/**
 * React Hook لاستخدام Progress Saver
 */
export const useProgressSaver = () => {
  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasProgress,
    getProgressInfo
  };
};

export default {
  saveProgress,
  loadProgress,
  clearProgress,
  hasProgress,
  getProgressInfo,
  useProgressSaver
};
