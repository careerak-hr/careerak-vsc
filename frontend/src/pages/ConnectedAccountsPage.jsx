import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectedAccountCard from '../components/auth/ConnectedAccountCard';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import './ConnectedAccountsPage.css';

// Translations
const translations = {
  ar: {
    title: 'الحسابات المتصلة',
    subtitle: 'إدارة حساباتك المرتبطة من مواقع التواصل الاجتماعي',
    noAccounts: 'لا توجد حسابات متصلة',
    noAccountsDesc: 'يمكنك ربط حساباتك من Google أو Facebook أو LinkedIn لتسهيل تسجيل الدخول',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ أثناء تحميل الحسابات',
    tryAgain: 'حاول مرة أخرى',
    backToProfile: 'العودة للملف الشخصي',
    unlinkConfirmTitle: 'تأكيد فك الربط',
    unlinkConfirmMessage: 'هل أنت متأكد من فك ربط حساب {provider}؟ ستحتاج إلى إعادة ربطه لاحقاً إذا أردت استخدامه مرة أخرى.',
    unlinkSuccess: 'تم فك ربط الحساب بنجاح',
    unlinkError: 'فشل في فك ربط الحساب',
    cancel: 'إلغاء',
    confirm: 'تأكيد'
  },
  en: {
    title: 'Connected Accounts',
    subtitle: 'Manage your linked social media accounts',
    noAccounts: 'No connected accounts',
    noAccountsDesc: 'You can link your Google, Facebook, or LinkedIn accounts for easier login',
    loading: 'Loading...',
    error: 'An error occurred while loading accounts',
    tryAgain: 'Try Again',
    backToProfile: 'Back to Profile',
    unlinkConfirmTitle: 'Confirm Unlink',
    unlinkConfirmMessage: 'Are you sure you want to unlink your {provider} account? You will need to reconnect it later if you want to use it again.',
    unlinkSuccess: 'Account unlinked successfully',
    unlinkError: 'Failed to unlink account',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  fr: {
    title: 'Comptes Connectés',
    subtitle: 'Gérez vos comptes de réseaux sociaux liés',
    noAccounts: 'Aucun compte connecté',
    noAccountsDesc: 'Vous pouvez lier vos comptes Google, Facebook ou LinkedIn pour faciliter la connexion',
    loading: 'Chargement...',
    error: 'Une erreur s\'est produite lors du chargement des comptes',
    tryAgain: 'Réessayer',
    backToProfile: 'Retour au Profil',
    unlinkConfirmTitle: 'Confirmer la Déconnexion',
    unlinkConfirmMessage: 'Êtes-vous sûr de vouloir déconnecter votre compte {provider}? Vous devrez le reconnecter plus tard si vous souhaitez l\'utiliser à nouveau.',
    unlinkSuccess: 'Compte déconnecté avec succès',
    unlinkError: 'Échec de la déconnexion du compte',
    cancel: 'Annuler',
    confirm: 'Confirmer'
  }
};

export default function ConnectedAccountsPage() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';
  
  // Font family based on language
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : 
                     language === 'fr' ? 'EB Garamond, serif' : 
                     'Cormorant Garamond, serif';

  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [accountToUnlink, setAccountToUnlink] = useState(null);
  const [unlinking, setUnlinking] = useState(false);

  // Fetch connected accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/auth/oauth/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts || []);
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkClick = (account) => {
    setAccountToUnlink(account);
    setShowUnlinkModal(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!accountToUnlink) return;
    
    try {
      setUnlinking(true);
      
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/auth/oauth/${accountToUnlink.provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove account from list
        setAccounts(accounts.filter(acc => acc.provider !== accountToUnlink.provider));
        setShowUnlinkModal(false);
        setAccountToUnlink(null);
        
        // Show success message (you can add a toast notification here)
        alert(t.unlinkSuccess);
      } else {
        alert(data.error || t.unlinkError);
      }
    } catch (err) {
      console.error('Error unlinking account:', err);
      alert(t.unlinkError);
    } finally {
      setUnlinking(false);
    }
  };

  const handleUnlinkCancel = () => {
    setShowUnlinkModal(false);
    setAccountToUnlink(null);
  };

  return (
    <div 
      className="connected-accounts-page"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/profile')}
          aria-label={t.backToProfile}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="header-content">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t.loading}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchAccounts}>
              {t.tryAgain}
            </button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>{t.noAccounts}</h2>
            <p>{t.noAccountsDesc}</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <ConnectedAccountCard
                key={account._id}
                account={account}
                onUnlink={handleUnlinkClick}
                language={language}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unlink Confirmation Modal */}
      {showUnlinkModal && accountToUnlink && (
        <ConfirmationModal
          isOpen={showUnlinkModal}
          onClose={handleUnlinkCancel}
          onConfirm={handleUnlinkConfirm}
          title={t.unlinkConfirmTitle}
          message={t.unlinkConfirmMessage.replace('{provider}', accountToUnlink.provider)}
          confirmText={t.confirm}
          cancelText={t.cancel}
          isLoading={unlinking}
          language={language}
        />
      )}
    </div>
  );
}
