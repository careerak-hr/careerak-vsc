import React from 'react';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';
import PasswordGenerator from '../PasswordGenerator';
import './RegistrationSteps.css';

/**
 * Step 2: Password
 * الخطوة الثانية - كلمة المرور
 * - كلمة المرور
 * - تأكيد كلمة المرور
 * - مؤشر قوة كلمة المرور
 * - مولد كلمات المرور
 * 
 * Requirements: 5.1
 */
function Step2Password({ 
  formData, 
  handleInputChange, 
  fieldErrors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      showPassword: 'إظهار',
      hidePassword: 'إخفاء'
    },
    en: {
      password: 'Password',
      confirmPassword: 'Confirm Password',
      showPassword: 'Show',
      hidePassword: 'Hide'
    },
    fr: {
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      showPassword: 'Afficher',
      hidePassword: 'Masquer'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  return (
    <div className="registration-step" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* كلمة المرور */}
      <div className="form-field">
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder={t.password}
            value={formData.password}
            onChange={handleInputChange}
            className={`auth-input-base ${fieldErrors.password ? 'error' : ''}`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-btn"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="auth-input-error">{fieldErrors.password}</p>
        )}
        
        {/* مؤشر قوة كلمة المرور */}
        {formData.password && (
          <PasswordStrengthIndicator 
            password={formData.password}
            language={language}
          />
        )}
      </div>
      
      {/* مولد كلمات المرور */}
      <PasswordGenerator 
        onGenerate={(password) => {
          handleInputChange({ target: { name: 'password', value: password } });
          handleInputChange({ target: { name: 'confirmPassword', value: password } });
        }}
        language={language}
      />
      
      {/* تأكيد كلمة المرور */}
      <div className="form-field">
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder={t.confirmPassword}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`auth-input-base ${fieldErrors.confirmPassword ? 'error' : ''}`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle-btn"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="auth-input-error">{fieldErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}

export default Step2Password;
