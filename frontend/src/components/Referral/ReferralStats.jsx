import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './ReferralStats.css';

/**
 * ReferralStats - لوحة إحصائيات الإحالات التفاعلية
 * Requirements: 7.1 (Personal stats dashboard), 7.2 (Channel breakdown), 7.3 (Conversion & success rate)
 * Uses pure CSS/SVG charts - no heavy chart libraries
 */

const translations = {
  ar: {
    title: 'إحصائياتي',
    subtitle: 'تتبع أداء إحالاتك ونقاطك',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل الإحصائيات',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات بعد',
    noDataDesc: 'شارك رابط إحالتك لرؤية الإحصائيات هنا',
    // Summary cards
    totalReferrals: 'إجمالي الإحالات',
    completedReferrals: 'الإحالات المكتملة',
    pointsEarned: 'النقاط المكتسبة',
    conversionRate: 'معدل التحويل',
    // Channel breakdown
    channelBreakdown: 'أكثر قنوات المشاركة فعالية',
    channelHint: 'عدد الإحالات لكل قناة',
    channels: {
      whatsapp: 'واتساب',
      email: 'بريد إلكتروني',
      direct: 'مباشر',
      other: 'أخرى',
    },
    // Monthly trend
    monthlyTrend: 'اتجاه الإحالات الشهري',
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    referrals: 'إحالة',
    // Success rate
    successRate: 'معدل النجاح',
    successRateDesc: 'نسبة الإحالات المكتملة من الإجمالي',
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'مقبول',
    low: 'منخفض',
    pending: 'معلقة',
    completed: 'مكتملة',
    points: 'نقطة',
  },
  en: {
    title: 'My Statistics',
    subtitle: 'Track your referral performance and points',
    loading: 'Loading...',
    error: 'Error loading statistics',
    retry: 'Retry',
    noData: 'No data yet',
    noDataDesc: 'Share your referral link to see statistics here',
    totalReferrals: 'Total Referrals',
    completedReferrals: 'Completed Referrals',
    pointsEarned: 'Points Earned',
    conversionRate: 'Conversion Rate',
    channelBreakdown: 'Most Effective Sharing Channels',
    channelHint: 'Referrals per channel',
    channels: {
      whatsapp: 'WhatsApp',
      email: 'Email',
      direct: 'Direct',
      other: 'Other',
    },
    monthlyTrend: 'Monthly Referral Trend',
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    referrals: 'referrals',
    successRate: 'Success Rate',
    successRateDesc: 'Percentage of completed referrals',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    low: 'Low',
    pending: 'Pending',
    completed: 'Completed',
    points: 'pts',
  },
  fr: {
    title: 'Mes Statistiques',
    subtitle: 'Suivez vos performances de parrainage et vos points',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement des statistiques',
    retry: 'Réessayer',
    noData: 'Pas encore de données',
    noDataDesc: 'Partagez votre lien de parrainage pour voir les statistiques ici',
    totalReferrals: 'Total Parrainages',
    completedReferrals: 'Parrainages Complétés',
    pointsEarned: 'Points Gagnés',
    conversionRate: 'Taux de Conversion',
    channelBreakdown: 'Canaux de Partage les Plus Efficaces',
    channelHint: 'Parrainages par canal',
    channels: {
      whatsapp: 'WhatsApp',
      email: 'Email',
      direct: 'Direct',
      other: 'Autre',
    },
    monthlyTrend: 'Tendance Mensuelle des Parrainages',
    months: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    referrals: 'parrainages',
    successRate: 'Taux de Réussite',
    successRateDesc: 'Pourcentage de parrainages complétés',
    excellent: 'Excellent',
    good: 'Bien',
    fair: 'Acceptable',
    low: 'Faible',
    pending: 'En attente',
    completed: 'Complétés',
    points: 'pts',
  },
};

// Channel icon emojis
const CHANNEL_ICONS = {
  whatsapp: '💬',
  email: '📧',
  direct: '🔗',
  other: '📤',
};

// Channel colors using project palette
const CHANNEL_COLORS = ['#304B60', '#D48161', '#6B8FA8', '#C47050', '#8BAAB8'];

/**
 * CSS-only circular progress ring (SVG)
 */
function CircularProgress({ percent, size = 120, strokeWidth = 10, color = '#D48161', label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rs-circular-wrap" aria-label={`${label}: ${percent}%`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="rs-circular-svg"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E3DAD1"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="rs-circular-arc"
        />
      </svg>
      <div className="rs-circular-label">
        <span className="rs-circular-percent">{percent}%</span>
      </div>
    </div>
  );
}

/**
 * CSS bar chart for channel breakdown
 */
function ChannelBar({ channel, count, maxCount, color, label }) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="rs-channel-row" role="listitem">
      <div className="rs-channel-meta">
        <span className="rs-channel-icon" aria-hidden="true">
          {CHANNEL_ICONS[channel] || '📤'}
        </span>
        <span className="rs-channel-name">{label}</span>
        <span className="rs-channel-count">{count}</span>
      </div>
      <div
        className="rs-channel-track"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={maxCount}
        aria-label={`${label}: ${count}`}
      >
        <div
          className="rs-channel-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/**
 * SVG polyline monthly trend chart
 */
function MonthlyTrendChart({ data, months, label, isRtl }) {
  if (!data || data.length === 0) return null;

  const W = 560;
  const H = 160;
  const PAD = { top: 16, right: 20, bottom: 36, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const step = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = PAD.left + i * step;
    const y = PAD.top + chartH - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Fill area under the line
  const areaPoints = [
    `${PAD.left},${PAD.top + chartH}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${PAD.left + chartW},${PAD.top + chartH}`,
  ].join(' ');

  // Y-axis ticks (0, mid, max)
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="rs-trend-chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="rs-trend-svg"
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = PAD.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + chartW}
                y2={y}
                stroke="#E3DAD1"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9CA3AF"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill="rgba(212, 129, 97, 0.1)" />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#D48161"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#D48161" />
            <circle cx={p.x} cy={p.y} r="7" fill="rgba(212,129,97,0.15)" />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          const monthIdx = (p.month - 1 + 12) % 12;
          const monthLabel = months[monthIdx] || '';
          // Show every label on desktop, every other on mobile
          return (
            <text
              key={i}
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#6B7280"
              className={i % 2 !== 0 ? 'rs-trend-label-alt' : ''}
            >
              {monthLabel}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Skeleton loader for a stat card
 */
function StatCardSkeleton() {
  return (
    <div className="rs-stat-card rs-skeleton-card" aria-hidden="true">
      <div className="rs-skeleton rs-skeleton-value" />
      <div className="rs-skeleton rs-skeleton-label" />
    </div>
  );
}

/**
 * Main ReferralStats component
 * Req 7.1: Personal statistics dashboard
 * Req 7.2: Most effective sharing channels
 * Req 7.3: Conversion rate and success rate
 */
const ReferralStats = ({ compact = false }) => {
  const { language, token } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const getToken = () => token || localStorage.getItem('token');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/referrals/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatNum = (n) =>
    (n || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  // Determine success rate label
  const getSuccessLabel = (rate) => {
    if (rate >= 75) return t.excellent;
    if (rate >= 50) return t.good;
    if (rate >= 25) return t.fair;
    return t.low;
  };

  const getSuccessColor = (rate) => {
    if (rate >= 75) return '#22c55e';
    if (rate >= 50) return '#D48161';
    if (rate >= 25) return '#f59e0b';
    return '#ef4444';
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div
        className={`rs-container ${compact ? 'rs-compact' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily }}
        aria-busy="true"
        aria-label={t.loading}
      >
        {!compact && (
          <div className="rs-header">
            <div className="rs-skeleton rs-skeleton-title" />
            <div className="rs-skeleton rs-skeleton-subtitle" />
          </div>
        )}
        <div className="rs-summary-grid">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="rs-skeleton rs-skeleton-chart" />
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div
        className={`rs-container ${compact ? 'rs-compact' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily }}
      >
        <div className="rs-error-state" role="alert">
          <span className="rs-error-icon" aria-hidden="true">⚠️</span>
          <p className="rs-error-msg">{t.error}</p>
          <button className="rs-retry-btn" onClick={fetchStats}>{t.retry}</button>
        </div>
      </div>
    );
  }

  const hasData = stats && (stats.totalReferrals > 0 || stats.totalPointsEarned > 0);

  // ---- Empty state ----
  if (!hasData) {
    return (
      <div
        className={`rs-container ${compact ? 'rs-compact' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily }}
      >
        {!compact && (
          <div className="rs-header">
            <h2 className="rs-title">{t.title}</h2>
            <p className="rs-subtitle">{t.subtitle}</p>
          </div>
        )}
        <div className="rs-empty-state">
          <svg className="rs-empty-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <rect x="10" y="40" width="14" height="30" rx="3" fill="#D4816180" />
            <rect x="33" y="25" width="14" height="45" rx="3" fill="#D4816180" />
            <rect x="56" y="12" width="14" height="58" rx="3" fill="#D4816180" />
          </svg>
          <p className="rs-empty-title">{t.noData}</p>
          <p className="rs-empty-desc">{t.noDataDesc}</p>
        </div>
      </div>
    );
  }

  const successRate = stats.successRate ?? 0;
  const conversionRate = stats.conversionRate ?? 0;
  const channelBreakdown = stats.channelBreakdown || [];
  const monthlyTrend = stats.monthlyTrend || [];
  const maxChannelCount = Math.max(...channelBreakdown.map(c => c.count), 1);

  return (
    <div
      className={`rs-container ${compact ? 'rs-compact' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      {!compact && (
        <div className="rs-header">
          <h2 className="rs-title">{t.title}</h2>
          <p className="rs-subtitle">{t.subtitle}</p>
        </div>
      )}

      {/* ── Section 1: Summary Cards (Req 7.1) ── */}
      <div className="rs-summary-grid" role="list" aria-label={t.title}>
        <div className="rs-stat-card rs-stat-primary" role="listitem">
          <span className="rs-stat-value">{formatNum(stats.totalReferrals)}</span>
          <span className="rs-stat-label">{t.totalReferrals}</span>
          <div className="rs-stat-badges">
            <span className="rs-badge rs-badge-completed">
              {formatNum(stats.completedReferrals)} {t.completed}
            </span>
            <span className="rs-badge rs-badge-pending">
              {formatNum(stats.pendingReferrals)} {t.pending}
            </span>
          </div>
        </div>

        <div className="rs-stat-card" role="listitem">
          <span className="rs-stat-value">{formatNum(stats.completedReferrals)}</span>
          <span className="rs-stat-label">{t.completedReferrals}</span>
        </div>

        <div className="rs-stat-card" role="listitem">
          <span className="rs-stat-value">{formatNum(stats.totalPointsEarned)}</span>
          <span className="rs-stat-label">{t.pointsEarned}</span>
          <span className="rs-stat-unit">{t.points}</span>
        </div>

        <div className="rs-stat-card rs-stat-accent" role="listitem">
          <span className="rs-stat-value">{conversionRate}%</span>
          <span className="rs-stat-label">{t.conversionRate}</span>
          {/* Mini progress bar */}
          <div className="rs-mini-bar-track" aria-hidden="true">
            <div
              className="rs-mini-bar-fill"
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Channel Breakdown (Req 7.2) ── */}
      {channelBreakdown.length > 0 && (
        <div className="rs-section">
          <div className="rs-section-header">
            <h3 className="rs-section-title">{t.channelBreakdown}</h3>
            <span className="rs-section-hint">{t.channelHint}</span>
          </div>
          <div className="rs-channel-list" role="list" aria-label={t.channelBreakdown}>
            {channelBreakdown.map((item, idx) => (
              <ChannelBar
                key={item.channel}
                channel={item.channel}
                count={item.count}
                maxCount={maxChannelCount}
                color={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]}
                label={t.channels[item.channel] || item.channel}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Monthly Trend (Req 7.1, 7.3) ── */}
      {monthlyTrend.length > 0 && (
        <div className="rs-section">
          <div className="rs-section-header">
            <h3 className="rs-section-title">{t.monthlyTrend}</h3>
          </div>
          <MonthlyTrendChart
            data={monthlyTrend}
            months={t.months}
            label={t.monthlyTrend}
            isRtl={isRtl}
          />
        </div>
      )}

      {/* ── Section 4: Success Rate Circular (Req 7.3) ── */}
      <div className="rs-section rs-success-section">
        <div className="rs-section-header">
          <h3 className="rs-section-title">{t.successRate}</h3>
        </div>
        <div className="rs-success-body">
          <CircularProgress
            percent={successRate}
            size={140}
            strokeWidth={12}
            color={getSuccessColor(successRate)}
            label={t.successRate}
          />
          <div className="rs-success-info">
            <p className="rs-success-desc">{t.successRateDesc}</p>
            <span
              className="rs-success-badge"
              style={{ backgroundColor: getSuccessColor(successRate) }}
            >
              {getSuccessLabel(successRate)}
            </span>
            <div className="rs-success-stats">
              <div className="rs-success-stat">
                <span className="rs-success-stat-val">{formatNum(stats.completedReferrals)}</span>
                <span className="rs-success-stat-lbl">{t.completed}</span>
              </div>
              <div className="rs-success-divider" aria-hidden="true" />
              <div className="rs-success-stat">
                <span className="rs-success-stat-val">{formatNum(stats.totalReferrals)}</span>
                <span className="rs-success-stat-lbl">{t.totalReferrals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStats;
