import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Modal.css';

const PasswordChangeModal = ({ onClose, onSuccess, onError }) => {
  const { language } = useApp();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    ar: {
      title: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      change: 'تغيير',
      cancel: 'إلغاء',
      show: 'إظهار',
      hide: 'إخفاء',
      passwordStrength: 'قوة كلمة المرور',
      weak: 'ضعيفة',
      fair: 'مقبولة',
      good: 'جيدة',
      strong: 'قوية',
      requirements: 'المتطلبات',
      minLength: 'على الأقل 8 أحرف',
      uppercase: 'حرف كبير واحد على الأقل',
      lowercase: 'حرف صغير واحد على الأقل',
      number: 'رقم واحد على الأقل',
      special: 'رمز خاص واحد على الأقل',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      weakPassword: 'كلمة المرور ضعيفة جداً',
      wrongPassword: 'كلمة المرور الحالية غير صحيحة',
      success: 'تم تغيير كلمة المرور بنجاح. سيتم تسجيل خروجك من الأجهزة الأخرى.',
      sessionWarning: 'سيتم تسجيل خروجك من جميع الأجهزة الأخرى',
    },
    en: {
      title: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      change: 'Change',
      cancel: 'Cancel',
      show: 'Show',
      hide: 'Hide',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
      requirements: 'Requirements',
      minLength: 'At least 8 characters',
      uppercase: 'At least one uppercase letter',
      lowercase: 'At least one lowercase letter',
      number: 'At least one number',
      special: 'At least one special character',
      passwordMismatch: 'Passwords do not match',
      weakPassword: 'Password is too weak',
      wrongPassword: 'Current password is incorrect',
      success: 'Password changed successfully. You will be logged out from other devices.',
      sessionWarning: 'You will be logged out from all other devices',
    },
    fr: {
      title: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      change: 'Changer',
      cancel: 'Annuler',
      show: 'Afficher',
      hide: 'Masquer',
      passwordStrength: 'Force du mot de passe',
      weak: 'Faible',
      fair: 'Acceptable',
      good: 'Bon',
      strong: 'Fort',
      requirements: 'Exigences',
      minLength: 'Au moins 8 caractères',
      uppercase: 'Au moins une lettre majuscule',
      lowercase: 'Au moins une lettre minuscule',
      number: 'Au moins un chiffre',
      special: 'Au moins un caractère spécial',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      weakPassword: 'Le mot de passe est trop faible',
      wrongPassword: 'Le mot de passe actuel est incorrect',
      success: 'Mot de passe changé avec succès. Vous serez déconnecté des autres appareils.',
      sessionWarning: 'Vous serez déconnecté de tous les autres appareils',
    }
  };

  const t = translations[language] || translations.en;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password strength for new password
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score++;
    else feedback.push(t.minLength);

    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push(t.uppercase);

    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push(t.lowercase);

    // Number check
    if (/[0-9]/.test(password)) score++;
    else feedback.push(t.number);

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push(t.special);

    setPasswordStrength({ score, feedback });
  };

  const getStrengthLabel = () => {
    if (passwordStrength.score <= 1) return t.weak;
    if (passwordStrength.score === 2) return t.fair;
    if (passwordStrength.score === 3) return t.good;
    return t.strong;
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 1) return '#f44336';
    if (passwordStrength.score === 2) return '#ff9800';
    if (passwordStrength.score === 3) return '#4caf50';
    return '#2e7d32';
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      onError(t.passwordMismatch);
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      onError(t.weakPassword);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t.wrongPassword);
      }

      onSuccess(t.success);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
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
          {/* Warning */}
          <div className="warning-box">
            ⚠️ {t.sessionWarning}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">
                {t.currentPassword}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                  aria-label={showPasswords.current ? t.hide : t.show}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                {t.newPassword}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                  aria-label={showPasswords.new ? t.hide : t.show}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(),
                      }}
                    />
                  </div>
                  <p className="strength-label" style={{ color: getStrengthColor() }}>
                    {t.passwordStrength}: {getStrengthLabel()}
                  </p>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="strength-feedback">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>❌ {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                {t.confirmPassword}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                  aria-label={showPasswords.confirm ? t.hide : t.show}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="requirements-box">
              <h4>{t.requirements}:</h4>
              <ul>
                <li className={formData.newPassword.length >= 8 ? 'met' : ''}>
                  {formData.newPassword.length >= 8 ? '✅' : '⭕'} {t.minLength}
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[A-Z]/.test(formData.newPassword) ? '✅' : '⭕'} {t.uppercase}
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[a-z]/.test(formData.newPassword) ? '✅' : '⭕'} {t.lowercase}
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[0-9]/.test(formData.newPassword) ? '✅' : '⭕'} {t.number}
                </li>
                <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[^A-Za-z0-9]/.test(formData.newPassword) ? '✅' : '⭕'} {t.special}
                </li>
              </ul>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                {t.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || passwordStrength.score < 3}
              >
                {isLoading ? '...' : t.change}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
