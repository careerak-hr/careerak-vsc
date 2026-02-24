import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TwoFactorSetup.css';

/**
 * مكون إعداد المصادقة الثنائية (2FA)
 * يسمح للمستخدم بتفعيل 2FA عن طريق مسح QR code
 */
const TwoFactorSetup = ({ onComplete, onCancel }) => {
  const { language } = useApp();
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Backup Codes
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    ar: {
      title: 'إعداد المصادقة الثنائية',
      step1Title: 'الخطوة 1: مسح رمز QR',
      step1Desc: 'استخدم تطبيق المصادقة (مثل Google Authenticator أو Authy) لمسح رمز QR أدناه',
      manualEntry: 'أو أدخل المفتاح يدوياً:',
      step2Title: 'الخطوة 2: التحقق',
      step2Desc: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة',
      tokenPlaceholder: 'أدخل الرمز (6 أرقام)',
      step3Title: 'الخطوة 3: احفظ الرموز الاحتياطية',
      step3Desc: 'احفظ هذه الرموز في مكان آمن. يمكنك استخدامها لتسجيل الدخول إذا فقدت جهازك',
      backupCodesWarning: 'لن تتمكن من رؤية هذه الرموز مرة أخرى!',
      setupButton: 'إعداد 2FA',
      verifyButton: 'تحقق',
      completeButton: 'اكتمل',
      cancelButton: 'إلغاء',
      copyButton: 'نسخ',
      copiedButton: 'تم النسخ!',
      downloadButton: 'تحميل',
      loading: 'جاري التحميل...',
      errorOccurred: 'حدث خطأ. حاول مرة أخرى',
      invalidToken: 'الرمز غير صحيح',
      setupSuccess: 'تم تفعيل المصادقة الثنائية بنجاح!'
    },
    en: {
      title: 'Two-Factor Authentication Setup',
      step1Title: 'Step 1: Scan QR Code',
      step1Desc: 'Use an authenticator app (like Google Authenticator or Authy) to scan the QR code below',
      manualEntry: 'Or enter the key manually:',
      step2Title: 'Step 2: Verify',
      step2Desc: 'Enter the 6-digit code from your authenticator app',
      tokenPlaceholder: 'Enter code (6 digits)',
      step3Title: 'Step 3: Save Backup Codes',
      step3Desc: 'Save these codes in a safe place. You can use them to log in if you lose your device',
      backupCodesWarning: 'You will not be able to see these codes again!',
      setupButton: 'Setup 2FA',
      verifyButton: 'Verify',
      completeButton: 'Complete',
      cancelButton: 'Cancel',
      copyButton: 'Copy',
      copiedButton: 'Copied!',
      downloadButton: 'Download',
      loading: 'Loading...',
      errorOccurred: 'An error occurred. Try again',
      invalidToken: 'Invalid code',
      setupSuccess: 'Two-factor authentication enabled successfully!'
    },
    fr: {
      title: 'Configuration de l\'authentification à deux facteurs',
      step1Title: 'Étape 1: Scanner le code QR',
      step1Desc: 'Utilisez une application d\'authentification (comme Google Authenticator ou Authy) pour scanner le code QR ci-dessous',
      manualEntry: 'Ou entrez la clé manuellement:',
      step2Title: 'Étape 2: Vérifier',
      step2Desc: 'Entrez le code à 6 chiffres de votre application d\'authentification',
      tokenPlaceholder: 'Entrez le code (6 chiffres)',
      step3Title: 'Étape 3: Enregistrer les codes de secours',
      step3Desc: 'Enregistrez ces codes dans un endroit sûr. Vous pouvez les utiliser pour vous connecter si vous perdez votre appareil',
      backupCodesWarning: 'Vous ne pourrez plus voir ces codes!',
      setupButton: 'Configurer 2FA',
      verifyButton: 'Vérifier',
      completeButton: 'Terminé',
      cancelButton: 'Annuler',
      copyButton: 'Copier',
      copiedButton: 'Copié!',
      downloadButton: 'Télécharger',
      loading: 'Chargement...',
      errorOccurred: 'Une erreur s\'est produite. Réessayez',
      invalidToken: 'Code invalide',
      setupSuccess: 'Authentification à deux facteurs activée avec succès!'
    }
  };

  const t = translations[language] || translations.ar;

  // الخطوة 1: إعداد 2FA وتوليد QR code
  const handleSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.errorOccurred);
      }

      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // الخطوة 2: التحقق من الرمز وتفعيل 2FA
  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError(t.invalidToken);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.invalidToken);
      }

      setBackupCodes(data.data.backupCodes);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // نسخ الرموز الاحتياطية
  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
  };

  // تحميل الرموز الاحتياطية كملف
  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careerak-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="two-factor-setup">
      <div className="two-factor-setup-header">
        <h2>{t.title}</h2>
      </div>

      <div className="two-factor-setup-content">
        {/* الخطوة 1: مسح QR code */}
        {step === 1 && (
          <div className="setup-step">
            <h3>{t.step1Title}</h3>
            <p>{t.step1Desc}</p>

            <div className="setup-actions">
              <button
                onClick={handleSetup}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? t.loading : t.setupButton}
              </button>
              <button onClick={onCancel} className="btn-outline">
                {t.cancelButton}
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 2: التحقق */}
        {step === 2 && (
          <div className="setup-step">
            <h3>{t.step2Title}</h3>
            
            {qrCode && (
              <div className="qr-code-container">
                <img src={qrCode} alt="QR Code" className="qr-code" />
              </div>
            )}

            <div className="manual-entry">
              <p>{t.manualEntry}</p>
              <code className="secret-key">{secret}</code>
            </div>

            <p className="verify-desc">{t.step2Desc}</p>

            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.tokenPlaceholder}
              className="token-input"
              maxLength={6}
            />

            {error && <p className="error-message">{error}</p>}

            <div className="setup-actions">
              <button
                onClick={handleVerify}
                disabled={loading || token.length !== 6}
                className="btn-primary"
              >
                {loading ? t.loading : t.verifyButton}
              </button>
              <button onClick={onCancel} className="btn-outline">
                {t.cancelButton}
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 3: الرموز الاحتياطية */}
        {step === 3 && (
          <div className="setup-step">
            <h3>{t.step3Title}</h3>
            <p>{t.step3Desc}</p>

            <div className="backup-codes-warning">
              ⚠️ {t.backupCodesWarning}
            </div>

            <div className="backup-codes-container">
              {backupCodes.map((code, index) => (
                <div key={index} className="backup-code">
                  {code}
                </div>
              ))}
            </div>

            <div className="backup-codes-actions">
              <button onClick={handleCopyBackupCodes} className="btn-outline">
                📋 {t.copyButton}
              </button>
              <button onClick={handleDownloadBackupCodes} className="btn-outline">
                💾 {t.downloadButton}
              </button>
            </div>

            <div className="setup-actions">
              <button onClick={onComplete} className="btn-primary">
                ✓ {t.completeButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
