import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './58_CompanyReferralDashboard.css';

const translations = {
  ar: {
    title: 'لوحة تحكم إحالات الشركات',
    subtitle: 'تتبع إحالاتك واستفد من المكافآت الخاصة بالشركات',
    myCode: 'كود الإحالة الخاص بك',
    copyCode: 'نسخ الكود',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    shareWhatsApp: 'واتساب',
    shareEmail: 'بريد إلكتروني',
    statsTitle: 'إحصائياتك',
    totalReferrals: 'إجمالي الإحالات',
    completed: 'مكتملة',
    pending: 'معلقة',
    cancelled: 'ملغاة',
    totalPoints: 'إجمالي النقاط المكتسبة',
    pointsUnit: 'نقطة',
    rewardsTitle: 'هيكل المكافآت',
    rewardCompanySignup: 'إحالة شركة جديدة',
    rewardFirstJob: 'نشر أول وظيفة',
    rewardHire: 'توظيف ناجح',
    rewardSubscription: 'اشتراك سنوي',
    referralsTitle: 'الشركات المُحالة',
    companyName: 'اسم الشركة',
    status: 'الحالة',
    date: 'التاريخ',
    points: 'النقاط',
    statusPending: 'معلق',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغي',
    noReferrals: 'لا توجد إحالات بعد',
    noReferralsDesc: 'شارك كود إحالتك مع الشركات الأخرى لتبدأ في كسب النقاط',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    retry: 'إعادة المحاولة',
    noDate: '—',
    noPoints: '—',
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    discountTitle: 'استخدام النقاط على باقات التوظيف',
    discountDesc: 'كل 100 نقطة = خصم 10% (حد أقصى 50%)',
    packagePrice: 'سعر الباقة ($)',
    pointsToUse: 'النقاط المراد استخدامها',
    applyDiscount: 'تطبيق الخصم',
    discountResult: 'نتيجة الخصم',
    discountAmount: 'مبلغ الخصم',
    finalPrice: 'السعر النهائي',
    newBalance: 'الرصيد الجديد',
    discountError: 'خطأ في تطبيق الخصم',
    anonymous: 'شركة مجهولة',
    breakdownTitle: 'توزيع المكافآت',
  },
  en: {
    title: 'Company Referral Dashboard',
    subtitle: 'Track your referrals and benefit from company-exclusive rewards',
    myCode: 'Your Referral Code',
    copyCode: 'Copy Code',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    shareWhatsApp: 'WhatsApp',
    shareEmail: 'Email',
    statsTitle: 'Your Statistics',
    totalReferrals: 'Total Referrals',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    totalPoints: 'Total Points Earned',
    pointsUnit: 'pts',
    rewardsTitle: 'Rewards Structure',
    rewardCompanySignup: 'New Company Referral',
    rewardFirstJob: 'First Job Post',
    rewardHire: 'Successful Hire',
    rewardSubscription: 'Annual Subscription',
    referralsTitle: 'Referred Companies',
    companyName: 'Company Name',
    status: 'Status',
    date: 'Date',
    points: 'Points',
    statusPending: 'Pending',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    noReferrals: 'No referrals yet',
    noReferralsDesc: 'Share your referral code with other companies to start earning points',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    noDate: '—',
    noPoints: '—',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    discountTitle: 'Use Points on Job Packages',
    discountDesc: 'Every 100 points = 10% discount (max 50%)',
    packagePrice: 'Package Price ($)',
    pointsToUse: 'Points to Use',
    applyDiscount: 'Apply Discount',
    discountResult: 'Discount Result',
    discountAmount: 'Discount Amount',
    finalPrice: 'Final Price',
    newBalance: 'New Balance',
    discountError: 'Error applying discount',
    anonymous: 'Unknown Company',
    breakdownTitle: 'Rewards Breakdown',
  },
  fr: {
    title: 'Tableau de Bord Parrainage Entreprise',
    subtitle: 'Suivez vos parrainages et bénéficiez des récompenses exclusives aux entreprises',
    myCode: 'Votre Code de Parrainage',
    copyCode: 'Copier le Code',
    copyLink: 'Copier le Lien',
    copied: 'Copié!',
    shareWhatsApp: 'WhatsApp',
    shareEmail: 'Email',
    statsTitle: 'Vos Statistiques',
    totalReferrals: 'Total des Parrainages',
    completed: 'Complétés',
    pending: 'En attente',
    cancelled: 'Annulés',
    totalPoints: 'Total des Points Gagnés',
    pointsUnit: 'pts',
    rewardsTitle: 'Structure des Récompenses',
    rewardCompanySignup: 'Parrainage d\'une nouvelle entreprise',
    rewardFirstJob: 'Premier offre d\'emploi',
    rewardHire: 'Recrutement réussi',
    rewardSubscription: 'Abonnement annuel',
    referralsTitle: 'Entreprises Parrainées',
    companyName: 'Nom de l\'entreprise',
    status: 'Statut',
    date: 'Date',
    points: 'Points',
    statusPending: 'En attente',
    statusCompleted: 'Complété',
    statusCancelled: 'Annulé',
    noReferrals: 'Aucun parrainage pour l\'instant',
    noReferralsDesc: 'Partagez votre code de parrainage avec d\'autres entreprises pour commencer',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    noDate: '—',
    noPoints: '—',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    discountTitle: 'Utiliser les Points sur les Forfaits',
    discountDesc: 'Chaque 100 points = 10% de réduction (max 50%)',
    packagePrice: 'Prix du Forfait ($)',
    pointsToUse: 'Points à Utiliser',
    applyDiscount: 'Appliquer la Réduction',
    discountResult: 'Résultat de la Réduction',
    discountAmount: 'Montant de la Réduction',
    finalPrice: 'Prix Final',
    newBalance: 'Nouveau Solde',
    discountError: 'Erreur lors de l\'application de la réduction',
    anonymous: 'Entreprise inconnue',
    breakdownTitle: 'Répartition des Récompenses',
  },
};

const REWARD_LABELS = {
  company_signup: 'rewardCompanySignup',
  first_job_post: 'rewardFirstJob',
  successful_hire: 'rewardHire',
  annual_subscription: 'rewardSubscription',
};

const REWARD_POINTS = {
  company_signup: 500,
  first_job_post: 300,
  successful_hire: 400,
  annual_subscription: 1000,
};

const STATUS_CONFIG = {
  pending: { className: 'crd-badge--pending', icon: '⏳' },
  completed: { className: 'crd-badge--completed', icon: '✅' },
  cancelled: { className: 'crd-badge--cancelled', icon: '❌' },
};

const CompanyReferralDashboard = () => {
  const { user, language } = useApp();
  const navigate = useNavigate();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';
  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const apiBase = `${import.meta.env.VITE_API_URL}/company-referrals`;
  const getToken = () => localStorage.getItem('token');

  // State
  const [code, setCode] = useState('');
  const [link, setLink] = useState('');
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Discount form state
  const [packagePrice, setPackagePrice] = useState('');
  const [pointsToUse, setPointsToUse] = useState('');
  const [discountResult, setDiscountResult] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchAll = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${getToken()}` };

      const [codeRes, statsRes, referralsRes] = await Promise.all([
        fetch(`${apiBase}/my-code`, { headers }),
        fetch(`${apiBase}/stats`, { headers }),
        fetch(`${apiBase}/my-referrals?page=${currentPage}&limit=10`, { headers }),
      ]);

      if (!codeRes.ok || !statsRes.ok || !referralsRes.ok) throw new Error('fetch failed');

      const [codeData, statsData, referralsData] = await Promise.all([
        codeRes.json(),
        statsRes.json(),
        referralsRes.json(),
      ]);

      setCode(codeData.code || '');
      setLink(codeData.link || '');
      setStats(statsData);
      setReferrals(referralsData.referrals || []);
      setTotal(referralsData.total || 0);
      setPages(referralsData.pages || 1);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [apiBase, t.error]);

  useEffect(() => {
    if (user) fetchAll(page);
  }, [user, page, fetchAll]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('دعوة للانضمام إلى كاريرك');
    const body = encodeURIComponent(`${link}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    setDiscountError(null);
    setDiscountResult(null);
    setDiscountLoading(true);
    try {
      const res = await fetch(`${apiBase}/apply-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          packagePrice: parseFloat(packagePrice),
          pointsToUse: parseInt(pointsToUse, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.discountError);
      setDiscountResult(data);
      // Refresh stats after discount
      const statsRes = await fetch(`${apiBase}/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      setDiscountError(err.message);
    } finally {
      setDiscountLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t.noDate;
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const getCompanyName = (ref) => {
    const c = ref.referredCompanyId;
    if (!c) return t.anonymous;
    return c.companyName || c.email || t.anonymous;
  };

  const getTotalPoints = (rewards = []) => {
    const sum = rewards.reduce((acc, r) => acc + (r.points || 0), 0);
    return sum > 0 ? `${sum} ${t.pointsUnit}` : t.noPoints;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="crd-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="crd-loading">
          <div className="crd-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crd-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="crd-error">
          <p>{error}</p>
          <button className="crd-retry-btn" onClick={() => fetchAll(page)}>{t.retry}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="crd-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Header */}
      <header className="crd-header">
        <h1 className="crd-title">{t.title}</h1>
        <p className="crd-subtitle">{t.subtitle}</p>
      </header>

      {/* Referral Code Card */}
      <section className="crd-code-card" aria-label={t.myCode}>
        <h2 className="crd-section-title">{t.myCode}</h2>
        <div className="crd-code-display">
          <span className="crd-code-value" aria-label={`${t.myCode}: ${code}`}>{code}</span>
        </div>
        <div className="crd-code-actions">
          <button
            className="crd-btn crd-btn--primary"
            onClick={() => copyToClipboard(code, 'code')}
            aria-label={t.copyCode}
          >
            {copiedCode ? t.copied : t.copyCode}
          </button>
          <button
            className="crd-btn crd-btn--secondary"
            onClick={() => copyToClipboard(link, 'link')}
            aria-label={t.copyLink}
          >
            {copiedLink ? t.copied : t.copyLink}
          </button>
          <button
            className="crd-btn crd-btn--whatsapp"
            onClick={shareWhatsApp}
            aria-label={t.shareWhatsApp}
          >
            {t.shareWhatsApp}
          </button>
          <button
            className="crd-btn crd-btn--email"
            onClick={shareEmail}
            aria-label={t.shareEmail}
          >
            {t.shareEmail}
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      {stats && (
        <section className="crd-stats-section" aria-label={t.statsTitle}>
          <h2 className="crd-section-title">{t.statsTitle}</h2>
          <div className="crd-stats-grid">
            <div className="crd-stat-card">
              <span className="crd-stat-icon" aria-hidden="true">🏢</span>
              <span className="crd-stat-value">{stats.total}</span>
              <span className="crd-stat-label">{t.totalReferrals}</span>
            </div>
            <div className="crd-stat-card crd-stat-card--completed">
              <span className="crd-stat-icon" aria-hidden="true">✅</span>
              <span className="crd-stat-value">{stats.completed}</span>
              <span className="crd-stat-label">{t.completed}</span>
            </div>
            <div className="crd-stat-card crd-stat-card--pending">
              <span className="crd-stat-icon" aria-hidden="true">⏳</span>
              <span className="crd-stat-value">{stats.pending}</span>
              <span className="crd-stat-label">{t.pending}</span>
            </div>
            <div className="crd-stat-card crd-stat-card--points">
              <span className="crd-stat-icon" aria-hidden="true">💎</span>
              <span className="crd-stat-value">{stats.totalPointsEarned}</span>
              <span className="crd-stat-label">{t.totalPoints}</span>
            </div>
          </div>

          {/* Rewards Breakdown */}
          {stats.rewardBreakdown && stats.rewardBreakdown.length > 0 && (
            <div className="crd-breakdown">
              <h3 className="crd-breakdown-title">{t.breakdownTitle}</h3>
              <ul className="crd-breakdown-list">
                {stats.rewardBreakdown.map((item) => (
                  <li key={item._id} className="crd-breakdown-item">
                    <span className="crd-breakdown-label">
                      {t[REWARD_LABELS[item._id]] || item._id}
                    </span>
                    <span className="crd-breakdown-meta">
                      ×{item.count} — {item.totalPoints} {t.pointsUnit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Rewards Structure */}
      <section className="crd-rewards-section" aria-label={t.rewardsTitle}>
        <h2 className="crd-section-title">{t.rewardsTitle}</h2>
        <ul className="crd-rewards-list">
          {Object.entries(REWARD_POINTS).map(([key, pts]) => (
            <li key={key} className="crd-reward-item">
              <span className="crd-reward-label">{t[REWARD_LABELS[key]]}</span>
              <span className="crd-reward-points">{pts} {t.pointsUnit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Discount Section */}
      <section className="crd-discount-section" aria-label={t.discountTitle}>
        <h2 className="crd-section-title">{t.discountTitle}</h2>
        <p className="crd-discount-desc">{t.discountDesc}</p>
        <form className="crd-discount-form" onSubmit={handleApplyDiscount} noValidate>
          <div className="crd-form-row">
            <label className="crd-label" htmlFor="packagePrice">{t.packagePrice}</label>
            <input
              id="packagePrice"
              className="crd-input"
              type="number"
              min="1"
              step="0.01"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value)}
              required
            />
          </div>
          <div className="crd-form-row">
            <label className="crd-label" htmlFor="pointsToUse">{t.pointsToUse}</label>
            <input
              id="pointsToUse"
              className="crd-input"
              type="number"
              min="100"
              step="100"
              value={pointsToUse}
              onChange={(e) => setPointsToUse(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="crd-btn crd-btn--primary"
            disabled={discountLoading}
          >
            {discountLoading ? t.loading : t.applyDiscount}
          </button>
        </form>

        {discountError && (
          <p className="crd-discount-error" role="alert">{discountError}</p>
        )}

        {discountResult && (
          <div className="crd-discount-result" role="status">
            <h3 className="crd-discount-result-title">{t.discountResult}</h3>
            <ul className="crd-discount-result-list">
              <li>
                <span>{t.discountAmount}:</span>
                <strong>${discountResult.discountAmount} ({discountResult.discountPercent}%)</strong>
              </li>
              <li>
                <span>{t.finalPrice}:</span>
                <strong>${discountResult.finalPrice}</strong>
              </li>
              <li>
                <span>{t.newBalance}:</span>
                <strong>{discountResult.newBalance} {t.pointsUnit}</strong>
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Referrals Table */}
      <section className="crd-referrals-section" aria-label={t.referralsTitle}>
        <h2 className="crd-section-title">{t.referralsTitle} ({total})</h2>

        {referrals.length === 0 ? (
          <div className="crd-empty">
            <div className="crd-empty-icon" aria-hidden="true">🏢</div>
            <h3 className="crd-empty-title">{t.noReferrals}</h3>
            <p className="crd-empty-desc">{t.noReferralsDesc}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="crd-table-wrapper" role="region" aria-label={t.referralsTitle}>
              <table className="crd-table">
                <thead>
                  <tr>
                    <th scope="col">{t.companyName}</th>
                    <th scope="col">{t.status}</th>
                    <th scope="col">{t.date}</th>
                    <th scope="col">{t.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => {
                    const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={ref._id}>
                        <td>
                          <div className="crd-company-cell">
                            <div className="crd-avatar" aria-hidden="true">
                              {getCompanyName(ref).charAt(0).toUpperCase()}
                            </div>
                            <span>{getCompanyName(ref)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`crd-badge ${statusCfg.className}`}>
                            <span aria-hidden="true">{statusCfg.icon}</span>
                            {t[`status${ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}`] || ref.status}
                          </span>
                        </td>
                        <td className="crd-date">{formatDate(ref.createdAt)}</td>
                        <td className="crd-points">{getTotalPoints(ref.rewards)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="crd-cards" role="list">
              {referrals.map((ref) => {
                const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
                return (
                  <div key={ref._id} className="crd-card" role="listitem">
                    <div className="crd-card-top">
                      <div className="crd-avatar" aria-hidden="true">
                        {getCompanyName(ref).charAt(0).toUpperCase()}
                      </div>
                      <div className="crd-card-info">
                        <span className="crd-card-name">{getCompanyName(ref)}</span>
                        <span className="crd-card-date">{formatDate(ref.createdAt)}</span>
                      </div>
                      <span className={`crd-badge ${statusCfg.className}`}>
                        <span aria-hidden="true">{statusCfg.icon}</span>
                        {t[`status${ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}`] || ref.status}
                      </span>
                    </div>
                    <div className="crd-card-footer">
                      <span className="crd-card-points-label">{t.points}:</span>
                      <span className="crd-card-points-value">{getTotalPoints(ref.rewards)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <nav className="crd-pagination" aria-label="pagination">
                <button
                  className="crd-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label={t.prev}
                >
                  {t.prev}
                </button>
                <span className="crd-page-info">
                  {t.page} {page} {t.of} {pages}
                </span>
                <button
                  className="crd-page-btn"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label={t.next}
                >
                  {t.next}
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CompanyReferralDashboard;
