/**
 * Custom Hook for Video Interview Translations
 * Hook مخصص لترجمات نظام الفيديو للمقابلات
 * 
 * يوفر وصول سهل للترجمات مع دعم اللغة الحالية من AppContext
 */

import { useApp } from '../context/AppContext';
import videoInterviewTranslations from '../translations/videoInterviewTranslations';

/**
 * Hook للحصول على ترجمات نظام الفيديو للمقابلات
 * @returns {Object} كائن الترجمات للغة الحالية
 */
export const useVideoInterviewTranslations = () => {
  const { language } = useApp();
  
  // الحصول على الترجمات للغة الحالية مع fallback للعربية
  const translations = videoInterviewTranslations[language] || videoInterviewTranslations.ar;
  
  return translations;
};

/**
 * Hook للحصول على قسم محدد من الترجمات
 * @param {string} section - اسم القسم (مثل: 'videoCall', 'deviceTest', 'waitingRoom')
 * @returns {Object} ترجمات القسم المحدد
 */
export const useVideoInterviewSection = (section) => {
  const translations = useVideoInterviewTranslations();
  return translations[section] || {};
};

export default useVideoInterviewTranslations;

