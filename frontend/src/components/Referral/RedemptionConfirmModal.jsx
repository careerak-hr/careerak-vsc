import React from 'react';
import { useApp } from '../../context/AppContext';
import './RedemptionConfirmModal.css';

const translations = {
  ar: {
    title: 'تأكيد الاستبدال',
    message: 'هل أنت متأكد من استبدال',
    pointsFor: 'نقطة مقابل',
    balanceAfter: 'رصيدك بعد الاستبدال',
    currentBalance: 'رصيدك الحالي',
    deduction: 'يُخصم',
    points: 'نقطة',
    confirm: 'تأكيد الاستبدال',
    cancel: 'إلغاء',
    loading: 'جاري المعالجة...',
    warning: 'لا يمكن التراجع عن هذه العملية',
  },
  en: {
    title: 'Confirm Redemption',
    message: 'Are you sure you want to redeem',
    pointsFor: 'points for',
    balanceAfter: 'Balance after redemption',
    currentBalance: 'Current balance',
    deduction: 'Deduction',
    points: 'pts',
    confirm: 'Confirm Redemption',
    cancel: 'Cancel',
    loading: 'Processing...',
    warning: 'This action cannot be undone',
  },
  fr: {
    title: 'Confirmer l\'Échange',
    message: 'Êtes-vous sûr de vouloir échanger',
    pointsFor: 'points pour',
    balanceAfter: 'Solde après échange',
    currentBalance: 'Solde actuel',
    deduction: 'Déduction',
    points: 'pts',
    confirm: 'Confirmer l\'Échange',
    cancel: 'Annuler',
    loading: 'Traitement...',
    warning: 'Cette action est irréversible',
  },
};

/**
 * RedemptionConfirmModal - modal تأكيد الاستبدال
 * Requirements: 3.3 - تأكيد قبل الاستبدال
 */
const RedemptionConfirmModal = ({ option, userBalance, onConfirm, onCancel, loading }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const balanceAfter = userBalance - option.pointsCost;
  const formatNum = (n) =>
    n.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  return (
    <div
      className="rcm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rcm-title"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div
        className="rcm-modal"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily }}
      >
        {/* Header */}
        <div className="rcm-header">
          <span className="rcm-header-icon" aria-hidden="true">🎁</span>
          <h2 id="rcm-title" className="rcm-title">{t.title}</h2>
        </div>

        {/* Body */}
        <div className="rcm-body">
          <p className="rcm-message">
            {t.message}{' '}
            <strong className="rcm-cost">
              {formatNum(option.pointsCost)} {t.points}
            </strong>{' '}
            {t.pointsFor}{' '}
            <strong className="rcm-option-name">{option.name}</strong>
          </p>

          {/* Balance summary */}
          <div className="rcm-balance-summary">
            <div className="rcm-balance-row">
              <span className="rcm-balance-label">
                {t.currentBalance}
              </span>
              <span className="rcm-balance-value rcm-balance-current">
                {formatNum(userBalance)} {t.points}
              </span>
            </div>
            <div className="rcm-balance-row rcm-balance-row--deduct">
              <span className="rcm-balance-label">
                {t.deduction}
              </span>
              <span className="rcm-balance-value rcm-balance-deduct">
                -{formatNum(option.pointsCost)} {t.points}
              </span>
            </div>
            <div className="rcm-balance-divider" />
            <div className="rcm-balance-row rcm-balance-row--after">
              <span className="rcm-balance-label rcm-balance-label--bold">{t.balanceAfter}</span>
              <span className="rcm-balance-value rcm-balance-after">
                {formatNum(balanceAfter)} {t.points}
              </span>
            </div>
          </div>

          {/* Warning */}
          <p className="rcm-warning">
            <span aria-hidden="true">⚠️</span> {t.warning}
          </p>
        </div>

        {/* Actions */}
        <div className="rcm-actions">
          <button
            className="rcm-btn rcm-btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            className="rcm-btn rcm-btn--confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="rcm-spinner" aria-hidden="true" />
            ) : null}
            {loading ? t.loading : t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedemptionConfirmModal;
