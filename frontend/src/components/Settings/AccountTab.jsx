import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ProfileEditForm from './ProfileEditForm';
import EmailChangeModal from './EmailChangeModal';
import PhoneChangeModal from './PhoneChangeModal';
import PasswordChangeModal from './PasswordChangeModal';
import './AccountTab.css';

const AccountTab = () => {
  const { user, language } = useApp();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const translations = {
    ar: {
      title: 'معلومات الحساب',
      profileSection: 'الملف الشخصي',
      securitySection: 'الأمان',
      changeEmail: 'تغيير البريد الإلكتروني',
      changePhone: 'تغيير رقم الهاتف',
      changePassword: 'تغيير كلمة المرور',
      currentEmail: 'البريد الحالي',
      currentPhone: 'الهاتف الحالي',
    },
    en: {
      title: 'Account Information',
      profileSection: 'Profile',
      securitySection: 'Security',
      changeEmail: 'Change Email',
      changePhone: 'Change Phone',
      changePassword: 'Change Password',
      currentEmail: 'Current Email',
      currentPhone: 'Current Phone',
    },
    fr: {
      title: 'Informations du compte',
      profileSection: 'Profil',
      securitySection: 'Sécurité',
      changeEmail: 'Changer l\'email',
      changePhone: 'Changer le téléphone',
      changePassword: 'Changer le mot de passe',
      currentEmail: 'Email actuel',
      currentPhone: 'Téléphone actuel',
    }
  };

  const t = translations[language] || translations.en;

  const handleProfileUpdate = (success, message) => {
    if (success) {
      setSuccessMessage(message);
      setErrorMessage('');
    } else {
      setErrorMessage(message);
      setSuccessMessage('');
    }
    
    // Clear messages after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  return (
    <div className="account-tab">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="message-banner success" role="alert">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="message-banner error" role="alert">
          ❌ {errorMessage}
        </div>
      )}

      {/* Profile Section */}
      <section className="account-section">
        <h2 className="section-title">{t.profileSection}</h2>
        <ProfileEditForm onUpdate={handleProfileUpdate} />
      </section>

      {/* Security Section */}
      <section className="account-section">
        <h2 className="section-title">{t.securitySection}</h2>
        
        {/* Email Change */}
        <div className="security-item">
          <div className="security-item-info">
            <label className="security-label">{t.currentEmail}</label>
            <p className="security-value">{user?.email || 'Not set'}</p>
          </div>
          <button
            className="security-btn"
            onClick={() => setShowEmailModal(true)}
            aria-label={t.changeEmail}
          >
            {t.changeEmail}
          </button>
        </div>

        {/* Phone Change */}
        <div className="security-item">
          <div className="security-item-info">
            <label className="security-label">{t.currentPhone}</label>
            <p className="security-value">{user?.phone || 'Not set'}</p>
          </div>
          <button
            className="security-btn"
            onClick={() => setShowPhoneModal(true)}
            aria-label={t.changePhone}
          >
            {t.changePhone}
          </button>
        </div>

        {/* Password Change */}
        <div className="security-item">
          <button
            className="security-btn-primary"
            onClick={() => setShowPasswordModal(true)}
            aria-label={t.changePassword}
          >
            🔒 {t.changePassword}
          </button>
        </div>
      </section>

      {/* Modals */}
      {showEmailModal && (
        <EmailChangeModal
          onClose={() => setShowEmailModal(false)}
          onSuccess={(message) => {
            setShowEmailModal(false);
            handleProfileUpdate(true, message);
          }}
          onError={(message) => {
            handleProfileUpdate(false, message);
          }}
        />
      )}

      {showPhoneModal && (
        <PhoneChangeModal
          onClose={() => setShowPhoneModal(false)}
          onSuccess={(message) => {
            setShowPhoneModal(false);
            handleProfileUpdate(true, message);
          }}
          onError={(message) => {
            handleProfileUpdate(false, message);
          }}
        />
      )}

      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(message) => {
            setShowPasswordModal(false);
            handleProfileUpdate(true, message);
          }}
          onError={(message) => {
            handleProfileUpdate(false, message);
          }}
        />
      )}
    </div>
  );
};

export default AccountTab;
