/**
 * مثال على استخدام نظام Bookmark مع المزامنة عبر الأجهزة
 * 
 * هذا المثال يوضح:
 * 1. كيفية حفظ/إزالة وظيفة من المفضلة
 * 2. كيفية جلب الوظائف المحفوظة
 * 3. كيفية المزامنة عبر الأجهزة
 * 4. كيفية التعامل مع حالة offline
 */

import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import {
  toggleBookmark,
  checkBookmarkStatus,
  getBookmarkedJobs,
  syncBookmarks,
  setupOnlineListener,
  isOnline
} from '../utils/bookmarkUtils';

const BookmarkSyncExample = () => {
  const [jobs, setJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [message, setMessage] = useState('');

  // Mock jobs للتجربة
  const mockJobs = [
    { id: '1', title: 'مطور Full Stack', company: 'شركة التقنية' },
    { id: '2', title: 'مصمم UI/UX', company: 'استوديو التصميم' },
    { id: '3', title: 'مدير مشروع', company: 'شركة المنتجات' }
  ];

  useEffect(() => {
    setJobs(mockJobs);
    loadBookmarkedJobs();

    // إعداد مستمع للاتصال بالإنترنت
    const removeListener = setupOnlineListener(handleAutoSync);

    // مستمع لحالة الاتصال
    const handleOnlineStatus = () => {
      setOnline(true);
      showMessage('تم الاتصال بالإنترنت', 'success');
    };
    
    const handleOfflineStatus = () => {
      setOnline(false);
      showMessage('لا يوجد اتصال بالإنترنت', 'warning');
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      removeListener();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const loadBookmarkedJobs = async () => {
    setLoading(true);
    try {
      const jobs = await getBookmarkedJobs();
      setBookmarkedJobs(jobs);
      showMessage(`تم جلب ${jobs.length} وظيفة محفوظة`, 'success');
    } catch (error) {
      showMessage('فشل في جلب الوظائف المحفوظة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (jobId) => {
    try {
      const result = await toggleBookmark(jobId);
      
      if (result.bookmarked) {
        showMessage('تم حفظ الوظيفة', 'success');
      } else {
        showMessage('تم إزالة الوظيفة من المفضلة', 'success');
      }

      if (result.offline) {
        showMessage('تم الحفظ محلياً. سيتم المزامنة عند الاتصال بالإنترنت.', 'warning');
      }

      // إعادة تحميل القائمة
      await loadBookmarkedJobs();
    } catch (error) {
      showMessage('حدث خطأ أثناء تبديل حالة الحفظ', 'error');
    }
  };

  const handleManualSync = async () => {
    if (!online) {
      showMessage('لا يوجد اتصال بالإنترنت', 'error');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncBookmarks();
      
      if (result.success) {
        await loadBookmarkedJobs();
        showMessage(`تمت المزامنة بنجاح! (${result.count} وظيفة)`, 'success');
      } else {
        showMessage('فشلت المزامنة', 'error');
      }
    } catch (error) {
      showMessage('حدث خطأ أثناء المزامنة', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoSync = async (result) => {
    if (result?.success) {
      await loadBookmarkedJobs();
      showMessage('تمت المزامنة التلقائية بنجاح', 'success');
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const isJobBookmarked = (jobId) => {
    return bookmarkedJobs.some(job => (job._id || job.id) === jobId);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>مثال على نظام Bookmark مع المزامنة</h1>

      {/* حالة الاتصال */}
      <div style={{
        ...styles.statusBar,
        backgroundColor: online ? '#10b981' : '#f59e0b'
      }}>
        {online ? <Wifi size={20} /> : <WifiOff size={20} />}
        <span>{online ? 'متصل بالإنترنت' : 'غير متصل'}</span>
      </div>

      {/* رسالة */}
      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: 
            message.type === 'success' ? '#10b981' :
            message.type === 'error' ? '#ef4444' :
            message.type === 'warning' ? '#f59e0b' : '#3b82f6'
        }}>
          {message.text}
        </div>
      )}

      {/* زر المزامنة */}
      <div style={styles.actions}>
        <button
          onClick={handleManualSync}
          disabled={!online || syncing}
          style={{
            ...styles.button,
            ...styles.syncButton,
            opacity: (!online || syncing) ? 0.6 : 1
          }}
        >
          <RefreshCw size={18} style={{
            animation: syncing ? 'spin 1s linear infinite' : 'none'
          }} />
          <span>{syncing ? 'جاري المزامنة...' : 'مزامنة يدوية'}</span>
        </button>

        <button
          onClick={loadBookmarkedJobs}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'جاري التحميل...' : 'تحديث القائمة'}
        </button>
      </div>

      {/* قائمة الوظائف */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>الوظائف المتاحة</h2>
        <div style={styles.jobsList}>
          {jobs.map(job => (
            <div key={job.id} style={styles.jobCard}>
              <div>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <p style={styles.jobCompany}>{job.company}</p>
              </div>
              <button
                onClick={() => handleToggleBookmark(job.id)}
                style={{
                  ...styles.bookmarkButton,
                  color: isJobBookmarked(job.id) ? '#ef4444' : '#6b7280'
                }}
              >
                <Heart
                  size={24}
                  fill={isJobBookmarked(job.id) ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* الوظائف المحفوظة */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          الوظائف المحفوظة ({bookmarkedJobs.length})
        </h2>
        {bookmarkedJobs.length === 0 ? (
          <p style={styles.emptyMessage}>لا توجد وظائف محفوظة</p>
        ) : (
          <div style={styles.jobsList}>
            {bookmarkedJobs.map(job => (
              <div key={job._id || job.id} style={styles.jobCard}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.jobCompany}>{job.company?.name || job.company}</p>
                  {job.bookmarkedAt && (
                    <p style={styles.bookmarkDate}>
                      محفوظة منذ: {new Date(job.bookmarkedAt).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleBookmark(job._id || job.id)}
                  style={{
                    ...styles.bookmarkButton,
                    color: '#ef4444'
                  }}
                >
                  <Heart size={24} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div style={styles.info}>
        <h3 style={styles.infoTitle}>كيف يعمل النظام:</h3>
        <ul style={styles.infoList}>
          <li>✅ البيانات تُحفظ في قاعدة البيانات (MongoDB)</li>
          <li>✅ المزامنة التلقائية عند الاتصال بالإنترنت</li>
          <li>✅ Fallback إلى localStorage عند عدم الاتصال</li>
          <li>✅ يعمل على جميع الأجهزة (Desktop, Mobile, Tablet)</li>
          <li>✅ المزامنة عبر الأجهزة المختلفة</li>
        </ul>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  },
  button: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#304B60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  syncButton: {
    backgroundColor: '#D48161'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '1rem'
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  jobCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'white',
    border: '2px solid #E3DAD1',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  jobTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#304B60',
    margin: '0 0 0.25rem 0'
  },
  jobCompany: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0
  },
  bookmarkDate: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: '0.25rem 0 0 0'
  },
  bookmarkButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    transition: 'all 0.3s ease'
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px'
  },
  info: {
    padding: '1.5rem',
    backgroundColor: '#f0f9ff',
    border: '2px solid #3b82f6',
    borderRadius: '8px'
  },
  infoTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: '0.75rem'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  }
};

export default BookmarkSyncExample;
