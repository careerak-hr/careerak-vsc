import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import './AchievementsPage.css';

const translations = {
  ar: {
    title: 'جميع الإنجازات',
    subtitle: 'تتبع تقدمك واكسب الأوسمة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ أثناء تحميل الإنجازات',
    retry: 'إعادة المحاولة',
    earned: 'مكتسب',
    locked: 'مقفل',
    all: 'الكل',
    progress: 'التقدم',
    points: 'نقطة',
    totalPoints: 'مجموع النقاط',
    earnedBadges: 'أوسمة مكتسبة',
    totalBadges: 'إجمالي الأوسمة',
    completion: 'نسبة الإنجاز',
    earnedOn: 'حصلت عليه في',
    howToEarn: 'كيف تحصل عليه',
    noProgress: 'لا توجد إنجازات في هذه الفئة',
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
    filter: {
      all: 'الكل',
      earned: 'المكتسبة',
      inProgress: 'قيد التقدم',
      locked: 'المقفلة',
    },
  },
  en: {
    title: 'All Achievements',
    subtitle: 'Track your progress and earn badges',
    loading: 'Loading...',
    error: 'Error loading achievements',
    retry: 'Retry',
    earned: 'Earned',
    locked: 'Locked',
    all: 'All',
    progress: 'Progress',
    points: 'pts',
    totalPoints: 'Total Points',
    earnedBadges: 'Earned Badges',
    totalBadges: 'Total Badges',
    completion: 'Completion',
    earnedOn: 'Earned on',
    howToEarn: 'How to earn',
    noProgress: 'No achievements in this category',
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
    filter: {
      all: 'All',
      earned: 'Earned',
      inProgress: 'In Progress',
      locked: 'Locked',
    },
  },
  fr: {
    title: 'Toutes les Réalisations',
    subtitle: 'Suivez votre progression et gagnez des badges',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    earned: 'Obtenu',
    locked: 'Verrouillé',
    all: 'Tous',
    progress: 'Progression',
    points: 'pts',
    totalPoints: 'Points Totaux',
    earnedBadges: 'Badges Obtenus',
    totalBadges: 'Total Badges',
    completion: 'Complétion',
    earnedOn: 'Obtenu le',
    howToEarn: 'Comment obtenir',
    noProgress: 'Aucune réalisation dans cette catégorie',
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
    filter: {
      all: 'Tous',
      earned: 'Obtenus',
      inProgress: 'En cours',
      locked: 'Verrouillés',
    },
  },
};

const CATEGORIES = ['all', 'learning', 'achievement', 'engagement', 'career', 'social'];
const STATUS_FILTERS = ['all', 'earned', 'inProgress', 'locked'];

const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

export default function AchievementsPage() {
  const { language, fontFamily, user } = useApp();
  const t = translations[language] || translations.ar;
  const fontStyle = { fontFamily, fontWeight: 'inherit', fontStyle: 'inherit' };

  const [progressList, setProgressList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const lang = language || 'ar';
      const headers = { Authorization: `Bearer ${token}` };

      const [progressRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/badges/progress?lang=${lang}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/badges/stats`, { headers }),
      ]);

      if (!progressRes.ok || !statsRes.ok) throw new Error('fetch_failed');

      const [progressData, statsData] = await Promise.all([
        progressRes.json(),
        statsRes.json(),
      ]);

      // Sort: earned first, then by progress desc, then by rarity
      const sorted = (progressData.data || []).sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        if (b.progress !== a.progress) return b.progress - a.progress;
        return (rarityOrder[a.badge?.rarity] ?? 3) - (rarityOrder[b.badge?.rarity] ?? 3);
      });

      setProgressList(sorted);
      setStats(statsData.data || null);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = progressList.filter(item => {
    const catMatch =
      activeCategory === 'all' || item.badge?.category === activeCategory;
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'earned' && item.earned) ||
      (statusFilter === 'inProgress' && !item.earned && item.progress > 0) ||
      (statusFilter === 'locked' && !item.earned && item.progress === 0);
    return catMatch && statusMatch;
  });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US'
    );

  const rarityClass = (r) => `rarity-${r || 'common'}`;

  if (loading) {
    return (
      <div className="achievements-page" style={fontStyle}>
        <div className="achievements-loading">
          <div className="achievements-spinner" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-page" style={fontStyle}>
        <div className="achievements-error">
          <p>{error}</p>
          <button className="achievements-retry-btn" onClick={fetchData}>{t.retry}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-page" style={fontStyle}>
      {/* Page header */}
      <div className="achievements-hero">
        <h1 className="achievements-title">{t.title}</h1>
        <p className="achievements-subtitle">{t.subtitle}</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="achievements-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.earnedBadges}</span>
            <span className="stat-label">{t.earnedBadges}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalBadges}</span>
            <span className="stat-label">{t.totalBadges}</span>
          </div>
          <div className="stat-card accent">
            <span className="stat-value">{stats.totalPoints}</span>
            <span className="stat-label">{t.totalPoints}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completionPercentage}%</span>
            <span className="stat-label">{t.completion}</span>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="achievements-filters">
        <div className="filter-group">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {t.categories[cat]}
            </button>
          ))}
        </div>
        <div className="filter-group status-group">
          {STATUS_FILTERS.map(sf => (
            <button
              key={sf}
              className={`filter-btn status-btn ${statusFilter === sf ? 'active' : ''}`}
              onClick={() => setStatusFilter(sf)}
            >
              {t.filter[sf]}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements grid */}
      {filtered.length === 0 ? (
        <div className="achievements-empty">{t.noProgress}</div>
      ) : (
        <div className="achievements-grid">
          {filtered.map((item) => {
            const badge = item.badge;
            const pct = item.progress ?? 0;
            return (
              <button
                key={badge.badgeId}
                className={`achievement-card ${item.earned ? 'earned' : 'locked'} ${rarityClass(badge.rarity)}`}
                onClick={() => setSelectedBadge(item)}
                aria-label={badge.name}
              >
                {/* Icon */}
                <div className="ac-icon-wrap">
                  <span className="ac-icon" aria-hidden="true">{badge.icon}</span>
                  {!item.earned && <span className="ac-lock" aria-hidden="true">🔒</span>}
                </div>

                {/* Info */}
                <div className="ac-info">
                  <div className="ac-name">{badge.name}</div>
                  <div className={`ac-rarity ${rarityClass(badge.rarity)}`}>
                    {t.rarity[badge.rarity] || badge.rarity}
                  </div>
                  {item.earned ? (
                    <div className="ac-earned-label">✓ {t.earned}</div>
                  ) : (
                    <div className="ac-progress-wrap">
                      <div className="ac-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <div className="ac-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="ac-progress-pct">{pct}%</span>
                    </div>
                  )}
                </div>

                {/* Points */}
                <div className="ac-points">{badge.points} {t.points}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedBadge && (
        <div
          className="achievement-modal-overlay"
          onClick={() => setSelectedBadge(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedBadge.badge?.name}
        >
          <div
            className={`achievement-modal ${rarityClass(selectedBadge.badge?.rarity)}`}
            onClick={e => e.stopPropagation()}
            style={fontStyle}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedBadge(null)}
              aria-label="close"
            >✕</button>

            <div className="modal-icon">{selectedBadge.badge?.icon}</div>
            <h2 className="modal-name">{selectedBadge.badge?.name}</h2>
            <div className={`modal-rarity ${rarityClass(selectedBadge.badge?.rarity)}`}>
              {t.rarity[selectedBadge.badge?.rarity]}
            </div>
            <p className="modal-desc">{selectedBadge.badge?.description}</p>

            {selectedBadge.earned ? (
              <div className="modal-earned-section">
                <span className="modal-earned-date">
                  {t.earnedOn}: {formatDate(selectedBadge.earnedAt)}
                </span>
                <span className="modal-points-badge">+{selectedBadge.badge?.points} {t.points}</span>
              </div>
            ) : (
              <div className="modal-progress-section">
                <div className="modal-progress-label">
                  {t.progress}: {selectedBadge.progress}%
                </div>
                <div className="modal-progress-bar" role="progressbar" aria-valuenow={selectedBadge.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="modal-progress-fill"
                    style={{ width: `${selectedBadge.progress}%` }}
                  />
                </div>
                <p className="modal-how-to">
                  <strong>{t.howToEarn}:</strong> {selectedBadge.badge?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
