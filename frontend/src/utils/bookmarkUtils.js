/**
 * Bookmark Utilities
 * دوال مساعدة لإدارة الوظائف المحفوظة مع المزامنة عبر الأجهزة
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * الحصول على token من localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * الحصول على headers للطلبات
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * تبديل حالة حفظ الوظيفة (toggle bookmark)
 * @param {string} jobId - معرف الوظيفة
 * @returns {Promise<{bookmarked: boolean, message: string}>}
 */
export const toggleBookmark = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/bookmark`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'فشل في تبديل حالة الحفظ');
    }

    const data = await response.json();
    
    if (data.success) {
      // تحديث localStorage كـ cache
      updateLocalBookmarkCache(jobId, data.bookmarked);
      
      return {
        bookmarked: data.bookmarked,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'حدث خطأ');
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    
    // Fallback: استخدام localStorage فقط
    const localBookmarked = toggleLocalBookmark(jobId);
    
    return {
      bookmarked: localBookmarked,
      message: localBookmarked ? 'تم الحفظ محلياً' : 'تم الإزالة محلياً',
      offline: true
    };
  }
};

/**
 * التحقق من حفظ وظيفة معينة
 * @param {string} jobId - معرف الوظيفة
 * @returns {Promise<boolean>}
 */
export const checkBookmarkStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/bookmark/status`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('فشل في التحقق من حالة الحفظ');
    }

    const data = await response.json();
    
    if (data.success) {
      // تحديث localStorage
      updateLocalBookmarkCache(jobId, data.isBookmarked);
      return data.isBookmarked;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    
    // Fallback: التحقق من localStorage
    return isBookmarkedLocally(jobId);
  }
};

/**
 * الحصول على جميع الوظائف المحفوظة
 * @param {Object} filters - فلاتر إضافية
 * @returns {Promise<Array>}
 */
export const getBookmarkedJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.tags) queryParams.append('tags', filters.tags.join(','));

    const url = `${API_URL}/api/jobs/bookmarked${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الوظائف المحفوظة');
    }

    const data = await response.json();
    
    if (data.success) {
      // تحديث localStorage cache
      saveBookmarkedJobsToLocal(data.jobs);
      return data.jobs || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching bookmarked jobs:', error);
    
    // Fallback: جلب من localStorage
    return getBookmarkedJobsFromLocal();
  }
};

/**
 * تحديث ملاحظات أو tags للوظيفة المحفوظة
 * @param {string} jobId - معرف الوظيفة
 * @param {Object} updates - التحديثات (notes, tags, notifyOnChange)
 * @returns {Promise<Object>}
 */
export const updateBookmark = async (jobId, updates) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/bookmark`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'فشل في تحديث الوظيفة المحفوظة');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.bookmark;
    } else {
      throw new Error(data.message || 'حدث خطأ');
    }
  } catch (error) {
    console.error('Error updating bookmark:', error);
    throw error;
  }
};

/**
 * الحصول على إحصائيات الحفظ
 * @returns {Promise<Object>}
 */
export const getBookmarkStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/bookmarks/stats`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الإحصائيات');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.stats;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching bookmark stats:', error);
    return null;
  }
};

// ==================== Local Storage Helpers ====================

/**
 * تحديث cache محلي لحالة الحفظ
 */
const updateLocalBookmarkCache = (jobId, isBookmarked) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobIds') || '[]');
    
    if (isBookmarked && !bookmarks.includes(jobId)) {
      bookmarks.push(jobId);
    } else if (!isBookmarked) {
      const index = bookmarks.indexOf(jobId);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
    
    localStorage.setItem('bookmarkedJobIds', JSON.stringify(bookmarks));
    localStorage.setItem('bookmarkCount', bookmarks.length.toString());
  } catch (error) {
    console.error('Error updating local bookmark cache:', error);
  }
};

/**
 * تبديل حالة الحفظ محلياً (fallback)
 */
const toggleLocalBookmark = (jobId) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobIds') || '[]');
    const index = bookmarks.indexOf(jobId);
    
    if (index > -1) {
      bookmarks.splice(index, 1);
      localStorage.setItem('bookmarkedJobIds', JSON.stringify(bookmarks));
      localStorage.setItem('bookmarkCount', bookmarks.length.toString());
      return false;
    } else {
      bookmarks.push(jobId);
      localStorage.setItem('bookmarkedJobIds', JSON.stringify(bookmarks));
      localStorage.setItem('bookmarkCount', bookmarks.length.toString());
      return true;
    }
  } catch (error) {
    console.error('Error toggling local bookmark:', error);
    return false;
  }
};

/**
 * التحقق من الحفظ محلياً
 */
const isBookmarkedLocally = (jobId) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobIds') || '[]');
    return bookmarks.includes(jobId);
  } catch (error) {
    console.error('Error checking local bookmark:', error);
    return false;
  }
};

/**
 * حفظ قائمة الوظائف المحفوظة محلياً
 */
const saveBookmarkedJobsToLocal = (jobs) => {
  try {
    localStorage.setItem('bookmarkedJobs', JSON.stringify(jobs));
    
    const jobIds = jobs.map(job => job._id || job.id);
    localStorage.setItem('bookmarkedJobIds', JSON.stringify(jobIds));
    localStorage.setItem('bookmarkCount', jobs.length.toString());
  } catch (error) {
    console.error('Error saving bookmarked jobs to local:', error);
  }
};

/**
 * جلب الوظائف المحفوظة محلياً
 */
const getBookmarkedJobsFromLocal = () => {
  try {
    const jobs = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
    return jobs;
  } catch (error) {
    console.error('Error getting bookmarked jobs from local:', error);
    return [];
  }
};

/**
 * مزامنة البيانات المحلية مع الخادم
 * يُستخدم عند الاتصال بالإنترنت بعد فترة offline
 */
export const syncBookmarks = async () => {
  try {
    // جلب البيانات من الخادم
    const serverJobs = await getBookmarkedJobs();
    
    // تحديث localStorage
    saveBookmarkedJobsToLocal(serverJobs);
    
    return {
      success: true,
      count: serverJobs.length
    };
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * التحقق من حالة الاتصال بالإنترنت
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * إعداد مستمع لحالة الاتصال بالإنترنت
 * يقوم بالمزامنة تلقائياً عند العودة للاتصال
 */
export const setupOnlineListener = (onSync) => {
  const handleOnline = async () => {
    console.log('Connection restored. Syncing bookmarks...');
    const result = await syncBookmarks();
    
    if (result.success && onSync) {
      onSync(result);
    }
  };

  window.addEventListener('online', handleOnline);
  
  // إرجاع دالة لإزالة المستمع
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

export default {
  toggleBookmark,
  checkBookmarkStatus,
  getBookmarkedJobs,
  updateBookmark,
  getBookmarkStats,
  syncBookmarks,
  isOnline,
  setupOnlineListener
};
