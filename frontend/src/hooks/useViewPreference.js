import { useState, useEffect } from 'react';

/**
 * Hook to manage view preference (grid vs list)
 * Requirements: 1.3 (حفظ التفضيل في localStorage)
 */
const useViewPreference = (defaultView = 'grid') => {
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem('job_view_preference');
    return savedView || defaultView;
  });

  useEffect(() => {
    localStorage.setItem('job_view_preference', view);
  }, [view]);

  const toggleView = () => {
    setView(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  return { view, setView, toggleView };
};

export default useViewPreference;
