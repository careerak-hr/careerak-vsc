import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Modal.css';

const EmailChangeModal = ({ onClose, onSuccess, onError }) => {
  const { language } = useApp();
  const [step, setStep] = useState(1); // 1: Enter new email, 2: Verify old email, 3: Verify new email, 4: Confirm password
  const [formData, setFormData] = useState({
    newEmail: '',
    oldEmailOTP: '',
    newEmailOTP: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const translations = {
    ar: {
      title: 'تغيير البريد الإلكتروني',
      step1Title: 'أدخل البريد الجديد',
      step2Title: 'تحقق من البريد القديم',
      step3Title: 'تحقق من البريد الجديد',
      step4Title: 'تأكيد كلمة المرور',
      newEmail: 'البريد الإلكتروني الجديد',
      oldEmailOTP: 'رمز التحقق من البريد القديم',
      newEmailOTP: 'رمز التحقق من البريد الجديد',
      password: 'كلمة المرور',
      next: 'التالي',
      verify: 'تحقق',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      resendOTP: 'إعادة إرسال الرمز',
      resendIn: 'إعادة الإرسال بعد',
      seconds: 'ثانية',
      step1Desc: 'أدخل عنوان البريد الإلكتروني الجديد',
      step2Desc: 'أدخل رمز التحقق المرسل إلى بريدك القديم',
      step3Desc: 'أدخل رمز التحقق المرسل إلى بريدك الجديد',
      step4Desc: 'أدخل كلمة المرور لتأكيد التغيير',
      emailInUse: 'البريد الإلكتروني مستخدم بالفعل',
      invalidOTP: 'رمز التحقق غير صحيح',
      invalidPassword: 'كلمة المرور غير صحيحة',
      success: 'تم تغيير البريد الإلكتروني بنجاح',
    },
    en: {
      title: 'Change Email',
      step1Title: 'Enter New Email',
      step2Title: 'Verify Old Email',
      step3Title: 'Verify New Email',
      step4Title: 'Confirm Password',
      newEmail: 'New Email',
      oldEmailOTP: 'Old Email OTP',
      newEmailOTP: 'New Email OTP',
      password: 'Password',
      next: 'Next',
      verify: 'Verify',
      confirm: 'Confirm',
      cancel: 'Cancel',
      resendOTP: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      step1Desc: 'Enter your new email address',
      step2Desc: 'Enter the verification code sent to your old email',
      step3Desc: 'Enter the verification code sent to your new email',
      step4Desc: 'Enter your password to confirm the change',
      emailInUse: 'Email already in use',
      invalidOTP: 'Invalid verification code',
      invalidPassword: 'Invalid password',
      success: 'Email changed successfully',
    },
    fr: {
      title: 'Changer l\'email',
      step1Title: 'Entrez le nouvel email',
      step2Title: 'Vérifier l\'ancien email',
      step3Title: 'Vérifier le nouvel email',
      step4Title: 'Confirmer le mot de passe',
      newEmail: 'Nouvel email',
      oldEmailOTP: 'Code de l\'ancien email',
      newEmailOTP: 'Code du nouvel email',
      password: 'Mot de passe',
      next: 'Suivant',
      verify: 'Vérifier',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      resendOTP: 'Renvoyer le code',
      resendIn: 'Renvoyer dans',
      seconds: 'secondes',
      step1Desc: 'Entrez votre nouvelle adresse email',
      step2Desc: 'Entrez le code envoyé à votre ancien email',
      step3Desc: 'Entrez le code envoyé à votre nouvel email',
      step4Desc: 'Entrez votre mot de passe pour confirmer',
      emailInUse: 'Email déjà utilisé',
      invalidOTP: 'Code de vérification invalide',
      invalidPassword: 'Mot de passe invalide',
      success: 'Email changé avec succès',
    }
  };

  const t = translations[language] || translations.en;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/email/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newEmail: formData.newEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t.emailInUse);
      }

      startCountdown();
      setStep(2);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/email/verify-old', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ otp: formData.oldEmailOTP }),
      });

      if (!response.ok) {
        throw new Error(t.invalidOTP);
      }

      startCountdown();
      setStep(3);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/email/verify-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ otp: formData.newEmailOTP }),
      });

      if (!response.ok) {
        throw new Error(t.invalidOTP);
      }

      setStep(4);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          oldEmailOTP: formData.oldEmailOTP,
          newEmailOTP: formData.newEmailOTP,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error(t.invalidPassword);
      }

      onSuccess(t.success);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      await fetch('/api/settings/email/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ step }),
      });
      startCountdown();
    } catch (error) {
      onError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return t.step1Title;
      case 2: return t.step2Title;
      case 3: return t.step3Title;
      case 4: return t.step4Title;
      default: return t.title;
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return t.step1Desc;
      case 2: return t.step2Desc;
      case 3: return t.step3Desc;
      case 4: return t.step4Desc;
      default: return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-title" aria-modal="true">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{t.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`progress-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}
              >
                {s}
              </div>
            ))}
          </div>

          <h3 className="step-title">{getStepTitle()}</h3>
          <p className="step-description">{getStepDescription()}</p>

          {/* Step 1: Enter New Email */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="form-group">
                <label htmlFor="newEmail" className="form-label">{t.newEmail}</label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.next}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verify Old Email */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="form-group">
                <label htmlFor="oldEmailOTP" className="form-label">{t.oldEmailOTP}</label>
                <input
                  type="text"
                  id="oldEmailOTP"
                  name="oldEmailOTP"
                  value={formData.oldEmailOTP}
                  onChange={handleInputChange}
                  className="form-input"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              {countdown > 0 ? (
                <p className="resend-info">{t.resendIn} {countdown} {t.seconds}</p>
              ) : (
                <button type="button" onClick={handleResendOTP} className="resend-btn">
                  {t.resendOTP}
                </button>
              )}
              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.verify}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Verify New Email */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit}>
              <div className="form-group">
                <label htmlFor="newEmailOTP" className="form-label">{t.newEmailOTP}</label>
                <input
                  type="text"
                  id="newEmailOTP"
                  name="newEmailOTP"
                  value={formData.newEmailOTP}
                  onChange={handleInputChange}
                  className="form-input"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              {countdown > 0 ? (
                <p className="resend-info">{t.resendIn} {countdown} {t.seconds}</p>
              ) : (
                <button type="button" onClick={handleResendOTP} className="resend-btn">
                  {t.resendOTP}
                </button>
              )}
              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.verify}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Confirm Password */}
          {step === 4 && (
            <form onSubmit={handleStep4Submit}>
              <div className="form-group">
                <label htmlFor="password" className="form-label">{t.password}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.confirm}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailChangeModal;
