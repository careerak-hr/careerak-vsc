import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TwoFactorVerify.css';

/**
 * مكون التحقق من المصادقة الثنائية (2FA)
 * يستخدم أثناء تسجيل الدخول للمستخدمين الذين لديهم 2FA مفعل
 */
const TwoFactorVerify = ({ userId, onSuccess, onCancel }) => {
  const { language } = useApp();
  const [token, setToken] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    ar: {
      title: 'التحقق من المصادقة الثنائية',
      description: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة',
      backupCodeDescription: 'أدخل أحد الرموز الاحتياطية',
      tokenPlaceholder: 'أدخل الرمز (6 أرقام)',
      backupCodePlaceholder: 'أدخل الرمز الاحتياطي',
      verifyButton: 'تحقق',
      cancelButton: 'إلغاء',
      useBackupCode: 'استخدم رمز احتياطي',
      useAuthApp: 'استخدم تطبيق المصادقة',
      loading: 'جاري التحقق...',
      invalidToken: 'الرمز غير صحيح',
      errorOccurred: 'حدث خطأ. حاول مرة أخرى'
    },
    en: {
      title: 'Two-Factor Authentication',
      description: 'Enter the 6-digit code from your authenticator app',
      backupCodeDescription: 'Enter one of your backup codes',
      tokenPlaceholder: 'Enter code (6 digits)',
      backupCodePlaceholder: 'Enter backup code',
      verifyButton: 'Verify',
      cancelButton: 'Cancel',
      useBackupCode: 'Use backup code',
      useAuthApp: 'Use authenticator app',
      loading: 'Verifying...',
      invalidToken: 'Invalid code',
      errorOccurred: 'An error occurred. Try again'
    },
    fr: {
      title: 'Authentification à deux facteurs',
      description: 'Entrez le code à 6 chiffres de votre application d\'authentification',
      backupCodeDescription: 'Entrez l\'un de vos codes de secours',
      tokenPlaceholder: 'Entrez le code (6 chiffres)',
      backupCodePlaceholder: 'Entrez le code de secours',
      verifyButton: 'Vérifier',
      cancelButton: 'Annuler',
      useBackupCode: 'Utiliser un code de secours',
      useAuthApp: 'Utiliser l\'application d\'authentification',
      loading: 'Vérification...',
      invalidToken: 'Code invalide',
      errorOccurred: 'Une erreur s\'est produite. Réessayez'
    }
  };

  const t = translations[language] || translations.ar;

  const handleVerify = async () => {
    if (!token || (useBackupCode ? token.length !== 8 : token.length !== 6)) {
      setError(t.invalidToken);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          token,
          isBackupCode: useBackupCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.invalidToken);
      }

      // نجح التحقق
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setToken('');
    setError('');
  };

  return (
    <div className="two-factor-verify">
      <div className="two-factor-verify-header">
        <h2>{t.title}</h2>
        <p className="description">
          {useBackupCode ? t.backupCodeDescription : t.description}
        </p>
      </div>

      <div className="two-factor-verify-content">
        <input
          type="text"
          value={token}
          onChange={(e) => {
            const value = useBackupCode 
              ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
              : e.target.value.replace(/\D/g, '').slice(0, 6);
            setToken(value);
          }}
          placeholder={useBackupCode ? t.backupCodePlaceholder : t.tokenPlaceholder}
          className="token-input"
          maxLength={useBackupCode ? 8 : 6}
          autoFocus
        />

        {error && <p className="error-message">{error}</p>}

        <div className="verify-actions">
          <button
            onClick={handleVerify}
            disabled={loading || (useBackupCode ? token.length !== 8 : token.length !== 6)}
            className="btn-primary"
          >
            {loading ? t.loading : t.verifyButton}
          </button>
          <button onClick={onCancel} className="btn-outline">
            {t.cancelButton}
          </button>
        </div>

        <div className="toggle-method">
          <button onClick={handleToggleBackupCode} className="link-button">
            {useBackupCode ? t.useAuthApp : t.useBackupCode}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
