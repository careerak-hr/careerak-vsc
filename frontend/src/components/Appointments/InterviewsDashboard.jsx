import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './InterviewsDashboard.css';

/**
 * لوحة تحكم شاملة للمقابلات - للشركات
 * يعرض جميع المقابلات القادمة والسابقة مع فلترة وبحث وإحصائيات
 *
 * Requirements: User Story 6 - لوحة تحكم شاملة للمقابلات
 */

const translations = {
  ar: {
    title: 'لوحة تحكم المقابلات',
    subtitle: 'إدارة جميع مقابلاتك في مكان واحد',
    stats: {
      total: 'إجمالي المقابلات',
      upcoming: 'القادمة',
      completed: 'المكتملة',
      cancelled: 'الملغاة',
      attendanceRate: 'معدل الحضور',
    },
    filters: {
      title: 'البحث والفلترة',
      search: 'بحث',
      searchPlaceholder: 'ابحث باسم المرشح أو الوظيفة...',
      status: 'الحالة',
      type: 'نوع المقابلة',
      dateFrom: 'من تاريخ',
      dateTo: 'إلى تاريخ',
      apply: 'تطبيق',
      clear: 'مسح',
      all: 'الكل',
    },
    status: {
      scheduled: 'مجدولة',
      confirmed: 'مؤكدة',
      in_progress: 'جارية',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
      rescheduled: 'معاد جدولتها',
    },
    interviewType: {
      'in-person': 'حضوري',
      virtual: 'افتراضي',
      phone: 'هاتفي',
      video_interview: 'مقابلة فيديو',
      phone_call: 'مكالمة هاتفية',
      in_person: 'حضوري',
      other: 'أخرى',
    },
    card: {
      candidate: 'المرشح',
      job: 'الوظيفة',
      time: 'الوقت',
      duration: 'المدة',
      minutes: 'دقيقة',
      noJob: 'غير محدد',
      joinMeeting: 'انضمام للاجتماع',
      viewDetails: 'عرض التفاصيل',
    },
    export: {
      title: 'تصدير',
      excel: 'تصدير Excel',
      pdf: 'تصدير PDF',
      exporting: 'جاري التصدير...',
    },
    pagination: {
      prev: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من',
    },
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    noData: 'لا توجد مقابلات',
    noDataHint: 'لم يتم جدولة أي مقابلات بعد',
    retry: 'إعادة المحاولة',
  },
  en: {
    title: 'Interviews Dashboard',
    subtitle: 'Manage all your interviews in one place',
    stats: {
      total: 'Total Interviews',
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
      attendanceRate: 'Attendance Rate',
    },
    filters: {
      title: 'Search & Filter',
      search: 'Search',
      searchPlaceholder: 'Search by candidate name or job...',
      status: 'Status',
      type: 'Interview Type',
      dateFrom: 'From Date',
      dateTo: 'To Date',
      apply: 'Apply',
      clear: 'Clear',
      all: 'All',
    },
    status: {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
    },
    interviewType: {
      'in-person': 'In Person',
      virtual: 'Virtual',
      phone: 'Phone',
      video_interview: 'Video Interview',
      phone_call: 'Phone Call',
      in_person: 'In Person',
      other: 'Other',
    },
    card: {
      candidate: 'Candidate',
      job: 'Job',
      time: 'Time',
      duration: 'Duration',
      minutes: 'min',
      noJob: 'Not specified',
      joinMeeting: 'Join Meeting',
      viewDetails: 'View Details',
    },
    export: {
      title: 'Export',
      excel: 'Export Excel',
      pdf: 'Export PDF',
      exporting: 'Exporting...',
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    loading: 'Loading...',
    error: 'Error loading data',
    noData: 'No interviews found',
    noDataHint: 'No interviews have been scheduled yet',
    retry: 'Retry',
  },
  fr: {
    title: 'Tableau de bord des entretiens',
    subtitle: 'Gérez tous vos entretiens en un seul endroit',
    stats: {
      total: 'Total des entretiens',
      upcoming: 'À venir',
      completed: 'Terminés',
      cancelled: 'Annulés',
      attendanceRate: 'Taux de présence',
    },
    filters: {
      title: 'Recherche et filtre',
      search: 'Recherche',
      searchPlaceholder: 'Rechercher par nom du candidat ou poste...',
      status: 'Statut',
      type: 'Type d\'entretien',
      dateFrom: 'Date de début',
      dateTo: 'Date de fin',
      apply: 'Appliquer',
      clear: 'Effacer',
      all: 'Tous',
    },
    status: {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      rescheduled: 'Replanifié',
    },
    interviewType: {
      'in-person': 'En personne',
      virtual: 'Virtuel',
      phone: 'Téléphone',
      video_interview: 'Entretien vidéo',
      phone_call: 'Appel téléphonique',
      in_person: 'En personne',
      other: 'Autre',
    },
    card: {
      candidate: 'Candidat',
      job: 'Poste',
      time: 'Heure',
      duration: 'Durée',
      minutes: 'min',
      noJob: 'Non spécifié',
      joinMeeting: 'Rejoindre la réunion',
      viewDetails: 'Voir les détails',
    },
    export: {
      title: 'Exporter',
      excel: 'Exporter Excel',
      pdf: 'Exporter PDF',
      exporting: 'Exportation...',
    },
    pagination: {
      prev: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur',
    },
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    noData: 'Aucun entretien trouvé',
    noDataHint: 'Aucun entretien n\'a encore été planifié',
    retry: 'Réessayer',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_COLORS = {
  scheduled: '#304B60',
  confirmed: '#2e7d32',
  in_progress: '#e65100',
  completed: '#1565c0',
  cancelled: '#c62828',
  rescheduled: '#6a1b9a',
};

function formatDateTime(date, language) {
  const d = new Date(date);
  const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCandidateName(participants) {
  if (!participants || participants.length === 0) return '—';
  const p = participants[0]?.userId;
  if (!p) return '—';
  return `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || '—';
}

function getCandidateAvatar(participants) {
  if (!participants || participants.length === 0) return null;
  return participants[0]?.userId?.profilePicture || null;
}

// --- Stats Card ---
function StatsCard({ label, value, icon, accent }) {
  return (
    <div className="id-stats-card" style={{ borderTopColor: accent }}>
      <span className="id-stats-icon">{icon}</span>
      <div className="id-stats-body">
        <span className="id-stats-value">{value}</span>
        <span className="id-stats-label">{label}</span>
      </div>
    </div>
  );
}

// --- Interview Card ---
function InterviewCard({ appointment, t, language, fontFamily }) {
  const isRTL = language === 'ar';
  const candidateName = getCandidateName(appointment.participants);
  const avatarUrl = getCandidateAvatar(appointment.participants);
  const statusColor = STATUS_COLORS[appointment.status] || '#304B60';
  const statusLabel = t.status[appointment.status] || appointment.status;
  const typeKey = appointment.interviewType || appointment.type;
  const typeLabel = t.interviewType[typeKey] || typeKey || '—';
  const jobTitle = appointment.jobApplicationId?.jobTitle || t.card.noJob;
  const meetLink = appointment.meetLink || appointment.meetingLink || appointment.googleMeetLink;

  return (
    <div className="id-card" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Status badge */}
      <span
        className="id-card-status"
        style={{ backgroundColor: statusColor }}
      >
        {statusLabel}
      </span>

      {/* Candidate */}
      <div className="id-card-candidate">
        <div className="id-card-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={candidateName} />
          ) : (
            <span className="id-card-avatar-initials">
              {candidateName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="id-card-candidate-info">
          <span className="id-card-candidate-name">{candidateName}</span>
          <span className="id-card-job">{jobTitle}</span>
        </div>
      </div>

      {/* Details */}
      <div className="id-card-details">
        <div className="id-card-detail-row">
          <span className="id-card-detail-icon">🕐</span>
          <span>{formatDateTime(appointment.scheduledAt, language)}</span>
        </div>
        <div className="id-card-detail-row">
          <span className="id-card-detail-icon">⏱</span>
          <span>{appointment.duration} {t.card.minutes}</span>
        </div>
        <div className="id-card-detail-row">
          <span className="id-card-detail-icon">📋</span>
          <span>{typeLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="id-card-actions">
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="id-card-btn id-card-btn--primary"
          >
            {t.card.joinMeeting}
          </a>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
const InterviewsDashboard = ({ onSelectAppointment }) => {
  const { language, token } = useApp();
  const fontFamily = language === 'ar'
    ? 'Amiri, Cairo, serif'
    : language === 'fr'
    ? 'EB Garamond, serif'
    : 'Cormorant Garamond, serif';
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  const fetchAppointments = useCallback(async (page = 1, activeFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        role: 'company',
        page,
        limit: pagination.limit,
        ...activeFilters,
      });
      // Remove empty params
      for (const [k, v] of [...params.entries()]) {
        if (!v) params.delete(k);
      }

      const res = await fetch(`${API_BASE}/api/appointments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setAppointments(data.appointments || []);
        setPagination((prev) => ({
          ...prev,
          page,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1,
        }));
        if (data.stats) setStats(data.stats);
      } else {
        throw new Error(data.message || t.error);
      }
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.limit, t.error]);

  useEffect(() => {
    fetchAppointments(1, appliedFilters);
  }, [fetchAppointments, appliedFilters]);

  const handleApplyFilters = () => {
    const active = {};
    if (filters.search) active.search = filters.search;
    if (filters.status) active.status = filters.status;
    if (filters.type) active.type = filters.type;
    if (filters.startDate) active.startDate = filters.startDate;
    if (filters.endDate) active.endDate = filters.endDate;
    setAppliedFilters(active);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', type: '', startDate: '', endDate: '' });
    setAppliedFilters({});
  };

  const handlePageChange = (newPage) => {
    fetchAppointments(newPage, appliedFilters);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ role: 'company', format, ...appliedFilters });
      const res = await fetch(`${API_BASE}/api/appointments/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interviews.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // silent fail for export
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className={`id-root${isRTL ? ' id-rtl' : ' id-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="id-header">
        <div className="id-header-text">
          <h1 className="id-title">{t.title}</h1>
          <p className="id-subtitle">{t.subtitle}</p>
        </div>
        <div className="id-header-actions">
          <button
            className="id-export-btn"
            onClick={() => handleExport('excel')}
            disabled={exporting}
            title={t.export.excel}
          >
            📊 {exporting ? t.export.exporting : t.export.excel}
          </button>
          <button
            className="id-export-btn id-export-btn--pdf"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            title={t.export.pdf}
          >
            📄 {t.export.pdf}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="id-stats-row">
          <StatsCard label={t.stats.total} value={stats.total} icon="📅" accent="#304B60" />
          <StatsCard label={t.stats.upcoming} value={stats.upcoming} icon="⏳" accent="#D48161" />
          <StatsCard label={t.stats.completed} value={stats.completed} icon="✅" accent="#2e7d32" />
          <StatsCard label={t.stats.cancelled} value={stats.cancelled} icon="❌" accent="#c62828" />
          <StatsCard
            label={t.stats.attendanceRate}
            value={`${stats.attendanceRate}%`}
            icon="📈"
            accent="#1565c0"
          />
        </div>
      )}

      {/* Filters */}
      <div className="id-filters">
        <div className="id-filters-grid">
          <div className="id-filter-group id-filter-group--wide">
            <label className="id-filter-label">{t.filters.search}</label>
            <input
              className="id-filter-input"
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder={t.filters.searchPlaceholder}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>

          <div className="id-filter-group">
            <label className="id-filter-label">{t.filters.status}</label>
            <select
              className="id-filter-select"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">{t.filters.all}</option>
              {Object.entries(t.status).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="id-filter-group">
            <label className="id-filter-label">{t.filters.type}</label>
            <select
              className="id-filter-select"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">{t.filters.all}</option>
              <option value="video_interview">{t.interviewType.video_interview}</option>
              <option value="phone_call">{t.interviewType.phone_call}</option>
              <option value="in_person">{t.interviewType.in_person}</option>
              <option value="other">{t.interviewType.other}</option>
            </select>
          </div>

          <div className="id-filter-group">
            <label className="id-filter-label">{t.filters.dateFrom}</label>
            <input
              className="id-filter-input"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>

          <div className="id-filter-group">
            <label className="id-filter-label">{t.filters.dateTo}</label>
            <input
              className="id-filter-input"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="id-filter-actions">
          <button className="id-btn id-btn--primary" onClick={handleApplyFilters}>
            {t.filters.apply}
          </button>
          <button className="id-btn id-btn--ghost" onClick={handleClearFilters}>
            {t.filters.clear}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="id-content">
        {loading && (
          <div className="id-loading">
            <div className="id-spinner" />
            <span>{t.loading}</span>
          </div>
        )}

        {!loading && error && (
          <div className="id-error">
            <span>{error}</span>
            <button className="id-btn id-btn--ghost" onClick={() => fetchAppointments(1, appliedFilters)}>
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="id-empty">
            <span className="id-empty-icon">📭</span>
            <p className="id-empty-title">{t.noData}</p>
            <p className="id-empty-hint">{t.noDataHint}</p>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="id-grid">
            {appointments.map((appt) => (
              <InterviewCard
                key={appt._id}
                appointment={appt}
                t={t}
                language={language}
                fontFamily={fontFamily}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="id-pagination">
          <button
            className="id-btn id-btn--ghost"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            {isRTL ? '›' : '‹'} {t.pagination.prev}
          </button>
          <span className="id-pagination-info">
            {t.pagination.page} {pagination.page} {t.pagination.of} {pagination.pages}
          </span>
          <button
            className="id-btn id-btn--ghost"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            {t.pagination.next} {isRTL ? '‹' : '›'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewsDashboard;
