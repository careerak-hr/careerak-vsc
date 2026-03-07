import { useState, useEffect } from 'react';

/**
 * Hook لإدارة تفضيل عرض الوظائف (Grid/List)
 * يحفظ التفضيل في localStorage ويسترجعه تلقائياً
 */

const VIEW_PREFERENCE_KEY = 'careerak_jobViewPreference';

/**
 * حفظ تفضيل العرض في localStorage
 * @param {string} view - نوع العرض ('grid' أو 'list')
 */
function saveViewPreference(view) {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, view);
  } catch (error) {
    console.error('Error saving view preference:', error);
  }
}

/**
 * استرجاع تفضيل العرض من localStorage
 * @returns {string} - نوع العرض ('grid' أو 'list')، الافتراضي 'grid'
 */
function getViewPreference() {
  try {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return saved || 'grid';
  } catch (error) {
    console.error('Error getting view preference:', error);
    return 'grid';
  }
}

/**
 * Hook مخصص لإدارة تفضيل عرض الوظائف
 * @returns {[string, function]} - [view, toggleView]
 */
export function useViewPreference() {
  // تهيئة الحالة من localStorage
  const [view, setView] = useState(() => getViewPreference());

  /**
   * تبديل بين Grid و List
   */
  const toggleView = () => {
    const newView = view === 'grid' ? 'list' : 'grid';
    setView(newView);
    saveViewPreference(newView);
  };

  /**
   * تعيين نوع عرض محدد
   * @param {string} newView - نوع العرض ('grid' أو 'list')
   */
  const setViewType = (newView) => {
    if (newView === 'grid' || newView === 'list') {
      setView(newView);
      saveViewPreference(newView);
    }
  };

  // مزامنة مع localStorage عند التغيير من تبويب آخر
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === VIEW_PREFERENCE_KEY && e.newValue) {
        setView(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return [view, toggleView, setViewType];
}

export default useViewPreference;
