import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getSEOMetadata, getDynamicSEOMetadata } from '../config/seoMetadata';

/**
 * Custom hook for SEO metadata
 * 
 * Provides SEO metadata based on current language and page
 * 
 * @param {string} page - Page identifier (e.g., 'language', 'entry', 'login')
 * @param {Object} customData - Optional custom data for dynamic metadata
 * @returns {Object} SEO metadata object with title, description, keywords, and locale
 * 
 * @example
 * const seo = useSEO('login');
 * <SEOHead {...seo} />
 * 
 * @example
 * const seo = useSEO('profile', { name: 'John Doe' });
 * <SEOHead {...seo} />
 */
export const useSEO = (page, customData = {}) => {
  const { language } = useApp();
  
  const seoData = useMemo(() => {
    const metadata = customData && Object.keys(customData).length > 0
      ? getDynamicSEOMetadata(page, language, customData)
      : getSEOMetadata(page, language);
    
    // Map language to locale
    const localeMap = {
      ar: 'ar_SA',
      en: 'en_US',
      fr: 'fr_FR'
    };
    
    // Get alternate locales (all except current)
    const allLocales = ['ar_SA', 'en_US', 'fr_FR'];
    const currentLocale = localeMap[language] || 'ar_SA';
    const alternateLocales = allLocales.filter(locale => locale !== currentLocale);
    
    // Get current URL if not provided in metadata
    const currentUrl = metadata.url 
      ? (typeof window !== 'undefined' ? window.location.origin + metadata.url : metadata.url)
      : (typeof window !== 'undefined' ? window.location.href : '');
    
    return {
      ...metadata,
      url: currentUrl,
      locale: currentLocale,
      alternateLocales,
      siteName: 'Careerak',
      type: 'website'
    };
  }, [page, language, customData]);
  
  return seoData;
};

export default useSEO;
