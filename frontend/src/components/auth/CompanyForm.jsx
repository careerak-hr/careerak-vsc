import React from 'react';
import countries from '../../data/countries.json';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordGenerator from './PasswordGenerator';
import EmailValidator from './EmailValidator';
import '../../pages/03_AuthPage.css';

const CompanyForm = ({ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL }) => {

  // معالج تغيير البريد الإلكتروني
  const handleEmailChange = (email) => {
    handleInputChange({ target: { name: 'email', value: email } });
  };

  return (
    <>
      <input
        type="text"
        name="companyName"
        placeholder={t.companyName}
        value={formData.companyName}
        onChange={handleInputChange}
        className="auth-input-base"
      />
      {fieldErrors.companyName && <p className="auth-input-error">{fieldErrors.companyName}</p>}

      <div className="grid grid-cols-2 gap-4">
        <select
          name="industry"
          value={formData.industry}
          onChange={handleInputChange}
          className="auth-select-base"
        >
          <option value="" disabled selected>{t.industry}</option>
          <option value="industrial">{t.industrial}</option>
          <option value="commercial">{t.commercial}</option>
          <option value="service">{t.service}</option>
          <option value="educational">{t.educational}</option>
          <option value="governmental">{t.governmental}</option>
          <option value="office">{t.office}</option>
          <option value="shop">{t.shop}</option>
          <option value="workshop">{t.workshop}</option>
        </select>
        <input
          type="text"
          name="subIndustry"
          placeholder={t.specialization}
          value={formData.subIndustry}
          onChange={handleInputChange}
          className="auth-input-base"
        />
      </div>
      {fieldErrors.industry && <p className="auth-input-error">{fieldErrors.industry}</p>}
      {fieldErrors.subIndustry && <p className="auth-input-error">{fieldErrors.subIndustry}</p>}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="authorizedName"
          placeholder={t.authorizedName}
          value={formData.authorizedName}
          onChange={handleInputChange}
          className="auth-input-base"
        />
        <input
          type="text"
          name="authorizedPosition"
          placeholder={t.authorizedPosition}
          value={formData.authorizedPosition}
          onChange={handleInputChange}
          className="auth-input-base"
        />
      </div>
      {fieldErrors.authorizedName && <p className="auth-input-error">{fieldErrors.authorizedName}</p>}
      {fieldErrors.authorizedPosition && <p className="auth-input-error">{fieldErrors.authorizedPosition}</p>}

      <input
        type="text"
        name="companyKeywords"
        placeholder={t.companyKeywords}
        value={formData.companyKeywords}
        onChange={handleInputChange}
        className="auth-input-base auth-textarea"
      />
      {fieldErrors.companyKeywords && <p className="auth-input-error">{fieldErrors.companyKeywords}</p>}

      <div className="grid grid-cols-3 gap-2">
        <select
          name="countryCode"
          value={formData.countryCode}
          onChange={handleInputChange}
          className="auth-select-base text-sm"
        >
          <option value="" disabled selected>{t.countryCode}</option>
          {countries.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name="phone"
          placeholder={t.mobile}
          value={formData.phone}
          onChange={handleInputChange}
          className="auth-input-base col-span-2"
        />
      </div>
      {fieldErrors.countryCode && <p className="auth-input-error">{fieldErrors.countryCode}</p>}
      {fieldErrors.phone && <p className="auth-input-error">{fieldErrors.phone}</p>}

      <EmailValidator
        value={formData.email}
        onChange={handleEmailChange}
        onValidation={(result) => {
          // يمكن استخدام النتيجة لتحديث حالة التحقق
          console.log('Email validation result:', result);
        }}
      />
      {fieldErrors.email && <p className="auth-input-error">{fieldErrors.email}</p>}

      <div className="auth-password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder={t.password}
          value={formData.password}
          onChange={handleInputChange}
          className="auth-input-base"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
        >
          {showPassword ? '👁️' : '🙈'}
        </button>
      </div>
      {/* Password Strength Indicator */}
      {formData.password && (
        <PasswordStrengthIndicator 
          password={formData.password}
          onStrengthChange={(strength) => {
            console.log('Password strength:', strength);
          }}
        />
      )}
      {/* Password Generator */}
      <PasswordGenerator 
        onPasswordGenerated={(password) => {
          // تعبئة حقل كلمة المرور بالكلمة المولدة
          handleInputChange({
            target: {
              name: 'password',
              value: password
            }
          });
        }}
      />
      {fieldErrors.password && <p className="auth-input-error">{fieldErrors.password}</p>}

      <div className="auth-password-wrapper">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder={t.confirmPassword}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="auth-input-base"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
        >
          {showConfirmPassword ? '👁️' : '🙈'}
        </button>
      </div>
      {fieldErrors.confirmPassword && <p className="auth-input-error">{fieldErrors.confirmPassword}</p>}
    </>
  );
};

export default CompanyForm;
