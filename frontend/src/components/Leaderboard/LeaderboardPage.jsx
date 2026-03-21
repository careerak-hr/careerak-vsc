import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './LeaderboardPage.css';

// ---- Translations ----
const translations = {
  ar: {
    title: 'لوحة المتصدرين',
    subtitle: 'أفضل المحيلين على المنصة',
    myRank: 'ترتيبي',
    rank: 'الترتيب',
    name: 'الاسم',
    referrals: 'الإحالات',
    points: 'النقاط',
    prize: 'الجائزة',
    period: 'الفترة',
    monthly: 'شهري',
    yearly: 'سنوي',
    alltime: 'كل الأوقات',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات بعد',
    noDataDesc: 'كن أول المحيلين وابدأ في كسب النقاط',
    myRankLabel: 'ترتيبك الحالي',
    notRanked: 'لم تظهر في اللوحة بعد',
    referralCount: 'إحالة',
    pointsUnit: 'نقطة',
    hideFromLeaderboard: 'إخفاء اسمي من اللوحة',
    showInLeaderboard: 'إظهار اسمي في اللوحة',
    privacyUpdated: 'تم تحديث إعداد الخصوصية',
    privacyError: 'فشل تحديث الخصوصية',
    you: 'أنت',
    prizes: {
      gold: '🥇 شارة ذهبية + 1000 نقطة',
      silver: '🥈 شارة فضية + 500 نقطة',
      bronze: '🥉 شارة برونزية + 250 نقطة',
      active_referrer: '🏆 محيل نشط',
    },
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
  },
  en: {
    title: 'Leaderboard',
    subtitle: 'Top referrers on the platform',
    myRank: 'My Rank',
    rank: 'Rank',
    name: 'Name',
    referrals: 'Referrals',
    points: 'Points',
    prize: 'Prize',
    period: 'Period',
    monthly: 'Monthly',
    yearly: 'Yearly',
    alltime: 'All Time',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    noData: 'No data yet',
    noDataDesc: 'Be the first referrer and start earning points',
    myRankLabel: 'Your Current Rank',
    notRanked: 'Not ranked yet',
    referralCount: 'referral',
    pointsUnit: 'pts',
    hideFromLeaderboard: 'Hide my name from leaderboard',
    showInLeaderboard: 'Show my name in leaderboard',
    privacyUpdated: 'Privacy setting updated',
    privacyError: 'Failed to update privacy',
    you: 'You',
    prizes: {
      gold: '🥇 Gold Badge + 1000 pts',
      silver: '🥈 Silver Badge + 500 pts',
      bronze: '🥉 Bronze Badge + 250 pts',
      active_referrer: '🏆 Active Referrer',
    },
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
  },
  fr: {
    title: 'Classement',
    subtitle: 'Meilleurs parrains sur la plateforme',
    myRank: 'Mon Classement',
    rank: 'Rang',
    name: 'Nom',
    referrals: 'Parrainages',
    points: 'Points',
    prize: 'Prix',
    period: 'Période',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    alltime: 'Tout le temps',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    noData: 'Pas encore de données',
    noDataDesc: 'Soyez le premier parrain et commencez à gagner des points',
    myRankLabel: 'Votre Classement Actuel',
    notRanked: 'Pas encore classé',
    referralCount: 'parrainage',
    pointsUnit: 'pts',
    hideFromLeaderboard: 'Masquer mon nom du classement',
    showInLeaderboard: 'Afficher mon nom dans le classement',
    privacyUpdated: 'Paramètre de confidentialité mis à jour',
    privacyError: 'Échec de la mise à jour de la confidentialité',
    you: 'Vous',
    prizes: {
      gold: '🥇 Badge Or + 1000 pts',
      silver: '🥈 Badge Argent + 500 pts',
      bronze: '🥉 Badge Bronze + 250 pts',
      active_referrer: '🏆 Parrain Actif',
    },
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
  },
};

const PERIODS = ['alltime', 'monthly', 'yearly'];

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

// ---- Podium Component ----
const Podium = ({ top3, t, isRtl, user, formatNum }) => {
  if (!top3 || top3.length === 0) return null;

  // Podium order: 2nd (left), 1st (center), 3rd (right)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = { 1: 'lb-podium-col--first', 2: 'lb-podium-col--second', 3: 'lb-podium-col--third' };
  const podiumColors = { 1: '#D4AF37', 2: '#A8A9AD', 3: '#CD7F32' };

  const isCurrentUser = (entry) =>
    user && entry?.userId && entry.userId.toString() === user._id?.toString();

  return (
    <div className="lb-podium" dir={isRtl ? 'rtl' : 'ltr'} aria-label={t.title}>
      {podiumOrder.map((entry) => {
        if (!entry) return null;
        const isCurrent = isCurrentUser(entry);
        return (
          <div
            key={entry.userId}
            className={`lb-podium-col ${podiumHeights[entry.rank] || ''} ${isCurrent ? 'lb-podium-col--current' : ''}`}
          >
            <div className="lb-podium-medal" aria-hidden="true">
              {RANK_MEDALS[entry.rank]}
            </div>
            <div className="lb-podium-avatar-wrap">
              {entry.profileImage ? (
                <img
                  src={entry.profileImage}
                  alt={entry.name}
                  className="lb-podium-avatar"
                  loading="lazy"
                />
              ) : (
                <div
                  className="lb-podium-avatar lb-podium-avatar--placeholder"
                  style={{ background: podiumColors[entry.rank] }}
                  aria-hidden="true"
                >
                  {(entry.name || '?')[0].toUpperCase()}
                </div>
              )}
              {isCurrent && (
                <span className="lb-podium-you" aria-label={t.you}>({t.you})</span>
              )}
            </div>
            <p className="lb-podium-name">{entry.name || '—'}</p>
            <div className="lb-podium-stats">
              <span className="lb-podium-referrals">{formatNum(entry.referralCount)} {t.referralCount}</span>
              <span className="lb-podium-points" style={{ color: podiumColors[entry.rank] }}>
                {formatNum(entry.totalPoints)} {t.pointsUnit}
              </span>
            </div>
            <div
              className="lb-podium-stand"
              style={{ background: podiumColors[entry.rank] }}
              aria-hidden="true"
            >
              <span className="lb-podium-rank">#{entry.rank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Main Component ----
const LeaderboardPage = () => {
  const { user, language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [period, setPeriod] = useState('alltime');
  const [rankings, setRankings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [lbRes, rankRes] = await Promise.allSettled([
        fetch(`${apiUrl}/leaderboard?period=${period}&page=${page}&limit=10`, { headers }),
        fetch(`${apiUrl}/leaderboard/my-rank?period=${period}`, { headers }),
      ]);

      if (lbRes.status === 'fulfilled' && lbRes.value.ok) {
        const data = await lbRes.value.json();
        setRankings(data.rankings || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        setRankings([]);
      }

      if (rankRes.status === 'fulfilled' && rankRes.value.ok) {
        const data = await rankRes.value.json();
        setMyRank(data);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [period, page, apiUrl, t.error]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Reset page when period changes
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setPage(1);
  };

  const handleToggleVisibility = async () => {
    if (!myRank) return;
    const newVisibility = !myRank.isVisible;
    try {
      setPrivacyLoading(true);
      const res = await fetch(`${apiUrl}/leaderboard/visibility`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: newVisibility }),
      });
      if (!res.ok) throw new Error();
      setMyRank(prev => ({ ...prev, isVisible: newVisibility }));
      showToast('success', t.privacyUpdated);
    } catch {
      showToast('error', t.privacyError);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const formatNum = (n) =>
    (n || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  const getPrizeLabel = (prize) => {
    if (!prize) return null;
    return t.prizes[prize.badge] || null;
  };

  const isCurrentUser = (entry) =>
    user && entry.userId && entry.userId.toString() === user._id?.toString();

  return (
    <div className="lb-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Header */}
      <div className="lb-header">
        <div className="lb-header-text">
          <h1 className="lb-title">
            <span className="lb-title-icon" aria-hidden="true">🏆</span>
            {t.title}
          </h1>
          <p className="lb-subtitle">{t.subtitle}</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="lb-period-filter" role="group" aria-label={t.period}>
        {PERIODS.map(p => (
          <button
            key={p}
            className={`lb-period-btn${period === p ? ' lb-period-btn--active' : ''}`}
            onClick={() => handlePeriodChange(p)}
            aria-pressed={period === p}
          >
            {t[p]}
          </button>
        ))}
      </div>

      {/* My Rank Card */}
      {myRank && (
        <div className="lb-my-rank-card" aria-label={t.myRankLabel}>
          <div className="lb-my-rank-info">
            <span className="lb-my-rank-label">{t.myRankLabel}</span>
            <div className="lb-my-rank-value">
              {myRank.rank
                ? <><span className="lb-my-rank-number">#{formatNum(myRank.rank)}</span></>
                : <span className="lb-my-rank-none">{t.notRanked}</span>
              }
            </div>
            {myRank.rank && (
              <div className="lb-my-rank-stats">
                <span>{formatNum(myRank.referralCount)} {t.referralCount}</span>
                <span className="lb-my-rank-sep">·</span>
                <span>{formatNum(myRank.totalPoints)} {t.pointsUnit}</span>
              </div>
            )}
            {myRank.prize && (
              <div className="lb-my-rank-prize">{getPrizeLabel(myRank.prize)}</div>
            )}
          </div>

          {/* Privacy Toggle */}
          <button
            className={`lb-privacy-btn${myRank.isVisible ? '' : ' lb-privacy-btn--hidden'}`}
            onClick={handleToggleVisibility}
            disabled={privacyLoading}
            aria-label={myRank.isVisible ? t.hideFromLeaderboard : t.showInLeaderboard}
            title={myRank.isVisible ? t.hideFromLeaderboard : t.showInLeaderboard}
          >
            <span aria-hidden="true">{myRank.isVisible ? '👁️' : '🙈'}</span>
            <span className="lb-privacy-text">
              {myRank.isVisible ? t.hideFromLeaderboard : t.showInLeaderboard}
            </span>
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="lb-loading" aria-live="polite">
          <div className="lb-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="lb-error" role="alert">
          <p>{error}</p>
          <button className="lb-retry-btn" onClick={fetchLeaderboard}>{t.retry}</button>
        </div>
      )}

      {/* Rankings */}
      {!loading && !error && (
        <>
          {rankings.length === 0 ? (
            <div className="lb-empty">
              <span className="lb-empty-icon" aria-hidden="true">🏆</span>
              <h3 className="lb-empty-title">{t.noData}</h3>
              <p className="lb-empty-desc">{t.noDataDesc}</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {page === 1 && rankings.length >= 1 && (
                <Podium
                  top3={rankings.slice(0, 3)}
                  t={t}
                  isRtl={isRtl}
                  user={user}
                  formatNum={formatNum}
                />
              )}

            <div className="lb-table-wrapper" role="region" aria-label={t.title}>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th className="lb-th lb-th--rank">{t.rank}</th>
                    <th className="lb-th lb-th--name">{t.name}</th>
                    <th className="lb-th lb-th--referrals">{t.referrals}</th>
                    <th className="lb-th lb-th--points">{t.points}</th>
                    <th className="lb-th lb-th--prize">{t.prize}</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((entry) => {
                    const isCurrent = isCurrentUser(entry);
                    return (
                      <tr
                        key={`${entry.userId}-${entry.rank}`}
                        className={`lb-row${isCurrent ? ' lb-row--current' : ''}${entry.rank <= 3 ? ` lb-row--top${entry.rank}` : ''}`}
                        aria-current={isCurrent ? 'true' : undefined}
                      >
                        <td className="lb-td lb-td--rank">
                          <span className="lb-rank-badge">
                            {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                          </span>
                        </td>
                        <td className="lb-td lb-td--name">
                          <div className="lb-user-info">
                            {entry.profileImage ? (
                              <img
                                src={entry.profileImage}
                                alt={entry.name}
                                className="lb-avatar"
                                loading="lazy"
                              />
                            ) : (
                              <div className="lb-avatar lb-avatar--placeholder" aria-hidden="true">
                                {(entry.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <span className="lb-user-name">
                              {entry.name || t.name}
                              {isCurrent && (
                                <span className="lb-you-badge" aria-label={t.you}> ({t.you})</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="lb-td lb-td--referrals">
                          <span className="lb-stat">{formatNum(entry.referralCount)}</span>
                        </td>
                        <td className="lb-td lb-td--points">
                          <span className="lb-stat lb-stat--points">{formatNum(entry.totalPoints)}</span>
                        </td>
                        <td className="lb-td lb-td--prize">
                          {entry.prize ? (
                            <span className="lb-prize-label">{getPrizeLabel(entry.prize)}</span>
                          ) : (
                            <span className="lb-no-prize">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="lb-pagination" role="navigation" aria-label="pagination">
              <button
                className="lb-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={t.prev}
              >
                {isRtl ? '›' : '‹'}
              </button>
              <span className="lb-page-info">
                {t.page} {formatNum(page)} {t.of} {formatNum(pages)}
              </span>
              <button
                className="lb-page-btn"
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                aria-label={t.next}
              >
                {isRtl ? '‹' : '›'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`lb-toast lb-toast--${toast.type}`}
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true">{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
