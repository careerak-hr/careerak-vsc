import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './PointsBalanceWidget.css';

const translations = {
  ar: {
    title: 'رصيد النقاط',
    points: 'نقطة',
    loading: 'جاري التحميل...',
    error: 'تعذّر تحميل الرصيد',
    retry: 'إعادة المحاولة',
    viewHistory: 'سجل النقاط',
    earnMore: 'اكسب المزيد',
    referFriend: 'أحِل صديقاً',
    rewardHint: 'أحِل أصدقاءك واكسب نقاطاً',
  },
  en: {
    title: 'Points Balance',
    points: 'pts',
    loading: 'Loading...',
    error: 'Failed to load balance',
    retry: 'Retry',
    viewHistory: 'Points History',
    earnMore: 'Earn More',
    referFriend: 'Refer a Friend',
    rewardHint: 'Refer friends and earn points',
  },
  fr: {
    title: 'Solde de Points',
    points: 'pts',
    loading: 'Chargement...',
    error: 'Impossible de charger le solde',
    retry: 'Réessayer',
    viewHistory: 'Historique',
    earnMore: 'Gagner Plus',
    referFriend: 'Parrainer un Ami',
    rewardHint: 'Parrainez des amis et gagnez des points',
  },
};

/**
 * PointsBalanceWidget - عرض رصيد النقاط في الملف الشخصي
 * Requirements: 2.4 - عرض رصيد النقاط في الملف الشخصي
 */
const PointsBalanceWidget = ({ onViewHistory, onReferFriend }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/rewards/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setBalance(data.balance ?? 0);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const fontStyle = { fontFamily };

  if (loading) {
    return (
      <div className="pbw-container pbw-loading" dir={isRtl ? 'rtl' : 'ltr'} style={fontStyle}>
        <div className="pbw-skeleton" aria-hidden="true" />
        <p className="pbw-loading-text">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pbw-container pbw-error-state" dir={isRtl ? 'rtl' : 'ltr'} style={fontStyle}>
        <p className="pbw-error-msg">{error}</p>
        <button className="pbw-retry-btn" onClick={fetchBalance}>
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <section
      className="pbw-container"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={fontStyle}
      aria-label={t.title}
    >
      {/* Header */}
      <div className="pbw-header">
        <span className="pbw-icon" aria-hidden="true">🏆</span>
        <h3 className="pbw-title">{t.title}</h3>
      </div>

      {/* Balance Display */}
      <div className="pbw-balance-display">
        <span className="pbw-balance-number" aria-live="polite">
          {balance.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </span>
        <span className="pbw-balance-unit">{t.points}</span>
      </div>

      {/* Hint */}
      <p className="pbw-hint">{t.rewardHint}</p>

      {/* Actions */}
      <div className="pbw-actions">
        {onReferFriend && (
          <button className="pbw-btn pbw-btn--primary" onClick={onReferFriend}>
            {t.referFriend}
          </button>
        )}
        {onViewHistory && (
          <button className="pbw-btn pbw-btn--secondary" onClick={onViewHistory}>
            {t.viewHistory}
          </button>
        )}
      </div>
    </section>
  );
};

export default PointsBalanceWidget;
