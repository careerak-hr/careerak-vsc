import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import RedemptionCard from './RedemptionCard';
import RedemptionConfirmModal from './RedemptionConfirmModal';
import RedemptionHistory from './RedemptionHistory';
import './RewardsStore.css';

const translations = {
  ar: {
    title: 'متجر المكافآت',
    subtitle: 'استبدل نقاطك بمكافآت رائعة',
    balance: 'رصيدك الحالي',
    points: 'نقطة',
    optionsTitle: 'خيارات الاستبدال',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في التحميل',
    retry: 'إعادة المحاولة',
    successTitle: 'تم الاستبدال بنجاح!',
    successMsg: 'تم خصم النقاط وتطبيق المكافأة',
    close: 'إغلاق',
    noOptions: 'لا توجد خيارات متاحة حالياً',
    insufficientHint: 'نقاط غير كافية',
    needed: 'تحتاج',
    more: 'نقطة إضافية',
  },
  en: {
    title: 'Rewards Store',
    subtitle: 'Redeem your points for amazing rewards',
    balance: 'Your Balance',
    points: 'pts',
    optionsTitle: 'Redemption Options',
    loading: 'Loading...',
    error: 'Failed to load',
    retry: 'Retry',
    successTitle: 'Redeemed Successfully!',
    successMsg: 'Points deducted and reward applied',
    close: 'Close',
    noOptions: 'No options available',
    insufficientHint: 'Not enough points',
    needed: 'Need',
    more: 'more points',
  },
  fr: {
    title: 'Boutique de Récompenses',
    subtitle: 'Échangez vos points contre des récompenses',
    balance: 'Votre Solde',
    points: 'pts',
    optionsTitle: 'Options d\'Échange',
    loading: 'Chargement...',
    error: 'Erreur de chargement',
    retry: 'Réessayer',
    successTitle: 'Échange réussi!',
    successMsg: 'Points déduits et récompense appliquée',
    close: 'Fermer',
    noOptions: 'Aucune option disponible',
    insufficientHint: 'Points insuffisants',
    needed: 'Besoin de',
    more: 'points supplémentaires',
  },
};

/**
 * RewardsStore - متجر المكافآت الرئيسي
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
const RewardsStore = () => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRtl = language === 'ar';

  const fontFamily =
    language === 'ar'
      ? "'Amiri', serif"
      : language === 'fr'
      ? "'EB Garamond', serif"
      : "'Cormorant Garamond', serif";

  const [balance, setBalance] = useState(0);
  const [options, setOptions] = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedOption, setSelectedOption] = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Trigger to refresh history after redemption
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const getToken = () => localStorage.getItem('token');

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const res = await fetch(`${apiUrl}/rewards/balance`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('balance fetch failed');
      const data = await res.json();
      setBalance(data.balance ?? 0);
    } catch {
      // keep previous balance on error
    } finally {
      setLoadingBalance(false);
    }
  }, [apiUrl]);

  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError(null);
      const res = await fetch(`${apiUrl}/rewards/options`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('options fetch failed');
      const data = await res.json();
      // Localize option names/descriptions
      const localized = (data.options || []).map(opt => ({
        ...opt,
        name: typeof opt.name === 'object' ? (opt.name[language] || opt.name.ar) : opt.name,
        description: typeof opt.description === 'object'
          ? (opt.description[language] || opt.description.ar)
          : opt.description,
      }));
      setOptions(localized);
    } catch {
      setError(t.error);
    } finally {
      setLoadingOptions(false);
    }
  }, [apiUrl, language, t.error]);

  useEffect(() => {
    fetchBalance();
    fetchOptions();
  }, [fetchBalance, fetchOptions]);

  const handleRedeemClick = (option) => {
    setSelectedOption(option);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedOption) return;
    try {
      setRedeemLoading(true);
      const res = await fetch(`${apiUrl}/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ optionId: selectedOption.optionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'redeem failed');

      // Update balance immediately
      setBalance(data.newBalance ?? balance - selectedOption.pointsCost);
      setSelectedOption(null);
      setSuccessMessage(selectedOption.name);
      setHistoryRefresh(n => n + 1);

      // Auto-dismiss success after 3s
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Keep modal open on error so user sees it
      console.error('Redeem error:', err);
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCancelRedeem = () => {
    if (!redeemLoading) setSelectedOption(null);
  };

  const formatNum = (n) =>
    (n || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  const isLoading = loadingBalance || loadingOptions;

  return (
    <div
      className="rs-page"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <header className="rs-header">
        <div className="rs-header-text">
          <h1 className="rs-title">
            <span className="rs-title-icon" aria-hidden="true">🏪</span>
            {t.title}
          </h1>
          <p className="rs-subtitle">{t.subtitle}</p>
        </div>

        {/* Balance Card */}
        <div className="rs-balance-card" aria-label={t.balance}>
          <span className="rs-balance-label">{t.balance}</span>
          {loadingBalance ? (
            <div className="rs-balance-skeleton" aria-hidden="true" />
          ) : (
            <div className="rs-balance-display">
              <span className="rs-balance-number" aria-live="polite">
                {formatNum(balance)}
              </span>
              <span className="rs-balance-unit">{t.points}</span>
            </div>
          )}
        </div>
      </header>

      {/* Success Toast */}
      {successMessage && (
        <div className="rs-success-toast" role="alert" aria-live="assertive">
          <span className="rs-success-icon" aria-hidden="true">✅</span>
          <div>
            <strong>{t.successTitle}</strong>
            <p>{successMessage}</p>
          </div>
          <button
            className="rs-success-close"
            onClick={() => setSuccessMessage(null)}
            aria-label={t.close}
          >
            ×
          </button>
        </div>
      )}

      {/* Options Section */}
      <section className="rs-options-section" aria-labelledby="rs-options-heading">
        <h2 id="rs-options-heading" className="rs-section-title">{t.optionsTitle}</h2>

        {isLoading ? (
          <div className="rs-loading" aria-busy="true">
            <div className="rs-spinner" aria-hidden="true" />
            <p>{t.loading}</p>
          </div>
        ) : error ? (
          <div className="rs-error">
            <p>{error}</p>
            <button className="rs-retry-btn" onClick={() => { fetchBalance(); fetchOptions(); }}>
              {t.retry}
            </button>
          </div>
        ) : options.length === 0 ? (
          <p className="rs-no-options">{t.noOptions}</p>
        ) : (
          <div className="rs-options-grid" role="list">
            {options.map(option => (
              <div key={option.optionId} role="listitem">
                <RedemptionCard
                  option={option}
                  userBalance={balance}
                  onRedeem={handleRedeemClick}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Redemption History */}
      <RedemptionHistory refreshTrigger={historyRefresh} />

      {/* Confirm Modal */}
      {selectedOption && (
        <RedemptionConfirmModal
          option={selectedOption}
          userBalance={balance}
          onConfirm={handleConfirmRedeem}
          onCancel={handleCancelRedeem}
          loading={redeemLoading}
        />
      )}
    </div>
  );
};

export default RewardsStore;
