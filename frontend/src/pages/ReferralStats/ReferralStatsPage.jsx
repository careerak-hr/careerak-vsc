import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ChartWidget from '../../components/admin/ChartWidget';
import ReferralStats from '../../components/Referral/ReferralStats';
import './ReferralStatsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const MONTH_NAMES = {
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  fr: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
};

const SOURCE_LABELS = {
  ar: {
    referral_signup: 'تسجيل جديد',
    referral_first_course: 'أول دورة',
    referral_job: 'وظيفة',
    referral_five_courses: '5 دورات',
    referral_paid_subscription: 'اشتراك مدفوع',
    welcome_bonus: 'مكافأة ترحيب',
  },
  en: {
    referral_signup: 'New Signup',
    referral_first_course: 'First Course',
    referral_job: 'Job Hired',
    referral_five_courses: '5 Courses',
    referral_paid_subscription: 'Paid Subscription',
    welcome_bonus: 'Welcome Bonus',
  },
  fr: {
    referral_signup: 'Inscription',
    referral_first_course: 'Premier Cours',
    referral_job: 'Emploi',
    referral_five_courses: '5 Cours',
    referral_paid_subscription: 'Abonnement Payant',
    welcome_bonus: 'Bonus Bienvenue',
  },
};

const CHANNEL_LABELS = {
  ar: { whatsapp: 'واتساب', email: 'بريد إلكتروني', direct: 'مباشر', other: 'أخرى' },
  en: { whatsapp: 'WhatsApp', email: 'Email', direct: 'Direct', other: 'Other' },
  fr: { whatsapp: 'WhatsApp', email: 'Email', direct: 'Direct', other: 'Autre' },
};

const translations = {
  ar: {
    title: 'إحصائيات الإحالات',
    subtitle: 'تتبع أداء إحالاتك ونقاطك',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل الإحصائيات',
    retry: 'إعادة المحاولة',
    totalReferrals: 'إجمالي الإحالات',
    completed: 'مكتملة',
    pending: 'معلقة',
    cancelled: 'ملغاة',
    conversionRate: 'معدل التحويل',
    pointsBalance: 'رصيد النقاط',
    totalEarned: 'إجمالي المكتسب',
    totalRedeemed: 'إجمالي المستبدل',
    redemptionRate: 'معدل الاستبدال',
    monthlyTrend: 'اتجاه الإحالات الشهري',
    totalLabel: 'إجمالي الإحالات',
    completedLabel: 'مكتملة',
    earningsBySource: 'النقاط حسب المصدر',
    channelBreakdown: 'توزيع قنوات المشاركة',
    noData: 'لا توجد بيانات كافية بعد',
    noDataDesc: 'ابدأ بمشاركة رابط إحالتك لرؤية الإحصائيات',
    shareLink: 'مشاركة رابط الإحالة',
    points: 'نقطة',
    referrals: 'إحالة',
    backToReferrals: 'العودة إلى الإحالات',
  },
  en: {
    title: 'Referral Statistics',
    subtitle: 'Track your referral performance and points',
    loading: 'Loading...',
    error: 'Error loading statistics',
    retry: 'Retry',
    totalReferrals: 'Total Referrals',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    conversionRate: 'Conversion Rate',
    pointsBalance: 'Points Balance',
    totalEarned: 'Total Earned',
    totalRedeemed: 'Total Redeemed',
    redemptionRate: 'Redemption Rate',
    monthlyTrend: 'Monthly Referral Trend',
    totalLabel: 'Total Referrals',
    completedLabel: 'Completed',
    earningsBySource: 'Points by Source',
    channelBreakdown: 'Sharing Channel Breakdown',
    noData: 'Not enough data yet',
    noDataDesc: 'Start sharing your referral link to see statistics',
    shareLink: 'Share Referral Link',
    points: 'pts',
    referrals: 'referrals',
    backToReferrals: 'Back to Referrals',
  },
  fr: {
    title: 'Statistiques de Parrainage',
    subtitle: 'Suivez vos performances de parrainage et vos points',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement des statistiques',
    retry: 'Réessayer',
    totalReferrals: 'Total Parrainages',
    completed: 'Complétés',
    pending: 'En attente',
    cancelled: 'Annulés',
    conversionRate: 'Taux de Conversion',
    pointsBalance: 'Solde de Points',
    totalEarned: 'Total Gagné',
    totalRedeemed: 'Total Échangé',
    redemptionRate: 'Taux d\'Échange',
    monthlyTrend: 'Tendance Mensuelle',
    totalLabel: 'Total Parrainages',
    completedLabel: 'Complétés',
    earningsBySource: 'Points par Source',
    channelBreakdown: 'Répartition des Canaux',
    noData: 'Pas encore assez de données',
    noDataDesc: 'Commencez à partager votre lien de parrainage pour voir les statistiques',
    shareLink: 'Partager le Lien',
    points: 'pts',
    referrals: 'parrainages',
    backToReferrals: 'Retour aux Parrainages',
  },
};

// Chart color palette using project colors
const CHART_COLORS = ['#304B60', '#D48161', '#E3DAD1', '#5B7A94', '#C47050', '#8BA5B8'];

const ReferralStatsPage = () => {
  const { user, language, token } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';
  const monthNames = MONTH_NAMES[language] || MONTH_NAMES.ar;
  const srcLabels = SOURCE_LABELS[language] || SOURCE_LABELS.ar;
  const chLabels = CHANNEL_LABELS[language] || CHANNEL_LABELS.ar;

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [personalStats, setPersonalStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [earningsBySource, setEarningsBySource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [personalRes, trendRes, earningsRes] = await Promise.all([
        fetch(`${API_BASE}/api/referrals/analytics/personal`, { headers }),
        fetch(`${API_BASE}/api/referrals/analytics/trend`, { headers }),
        fetch(`${API_BASE}/api/referrals/analytics/earnings`, { headers }),
      ]);

      if (!personalRes.ok) throw new Error('Failed to load stats');

      const [personal, trend, earnings] = await Promise.all([
        personalRes.json(),
        trendRes.json(),
        earningsRes.json(),
      ]);

      setPersonalStats(personal);
      setMonthlyTrend(Array.isArray(trend) ? trend : []);
      setEarningsBySource(Array.isArray(earnings) ? earnings : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchStats();
  }, [user, navigate, fetchStats]);

  // Build monthly trend chart data
  const trendChartData = React.useMemo(() => {
    if (!monthlyTrend.length) return null;
    return {
      labels: monthlyTrend.map(d => monthNames[d.month - 1]),
      datasets: [
        {
          label: t.totalLabel,
          data: monthlyTrend.map(d => d.total),
          borderColor: '#304B60',
          backgroundColor: 'rgba(48, 75, 96, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#304B60',
          pointRadius: 4,
        },
        {
          label: t.completedLabel,
          data: monthlyTrend.map(d => d.completed),
          borderColor: '#D48161',
          backgroundColor: 'rgba(212, 129, 97, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#D48161',
          pointRadius: 4,
        },
      ],
    };
  }, [monthlyTrend, t, monthNames]);

  // Build earnings by source chart data (doughnut)
  const earningsChartData = React.useMemo(() => {
    if (!earningsBySource.length) return null;
    return {
      labels: earningsBySource.map(e => srcLabels[e.source] || e.source),
      datasets: [{
        data: earningsBySource.map(e => e.totalPoints),
        backgroundColor: CHART_COLORS,
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [earningsBySource, srcLabels]);

  // Build channel breakdown chart data (bar)
  const channelChartData = React.useMemo(() => {
    if (!personalStats?.channels?.length) return null;
    return {
      labels: personalStats.channels.map(c => chLabels[c.channel] || c.channel),
      datasets: [{
        label: t.totalReferrals,
        data: personalStats.channels.map(c => c.count),
        backgroundColor: CHART_COLORS.slice(0, personalStats.channels.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [personalStats, chLabels, t]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="referral-stats-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="stats-loading">
          <div className="stats-spinner" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referral-stats-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="stats-error">
          <p>{t.error}</p>
          <button className="stats-retry-btn" onClick={fetchStats}>{t.retry}</button>
        </div>
      </div>
    );
  }

  const hasData = personalStats?.referrals?.total > 0;

  return (
    <div className="referral-stats-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Header */}
      <div className="stats-header">
        <div>
          <h1 className="stats-title">{t.title}</h1>
          <p className="stats-subtitle">{t.subtitle}</p>
        </div>
        <Link to="/my-referrals" className="stats-back-link">{t.backToReferrals}</Link>
      </div>

      {!hasData ? (
        <div className="stats-empty">
          <div className="stats-empty-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="8" y="32" width="12" height="24" rx="2" fill="#D4816180"/>
              <rect x="26" y="20" width="12" height="36" rx="2" fill="#D4816180"/>
              <rect x="44" y="10" width="12" height="46" rx="2" fill="#D4816180"/>
            </svg>
          </div>
          <h2 className="stats-empty-title">{t.noData}</h2>
          <p className="stats-empty-desc">{t.noDataDesc}</p>
          <Link to="/my-referrals" className="stats-share-btn">{t.shareLink}</Link>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-kpi-grid">
            <div className="stats-kpi-card stats-kpi-primary">
              <span className="stats-kpi-value">{personalStats.referrals.total}</span>
              <span className="stats-kpi-label">{t.totalReferrals}</span>
              <div className="stats-kpi-breakdown">
                <span className="kpi-badge kpi-completed">{personalStats.referrals.completed} {t.completed}</span>
                <span className="kpi-badge kpi-pending">{personalStats.referrals.pending} {t.pending}</span>
              </div>
            </div>

            <div className="stats-kpi-card">
              <span className="stats-kpi-value">{personalStats.conversion?.rate ?? 0}%</span>
              <span className="stats-kpi-label">{t.conversionRate}</span>
              <div className="stats-kpi-bar-wrap">
                <div
                  className="stats-kpi-bar"
                  style={{ width: `${personalStats.conversion?.rate ?? 0}%` }}
                  role="progressbar"
                  aria-valuenow={personalStats.conversion?.rate ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            <div className="stats-kpi-card">
              <span className="stats-kpi-value">{personalStats.points?.balance?.toLocaleString() ?? 0}</span>
              <span className="stats-kpi-label">{t.pointsBalance}</span>
              <span className="stats-kpi-sub">
                {t.totalEarned}: {personalStats.points?.totalEarned?.toLocaleString() ?? 0} {t.points}
              </span>
            </div>

            <div className="stats-kpi-card">
              <span className="stats-kpi-value">{personalStats.points?.totalRedeemed?.toLocaleString() ?? 0}</span>
              <span className="stats-kpi-label">{t.totalRedeemed}</span>
              <span className="stats-kpi-sub">
                {t.redemptionRate}: {
                  personalStats.points?.totalEarned > 0
                    ? Math.round((personalStats.points.totalRedeemed / personalStats.points.totalEarned) * 100)
                    : 0
                }%
              </span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="stats-charts-grid">
            {/* Monthly Trend - full width */}
            {trendChartData && (
              <div className="stats-chart-card stats-chart-full">
                <ChartWidget
                  type="line"
                  data={trendChartData}
                  title={t.monthlyTrend}
                  showTimeRangeSelector={false}
                  height={280}
                />
              </div>
            )}

            {/* Earnings by Source */}
            {earningsChartData && (
              <div className="stats-chart-card">
                <ChartWidget
                  type="doughnut"
                  data={earningsChartData}
                  title={t.earningsBySource}
                  showTimeRangeSelector={false}
                  height={260}
                />
              </div>
            )}

            {/* Channel Breakdown */}
            {channelChartData && (
              <div className="stats-chart-card">
                <ChartWidget
                  type="bar"
                  data={channelChartData}
                  title={t.channelBreakdown}
                  showTimeRangeSelector={false}
                  height={260}
                />
              </div>
            )}
          </div>

          {/* Interactive Stats Dashboard - pure CSS/SVG charts (Req 7.1, 7.2, 7.3) */}
          <div className="stats-referral-stats-section">
            <ReferralStats compact />
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralStatsPage;
