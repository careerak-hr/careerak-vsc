import React, { useState, useEffect } from 'react';
import {
  FaShareAlt, FaBriefcase, FaGraduationCap, FaUser, FaBuilding,
  FaWhatsapp, FaLinkedin, FaTwitter, FaFacebook, FaTelegram,
  FaEnvelope, FaLink, FaCommentDots, FaMobile, FaCalendarAlt,
} from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import './ShareAnalytics.css';

const translations = {
  ar: {
    title: 'إحصائيات المشاركة',
    totalShares: 'إجمالي المشاركات',
    byContentType: 'حسب نوع المحتوى',
    byPlatform: 'حسب المنصة',
    topContent: 'الأكثر مشاركة',
    period: 'الفترة',
    days: 'يوم',
    job: 'وظيفة',
    course: 'دورة',
    profile: 'ملف شخصي',
    company: 'شركة',
    copy_link: 'نسخ الرابط',
    internal_chat: 'محادثة داخلية',
    native: 'مشاركة أصلية',
    loading: 'جارٍ التحميل...',
    error: 'فشل تحميل البيانات',
    noData: 'لا توجد بيانات',
    shares: 'مشاركة',
    rank: '#',
    content: 'المحتوى',
    count: 'العدد',
    customRange: 'نطاق مخصص',
    startDate: 'من',
    endDate: 'إلى',
    apply: 'تطبيق',
    last7: 'آخر 7 أيام',
    last30: 'آخر 30 يوم',
    last90: 'آخر 90 يوم',
  },
  en: {
    title: 'Share Analytics',
    totalShares: 'Total Shares',
    byContentType: 'By Content Type',
    byPlatform: 'By Platform',
    topContent: 'Most Shared',
    period: 'Period',
    days: 'days',
    job: 'Job',
    course: 'Course',
    profile: 'Profile',
    company: 'Company',
    copy_link: 'Copy Link',
    internal_chat: 'Internal Chat',
    native: 'Native Share',
    loading: 'Loading...',
    error: 'Failed to load data',
    noData: 'No data available',
    shares: 'shares',
    rank: '#',
    content: 'Content',
    count: 'Count',
    customRange: 'Custom Range',
    startDate: 'From',
    endDate: 'To',
    apply: 'Apply',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    last90: 'Last 90 days',
  },
  fr: {
    title: 'Analytiques de partage',
    totalShares: 'Total des partages',
    byContentType: 'Par type de contenu',
    byPlatform: 'Par plateforme',
    topContent: 'Les plus partagés',
    period: 'Période',
    days: 'jours',
    job: 'Emploi',
    course: 'Cours',
    profile: 'Profil',
    company: 'Entreprise',
    copy_link: 'Copier le lien',
    internal_chat: 'Chat interne',
    native: 'Partage natif',
    loading: 'Chargement...',
    error: 'Échec du chargement',
    noData: 'Aucune donnée',
    shares: 'partages',
    rank: '#',
    content: 'Contenu',
    count: 'Nombre',
    customRange: 'Plage personnalisée',
    startDate: 'Du',
    endDate: 'Au',
    apply: 'Appliquer',
    last7: '7 derniers jours',
    last30: '30 derniers jours',
    last90: '90 derniers jours',
  },
};

const PLATFORM_ICONS = {
  whatsapp: FaWhatsapp,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  facebook: FaFacebook,
  telegram: FaTelegram,
  email: FaEnvelope,
  copy_link: FaLink,
  internal_chat: FaCommentDots,
  native: FaMobile,
};

const CONTENT_ICONS = {
  job: FaBriefcase,
  course: FaGraduationCap,
  profile: FaUser,
  company: FaBuilding,
};

const PLATFORM_COLORS = {
  whatsapp: '#25D366',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  telegram: '#2AABEE',
  email: '#D48161',
  copy_link: '#304B60',
  internal_chat: '#304B60',
  native: '#304B60',
};

const PRESET_OPTIONS = [
  { days: 7, labelKey: 'last7' },
  { days: 30, labelKey: 'last30' },
  { days: 90, labelKey: 'last90' },
];

/** Format a Date to YYYY-MM-DD for <input type="date"> */
const toInputDate = (date) => date.toISOString().slice(0, 10);

const ShareAnalytics = ({ token }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  // Preset period in days (null when custom range is active)
  const [period, setPeriod] = useState(30);

  // Custom date range state
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toInputDate(d);
  });
  const [customEnd, setCustomEnd] = useState(() => toInputDate(new Date()));
  // Applied custom range (null = not active)
  const [appliedRange, setAppliedRange] = useState(null);

  const [summary, setSummary] = useState(null);
  const [byPlatform, setByPlatform] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  /** Build query string for the current filter selection */
  const buildQuery = () => {
    if (appliedRange) {
      return `startDate=${encodeURIComponent(appliedRange.start)}&endDate=${encodeURIComponent(appliedRange.end)}`;
    }
    return `days=${period}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const q = buildQuery();
        const [summaryRes, platformRes, topRes] = await Promise.all([
          fetch(`${apiUrl}/api/shares/analytics/summary?${q}`, { headers }),
          fetch(`${apiUrl}/api/shares/analytics/by-platform?${q}`, { headers }),
          fetch(`${apiUrl}/api/shares/analytics/top-content?${q}&limit=10`, { headers }),
        ]);

        const [s, p, top] = await Promise.all([
          summaryRes.json(),
          platformRes.json(),
          topRes.json(),
        ]);

        if (s.success) setSummary(s.data);
        if (p.success) setByPlatform(p.data.byPlatform || []);
        if (top.success) setTopContent(top.data.topContent || []);
      } catch {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period, appliedRange]);

  const handlePreset = (days) => {
    setPeriod(days);
    setAppliedRange(null);
    setShowCustom(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    setAppliedRange({ start: customStart, end: customEnd });
    setPeriod(null);
    setShowCustom(false);
  };

  const maxPlatformCount = byPlatform.length > 0 ? byPlatform[0].count : 1;

  return (
    <div className="share-analytics" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="share-analytics-header">
        <h2 className="share-analytics-title">
          <FaShareAlt />
          {t.title}
        </h2>

        {/* Date Range Filter */}
        <div className="share-analytics-period">
          <span>{t.period}:</span>

          {/* Preset buttons */}
          {PRESET_OPTIONS.map(({ days, labelKey }) => (
            <button
              key={days}
              className={`period-btn ${period === days && !appliedRange ? 'period-btn-active' : ''}`}
              onClick={() => handlePreset(days)}
            >
              {t[labelKey]}
            </button>
          ))}

          {/* Custom range toggle */}
          <button
            className={`period-btn period-btn-custom ${showCustom || appliedRange ? 'period-btn-active' : ''}`}
            onClick={() => setShowCustom((v) => !v)}
          >
            <FaCalendarAlt style={{ marginInlineEnd: 4 }} />
            {appliedRange
              ? `${appliedRange.start} → ${appliedRange.end}`
              : t.customRange}
          </button>
        </div>
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <div className="share-analytics-custom-range">
          <label className="custom-range-label">
            {t.startDate}
            <input
              type="date"
              className="custom-range-input"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </label>
          <label className="custom-range-label">
            {t.endDate}
            <input
              type="date"
              className="custom-range-input"
              value={customEnd}
              min={customStart}
              max={toInputDate(new Date())}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </label>
          <button
            className="custom-range-apply"
            onClick={handleApplyCustom}
            disabled={!customStart || !customEnd}
          >
            {t.apply}
          </button>
        </div>
      )}

      {loading ? (
        <p className="share-analytics-loading">{t.loading}</p>
      ) : error ? (
        <p className="share-analytics-error">{error}</p>
      ) : (
        <div className="share-analytics-grid">
          {/* Total Shares Card */}
          <div className="analytics-card analytics-card-total">
            <div className="analytics-card-value">{summary?.total ?? 0}</div>
            <div className="analytics-card-label">{t.totalShares}</div>
          </div>

          {/* By Content Type */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">{t.byContentType}</h3>
            {summary?.byContentType?.length > 0 ? (
              <div className="content-type-list">
                {summary.byContentType.map((item) => {
                  const Icon = CONTENT_ICONS[item._id] || FaShareAlt;
                  return (
                    <div key={item._id} className="content-type-item">
                      <div className="content-type-icon">
                        <Icon />
                      </div>
                      <div className="content-type-info">
                        <span className="content-type-name">
                          {t[item._id] || item._id}
                        </span>
                        <span className="content-type-count">
                          {item.count} {t.shares}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="analytics-no-data">{t.noData}</p>
            )}
          </div>

          {/* By Platform */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">{t.byPlatform}</h3>
            {byPlatform.length > 0 ? (
              <div className="platform-list">
                {byPlatform.map((item) => {
                  const Icon = PLATFORM_ICONS[item._id] || FaShareAlt;
                  const color = PLATFORM_COLORS[item._id] || '#304B60';
                  const pct = Math.round((item.count / maxPlatformCount) * 100);
                  return (
                    <div key={item._id} className="platform-item">
                      <div className="platform-item-header">
                        <div className="platform-icon" style={{ color }}>
                          <Icon />
                        </div>
                        <span className="platform-name">
                          {t[item._id] || item._id}
                        </span>
                        <span className="platform-count">{item.count}</span>
                      </div>
                      <div className="platform-bar-bg">
                        <div
                          className="platform-bar-fill"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="analytics-no-data">{t.noData}</p>
            )}
          </div>

          {/* Top Content */}
          <div className="analytics-card analytics-card-wide">
            <h3 className="analytics-card-title">{t.topContent}</h3>
            {topContent.length > 0 ? (
              <table className="top-content-table">
                <thead>
                  <tr>
                    <th>{t.rank}</th>
                    <th>{t.content}</th>
                    <th>{t.count}</th>
                  </tr>
                </thead>
                <tbody>
                  {topContent.map((item, idx) => {
                    const Icon = CONTENT_ICONS[item.contentType] || FaShareAlt;
                    return (
                      <tr key={`${item.contentType}-${item.contentId}`}>
                        <td className="top-content-rank">{idx + 1}</td>
                        <td className="top-content-info">
                          <Icon className="top-content-icon" />
                          <span>{t[item.contentType] || item.contentType}</span>
                          <span className="top-content-id">
                            {String(item.contentId).slice(-6)}
                          </span>
                        </td>
                        <td className="top-content-count">{item.shareCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="analytics-no-data">{t.noData}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareAnalytics;
