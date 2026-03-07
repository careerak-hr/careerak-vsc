import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * مثال على استخدام إشعارات إغلاق الوظائف المحفوظة
 * 
 * الميزات:
 * - عرض إشعارات إغلاق الوظائف المحفوظة
 * - تصفية الإشعارات حسب النوع
 * - تحديد الإشعار كمقروء
 * - الانتقال إلى الوظائف المشابهة
 */

const JobClosedNotificationExample = () => {
  const { language } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'إشعارات إغلاق الوظائف',
      noNotifications: 'لا توجد إشعارات',
      markAsRead: 'تحديد كمقروء',
      viewSimilar: 'عرض وظائف مشابهة',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ أثناء تحميل الإشعارات'
    },
    en: {
      title: 'Job Closed Notifications',
      noNotifications: 'No notifications',
      markAsRead: 'Mark as read',
      viewSimilar: 'View similar jobs',
      loading: 'Loading...',
      error: 'Error loading notifications'
    },
    fr: {
      title: 'Notifications de fermeture d\'emploi',
      noNotifications: 'Aucune notification',
      markAsRead: 'Marquer comme lu',
      viewSimilar: 'Voir des emplois similaires',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement des notifications'
    }
  };

  const t = translations[language] || translations.ar;

  // جلب الإشعارات
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications?type=job_closed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // تحديث الحالة المحلية
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // الانتقال إلى الوظائف المشابهة
  const viewSimilarJobs = (jobId) => {
    window.location.href = `/job-postings?similar=${jobId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3">{t.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="mt-4 text-gray-600">{t.noNotifications}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <JobClosedNotificationCard
              key={notification._id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onViewSimilar={viewSimilarJobs}
              translations={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// مكون بطاقة الإشعار
const JobClosedNotificationCard = ({ notification, onMarkAsRead, onViewSimilar, translations }) => {
  const isRead = notification.isRead;
  const jobId = notification.relatedData?.jobPosting;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* أيقونة وعنوان */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📌</span>
            <h3 className="text-lg font-semibold">{notification.title}</h3>
            {!isRead && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                جديد
              </span>
            )}
          </div>

          {/* الرسالة */}
          <p className="text-gray-700 mb-3">{notification.message}</p>

          {/* التاريخ */}
          <p className="text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* الإجراءات */}
        <div className="flex flex-col gap-2 ml-4">
          {!isRead && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
            >
              {translations.markAsRead}
            </button>
          )}
          
          {jobId && (
            <button
              onClick={() => onViewSimilar(jobId)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm transition-colors"
            >
              {translations.viewSimilar}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobClosedNotificationExample;

/**
 * مثال الاستخدام:
 * 
 * import JobClosedNotificationExample from './examples/JobClosedNotificationExample';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <JobClosedNotificationExample />
 *     </div>
 *   );
 * }
 * 
 * الميزات:
 * 1. عرض جميع إشعارات إغلاق الوظائف المحفوظة
 * 2. تمييز الإشعارات غير المقروءة
 * 3. تحديد الإشعار كمقروء بنقرة واحدة
 * 4. الانتقال إلى الوظائف المشابهة
 * 5. دعم متعدد اللغات (ar, en, fr)
 * 6. تصميم متجاوب
 * 7. معالجة الأخطاء
 * 8. حالات التحميل
 */
