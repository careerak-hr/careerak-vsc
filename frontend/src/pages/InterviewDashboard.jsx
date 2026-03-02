import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './InterviewDashboard.css';

/**
 * لوحة إدارة المقابلات
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
const InterviewDashboard = () => {
  const { language, fontFamily } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const translations = {
    ar: {
      title: 'لوحة إدارة المقابلات',
      upcoming: 'المقابلات القادمة',
      past: 'المقابلات السابقة',
      search: 'البحث والفلترة',
      stats: 'الإحصائيات',
      noInterviews: 'لا توجد مقابلات',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      scheduledAt: 'موعد المقابلة',
      status: 'الحالة',
      participants: 'المشاركون',
      duration: 'المدة',
      recording: 'التسجيل',
      notes: 'الملاحظات',
      rating: 'التقييم',
      viewDetails: 'عرض التفاصيل',
      addNotes: 'إضافة ملاحظات',
      rateCandidate: 'تقييم المرشح',
      downloadRecording: 'تحميل التسجيل',
      filterByStatus: 'تصفية حسب الحالة',
      filterByDate: 'تصفية حسب التاريخ',
      searchPlaceholder: 'ابحث في المقابلات...',
      apply: 'تطبيق',
      clear: 'مسح',
      scheduled: 'مجدولة',
      waiting: 'في الانتظار',
      active: 'نشطة',
      ended: 'انتهت',
      cancelled: 'ملغاة',
      available: 'متاح',
      notAvailable: 'غير متاح',
      upcomingCount: 'المقابلات القادمة',
      completedCount: 'المقابلات المكتملة',
      cancelledCount: 'المقابلات الملغاة',
      recordingsCount: 'التسجيلات المتاحة',
      previous: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من'
    },
    en: {
      title: 'Interview Dashboard',
      upcoming: 'Upcoming Interviews',
      past: 'Past Interviews',
      search: 'Search & Filter',
      stats: 'Statistics',
      noInterviews: 'No interviews found',
      loading: 'Loading...',
      error: 'An error occurred',
      scheduledAt: 'Scheduled At',
      status: 'Status',
      participants: 'Participants',
      duration: 'Duration',
      recording: 'Recording',
      notes: 'Notes',
      rating: 'Rating',
      viewDetails: 'View Details',
      addNotes: 'Add Notes',
      rateCandidate: 'Rate Candidate',
      downloadRecording: 'Download Recording',
      filterByStatus: 'Filter by Status',
      filterByDate: 'Filter by Date',
      searchPlaceholder: 'Search interviews...',
      apply: 'Apply',
      clear: 'Clear',
      scheduled: 'Scheduled',
      waiting: 'Waiting',
      active: 'Active',
      ended: 'Ended',
      cancelled: 'Cancelled',
      available: 'Available',
      notAvailable: 'Not Available',
      upcomingCount: 'Upcoming Interviews',
      completedCount: 'Completed Interviews',
      cancelledCount: 'Cancelled Interviews',
      recordingsCount: 'Available Recordings',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    fr: {
      title: 'Tableau de bord des entretiens',
      upcoming: 'Entretiens à venir',
      past: 'Entretiens passés',
      search: 'Recherche et filtre',
      stats: 'Statistiques',
      noInterviews: 'Aucun entretien trouvé',
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      scheduledAt: 'Prévu le',
      status: 'Statut',
      participants: 'Participants',
      duration: 'Durée',
      recording: 'Enregistrement',
      notes: 'Notes',
      rating: 'Évaluation',
      viewDetails: 'Voir les détails',
      addNotes: 'Ajouter des notes',
      rateCandidate: 'Évaluer le candidat',
      downloadRecording: 'Télécharger l\'enregistrement',
      filterByStatus: 'Filtrer par statut',
      filterByDate: 'Filtrer par date',
      searchPlaceholder: 'Rechercher des entretiens...',
      apply: 'Appliquer',
      clear: 'Effacer',
      scheduled: 'Prévu',
      waiting: 'En attente',
      active: 'Actif',
      ended: 'Terminé',
      cancelled: 'Annulé',
      available: 'Disponible',
      notAvailable: 'Non disponible',
      upcomingCount: 'Entretiens à venir',
      completedCount: 'Entretiens terminés',
      cancelledCount: 'Entretiens annulés',
      recordingsCount: 'Enregistrements disponibles',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'de'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [activeTab, pagination.page, filters]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video-interviews/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL}/video-interviews/`;

      if (activeTab === 'upcoming') {
        url += `upcoming?page=${pagination.page}&limit=${pagination.limit}`;
      } else if (activeTab === 'past') {
        url += `past?page=${pagination.page}&limit=${pagination.limit}`;
        if (filters.status) url += `&status=${filters.status}`;
      } else if (activeTab === 'search') {
        url += `search?page=${pagination.page}&limit=${pagination.limit}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;
        if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch interviews');

      const data = await response.json();
      setInterviews(data.interviews);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/interview/${interviewId}`);
  };

  const handleAddNotes = async (interviewId) => {
    const notes = prompt(t.addNotes);
    if (!notes) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/video-interviews/${interviewId}/notes`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      if (!response.ok) throw new Error('Failed to add notes');

      fetchInterviews();
    } catch (err) {
      alert(t.error + ': ' + err.message);
    }
  };

  const handleRateCandidate = async (interviewId) => {
    const rating = prompt(t.rateCandidate + ' (1-5)');
    if (!rating || rating < 1 || rating > 5) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/video-interviews/${interviewId}/rating`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating: parseInt(rating) })
        }
      );

      if (!response.ok) throw new Error('Failed to rate candidate');

      fetchInterviews();
    } catch (err) {
      alert(t.error + ': ' + err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString(language);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'status-scheduled',
      waiting: 'status-waiting',
      active: 'status-active',
      ended: 'status-ended',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {t[status]}
      </span>
    );
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">{t.upcomingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">{t.completedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">{t.cancelledCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-value">{stats.withRecordings}</div>
          <div className="stat-label">{t.recordingsCount}</div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    if (activeTab !== 'search') return null;

    return (
      <div className="filters-section">
        <div className="filter-group">
          <label>{t.filterByStatus}</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="scheduled">{t.scheduled}</option>
            <option value="waiting">{t.waiting}</option>
            <option value="active">{t.active}</option>
            <option value="ended">{t.ended}</option>
            <option value="cancelled">{t.cancelled}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t.filterByDate}</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <button onClick={() => setFilters({ status: '', startDate: '', endDate: '', search: '' })}>
          {t.clear}
        </button>
      </div>
    );
  };

  const renderInterviewCard = (interview) => {
    return (
      <div key={interview._id} className="interview-card">
        <div className="interview-header">
          <div className="interview-info">
            <h3>{interview.hostId?.name}</h3>
            <p>{formatDate(interview.scheduledAt)}</p>
          </div>
          {getStatusBadge(interview.status)}
        </div>

        <div className="interview-body">
          <div className="info-row">
            <span className="label">{t.participants}:</span>
            <span className="value">
              {interview.participants.map(p => p.userId?.name).join(', ')}
            </span>
          </div>

          {interview.duration > 0 && (
            <div className="info-row">
              <span className="label">{t.duration}:</span>
              <span className="value">{formatDuration(interview.duration)}</span>
            </div>
          )}

          <div className="info-row">
            <span className="label">{t.recording}:</span>
            <span className="value">
              {interview.recording?.status === 'ready' ? t.available : t.notAvailable}
            </span>
          </div>

          {interview.rating && (
            <div className="info-row">
              <span className="label">{t.rating}:</span>
              <span className="value">{'⭐'.repeat(interview.rating)}</span>
            </div>
          )}
        </div>

        <div className="interview-actions">
          <button onClick={() => handleViewDetails(interview._id)}>
            {t.viewDetails}
          </button>

          {interview.status === 'ended' && (
            <>
              <button onClick={() => handleAddNotes(interview._id)}>
                {t.addNotes}
              </button>
              <button onClick={() => handleRateCandidate(interview._id)}>
                {t.rateCandidate}
              </button>
            </>
          )}

          {interview.recording?.status === 'ready' && (
            <a
              href={interview.recording.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn"
            >
              {t.downloadRecording}
            </a>
          )}
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={pagination.page === 1}
        >
          {t.previous}
        </button>

        <span>
          {t.page} {pagination.page} {t.of} {pagination.pages}
        </span>

        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={pagination.page === pagination.pages}
        >
          {t.next}
        </button>
      </div>
    );
  };

  return (
    <div className="interview-dashboard" style={{ fontFamily }}>
      <div className="dashboard-header">
        <h1>{t.title}</h1>
        {renderStatsCards()}
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          {t.upcoming}
        </button>
        <button
          className={activeTab === 'past' ? 'active' : ''}
          onClick={() => setActiveTab('past')}
        >
          {t.past}
        </button>
        <button
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          {t.search}
        </button>
      </div>

      {renderFilters()}

      <div className="interviews-list">
        {loading && <div className="loading">{t.loading}</div>}
        {error && <div className="error">{t.error}: {error}</div>}
        {!loading && !error && interviews.length === 0 && (
          <div className="no-interviews">{t.noInterviews}</div>
        )}
        {!loading && !error && interviews.map(renderInterviewCard)}
      </div>

      {renderPagination()}
    </div>
  );
};

export default InterviewDashboard;
