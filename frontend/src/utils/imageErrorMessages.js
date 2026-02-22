/**
 * Image Error Messages Utility
 * 
 * Provides multi-language error messages for image loading failures.
 * Supports Arabic, English, and French.
 * 
 * Requirements: FR-LOAD-6, NFR-COMPAT-5
 * 
 * @example
 * import { getImageErrorMessage } from './imageErrorMessages';
 * 
 * const message = getImageErrorMessage('ar');
 * // Returns: "فشل تحميل الصورة"
 */

export const IMAGE_ERROR_MESSAGES = {
  ar: {
    loadFailed: 'فشل تحميل الصورة',
    retry: 'إعادة المحاولة',
    networkError: 'خطأ في الاتصال بالشبكة',
    notFound: 'الصورة غير موجودة',
    invalidFormat: 'تنسيق الصورة غير صالح',
    tooLarge: 'حجم الصورة كبير جداً',
    accessDenied: 'تم رفض الوصول إلى الصورة',
  },
  en: {
    loadFailed: 'Failed to load image',
    retry: 'Retry',
    networkError: 'Network connection error',
    notFound: 'Image not found',
    invalidFormat: 'Invalid image format',
    tooLarge: 'Image size too large',
    accessDenied: 'Access to image denied',
  },
  fr: {
    loadFailed: 'Échec du chargement de l\'image',
    retry: 'Réessayer',
    networkError: 'Erreur de connexion réseau',
    notFound: 'Image introuvable',
    invalidFormat: 'Format d\'image invalide',
    tooLarge: 'Taille de l\'image trop grande',
    accessDenied: 'Accès à l\'image refusé',
  },
};

/**
 * Get error message in specified language
 * @param {string} language - Language code (ar, en, fr)
 * @param {string} errorType - Type of error (loadFailed, networkError, etc.)
 * @returns {string} Error message in specified language
 */
export const getImageErrorMessage = (language = 'en', errorType = 'loadFailed') => {
  const messages = IMAGE_ERROR_MESSAGES[language] || IMAGE_ERROR_MESSAGES.en;
  return messages[errorType] || messages.loadFailed;
};

/**
 * Get retry button text in specified language
 * @param {string} language - Language code (ar, en, fr)
 * @returns {string} Retry button text
 */
export const getRetryButtonText = (language = 'en') => {
  const messages = IMAGE_ERROR_MESSAGES[language] || IMAGE_ERROR_MESSAGES.en;
  return messages.retry;
};

/**
 * Detect error type from error object
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
export const detectErrorType = (error) => {
  if (!error) return 'loadFailed';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'networkError';
  }
  
  if (message.includes('404') || message.includes('not found')) {
    return 'notFound';
  }
  
  if (message.includes('format') || message.includes('invalid')) {
    return 'invalidFormat';
  }
  
  if (message.includes('size') || message.includes('large')) {
    return 'tooLarge';
  }
  
  if (message.includes('403') || message.includes('denied') || message.includes('forbidden')) {
    return 'accessDenied';
  }
  
  return 'loadFailed';
};

export default {
  IMAGE_ERROR_MESSAGES,
  getImageErrorMessage,
  getRetryButtonText,
  detectErrorType,
};
