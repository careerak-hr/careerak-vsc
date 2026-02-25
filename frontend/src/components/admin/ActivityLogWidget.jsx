import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import pusherClient from '../../utils/pusherClient';
import './ActivityLogWidget.css';

/**
 * ActivityLogWidget Component
 * Displays recent activity entries with filtering, search, and pagination
 * Requirements: 5.11-5.14
 */
const ActivityLogWidget = ({ maxEntries = 10, showFilters = true, showSearch = true }) => {
  const { language, fontFamily } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [actionType, setActionType] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Available action types
  const actionTypes = [
    'user_registered',
    'job_posted',
    'application_submitted',
    'application_status_changed',
    'course_published',
    'course_enrolled',
    'review_posted',
    'content_reported',
    'user_modified',
    'content_deleted'
  ];

  const translations = {
    ar: {
      title: 'سجل النشاطات',
      search: 'بحث...',
      filterByType: 'تصفية حسب النوع',
      filterByUser: 'معرف المستخدم',
      startDate: 'من تاريخ',
      endDate: 'إلى تاريخ',
      clearFilters: 'مسح الفلاتر',
      noLogs: 'لا توجد نشاطات',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
      previous: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من',
      total: 'إجمالي',
      entries: 'إدخال',
      viewAll: 'عرض الكل',
      actionTypes: {
        user_registered: 'تسجيل مستخدم',
        job_posted: 'نشر وظيفة',
        application_submitted: 'تقديم طلب',
        application_status_changed: 'تغيير حالة الطلب',
        course_published: 'نشر دورة',
        course_enrolled: 'التسجيل في دورة',
        review_posted: 'نشر تقييم',
        content_reported: 'الإبلاغ عن محتوى',
        user_modified: 'تعديل مستخدم',
        content_deleted: 'حذف محتوى'
      }
    },
    en: {
      title: 'Activity Log',
      search: 'Search...',
      filterByType: 'Filter by Type',
      filterByUser: 'User ID',
      startDate: 'Start Date',
      endDate: 'End Date',
      clearFilters: 'Clear Filters',
      noLogs: 'No activities found',
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      total: 'Total',
      entries: 'entries',
      viewAll: 'View All',
      actionTypes: {
        user_registered: 'User Registered',
        job_posted: 'Job Posted',
        application_submitted: 'Application Submitted',
        application_status_changed: 'Application Status Changed',
        course_published: 'Course Published',
        course_enrolled: 'Course Enrolled',
        review_posted: 'Review Posted',
        content_reported: 'Content Reported',
        user_modified: 'User Modified',
        content_deleted: 'Content Deleted'
      }
    },
    fr: {
      title: 'Journal d\'activité',
      search: 'Rechercher...',
      filterByType: 'Filtrer par type',
      filterByUser: 'ID utilisateur',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      clearFilters: 'Effacer les filtres',
      noLogs: 'Aucune activité trouvée',
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      retry: 'Réessayer',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'de',
      total: 'Total',
      entries: 'entrées',
      viewAll: 'Voir tout',
      actionTypes: {
        user_registered: 'Utilisateur enregistré',
        job_posted: 'Emploi publié',
        application_submitted: 'Candidature soumise',
        application_status_changed: 'Statut de candidature modifié',
        course_published: 'Cours publié',
        course_enrolled: 'Inscrit au cours',
        review_posted: 'Avis publié',
        content_reported: 'Contenu signalé',
        user_modified: 'Utilisateur modifié',
        content_deleted: 'Contenu supprimé'
      }
    }
  };

  const t = translations[language] || translations.en;

  // Fetch activity logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: maxEntries.toString()
      });

      if (actionType) params.append('actionType', actionType);
      if (userId) params.append('actorId', userId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      let url = `/api/admin/activity-log?${params.toString()}`;
      
      // Use search endpoint if search term is provided
      if (searchTerm) {
        url = `/api/admin/activity-log/search?q=${encodeURIComponent(searchTerm)}&${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      
      setLogs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, maxEntries, actionType, userId, startDate, endDate, searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time updates via Pusher (Requirement 5.14)
  useEffect(() => {
    if (!pusherClient.isConnected()) {
      return;
    }

    const handleNewActivity = (data) => {
      // Add new activity to the top of the list
      setLogs(prevLogs => {
        const newLogs = [data, ...prevLogs];
        // Keep only maxEntries items
        return newLogs.slice(0, maxEntries);
      });
      setTotal(prev => prev + 1);
    };

    // Subscribe to activity log channel
    window.addEventListener('pusher-activity-log', handleNewActivity);

    return () => {
      window.removeEventListener('pusher-activity-log', handleNewActivity);
    };
  }, [maxEntries]);

  // Clear all filters
  const handleClearFilters = () => {
    setActionType('');
    setUserId('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ar' ? 'الآن' : language === 'fr' ? 'maintenant' : 'now';
    if (diffMins < 60) return `${diffMins} ${language === 'ar' ? 'دقيقة' : language === 'fr' ? 'min' : 'min'}`;
    if (diffHours < 24) return `${diffHours} ${language === 'ar' ? 'ساعة' : language === 'fr' ? 'h' : 'h'}`;
    if (diffDays < 7) return `${diffDays} ${language === 'ar' ? 'يوم' : language === 'fr' ? 'j' : 'd'}`;
    
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Get action type color
  const getActionTypeColor = (type) => {
    const colors = {
      user_registered: '#10B981',
      job_posted: '#3B82F6',
      application_submitted: '#8B5CF6',
      application_status_changed: '#F59E0B',
      course_published: '#06B6D4',
      course_enrolled: '#14B8A6',
      review_posted: '#EC4899',
      content_reported: '#EF4444',
      user_modified: '#F97316',
      content_deleted: '#DC2626'
    };
    return colors[type] || '#6B7280';
  };

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  if (loading && logs.length === 0) {
    return (
      <div className="activity-log-widget" style={fontStyle}>
        <div className="activity-log-header">
          <h3>{t.title}</h3>
        </div>
        <div className="activity-log-loading">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-log-widget" style={fontStyle}>
        <div className="activity-log-header">
          <h3>{t.title}</h3>
        </div>
        <div className="activity-log-error">
          <p>{t.error}: {error}</p>
          <button onClick={fetchLogs} className="retry-button">
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-widget" style={fontStyle}>
      <div className="activity-log-header">
        <h3>{t.title}</h3>
        <span className="activity-log-count">
          {total} {t.entries}
        </span>
      </div>

      {showSearch && (
        <div className="activity-log-search">
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="search-input"
            style={fontStyle}
          />
        </div>
      )}

      {showFilters && (
        <div className="activity-log-filters">
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="filter-select"
            style={fontStyle}
          >
            <option value="">{t.filterByType}</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {t.actionTypes[type]}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={t.filterByUser}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
            className="filter-input"
            style={fontStyle}
          />

          <input
            type="date"
            placeholder={t.startDate}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="filter-input"
            style={fontStyle}
          />

          <input
            type="date"
            placeholder={t.endDate}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="filter-input"
            style={fontStyle}
          />

          {(actionType || userId || startDate || endDate || searchTerm) && (
            <button onClick={handleClearFilters} className="clear-filters-button">
              {t.clearFilters}
            </button>
          )}
        </div>
      )}

      <div className="activity-log-list">
        {logs.length === 0 ? (
          <div className="no-logs">
            <p>{t.noLogs}</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="activity-log-entry">
              <div 
                className="activity-type-indicator"
                style={{ backgroundColor: getActionTypeColor(log.actionType) }}
              ></div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-actor">{log.actorName}</span>
                  <span className="activity-time">{formatTimestamp(log.timestamp)}</span>
                </div>
                <div className="activity-action">
                  <span 
                    className="action-type-badge"
                    style={{ 
                      backgroundColor: `${getActionTypeColor(log.actionType)}20`,
                      color: getActionTypeColor(log.actionType)
                    }}
                  >
                    {t.actionTypes[log.actionType]}
                  </span>
                </div>
                <div className="activity-details">{log.details}</div>
                <div className="activity-meta">
                  <span className="activity-target">{log.targetType}</span>
                  <span className="activity-ip">{log.ipAddress}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="activity-log-pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            {t.previous}
          </button>
          <span className="pagination-info">
            {t.page} {page} {t.of} {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-button"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogWidget;
