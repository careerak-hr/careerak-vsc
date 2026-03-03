import { useState, useEffect, useCallback } from 'react';
import {
  serializeFiltersToURL,
  deserializeFiltersFromURL,
  updateURLWithFilters,
  getFiltersFromCurrentURL,
  clearFiltersFromURL,
  createShareableLink,
  copyShareableLinkToClipboard,
  areFiltersEqual
} from '../utils/filterUrlSerializer';

/**
 * Hook مخصص لإدارة الفلاتر مع مزامنة URL
 * 
 * @param {Object} initialFilters - الفلاتر الافتراضية
 * @param {Object} options - خيارات إضافية
 * @param {boolean} options.syncOnMount - مزامنة من URL عند التحميل (افتراضي: true)
 * @param {boolean} options.updateOnChange - تحديث URL عند تغيير الفلاتر (افتراضي: true)
 * @param {boolean} options.replaceState - استخدام replaceState بدلاً من pushState (افتراضي: false)
 * @returns {Object} - كائن يحتوي على الفلاتر والدوال
 */
export function useFilterURL(initialFilters = {}, options = {}) {
  const {
    syncOnMount = true,
    updateOnChange = true,
    replaceState = false
  } = options;

  // الحصول على الفلاتر من URL عند التحميل
  const getInitialFilters = () => {
    if (syncOnMount) {
      const urlFilters = getFiltersFromCurrentURL();
      // دمج الفلاتر من URL مع الفلاتر الافتراضية
      return Object.keys(urlFilters).length > 0 
        ? { ...initialFilters, ...urlFilters }
        : initialFilters;
    }
    return initialFilters;
  };

  const [filters, setFilters] = useState(getInitialFilters);

  // تحديث URL عند تغيير الفلاتر
  useEffect(() => {
    if (updateOnChange) {
      updateURLWithFilters(filters, replaceState);
    }
  }, [filters, updateOnChange, replaceState]);

  // الاستماع لتغييرات التنقل (back/forward)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.filters) {
        setFilters(event.state.filters);
      } else {
        const urlFilters = getFiltersFromCurrentURL();
        if (Object.keys(urlFilters).length > 0) {
          setFilters(urlFilters);
        } else {
          setFilters(initialFilters);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialFilters]);

  /**
   * تحديث فلتر واحد
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * تحديث عدة فلاتر دفعة واحدة
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * استبدال جميع الفلاتر
   */
  const replaceFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * حذف فلتر واحد
   */
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  /**
   * مسح جميع الفلاتر
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    clearFiltersFromURL(replaceState);
  }, [initialFilters, replaceState]);

  /**
   * إعادة تعيين إلى الفلاتر الافتراضية
   */
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * الحصول على رابط قابل للمشاركة
   */
  const getShareableLink = useCallback(() => {
    return createShareableLink(filters);
  }, [filters]);

  /**
   * نسخ الرابط إلى الحافظة
   */
  const copyLink = useCallback(async () => {
    return await copyShareableLinkToClipboard(filters);
  }, [filters]);

  /**
   * التحقق من وجود فلاتر نشطة
   */
  const hasActiveFilters = useCallback(() => {
    return !areFiltersEqual(filters, initialFilters);
  }, [filters, initialFilters]);

  /**
   * عدد الفلاتر النشطة
   */
  const activeFilterCount = useCallback(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          count++;
        } else if (typeof value === 'object') {
          // عد الكائنات المتداخلة (مثل salary.min, salary.max)
          Object.values(value).forEach(subValue => {
            if (subValue !== null && subValue !== undefined && subValue !== '') {
              count++;
            }
          });
        } else {
          count++;
        }
      }
    });
    return count;
  }, [filters]);

  return {
    // الحالة
    filters,
    
    // دوال التحديث
    updateFilter,
    updateFilters,
    replaceFilters,
    removeFilter,
    clearFilters,
    resetFilters,
    
    // دوال المشاركة
    getShareableLink,
    copyLink,
    
    // دوال المساعدة
    hasActiveFilters,
    activeFilterCount,
    
    // دوال منخفضة المستوى (للاستخدام المتقدم)
    serializeToURL: () => serializeFiltersToURL(filters),
    deserializeFromURL: deserializeFiltersFromURL,
  };
}

export default useFilterURL;
