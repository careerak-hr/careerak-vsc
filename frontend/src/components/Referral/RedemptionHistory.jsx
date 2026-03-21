import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './RedemptionHistory.css';

const translations = {
  ar: {
    title: 'سجل الاستبدالات',
    date: 'التاريخ',
    option: 'الخيار',
    cost: 'النقاط المستبدلة',
    status: 'الحالة',
    applied: 'مطبّق',
    pending: 'معلق',
    failed: 'فشل',
    empty: 'لا توجد استبدالات بعد',
    emptyDesc: 'استبدل نقاطك بمكافآت رائعة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل السجل',
    retry: 'إعادة المحاولة',
    points: 'نقطة',
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
  },
  en: {
    title: 'Redemption History',
    date: 'Date',
    option: 'Option',
    cost: 'Points Used',
    status: 'Status',
    applied: 'Applied',
    pending: 'Pending',
    failed: 'Failed',
    empty: 'No redemptions yet',
    emptyDesc: 'Redeem your points for amazing rewards',
    loading: 'Loading...',
    error: 'Error loading history',
    retry: 'Retry',
    points: 'pts',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
  },
  fr: {
    title: 'Historique des Échanges',
    date: 'Date',
    option: 'Option',
    cost: 'Points Utilisés',
    status: 'Statut',
    applied: 'Appliqué',
    pending: 'En attente',
    failed: 'Échoué',
    empty: 'Aucun échange pour l\'instant',
    emptyDesc: 'Échangez vos points contre des récompenses',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    points: 'pts',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
  },
};

const STATUS_CONFIG = {
  applied: { className: 'rh-badge--applied', icon: '✅' },
  pending: { className: 'rh-badge--pending', icon: '⏳' },
  failed: { className: 'rh-badge--failed', icon: '❌' },
};

/**
 * RedemptionHistory - سجل الاستبدالات السابقة
 * Requirements: 3.1 - سجل بجميع عمليات الاستبدال
 */
const RedemptionHistory = ({ refreshTrigger }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(
    async (currentPage) => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${apiUrl}/rewards/redemptions?page=${currentPage}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setHistory(data.redemptions || []);
        setPages(data.pages || 1);
      } catch {
        // Fallback: show empty state if API not ready
        setHistory([]);
        setPages(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory, refreshTrigger]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const formatNum = (n) =>
    (n || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  if (loading) {
    return (
      <div className="rh-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <h2 className="rh-title">{t.title}</h2>
        <div className="rh-loading">
          <div className="rh-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rh-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <h2 className="rh-title">{t.title}</h2>
        <div className="rh-error">
          <p>{error}</p>
          <button className="rh-retry-btn" onClick={() => fetchHistory(page)}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rh-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <h2 className="rh-title">{t.title}</h2>

      {history.length === 0 ? (
        <div className="rh-empty">
          <span className="rh-empty-icon" aria-hidden="true">📋</span>
          <p className="rh-empty-text">{t.empty}</p>
          <p className="rh-empty-desc">{t.emptyDesc}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="rh-table-wrapper" role="region" aria-label={t.title}>
            <table className="rh-table">
              <thead>
                <tr>
                  <th scope="col">{t.date}</th>
                  <th scope="col">{t.option}</th>
                  <th scope="col">{t.cost}</th>
                  <th scope="col">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.applied;
                  return (
                    <tr key={item._id}>
                      <td className="rh-date">{formatDate(item.createdAt)}</td>
                      <td className="rh-option-name">
                        {item.optionName || item.optionId || '—'}
                      </td>
                      <td className="rh-cost">
                        {formatNum(item.pointsCost)} {t.points}
                      </td>
                      <td>
                        <span className={`rh-badge ${statusCfg.className}`}>
                          <span aria-hidden="true">{statusCfg.icon}</span>
                          {t[item.status] || item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="rh-cards" role="list">
            {history.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.applied;
              return (
                <div key={item._id} className="rh-card" role="listitem">
                  <div className="rh-card-top">
                    <span className="rh-card-option">
                      {item.optionName || item.optionId || '—'}
                    </span>
                    <span className={`rh-badge ${statusCfg.className}`}>
                      <span aria-hidden="true">{statusCfg.icon}</span>
                      {t[item.status] || item.status}
                    </span>
                  </div>
                  <div className="rh-card-bottom">
                    <span className="rh-card-date">{formatDate(item.createdAt)}</span>
                    <span className="rh-card-cost">
                      -{formatNum(item.pointsCost)} {t.points}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <nav className="rh-pagination" aria-label="pagination">
              <button
                className="rh-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t.prev}
              </button>
              <span className="rh-page-info">
                {t.page} {page} {t.of} {pages}
              </span>
              <button
                className="rh-page-btn"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t.next}
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default RedemptionHistory;
