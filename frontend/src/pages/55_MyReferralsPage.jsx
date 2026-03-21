import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ReferralsList from '../components/Referral/ReferralsList';
import './55_MyReferralsPage.css';

const translations = {
  ar: {
    title: 'إحالاتي',
    subtitle: 'تتبع جميع الأشخاص الذين أحلتهم إلى المنصة',
    totalReferrals: 'إجمالي الإحالات',
    referral: 'إحالة',
    referrals: 'إحالات',
    name: 'الاسم',
    status: 'الحالة',
    date: 'التاريخ',
    points: 'النقاط المكتسبة',
    anonymous: 'مجهول',
    pending: 'معلق',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    emptyTitle: 'لا توجد إحالات بعد',
    emptyDesc: 'شارك رابط إحالتك مع أصدقائك وابدأ في كسب النقاط',
    shareLink: 'مشاركة رابط الإحالة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل الإحالات',
    retry: 'إعادة المحاولة',
    pointsEarned: 'نقطة',
    noPoints: '—',
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    viewLeaderboard: 'عرض لوحة المتصدرين',
    viewStats: 'عرض الإحصائيات',
  },
  en: {
    title: 'My Referrals',
    subtitle: 'Track all the people you have referred to the platform',
    totalReferrals: 'Total Referrals',
    referral: 'referral',
    referrals: 'referrals',
    name: 'Name',
    status: 'Status',
    date: 'Date',
    points: 'Points Earned',
    anonymous: 'Anonymous',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    emptyTitle: 'No referrals yet',
    emptyDesc: 'Share your referral link with friends and start earning points',
    shareLink: 'Share Referral Link',
    loading: 'Loading...',
    error: 'Error loading referrals',
    retry: 'Retry',
    pointsEarned: 'pts',
    noPoints: '—',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    viewLeaderboard: 'View Leaderboard',
    viewStats: 'View Statistics',
  },
  fr: {
    title: 'Mes Parrainages',
    subtitle: 'Suivez toutes les personnes que vous avez parrainées sur la plateforme',
    totalReferrals: 'Total des Parrainages',
    referral: 'parrainage',
    referrals: 'parrainages',
    name: 'Nom',
    status: 'Statut',
    date: 'Date',
    points: 'Points Gagnés',
    anonymous: 'Anonyme',
    pending: 'En attente',
    completed: 'Complété',
    cancelled: 'Annulé',
    emptyTitle: 'Aucun parrainage pour l\'instant',
    emptyDesc: 'Partagez votre lien de parrainage avec vos amis et commencez à gagner des points',
    shareLink: 'Partager le Lien',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement des parrainages',
    retry: 'Réessayer',
    pointsEarned: 'pts',
    noPoints: '—',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    viewStats: 'Voir les Statistiques',
  },
};

const MyReferralsPage = () => {
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

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="my-referrals-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      {/* Header */}
      <div className="referrals-header">
        <div className="referrals-header-text">
          <h1 className="referrals-title">{t.title}</h1>
          <p className="referrals-subtitle">{t.subtitle}</p>
        </div>
      </div>

      {/* Referrals List - يعرض الحالة والتاريخ لكل إحالة */}
      <ReferralsList limit={10} />
    </div>
  );
};

export default MyReferralsPage;
