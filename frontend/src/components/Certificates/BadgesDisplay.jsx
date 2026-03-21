import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './BadgesDisplay.css';

const translations = {
  ar: {
    title: 'إنجازاتي',
    earned: 'مكتسبة',
    all: 'الكل',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ أثناء تحميل الإنجازات',
    noBadges: 'لا توجد إنجازات بعد',
    earnedOn: 'حصلت عليه في',
    progress: 'التقدم',
    howToEarn: 'كيف تحصل عليه',
    points: 'نقطة',
    totalPoints: 'مجموع النقاط',
    categories: {
      all: 'الكل',
      learning: 'التعلم',
      achievement: 'الإنجاز',
      engagement: 'التفاعل',
      career: 'المسيرة',
      social: 'الاجتماعي',
    },
    rarity: {
      common: 'عادي',
      rare: 'نادر',
      epic: 'ملحمي',
      legendary: 'أسطوري',
    },
    hide: 'إخفاء',
    show: 'إظهار',
    hidden: 'مخفي',
    locked: 'مقفل',
  },
  en: {
    title: 'My Achievements',
    earned: 'Earned',
    all: 'All',
    loading: 'Loading...',
    error: 'Error loading achievements',
    noBadges: 'No achievements yet',
    earnedOn: 'Earned on',
    progress: 'Progress',
    howToEarn: 'How to earn',
    points: 'pts',
    totalPoints: 'Total Points',
    categories: {
      all: 'All',
      learning: 'Learning',
      achievement: 'Achievement',
      engagement: 'Engagement',
      career: 'Career',
      social: 'Social',
    },
    rarity: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
    hide: 'Hide',
    show: 'Show',
    hidden: 'Hidden',
    locked: 'Locked',
  },
  fr: {
    title: 'Mes Réalisations',
    earned: 'Obtenu',
    all: 'Tous',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    noBadges: 'Aucune réalisation pour le moment',
    earnedOn: 'Obtenu le',
    progress: 'Progression',
    howToEarn: 'Comment obtenir',
    points: 'pts',
    totalPoints: 'Points Totaux',
    categories: {
      all: 'Tous',
      learning: 'Apprentissage',
      achievement: 'Réalisation',
      engagement: 'Engagement',
      career: 'Carrière',
      social: 'Social',
    },
    rarity: {
      common: 'Commun',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire',
    },
    hide: 'Masquer',
    show: 'Afficher',
    hidden: 'Masqué',
    locked: 'Verrouillé',
  },
};

const CATEGORIES = ['all', 'learning', 'achievement', 'engagement', 'career', 'social'];

const BadgesDisplay = ({ userId, isOwnProfile = false }) => {
  const { language, fontFamily } = useApp();
  const t = translations[language] || translations.ar;

  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fontStyle = { fontFamily, fontWeight: 'inherit', fontStyle: 'inherit' };

  useEffect(() => {
    fetchData();
  }, [userId, language]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const lang = language || 'ar';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [userRes, allRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/badges/user/${userId}?lang=${lang}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/badges?lang=${lang}`, { headers }),
      ]);

      if (!userRes.ok || !allRes.ok) throw new Error('fetch_failed');

      const [userData, allData] = await Promise.all([userRes.json(), allRes.json()]);

      const earned = userData.data || [];
      setEarnedBadges(earned);
      setAllBadges(allData.data || []);
      setTotalPoints(earned.reduce((sum, ub) => sum + (ub.badge?.points || 0), 0));
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisplay = async (userBadgeId, currentDisplayed) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/badges/${userBadgeId}/display`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      setEarnedBadges(prev =>
        prev.map(ub =>
          ub.userBadgeId === userBadgeId ? { ...ub, isDisplayed: !currentDisplayed } : ub
        )
      );
    } catch {
      // silent fail — badge toggle is non-critical
    }
  };

  // Build a merged list: earned badges + locked badges from allBadges
  const earnedIds = new Set(earnedBadges.map(ub => ub.badge?.badgeId));

  const mergedBadges = [
    ...earnedBadges.map(ub => ({ ...ub.badge, userBadgeId: ub.userBadgeId, earnedAt: ub.earnedAt, isDisplayed: ub.isDisplayed, earned: true })),
    ...allBadges.filter(b => !earnedIds.has(b.badgeId)).map(b => ({ ...b, earned: false })),
  ];

  const filtered =
    activeCategory === 'all'
      ? mergedBadges
      : mergedBadges.filter(b => b.category === activeCategory);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US'
    );

  const rarityClass = (rarity) => `rarity-${rarity || 'common'}`;

  if (loading) {
    return (
      <div className="badges-display" style={fontStyle}>
        <div className="badges-loading">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badges-display" style={fontStyle}>
        <div className="badges-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="badges-display" style={fontStyle}>
      {/* Header */}
      <div className="badges-header">
        <h2 className="badges-title">{t.title}</h2>
        <div className="badges-summary">
          <span className="summary-earned">
            {earnedBadges.length} {t.earned}
          </span>
          <span className="summary-points">
            {totalPoints} {t.points}
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="badges-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {t.categories[cat]}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      {filtered.length === 0 ? (
        <div className="badges-empty">{t.noBadges}</div>
      ) : (
        <div className="badges-grid">
          {filtered.map((badge) => (
            <div
              key={badge.badgeId}
              className={`badge-card ${badge.earned ? 'earned' : 'locked'} ${rarityClass(badge.rarity)} ${badge.earned && !badge.isDisplayed ? 'hidden-badge' : ''}`}
              onClick={() => setSelectedBadge(badge)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectedBadge(badge)}
              aria-label={badge.name}
            >
              <div className="badge-icon-wrap">
                <span className="badge-icon" aria-hidden="true">{badge.icon}</span>
                {!badge.earned && <div className="badge-lock">🔒</div>}
                {badge.earned && !badge.isDisplayed && (
                  <div className="badge-hidden-indicator" title={t.hidden}>👁️‍🗨️</div>
                )}
              </div>
              <div className="badge-name">{badge.name}</div>
              <div className={`badge-rarity ${rarityClass(badge.rarity)}`}>
                {t.rarity[badge.rarity] || badge.rarity}
              </div>
              {badge.earned && (
                <div className="badge-points">{badge.points} {t.points}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedBadge && (
        <div
          className="badge-modal-overlay"
          onClick={() => setSelectedBadge(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedBadge.name}
        >
          <div
            className={`badge-modal ${rarityClass(selectedBadge.rarity)}`}
            onClick={e => e.stopPropagation()}
            style={fontStyle}
          >
            <button
              className="badge-modal-close"
              onClick={() => setSelectedBadge(null)}
              aria-label="close"
            >
              ✕
            </button>

            <div className="modal-icon">{selectedBadge.icon}</div>
            <h3 className="modal-name">{selectedBadge.name}</h3>
            <div className={`modal-rarity ${rarityClass(selectedBadge.rarity)}`}>
              {t.rarity[selectedBadge.rarity]}
            </div>
            <p className="modal-description">{selectedBadge.description}</p>

            {selectedBadge.earned ? (
              <div className="modal-earned-info">
                <span className="modal-earned-date">
                  {t.earnedOn}: {formatDate(selectedBadge.earnedAt)}
                </span>
                <span className="modal-points">
                  +{selectedBadge.points} {t.points}
                </span>
                {isOwnProfile && (
                  <button
                    className={`modal-toggle-btn ${selectedBadge.isDisplayed ? 'hide' : 'show'}`}
                    onClick={() => {
                      toggleDisplay(selectedBadge.userBadgeId, selectedBadge.isDisplayed);
                      setSelectedBadge(prev => ({ ...prev, isDisplayed: !prev.isDisplayed }));
                    }}
                  >
                    {selectedBadge.isDisplayed ? t.hide : t.show}
                  </button>
                )}
              </div>
            ) : (
              <div className="modal-locked-info">
                <span className="modal-locked-label">{t.howToEarn}</span>
                <p className="modal-locked-desc">{selectedBadge.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesDisplay;
