import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RedemptionCard from '../components/Referral/RedemptionCard';
import RedemptionConfirmModal from '../components/Referral/RedemptionConfirmModal';
import RedemptionHistory from '../components/Referral/RedemptionHistory';
import './57_RewardsStorePage.css';

// ---- Translations ----
const translations = {
  ar: {
    title: 'متجر المكافآت',
    subtitle: 'استبدل نقاطك بمكافآت رائعة',
    balance: 'رصيدك الحالي',
    points: 'نقطة',
    availableOptions: 'خيارات الاستبدال',
    discounts: 'خصومات الدورات',
    features: 'مزايا مميزة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    retry: 'إعادة المحاولة',
    successTitle: 'تم الاستبدال بنجاح!',
    successMsg: 'تم خصم النقاط وتطبيق المكافأة',
    errorRedeem: 'فشل الاستبدال، يرجى المحاولة مرة أخرى',
    close: 'إغلاق',
    backToReferrals: 'العودة للإحالات',
    noOptions: 'لا توجد خيارات متاحة حالياً',
  },
  en: {
    title: 'Rewards Store',
    subtitle: 'Redeem your points for amazing rewards',
    balance: 'Your Balance',
    points: 'pts',
    availableOptions: 'Redemption Options',
    discounts: 'Course Discounts',
    features: 'Premium Features',
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    successTitle: 'Redeemed Successfully!',
    successMsg: 'Points deducted and reward applied',
    errorRedeem: 'Redemption failed, please try again',
    close: 'Close',
    backToReferrals: 'Back to Referrals',
    noOptions: 'No options available at the moment',
  },
  fr: {
    title: 'Boutique de Récompenses',
    subtitle: 'Échangez vos points contre des récompenses',
    balance: 'Votre Solde',
    points: 'pts',
    availableOptions: 'Options d\'Échange',
    discounts: 'Réductions sur les Cours',
    features: 'Fonctionnalités Premium',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    successTitle: 'Échange Réussi!',
    successMsg: 'Points déduits et récompense appliquée',
    errorRedeem: 'Échec de l\'échange, veuillez réessayer',
    close: 'Fermer',
    backToReferrals: 'Retour aux Parrainages',
    noOptions: 'Aucune option disponible pour le moment',
  },
};

// ---- Default redemption options (fallback if API not ready) ----
const DEFAULT_OPTIONS = [
  {
    optionId: 'discount_10',
    name: { ar: 'خصم 10% على دورة', en: '10% Course Discount', fr: 'Réduction 10% sur un cours' },
    description: { ar: 'احصل على خصم 10% على أي دورة', en: 'Get 10% off any course', fr: 'Obtenez 10% de réduction sur un cours' },
    pointsCost: 100,
    type: 'discount',
  },
  {
    optionId: 'discount_25',
    name: { ar: 'خصم 25% على دورة', en: '25% Course Discount', fr: 'Réduction 25% sur un cours' },
    description: { ar: 'احصل على خصم 25% على أي دورة', en: 'Get 25% off any course', fr: 'Obtenez 25% de réduction sur un cours' },
    pointsCost: 250,
    type: 'discount',
  },
  {
    optionId: 'free_course',
    name: { ar: 'دورة مجانية (حتى 50$)', en: 'Free Course (up to $50)', fr: 'Cours Gratuit (jusqu\'à 50$)' },
    description: { ar: 'احصل على دورة مجانية بقيمة حتى 50 دولار', en: 'Get a free course worth up to $50', fr: 'Obtenez un cours gratuit d\'une valeur de 50$' },
    pointsCost: 500,
    type: 'discount',
  },
  {
    optionId: 'monthly_sub',
    name: { ar: 'اشتراك شهري مجاني', en: 'Free Monthly Subscription', fr: 'Abonnement Mensuel Gratuit' },
    description: { ar: 'اشتراك شهري مجاني في المنصة', en: 'One month free platform subscription', fr: 'Un mois d\'abonnement gratuit' },
    pointsCost: 1000,
    type: 'subscription',
  },
  {
    optionId: 'profile_boost',
    name: { ar: 'إبراز الملف الشخصي أسبوع', en: 'Profile Boost for 1 Week', fr: 'Mise en Avant du Profil 1 Semaine' },
    description: { ar: 'إبراز ملفك الشخصي لمدة أسبوع كامل', en: 'Boost your profile visibility for a full week', fr: 'Mettez en avant votre profil pendant une semaine' },
    pointsCost: 150,
    type: 'feature',
  },
  {
    optionId: 'premium_badge',
    name: { ar: 'شارة "عضو مميز"', en: '"Premium Member" Badge', fr: 'Badge "Membre Premium"' },
    description: { ar: 'احصل على شارة العضو المميز في ملفك', en: 'Get the Premium Member badge on your profile', fr: 'Obtenez le badge Membre Premium sur votre profil' },
    pointsCost: 200,
    type: 'feature',
  },
];

// ---- Main Component ----
const RewardsStorePage = () => {
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

  const [balance, setBalance] = useState(0);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedOption, setSelectedOption] = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  // History refresh trigger
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Fetch balance and options
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [balRes, optRes] = await Promise.allSettled([
        fetch(`${apiUrl}/rewards/balance`, { headers }),
        fetch(`${apiUrl}/rewards/options`, { headers }),
      ]);

      // Balance
      if (balRes.status === 'fulfilled' && balRes.value.ok) {
        const data = await balRes.value.json();
        setBalance(data.balance ?? 0);
      }

      // Options
      if (optRes.status === 'fulfilled' && optRes.value.ok) {
        const data = await optRes.value.json();
        setOptions(data.options || DEFAULT_OPTIONS);
      } else {
        setOptions(DEFAULT_OPTIONS);
      }
    } catch {
      setError(t.error);
      setOptions(DEFAULT_OPTIONS);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle redeem confirmation
  const handleConfirmRedeem = async () => {
    if (!selectedOption) return;
    try {
      setRedeemLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/rewards/redeem`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: selectedOption.optionId }),
      });

      if (!res.ok) throw new Error('redeem failed');

      // Update balance locally
      setBalance((prev) => prev - selectedOption.pointsCost);
      setSelectedOption(null);
      setHistoryRefresh((n) => n + 1);
      showToast('success', t.successMsg);
    } catch {
      showToast('error', t.errorRedeem);
    } finally {
      setRedeemLoading(false);
    }
  };

  // Localize option name/description
  const getLocalizedText = (field) => {
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field !== null) {
      return field[language] || field.ar || field.en || '';
    }
    return '';
  };

  const formatNum = (n) =>
    (n || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');

  // Separate options by type
  const discountOptions = options.filter((o) => o.type === 'discount' || o.type === 'subscription');
  const featureOptions = options.filter((o) => o.type === 'feature');

  if (!user) return null;

  return (
    <div className="rsp-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Page Header */}
      <div className="rsp-header">
        <div className="rsp-header-text">
          <h1 className="rsp-title">{t.title}</h1>
          <p className="rsp-subtitle">{t.subtitle}</p>
        </div>

        {/* Balance Widget */}
        <div className="rsp-balance-widget" aria-label={t.balance}>
          <span className="rsp-balance-icon" aria-hidden="true">🏆</span>
          <div className="rsp-balance-info">
            <span className="rsp-balance-label">{t.balance}</span>
            <span className="rsp-balance-value" aria-live="polite">
              {loading ? '...' : formatNum(balance)}
              <span className="rsp-balance-unit"> {t.points}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rsp-loading">
          <div className="rsp-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rsp-error">
          <p>{error}</p>
          <button className="rsp-retry-btn" onClick={fetchData}>{t.retry}</button>
        </div>
      )}

      {/* Options */}
      {!loading && (
        <>
          {/* Discount / Subscription Options */}
          {discountOptions.length > 0 && (
            <section className="rsp-section">
              <h2 className="rsp-section-title">
                <span aria-hidden="true">💰</span> {t.discounts}
              </h2>
              <div className="rsp-grid">
                {discountOptions.map((opt) => (
                  <RedemptionCard
                    key={opt.optionId}
                    option={{
                      ...opt,
                      name: getLocalizedText(opt.name),
                      description: getLocalizedText(opt.description),
                    }}
                    userBalance={balance}
                    onRedeem={(o) => setSelectedOption(o)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Feature Options */}
          {featureOptions.length > 0 && (
            <section className="rsp-section">
              <h2 className="rsp-section-title">
                <span aria-hidden="true">🎁</span> {t.features}
              </h2>
              <div className="rsp-grid">
                {featureOptions.map((opt) => (
                  <RedemptionCard
                    key={opt.optionId}
                    option={{
                      ...opt,
                      name: getLocalizedText(opt.name),
                      description: getLocalizedText(opt.description),
                    }}
                    userBalance={balance}
                    onRedeem={(o) => setSelectedOption(o)}
                  />
                ))}
              </div>
            </section>
          )}

          {options.length === 0 && (
            <p className="rsp-no-options">{t.noOptions}</p>
          )}

          {/* Redemption History */}
          <RedemptionHistory refreshTrigger={historyRefresh} />
        </>
      )}

      {/* Confirm Modal */}
      {selectedOption && (
        <RedemptionConfirmModal
          option={selectedOption}
          userBalance={balance}
          onConfirm={handleConfirmRedeem}
          onCancel={() => !redeemLoading && setSelectedOption(null)}
          loading={redeemLoading}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`rsp-toast rsp-toast--${toast.type}`}
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

export default RewardsStorePage;
