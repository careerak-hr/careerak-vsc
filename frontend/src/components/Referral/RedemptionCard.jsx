import React from 'react';
import { useApp } from '../../context/AppContext';
import './RedemptionCard.css';

const translations = {
  ar: {
    redeem: 'استبدال',
    points: 'نقطة',
    required: 'مطلوب',
    notEnough: 'رصيد غير كافٍ',
    discount: 'خصم',
    feature: 'ميزة',
    subscription: 'اشتراك',
  },
  en: {
    redeem: 'Redeem',
    points: 'pts',
    required: 'required',
    notEnough: 'Not enough points',
    discount: 'Discount',
    feature: 'Feature',
    subscription: 'Subscription',
  },
  fr: {
    redeem: 'Échanger',
    points: 'pts',
    required: 'requis',
    notEnough: 'Points insuffisants',
    discount: 'Réduction',
    feature: 'Fonctionnalité',
    subscription: 'Abonnement',
  },
};

const TYPE_ICONS = {
  discount: '💰',
  feature: '🎁',
  subscription: '⭐',
};

/**
 * RedemptionCard - بطاقة خيار الاستبدال
 * Requirements: 3.1, 3.2
 */
const RedemptionCard = ({ option, userBalance, onRedeem }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const canAfford = userBalance >= option.pointsCost;
  const icon = TYPE_ICONS[option.type] || '🎁';

  return (
    <article
      className={`rdc-card ${!canAfford ? 'rdc-card--disabled' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
      aria-label={option.name}
    >
      {/* Icon */}
      <div className="rdc-icon" aria-hidden="true">{icon}</div>

      {/* Content */}
      <div className="rdc-content">
        <h3 className="rdc-name">{option.name}</h3>
        {option.description && (
          <p className="rdc-description">{option.description}</p>
        )}
      </div>

      {/* Cost */}
      <div className="rdc-cost">
        <span className="rdc-cost-number">
          {option.pointsCost.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </span>
        <span className="rdc-cost-unit">{t.points}</span>
      </div>

      {/* Balance indicator */}
      {!canAfford && (
        <p className="rdc-insufficient" role="alert">
          {t.notEnough}
        </p>
      )}

      {/* Redeem Button */}
      <button
        className="rdc-btn"
        disabled={!canAfford}
        onClick={() => canAfford && onRedeem(option)}
        aria-disabled={!canAfford}
      >
        {t.redeem}
      </button>
    </article>
  );
};

export default RedemptionCard;
