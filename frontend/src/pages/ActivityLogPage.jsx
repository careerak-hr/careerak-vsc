import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import pusherClient from '../utils/pusherClient';
import './ActivityLogPage.css';

/**
 * ActivityLogPage Component
 * Full-page view of activity log with advanced filtering and export
 * Requirements: 5.11-5.14
 */
const ActivityLogPage = () => {
  const { language, fontFamily } = useApp();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [actionType, setActionType] = useState('');
  const [userId, setUserId] = useState('');
  const [targetType, setTargetType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Stats
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  
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
      backToDashboard: 'العودة إلى لوحة التحكم',
      search: 'بحث في السجل...',
      filterByType: 'نوع النشاط',
      filterByUser: 'معرف المستخدم',
      filterByTarget: 'نوع الهدف',
      startDate: 'من تاريخ',
      endDate: 'إلى تاريخ',
      sortBy: 'ترتيب حسب',
      sortOrder: 'الترتيب',
      clearFilters: 'مسح الفلاتر',
      exportLog: 'تصدير السجل',
      exporting: 'جاري التصدير...',
      showStats: 'إظهار الإحصائيات',
      hideStats: 'إخفاء الإحصائيات',
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
      perPage: 'لكل صفحة',
      timestamp: 'الوقت',
      actor: 'الفاعل',
      action: 'النشاط',
      target: 'الهدف',
      details: 'التفاصيل',
      ipAddress: 'عنوان IP',
      asc: 'تصاعدي',
      desc: 'تنازلي',
      stats: {
        title: 'إحصائيات السجل',
        totalLogs: 'إجمالي السجلات',
        byActionType: 'حسب نوع النشاط',
        byTargetType: 'حسب نوع الهدف',
        recentActivity: 'النشاطات الأخيرة'
      },
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
      backToDashboard: 'Back to Dashboard',
      search: 'Search in log...',
      filterByType: 'Activity Type',
      filterByUser: 'User ID',
      filterByTarget: 'Target Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      sortBy: 'Sort By',
      sortOrder: 'Order',
      clearFilters: 'Clear Filters',
      exportLog: 'Export Log',
      exporting: 'Exporting...',
      showStats: 'Show Statistics',
      hideStats: 'Hide Statistics',
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
      perPage: 'per page',
      timestamp: 'Time',
      actor: 'Actor',
      action: 'Action',
      target: 'Target',
      details: 'Details',
      ipAddress: 'IP Address',
      asc: 'Ascending',
      desc: 'Descending',
      stats: {
        title: 'Log Statistics',
        totalLogs: 'Total Logs',
        byActionType: 'By Action Type',
        byTargetType: 'By Target Type',
        recentActivity: 'Recent Activity'
      },
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
      backToDashboard: 'Retour au tableau de bord',
      search: 'Rechercher dans le journal...',
      filterByType: 'Type d\'activité',
      filterByUser: 'ID utilisateur',
      filterByTarget: 'Type de cible',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      sortBy: 'Trier par',
      sortOrder: 'Ordre',
      clearFilters: 'Effacer les filtres',
      exportLog: 'Exporter le journal',
      exporting: 'Exportation...',
      showStats: 'Afficher les statistiques',
      hideStats: 'Masquer les statistiques',
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
      perPage: 'par page',
      timestamp: 'Temps',
      actor: 'Acteur',
      action: 'Action',
      target: 'Cible',
      details: 'Détails',
      ipAddress: 'Adresse IP',
      asc: 'Croissant',
      desc: 'Décroissant',
      stats: {
        title: 'Statistiques du journal',
        totalLogs: 'Total des journaux',
        byActionType: 'Par type d\'action',
        byTargetType: 'Par type de cible',
        recentActivity: 'Activité récente'
      },
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
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (actionType) params.append('actionType', actionType);
      if (userId) params.append('actorId', userId);
      if (targetType) params.append('targetType', targetType);
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
  }, [page, limit, actionType, userId, targetType, startDate, endDate, searchTerm, sortBy, sortOrder]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/activity-log/stats?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, [startDate, endDate]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
    if (showStats) {
      fetchStats();
    }
  }, [fetchLogs, fetchStats, showStats]);

  // Real-time updates via Pusher
  useEffect(() => {
    if (!pusherClient.isConnected()) {
      return;
    }

    const handleNewActivity = (data) => {
      // Refresh logs when new activity is added
      fetchLogs();
      if (showStats) {
        fetchStats();
      }
    };

    window.addEventListener('pusher-activity-log', handleNewActivity);

    return () => {
      window.removeEventListener('pusher-activity-log', handleNewActivity);
    };
  }, [fetchLogs, fetchStats, showStats]);

  // Clear all filters
  const handleClearFilters = () => {
    setActionType('');
    setUserId('');
    setTargetType('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  // Export activity log
  const handleExport = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      if (actionType) params.append('actionType', actionType);
      if (userId) params.append('actorId', userId);
      if (targetType) params.append('targetType', targetType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/export/activity-log?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'excel',
          dateRange: {
            start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: endDate || new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export activity log');
      }

      const data = await response.json();
      
      // Download the file
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error exporting activity log:', err);
      alert(t.error + ': ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
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

  return (
    <div className="activity-log-page" style={fontStyle}>
      <div className="activity-log-page-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin-dashboard')} className="back-button">
            ← {t.backToDashboard}
          </button>
          <h1>{t.title}</h1>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="stats-toggle-button"
          >
            {showStats ? t.hideStats : t.showStats}
          </button>
          <button 
            onClick={handleExport} 
            disabled={exporting}
            className="export-button"
          >
            {exporting ? t.exporting : t.exportLog}
          </button>
        </div>
      </div>

      {showStats && stats && (
        <div className="activity-log-stats">
          <h2>{t.stats.title}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">{t.stats.totalLogs}</div>
              <div className="stat-value">{stats.totalLogs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t.stats.byActionType}</div>
              <div className="stat-list">
                {stats.byActionType.slice(0, 5).map(item => (
                  <div key={item.actionType} className="stat-item">
                    <span className="stat-item-label">{t.actionTypes[item.actionType]}</span>
                    <span className="stat-item-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t.stats.byTargetType}</div>
              <div className="stat-list">
                {stats.byTargetType.slice(0, 5).map(item => (
                  <div key={item.targetType} className="stat-item">
                    <span className="stat-item-label">{item.targetType}</span>
                    <span className="stat-item-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="activity-log-controls">
        <div className="search-bar">
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

        <div className="filters-row">
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
            type="text"
            placeholder={t.filterByTarget}
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            style={fontStyle}
          >
            <option value="timestamp">{t.timestamp}</option>
            <option value="actorName">{t.actor}</option>
            <option value="actionType">{t.action}</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
            style={fontStyle}
          >
            <option value="desc">{t.desc}</option>
            <option value="asc">{t.asc}</option>
          </select>

          {(actionType || userId || targetType || startDate || endDate || searchTerm) && (
            <button onClick={handleClearFilters} className="clear-filters-button">
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="pagination-controls">
          <div className="pagination-info">
            {t.total}: {total} {t.entries}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-button"
            >
              {t.previous}
            </button>
            <span className="page-info">
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
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="limit-select"
            style={fontStyle}
          >
            <option value="25">25 {t.perPage}</option>
            <option value="50">50 {t.perPage}</option>
            <option value="100">100 {t.perPage}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="activity-log-loading">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      ) : error ? (
        <div className="activity-log-error">
          <p>{t.error}: {error}</p>
          <button onClick={fetchLogs} className="retry-button">
            {t.retry}
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="no-logs">
          <p>{t.noLogs}</p>
        </div>
      ) : (
        <div className="activity-log-table-container">
          <table className="activity-log-table">
            <thead>
              <tr>
                <th>{t.timestamp}</th>
                <th>{t.actor}</th>
                <th>{t.action}</th>
                <th>{t.target}</th>
                <th>{t.details}</th>
                <th>{t.ipAddress}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="timestamp-cell">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="actor-cell">{log.actorName}</td>
                  <td className="action-cell">
                    <span 
                      className="action-badge"
                      style={{ 
                        backgroundColor: `${getActionTypeColor(log.actionType)}20`,
                        color: getActionTypeColor(log.actionType)
                      }}
                    >
                      {t.actionTypes[log.actionType]}
                    </span>
                  </td>
                  <td className="target-cell">{log.targetType}</td>
                  <td className="details-cell">{log.details}</td>
                  <td className="ip-cell">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;
