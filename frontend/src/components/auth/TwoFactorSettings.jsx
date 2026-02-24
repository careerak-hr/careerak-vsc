import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import TwoFactorSetup from './TwoFactorSetup';
import './TwoFactorSettings.css';

/**
 * مكون إعدادات المصادقة الثنائية (2FA)
 * يسمح للمستخدم بتفعيل/تعطيل 2FA وإدارة الرموز الاحتياطية
 */
const TwoFactorSettings = () => {
  const { language } = useApp();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const translations = {
    ar: {
      title: 'المصادقة الثنائية (2FA)',
      description: 'أضف طبقة أمان إضافية لحسابك',
      enabled: 'مفعّل',
      disabled: 'معطّل',
      status: 'الحالة:',
      backupCodes: 'الرموز الاحتياطية:',
      remaining: 'متبقي',
      enableButton: 'تفعيل 2FA',
      disableButton: 'تعطيل 2FA',
      regenerateButton: 'توليد رموز جديدة',
      cancelButton: 'إلغاء',
      confirmDisable: 'تأكيد التعطيل',
      disableWarning: 'هل أنت متأكد من تعطيل المصادقة الثنائية؟ سيقلل هذا من أمان حسابك.',
      passwordPlaceholder: 'أدخل كلمة المرور',
      tokenPlaceholder: 'أدخل رمز 2FA (اختياري)',
      confirmButton: 'تأكيد',
      loading: 'جاري التحميل...',
      disableSuccess: 'تم تعطيل المصادقة الثنائية',
      regenerateSuccess: 'تم توليد رموز احتياطية جديدة',
      errorOccurred: 'حدث خطأ. حاول مرة أخرى'
    },
    en: {
      title: 'Two-Factor Authentication (2FA)',
      description: 'Add an extra layer of security to your account',
      enabled: 'Enabled',
      disabled: 'Disabled',
      status: 'Status:',
      backupCodes: 'Backup Codes:',
      remaining: 'remaining',
      enableButton: 'Enable 2FA',
      disableButton: 'Disable 2FA',
      regenerateButton: 'Generate New Codes',
      cancelButton: 'Cancel',
      confirmDisable: 'Confirm Disable',
      disableWarning: 'Are you sure you want to disable two-factor authentication? This will reduce your account security.',
      passwordPlaceholder: 'Enter password',
      tokenPlaceholder: 'Enter 2FA code (optional)',
      confirmButton: 'Confirm',
      loading: 'Loading...',
      disableSuccess: 'Two-factor authentication disabled',
      regenerateSuccess: 'New backup codes generated',
      errorOccurred: 'An error occurred. Try again'
    },
    fr: {
      title: 'Authentification à deux facteurs (2FA)',
      description: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
      enabled: 'Activé',
      disabled: 'Désactivé',
      status: 'Statut:',
      backupCodes: 'Codes de secours:',
      remaining: 'restant',
      enableButton: 'Activer 2FA',
      disableButton: 'Désactiver 2FA',
      regenerateButton: 'Générer de nouveaux codes',
      cancelButton: 'Annuler',
      confirmDisable: 'Confirmer la désactivation',
      disableWarning: 'Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs? Cela réduira la sécurité de votre compte.',
      passwordPlaceholder: 'Entrez le mot de passe',
      tokenPlaceholder: 'Entrez le code 2FA (optionnel)',
      confirmButton: 'Confirmer',
      loading: 'Chargement...',
      disableSuccess: 'Authentification à deux facteurs désactivée',
      regenerateSuccess: 'Nouveaux codes de secours générés',
      errorOccurred: 'Une erreur s\'est produite. Réessayez'
    }
  };

  const t = translations[language] || translations.ar;

  // جلب حالة 2FA
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  // تعطيل 2FA
  const handleDisable = async () => {
    if (!password) {
      setError(t.passwordPlaceholder);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.errorOccurred);
      }

      setSuccess(t.disableSuccess);
      setShowDisable(false);
      setPassword('');
      setToken('');
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // توليد رموز احتياطية جديدة
  const handleRegenerate = async () => {
    if (!password) {
      setError(t.passwordPlaceholder);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/regenerate-backup-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.errorOccurred);
      }

      // تحميل الرموز الجديدة
      const codesText = data.data.backupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'careerak-backup-codes-new.txt';
      a.click();
      URL.revokeObjectURL(url);

      setSuccess(t.regenerateSuccess);
      setPassword('');
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return <div className="two-factor-settings loading">{t.loading}</div>;
  }

  if (showSetup) {
    return (
      <TwoFactorSetup
        onComplete={() => {
          setShowSetup(false);
          setSuccess(t.enableSuccess);
          fetchStatus();
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="two-factor-settings">
      <div className="settings-header">
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </div>

      {success && (
        <div className="success-message">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          ✗ {error}
        </div>
      )}

      <div className="settings-content">
        <div className="status-row">
          <span className="label">{t.status}</span>
          <span className={`status-badge ${status?.enabled ? 'enabled' : 'disabled'}`}>
            {status?.enabled ? t.enabled : t.disabled}
          </span>
        </div>

        {status?.enabled && (
          <div className="status-row">
            <span className="label">{t.backupCodes}</span>
            <span className="backup-count">
              {status.remainingBackupCodes} {t.remaining}
            </span>
          </div>
        )}

        {!showDisable ? (
          <div className="settings-actions">
            {!status?.enabled ? (
              <button onClick={() => setShowSetup(true)} className="btn-primary">
                {t.enableButton}
              </button>
            ) : (
              <>
                <button onClick={() => setShowDisable(true)} className="btn-danger">
                  {t.disableButton}
                </button>
                <button onClick={handleRegenerate} className="btn-outline">
                  {t.regenerateButton}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="disable-confirmation">
            <p className="warning">{t.disableWarning}</p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="input-field"
            />

            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.tokenPlaceholder}
              className="input-field"
              maxLength={6}
            />

            <div className="confirmation-actions">
              <button
                onClick={handleDisable}
                disabled={loading || !password}
                className="btn-danger"
              >
                {loading ? t.loading : t.confirmButton}
              </button>
              <button
                onClick={() => {
                  setShowDisable(false);
                  setPassword('');
                  setToken('');
                  setError('');
                }}
                className="btn-outline"
              >
                {t.cancelButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
