import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import './ReferralCharts.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const translations = {
  ar: {
    title: 'رسوم بيانية للإحالات',
    monthlyTrend: 'اتجاه الإحالات الشهري',
    earningsBySource: 'النقاط المكتسبة حسب المصدر',
    conversionRate: 'معدل التحويل',
    totalReferrals: 'إجمالي الإحالات',
    completedReferrals: 'الإحالات المكتملة',
    conversionRateLabel: 'معدل التحويل',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات كافية بعد',
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    sources: {
      referral: 'إحالة',
      signup: 'تسجيل',
      first_course: 'أول دورة',
      job: 'وظيفة',
      subscription: 'اشتراك',
      course_milestone: 'إنجاز دورات',
      redemption: 'استبدال',
    },
    points: 'نقطة',
    completed: 'مكتملة',
    total: 'إجمالي',
    rate: 'المعدل',
  },
  en: {
    title: 'Referral Charts',
    monthlyTrend: 'Monthly Referral Trend',
    earningsBySource: 'Points Earned by Source',
    conversionRate: 'Conversion Rate',
    totalReferrals: 'Total Referrals',
    completedReferrals: 'Completed Referrals',
    conversionRateLabel: 'Conversion Rate',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    noData: 'Not enough data yet',
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    sources: {
      referral: 'Referral',
      signup: 'Signup',
      first_course: 'First Course',
      job: 'Job',
      subscription: 'Subscription',
      course_milestone: 'Course Milestone',
      redemption: 'Redemption',
    },
    points: 'pts',
    completed: 'Completed',
    total: 'Total',
    rate: 'Rate',
  },
  fr: {
    title: 'Graphiques de Parrainage',
    monthlyTrend: 'Tendance Mensuelle',
    earningsBySource: 'Points Gagnés par Source',
    conversionRate: 'Taux de Conversion',
    totalReferrals: 'Total Parrainages',
    completedReferrals: 'Parrainages Complétés',
    conversionRateLabel: 'Taux de Conversion',
    loading: 'Chargement...',
    error: 'Erreur de chargement',
    retry: 'Réessayer',
    noData: 'Pas assez de données',
    months: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    sources: {
      referral: 'Parrainage',
      signup: 'Inscription',
      first_course: 'Premier Cours',
      job: 'Emploi',
      subscription: 'Abonnement',
      course_milestone: 'Jalon Cours',
      redemption: 'Échange',
    },
    points: 'pts',
    completed: 'Complétés',
    total: 'Total',
    rate: 'Taux',
  },
};

const COLORS = {
  primary: '#304B60',
  accent: '#D48161',
  secondary: '#E3DAD1',
  success: '#4CAF50',
  primaryAlpha: 'rgba(48, 75, 96, 0.7)',
  accentAlpha: 'rgba(212, 129, 97, 0.7)',
  successAlpha: 'rgba(76, 175, 80, 0.7)',
};

export default function ReferralCharts({ apiUrl, token }) {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const [trend, setTrend] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const base = apiUrl || '';

      const [trendRes, earningsRes, statsRes] = await Promise.all([
        fetch(`${base}/api/referrals/analytics/trend`, { headers }),
        fetch(`${base}/api/referrals/analytics/earnings`, { headers }),
        fetch(`${base}/api/referrals/analytics/personal`, { headers }),
      ]);

      if (!trendRes.ok || !earningsRes.ok || !statsRes.ok) throw new Error('fetch_failed');

      const [trendData, earningsData, statsData] = await Promise.all([
        trendRes.json(),
        earningsRes.json(),
        statsRes.json(),
      ]);

      setTrend(trendData);
      setEarnings(earningsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token, apiUrl]);

  if (loading) return <div className="referral-charts-loading">{t.loading}</div>;
  if (error) return (
    <div className="referral-charts-error">
      <p>{t.error}</p>
      <button onClick={fetchData}>{t.retry}</button>
    </div>
  );

  // Monthly trend chart data
  const trendLabels = trend.map(d => `${t.months[d.month - 1]} ${d.year}`);
  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: t.total,
        data: trend.map(d => d.total),
        backgroundColor: COLORS.primaryAlpha,
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: t.completed,
        data: trend.map(d => d.completed),
        backgroundColor: COLORS.accentAlpha,
        borderColor: COLORS.accent,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Conversion rate line chart
  const conversionChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: `${t.conversionRateLabel} (%)`,
        data: trend.map(d => d.conversionRate),
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(212, 129, 97, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: COLORS.accent,
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Earnings by source doughnut
  const earningsChartData = {
    labels: earnings.map(e => t.sources[e.source] || e.source),
    datasets: [
      {
        data: earnings.map(e => e.totalPoints),
        backgroundColor: [
          COLORS.primary, COLORS.accent, '#6B8FA8', '#E8A87C',
          '#5C7A8A', '#C4956A', '#8BAAB8',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: isRTL ? 'Amiri' : 'Cormorant Garamond' } } },
    },
    scales: {
      x: { ticks: { font: { family: isRTL ? 'Amiri' : 'Cormorant Garamond' } } },
      y: { ticks: { font: { family: isRTL ? 'Amiri' : 'Cormorant Garamond' } } },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, min: 0, max: 100, ticks: { ...chartOptions.scales.y.ticks, callback: v => `${v}%` } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: isRTL ? 'Amiri' : 'Cormorant Garamond' } } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed} ${t.points}`,
        },
      },
    },
  };

  const hasData = trend.length > 0;
  const conversionRate = stats?.conversion?.rate ?? 0;

  return (
    <div className={`referral-charts ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="referral-charts-title">{t.title}</h2>

      {/* Summary cards */}
      {stats && (
        <div className="referral-charts-summary">
          <div className="chart-stat-card">
            <span className="chart-stat-value">{stats.referrals?.total ?? 0}</span>
            <span className="chart-stat-label">{t.totalReferrals}</span>
          </div>
          <div className="chart-stat-card">
            <span className="chart-stat-value">{stats.referrals?.completed ?? 0}</span>
            <span className="chart-stat-label">{t.completedReferrals}</span>
          </div>
          <div className="chart-stat-card accent">
            <span className="chart-stat-value">{conversionRate}%</span>
            <span className="chart-stat-label">{t.conversionRateLabel}</span>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="referral-charts-empty">{t.noData}</div>
      ) : (
        <div className="referral-charts-grid">
          {/* Monthly trend bar chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">{t.monthlyTrend}</h3>
            <div className="chart-wrapper">
              <Bar data={trendChartData} options={chartOptions} />
            </div>
          </div>

          {/* Conversion rate line chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">{t.conversionRate}</h3>
            <div className="chart-wrapper">
              <Line data={conversionChartData} options={lineOptions} />
            </div>
          </div>

          {/* Earnings by source doughnut */}
          {earnings.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-card-title">{t.earningsBySource}</h3>
              <div className="chart-wrapper chart-wrapper--doughnut">
                <Doughnut data={earningsChartData} options={doughnutOptions} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
