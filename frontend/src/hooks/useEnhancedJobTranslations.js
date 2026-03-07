/**
 * Custom Hook for Enhanced Job Postings Translations
 * دعم كامل للعربية والإنجليزية
 */

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { t, tp } from '../translations/enhancedJobPostings';

/**
 * Hook to use translations in Enhanced Job Postings components
 * @returns {object} Translation functions and current language
 */
export function useEnhancedJobTranslations() {
  const { language } = useContext(AppContext);
  
  // Get current language (default to 'ar' if not set)
  const currentLang = language || 'ar';
  
  /**
   * Translate a key
   * @param {string} key - Translation key (e.g., 'bookmark.save')
   * @param {object} params - Parameters for interpolation
   * @returns {string} Translated text
   */
  const translate = (key, params = {}) => {
    return t(currentLang, key, params);
  };
  
  /**
   * Translate with pluralization
   * @param {string} key - Translation key
   * @param {number} count - Count for pluralization
   * @param {object} params - Additional parameters
   * @returns {string} Translated text with correct plural form
   */
  const translatePlural = (key, count, params = {}) => {
    return tp(currentLang, key, count, params);
  };
  
  /**
   * Format time ago (e.g., "منذ 3 أيام" or "3 days ago")
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted time string
   */
  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMins < 1) {
      return translate('time.justNow');
    } else if (diffMins < 60) {
      return translatePlural('time.minutesAgo', diffMins);
    } else if (diffHours < 24) {
      return translatePlural('time.hoursAgo', diffHours);
    } else if (diffDays < 7) {
      return translatePlural('time.daysAgo', diffDays);
    } else if (diffWeeks < 4) {
      return translatePlural('time.weeksAgo', diffWeeks);
    } else {
      return translatePlural('time.monthsAgo', diffMonths);
    }
  };
  
  /**
   * Format salary with currency
   * @param {number} amount - Salary amount
   * @returns {string} Formatted salary string
   */
  const formatSalary = (amount) => {
    const formatted = amount.toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US');
    const currency = translate('salary.currency');
    return currentLang === 'ar' ? `${formatted} ${currency}` : `${currency} ${formatted}`;
  };
  
  /**
   * Format count with proper pluralization
   * @param {number} count - Count number
   * @param {string} key - Translation key for the item
   * @returns {string} Formatted count string
   */
  const formatCount = (count, key) => {
    const countStr = count.toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US');
    const itemStr = translatePlural(key, count);
    return currentLang === 'ar' ? `${countStr} ${itemStr}` : `${countStr} ${itemStr}`;
  };
  
  /**
   * Check if current language is RTL
   * @returns {boolean} True if RTL
   */
  const isRTL = () => {
    return currentLang === 'ar';
  };
  
  return {
    t: translate,
    tp: translatePlural,
    formatTimeAgo,
    formatSalary,
    formatCount,
    isRTL,
    language: currentLang
  };
}

export default useEnhancedJobTranslations;
