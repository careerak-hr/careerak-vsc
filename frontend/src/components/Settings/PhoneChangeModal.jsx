import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Modal.css';

const PhoneChangeModal = ({ onClose, onSuccess, onError }) => {
  const { language } = useApp();
  const [step, setStep] = useState(1); // 1: Enter new phone, 2: Verify OTP
  const [formData, setFormData] = useState({
    newPhone: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const translations = {
    ar: {
      title: 'تغيير رقم الهاتف',
      step1Title: 'أدخل الرقم الجديد',
      step2Title: 'تحقق من الرقم',
      newPhone: 'رقم الهاتف الجديد',
      otp: 'رمز التحقق',
      next: 'التالي',
      verify: 'تحقق',
      cancel: 'إلغاء',
      resendOTP: 'إعادة إرسال الرمز',
      resendIn: 'إعادة الإرسال بعد',
      seconds: 'ثانية',
      step1Desc: 'أدخل رقم الهاتف الجديد',
      step2Desc: 'أدخل رمز التحقق المرسل إلى رقمك الجديد',
      phoneInUse: 'رقم الهاتف مستخدم بالفعل',
      invalidOTP: 'رمز التحقق غير صحيح',
      success: 'تم تغيير رقم الهاتف بنجاح',
      phonePlaceholder: '+966xxxxxxxxx',
    },
    en: {
      title: 'Change Phone Number',
      step1Title: 'Enter New Phone',
      step2Title: 'Verify Phone',
      newPhone: 'New Phone Number',
      otp: 'Verification Code',
      next: 'Next',
      verify: 'Verify',
      cancel: 'Cancel',
      resendOTP: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      step1Desc: 'Enter your new phone number',
      step2Desc: 'Enter the verification code sent to your new phone',
      phoneInUse: 'Phone number already in use',
      invalidOTP: 'Invalid verification code',
      success: 'Phone number changed successfully',
      phonePlaceholder: '+966xxxxxxxxx',
    },
    fr: {
      title: 'Changer le numéro de téléphone',
      step1Title: 'Entrez le nouveau numéro',
      step2Title: 'Vérifier le numéro',
      newPhone: 'Nouveau numéro de téléphone',
      otp: 'Code de vérification',
      next: 'Suivant',
      verify: 'Vérifier',
      cancel: 'Annuler',
      resendOTP: 'Renvoyer le code',
      resendIn: 'Renvoyer dans',
      seconds: 'secondes',
      step1Desc: 'Entrez votre nouveau numéro de téléphone',
      step2Desc: 'Entrez le code envoyé à votre nouveau numéro',
      phoneInUse: 'Numéro de téléphone déjà utilisé',
      invalidOTP: 'Code de vérification invalide',
      success: 'Numéro de téléphone changé avec succès',
      phonePlaceholder: '+966xxxxxxxxx',
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
      const response = await fetch('/api/settings/phone/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPhone: formData.newPhone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t.phoneInUse);
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
      const response = await fetch('/api/settings/phone/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          newPhone: formData.newPhone,
          otp: formData.otp,
        }),
      });

      if (!response.ok) {
        throw new Error(t.invalidOTP);
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
      await fetch('/api/settings/phone/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ phone: formData.newPhone }),
      });
      startCountdown();
    } catch (error) {
      onError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    return step === 1 ? t.step1Title : t.step2Title;
  };

  const getStepDescription = () => {
    return step === 1 ? t.step1Desc : t.step2Desc;
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
            {[1, 2].map((s) => (
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

          {/* Step 1: Enter New Phone */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="form-group">
                <label htmlFor="newPhone" className="form-label">{t.newPhone}</label>
                <input
                  type="tel"
                  id="newPhone"
                  name="newPhone"
                  value={formData.newPhone}
                  onChange={handleInputChange}
                  placeholder={t.phonePlaceholder}
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

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">{t.otp}</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
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
        </div>
      </div>
    </div>
  );
};

export default PhoneChangeModal;
