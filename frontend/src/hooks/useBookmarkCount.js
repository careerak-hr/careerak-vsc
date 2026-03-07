import { useState, useEffect, useCallback } from 'react';

/**
 * Hook لإدارة عداد الوظائف المحفوظة
 * يوفر العدد الحالي ودوال للتحديث
 * 
 * @returns {Object} { count, loading, error, fetchCount, incrementCount, decrementCount, setCount }
 */
export const useBookmarkCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * جلب عدد الوظائف المحفوظة من الخادم
   */
  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: استبدال بـ API call حقيقي
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/jobs/bookmarked/count', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setCount(data.count);

      // Mock data للتجربة
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // محاولة الحصول على العدد من localStorage
      const savedCount = localStorage.getItem('bookmarkCount');
      setCount(savedCount ? parseInt(savedCount, 10) : 0);
    } catch (err) {
      console.error('Error fetching bookmark count:', err);
      setError(err.message);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * زيادة العداد بمقدار 1
   */
  const incrementCount = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem('bookmarkCount', newCount.toString());
      return newCount;
    });
  }, []);

  /**
   * تقليل العداد بمقدار 1
   */
  const decrementCount = useCallback(() => {
    setCount(prev => {
      const newCount = Math.max(0, prev - 1);
      localStorage.setItem('bookmarkCount', newCount.toString());
      return newCount;
    });
  }, []);

  /**
   * تعيين العداد مباشرة
   * @param {number} newCount - العدد الجديد
   */
  const updateCount = useCallback((newCount) => {
    const validCount = Math.max(0, parseInt(newCount, 10) || 0);
    setCount(validCount);
    localStorage.setItem('bookmarkCount', validCount.toString());
  }, []);

  // جلب العدد عند التحميل الأول
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // الاستماع لتغييرات localStorage من نوافذ أخرى
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bookmarkCount' && e.newValue !== null) {
        setCount(parseInt(e.newValue, 10) || 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // الاستماع لحدث مخصص لتحديث العداد
  useEffect(() => {
    const handleBookmarkChange = (e) => {
      const { action } = e.detail;
      
      if (action === 'add') {
        incrementCount();
      } else if (action === 'remove') {
        decrementCount();
      } else if (action === 'refresh') {
        fetchCount();
      }
    };

    window.addEventListener('bookmarkCountChange', handleBookmarkChange);
    return () => window.removeEventListener('bookmarkCountChange', handleBookmarkChange);
  }, [incrementCount, decrementCount, fetchCount]);

  return {
    count,
    loading,
    error,
    fetchCount,
    incrementCount,
    decrementCount,
    setCount: updateCount
  };
};

/**
 * دالة مساعدة لإطلاق حدث تغيير العداد
 * @param {string} action - نوع الإجراء (add, remove, refresh)
 */
export const emitBookmarkCountChange = (action) => {
  const event = new CustomEvent('bookmarkCountChange', {
    detail: { action }
  });
  window.dispatchEvent(event);
};

export default useBookmarkCount;
