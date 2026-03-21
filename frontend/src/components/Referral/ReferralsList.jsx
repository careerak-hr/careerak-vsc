import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './ReferralsList.css';

const translations = {
  ar: {
    title: 'قائمة الإحالات',
    name: 'الاسم',
    status: 'الحالة',
    referralDate: 'تاريخ الإحالة',
    completionDate: 'تاريخ الإكمال',
    points: 'النقاط',
    anonymous: 'مجهول',
    pending: 'معلق',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    emptyTitle: 'لا توجد إحالات بعد',
    emptyDesc: 'شارك رابط إحالتك مع أصدقائك لتبدأ',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل الإحالات',
    retry: 'إعادة المحاولة',
    pointsUnit: 'نقطة',
    noPoints: '—',
    noDate: '—',
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    completedOn: 'أُكمل في',
    cancelledOn: 'أُلغي في',
    referredOn: 'أُحيل في',
  },
  en: {
    title: 'Referrals List',
    name: 'Name',
    status: 'Status',
    referralDate: 'Referral Date',
    completionDate: 'Completion Date',
    points: 'Points',
    anonymous: 'Anonymous',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    emptyTitle: 'No referrals yet',
    emptyDesc: 'Share your referral link with friends to get started',
    loading: 'Loading...',
    error: 'Error loading referrals',
    retry: 'Retry',
    pointsUnit: 'pts',
    noPoints: '—',
    noDate: '—',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    completedOn: 'Completed on',
    cancelledOn: 'Cancelled on',
    referredOn: 'Referred on',
  },
  fr: {
    title: 'Liste des Parrainages',
    name: 'Nom',
    status: 'Statut',
    referralDate: 'Date de Parrainage',
    completionDate: 'Date de Complétion',
    points: 'Points',
    anonymous: 'Anonyme',
    pending: 'En attente',
    completed: 'Complété',
    cancelled: 'Annulé',
    emptyTitle: 'Aucun parrainage pour l\'instant',
    emptyDesc: 'Partagez votre lien de parrainage avec vos amis pour commencer',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    pointsUnit: 'pts',
    noPoints: '—',
    noDate: '—',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    completedOn: 'Complété le',
    cancelledOn: 'Annulé le',
    referredOn: 'Parrainé le',
  },
};

const STATUS_CONFIG = {
  pending: { className: 'rl-badge--pending', icon: '⏳' },
  completed: { className: 'rl-badge--completed', icon: '✅' },
  cancelled: { className: 'rl-badge--cancelled', icon: '❌' },
};

/**
 * ReferralsList - مكون عرض قائمة الإحالات مع الحالة والتاريخ
 * يعرض: الاسم، الحالة (badge ملون)، تاريخ الإحالة، تاريخ الإكمال إن وُجد
 */
const ReferralsList = ({ apiUrl, token, limit = 10 }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [referrals, setReferrals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReferrals = useCallback(
    async (currentPage) => {
      try {
        setLoading(true);
        setError(null);
        const base = apiUrl || `${import.meta.env.VITE_API_URL}/referrals`;
        const authToken = token || localStorage.getItem('token');
        const res = await fetch(
          `${base}/my-referrals?page=${currentPage}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setReferrals(data.referrals || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } catch {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, token, limit, t.error]
  );

  useEffect(() => {
    fetchReferrals(page);
  }, [page, fetchReferrals]);

  const formatDate = (dateStr) => {
    if (!dateStr) return t.noDate;
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const getReferredName = (referral) => {
    const u = referral.referredUserId;
    if (!u) return t.anonymous;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || t.anonymous;
  };

  const getTotalPoints = (rewards = []) => {
    const sum = rewards.reduce((acc, r) => acc + (r.points || 0), 0);
    return sum > 0 ? `${sum} ${t.pointsUnit}` : t.noPoints;
  };

  /**
   * يُرجع التاريخ المناسب حسب الحالة:
   * - pending: تاريخ الإحالة (createdAt)
   * - completed: تاريخ الإكمال (completedAt)
   * - cancelled: تاريخ الإلغاء (completedAt إن وُجد، وإلا createdAt)
   */
  const getStatusDate = (referral) => {
    if (referral.status === 'completed' && referral.completedAt) {
      return { label: t.completedOn, date: formatDate(referral.completedAt) };
    }
    if (referral.status === 'cancelled' && referral.completedAt) {
      return { label: t.cancelledOn, date: formatDate(referral.completedAt) };
    }
    return { label: t.referredOn, date: formatDate(referral.createdAt) };
  };

  if (loading) {
    return (
      <div className="rl-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="rl-loading">
          <div className="rl-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rl-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="rl-error">
          <p>{error}</p>
          <button className="rl-retry-btn" onClick={() => fetchReferrals(page)}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="rl-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="rl-empty">
          <div className="rl-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="20" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path
                d="M10 54c0-12.15 9.85-22 22-22s22 9.85 22 22"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M44 28l4 4 8-8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="rl-empty-title">{t.emptyTitle}</h3>
          <p className="rl-empty-desc">{t.emptyDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Desktop Table */}
      <div className="rl-table-wrapper" role="region" aria-label={t.title}>
        <table className="rl-table">
          <thead>
            <tr>
              <th scope="col">{t.name}</th>
              <th scope="col">{t.status}</th>
              <th scope="col">{t.referralDate}</th>
              <th scope="col">{t.completionDate}</th>
              <th scope="col">{t.points}</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => {
              const statusDate = getStatusDate(ref);
              const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
              return (
                <tr key={ref._id}>
                  <td>
                    <div className="rl-name-cell">
                      <div className="rl-avatar" aria-hidden="true">
                        {getReferredName(ref).charAt(0).toUpperCase()}
                      </div>
                      <span>{getReferredName(ref)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`rl-badge ${statusCfg.className}`}>
                      <span className="rl-badge-icon" aria-hidden="true">{statusCfg.icon}</span>
                      {t[ref.status] || ref.status}
                    </span>
                  </td>
                  <td className="rl-date">{formatDate(ref.createdAt)}</td>
                  <td className="rl-date">
                    {ref.completedAt ? (
                      <span className={ref.status === 'completed' ? 'rl-date--completed' : 'rl-date--cancelled'}>
                        {formatDate(ref.completedAt)}
                      </span>
                    ) : (
                      <span className="rl-date--empty">{t.noDate}</span>
                    )}
                  </td>
                  <td className="rl-points">{getTotalPoints(ref.rewards)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="rl-cards" role="list">
        {referrals.map((ref) => {
          const statusDate = getStatusDate(ref);
          const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
          return (
            <div key={ref._id} className="rl-card" role="listitem">
              <div className="rl-card-top">
                <div className="rl-avatar" aria-hidden="true">
                  {getReferredName(ref).charAt(0).toUpperCase()}
                </div>
                <div className="rl-card-info">
                  <span className="rl-card-name">{getReferredName(ref)}</span>
                  <span className="rl-card-meta">
                    {statusDate.label}: <strong>{statusDate.date}</strong>
                  </span>
                </div>
                <span className={`rl-badge ${statusCfg.className}`}>
                  <span className="rl-badge-icon" aria-hidden="true">{statusCfg.icon}</span>
                  {t[ref.status] || ref.status}
                </span>
              </div>

              <div className="rl-card-dates">
                <div className="rl-card-date-item">
                  <span className="rl-card-date-label">{t.referralDate}</span>
                  <span className="rl-card-date-value">{formatDate(ref.createdAt)}</span>
                </div>
                {ref.completedAt && (
                  <div className="rl-card-date-item">
                    <span className="rl-card-date-label">{t.completionDate}</span>
                    <span className={`rl-card-date-value ${ref.status === 'completed' ? 'rl-date--completed' : 'rl-date--cancelled'}`}>
                      {formatDate(ref.completedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="rl-card-footer">
                <span className="rl-card-points-label">{t.points}:</span>
                <span className="rl-card-points-value">{getTotalPoints(ref.rewards)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav className="rl-pagination" aria-label="pagination">
          <button
            className="rl-page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label={t.prev}
          >
            {t.prev}
          </button>
          <span className="rl-page-info">
            {t.page} {page} {t.of} {pages}
          </span>
          <button
            className="rl-page-btn"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            aria-label={t.next}
          >
            {t.next}
          </button>
        </nav>
      )}
    </div>
  );
};

export default ReferralsList;
