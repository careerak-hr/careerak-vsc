import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './AppointmentStats.css';

/**
 * AppointmentStats
 * مكون إحصائيات المواعيد للشركات
 * يعرض: إجمالي المقابلات، عدد حسب الحالة، معدل الحضور مع مؤشر بصري ملوّن
 * مع فلترة حسب نطاق التاريخ
 *
 * Requirements: User Story 6 - إحصائيات (عدد المقابلات، معدل الحضور، إلخ)
 * KPI: معدل الحضور > 85% - مؤشر أخضر (≥85%) أو أحمر (<85%)
 * Colors: #304B60 (primary), #E3DAD1 (secondary), #D48161 (accent)
 * Fonts: Amiri (ar), Cormorant Garamond (en), EB Garamond (fr)
 */

const ATTENDANCE_TARGET = 85;

const translations = {
  ar: {
    title: 'إحصائيات المقابلات',
    subtitle: 'نظرة شاملة على أداء مقابلاتك',
    cards: {
      total: 'إجمالي المقابلات',
      scheduled: 'مجدولة',
      confirmed: 'مؤكدة',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
      attendanceRate: 'معدل الحضور',
      cancellationRate: 'معدل الإلغاء',
      attended: 'حضر',
      noShow: 'لم يحضر',
    },
    attendance: {
      kpiLabel: 'مؤشر الأداء: معدل الحضور',
      target: 'الهدف',
      current: 'الحالي',
      aboveTarget: 'ممتاز! معدل الحضور يتجاوز الهدف',
      belowTarget: 'تنبيه: معدل الحضور أقل من الهدف',
      noData: 'لا توجد بيانات حضور مسجّلة بعد',
      trackedOf: 'من',
      appointments: 'موعد مُتتبَّع',
    },
    filters: {
      title: 'فلترة حسب التاريخ',
      startDate: 'من تاريخ',
      endDate: 'إلى تاريخ',
      apply: 'تطبيق',
      clear: 'مسح',
    },
    loading: 'جاري التحميل...',
    error: 'فشل تحميل الإحصائيات',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات',
    percent: '%',
    interviews: 'مقابلة',
  },
  en: {
    title: 'Interview Statistics',
    subtitle: 'A comprehensive overview of your interview performance',
    cards: {
      total: 'Total Interviews',
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      attendanceRate: 'Attendance Rate',
      cancellationRate: 'Cancellation Rate',
      attended: 'Attended',
      noShow: 'No Show',
    },
    attendance: {
      kpiLabel: 'KPI: Attendance Rate',
      target: 'Target',
      current: 'Current',
      aboveTarget: 'Excellent! Attendance rate exceeds target',
      belowTarget: 'Alert: Attendance rate is below target',
      noData: 'No attendance data recorded yet',
      trackedOf: 'of',
      appointments: 'tracked appointments',
    },
    filters: {
      title: 'Filter by Date',
      startDate: 'From Date',
      endDate: 'To Date',
      apply: 'Apply',
      clear: 'Clear',
    },
    loading: 'Loading...',
    error: 'Failed to load statistics',
    retry: 'Retry',
    noData: 'No data available',
    percent: '%',
    interviews: 'interviews',
  },
  fr: {
    title: 'Statistiques des entretiens',
    subtitle: 'Vue d\'ensemble de vos entretiens',
    cards: {
      total: 'Total des entretiens',
      scheduled: 'Planifiés',
      confirmed: 'Confirmés',
      completed: 'Terminés',
      cancelled: 'Annulés',
      attendanceRate: 'Taux de présence',
      cancellationRate: 'Taux d\'annulation',
      attended: 'Présents',
      noShow: 'Absents',
    },
    attendance: {
      kpiLabel: 'KPI: Taux de présence',
      target: 'Objectif',
      current: 'Actuel',
      aboveTarget: 'Excellent! Le taux de présence dépasse l\'objectif',
      belowTarget: 'Alerte: Le taux de présence est inférieur à l\'objectif',
      noData: 'Aucune donnée de présence enregistrée',
      trackedOf: 'sur',
      appointments: 'rendez-vous suivis',
    },
    filters: {
      title: 'Filtrer par date',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      apply: 'Appliquer',
      clear: 'Effacer',
    },
    loading: 'Chargement...',
    error: 'Échec du chargement des statistiques',
    retry: 'Réessayer',
    noData: 'Aucune donnée disponible',
    percent: '%',
    interviews: 'entretiens',
  },
};

const AppointmentStats = ({ companyId }) => {
  const { language, token } = useApp();
  const lang = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '' });

  const fontFamily =
    language === 'ar'
      ? 'Amiri, serif'
      : language === 'fr'
      ? 'EB Garamond, serif'
      : 'Cormorant Garamond, serif';

  const fetchStats = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (companyId) params.append('companyId', companyId);

      const apiBase = import.meta.env.VITE_API_URL || '';
      const url = `${apiBase}/api/appointments/stats${params.toString() ? `?${params}` : ''}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, companyId]);

  useEffect(() => {
    fetchStats(appliedFilters);
  }, [fetchStats, appliedFilters]);

  const handleApply = () => {
    setAppliedFilters({ startDate, endDate });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setAppliedFilters({ startDate: '', endDate: '' });
  };

  return (
    <div
      className={`appt-stats ${isRtl ? 'appt-stats--rtl' : 'appt-stats--ltr'}`}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="appt-stats__header">
        <h2 className="appt-stats__title">{lang.title}</h2>
        <p className="appt-stats__subtitle">{lang.subtitle}</p>
      </div>

      {/* Date Filter */}
      <div className="appt-stats__filters">
        <span className="appt-stats__filters-label">{lang.filters.title}</span>
        <div className="appt-stats__filters-row">
          <div className="appt-stats__filter-field">
            <label className="appt-stats__filter-label">{lang.filters.startDate}</label>
            <input
              type="date"
              className="appt-stats__filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="appt-stats__filter-field">
            <label className="appt-stats__filter-label">{lang.filters.endDate}</label>
            <input
              type="date"
              className="appt-stats__filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="appt-stats__filter-actions">
            <button className="appt-stats__btn appt-stats__btn--primary" onClick={handleApply}>
              {lang.filters.apply}
            </button>
            <button className="appt-stats__btn appt-stats__btn--secondary" onClick={handleClear}>
              {lang.filters.clear}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="appt-stats__loading">
          <div className="appt-stats__spinner" />
          <span>{lang.loading}</span>
        </div>
      )}

      {error && !loading && (
        <div className="appt-stats__error">
          <span>{lang.error}</span>
          <button
            className="appt-stats__btn appt-stats__btn--primary"
            onClick={() => fetchStats(appliedFilters)}
          >
            {lang.retry}
          </button>
        </div>
      )}

      {stats && !loading && !error && (
        <>
          {/* مؤشر معدل الحضور KPI - البطاقة الرئيسية */}
          <AttendanceKpiCard stats={stats} lang={lang} />

          {/* شبكة الإحصائيات */}
          <div className="appt-stats__grid">
            {/* Total */}
            <StatCard
              label={lang.cards.total}
              value={stats.total}
              suffix={lang.interviews}
              color="#304B60"
              icon="📋"
            />

            {/* Completed */}
            <StatCard
              label={lang.cards.completed}
              value={stats.byStatus?.completed ?? 0}
              suffix={lang.interviews}
              color="#2e7d32"
              icon="✅"
            />

            {/* Cancelled */}
            <StatCard
              label={lang.cards.cancelled}
              value={stats.byStatus?.cancelled ?? 0}
              suffix={lang.interviews}
              color="#c62828"
              icon="🚫"
            />

            {/* Scheduled */}
            <StatCard
              label={lang.cards.scheduled}
              value={stats.byStatus?.scheduled ?? 0}
              suffix={lang.interviews}
              color="#D48161"
              icon="📅"
            />

            {/* Confirmed */}
            <StatCard
              label={lang.cards.confirmed}
              value={stats.byStatus?.confirmed ?? 0}
              suffix={lang.interviews}
              color="#1565c0"
              icon="🔵"
            />

            {/* Attended */}
            {stats.attendance && (
              <StatCard
                label={lang.cards.attended}
                value={stats.attendance.attended ?? 0}
                suffix={lang.interviews}
                color="#1b5e20"
                icon="🙋"
              />
            )}

            {/* No Show */}
            {stats.attendance && (
              <StatCard
                label={lang.cards.noShow}
                value={stats.attendance.noShow ?? 0}
                suffix={lang.interviews}
                color="#b71c1c"
                icon="❌"
              />
            )}

            {/* Cancellation Rate */}
            <RateCard
              label={lang.cards.cancellationRate}
              value={stats.cancellationRate}
              color="#c62828"
              icon="📉"
              lang={lang}
            />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * مؤشر KPI لمعدل الحضور - البطاقة الرئيسية
 * لون أخضر (≥85%) أو أحمر (<85%)
 */
const AttendanceKpiCard = ({ stats, lang }) => {
  const rate = stats.attendanceRate ?? 0;
  const isAboveTarget = rate >= ATTENDANCE_TARGET;
  const hasData = stats.attendance && stats.attendance.totalTracked > 0;

  const color = isAboveTarget ? '#1b5e20' : '#b71c1c';
  const bgColor = isAboveTarget ? '#f1f8e9' : '#ffebee';
  const borderColor = isAboveTarget ? '#4caf50' : '#f44336';
  const icon = isAboveTarget ? '✅' : '⚠️';

  return (
    <div
      className="appt-stats__kpi-card"
      style={{ borderColor, backgroundColor: bgColor }}
      role="region"
      aria-label={lang.attendance.kpiLabel}
    >
      {/* العنوان */}
      <div className="appt-stats__kpi-header">
        <span className="appt-stats__kpi-icon">{icon}</span>
        <span className="appt-stats__kpi-label" style={{ color: '#304B60' }}>
          {lang.attendance.kpiLabel}
        </span>
      </div>

      {/* المعدل الحالي */}
      <div className="appt-stats__kpi-body">
        <div className="appt-stats__kpi-rate" style={{ color }}>
          {rate}
          <span className="appt-stats__kpi-percent">%</span>
        </div>

        {/* شريط التقدم مقارنةً بالهدف */}
        <div className="appt-stats__kpi-progress-wrap">
          {/* الهدف */}
          <div
            className="appt-stats__kpi-target-line"
            style={{ left: `${ATTENDANCE_TARGET}%` }}
            title={`${lang.attendance.target}: ${ATTENDANCE_TARGET}%`}
          />
          {/* شريط الحالي */}
          <div className="appt-stats__kpi-bar-bg">
            <div
              className="appt-stats__kpi-bar-fill"
              style={{
                width: `${Math.min(rate, 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          {/* تسميات */}
          <div className="appt-stats__kpi-bar-labels">
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>0%</span>
            <span
              className="appt-stats__kpi-target-label"
              style={{ left: `${ATTENDANCE_TARGET}%`, color: '#304B60' }}
            >
              {lang.attendance.target}: {ATTENDANCE_TARGET}%
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>100%</span>
          </div>
        </div>

        {/* رسالة الحالة */}
        <p className="appt-stats__kpi-message" style={{ color }}>
          {hasData
            ? isAboveTarget
              ? lang.attendance.aboveTarget
              : lang.attendance.belowTarget
            : lang.attendance.noData}
        </p>

        {/* بيانات التتبع */}
        {hasData && (
          <p className="appt-stats__kpi-tracked" style={{ color: '#6b7280' }}>
            {stats.attendance.attended} {lang.attendance.trackedOf}{' '}
            {stats.attendance.totalTracked} {lang.attendance.appointments}
          </p>
        )}
      </div>
    </div>
  );
};

/** بطاقة إحصائية بسيطة (عدد) */
const StatCard = ({ label, value, suffix, color, icon }) => (
  <div className="appt-stats__card" style={{ borderTopColor: color }}>
    <div className="appt-stats__card-icon">{icon}</div>
    <div className="appt-stats__card-value" style={{ color }}>
      {value ?? 0}
    </div>
    <div className="appt-stats__card-suffix">{suffix}</div>
    <div className="appt-stats__card-label">{label}</div>
  </div>
);

/** بطاقة معدل (نسبة مئوية مع progress bar) */
const RateCard = ({ label, value, color, icon, lang }) => (
  <div className="appt-stats__card appt-stats__card--rate" style={{ borderTopColor: color }}>
    <div className="appt-stats__card-icon">{icon}</div>
    <div className="appt-stats__card-value" style={{ color }}>
      {value ?? 0}
      <span className="appt-stats__card-percent">{lang.percent}</span>
    </div>
    <div className="appt-stats__card-label">{label}</div>
    <div className="appt-stats__progress-bar">
      <div
        className="appt-stats__progress-fill"
        style={{ width: `${Math.min(value ?? 0, 100)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

export default AppointmentStats;
