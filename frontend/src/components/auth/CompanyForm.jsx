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
      <fieldset className="auth-fieldset">
        <legend className="auth-legend">
          {t.companyInfo || 'Company Information'}
        </legend>
        
        <div className="auth-field-group">
          <label htmlFor="companyName" className="auth-label">
            {t.companyName}
          </label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            placeholder={t.companyName}
            value={formData.companyName}
            onChange={handleInputChange}
            className="auth-input-base"
            aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
          />
          {fieldErrors.companyName && (
            <p id="companyName-error" className="auth-input-error" role="alert">
              {fieldErrors.companyName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field-group">
            <label htmlFor="industry" className="auth-label">
              {t.industry}
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="auth-select-base"
              aria-describedby={fieldErrors.industry ? "industry-error" : undefined}
            >
              <option value="" disabled>{t.industry}</option>
              <option value="industrial">{t.industrial}</option>
              <option value="commercial">{t.commercial}</option>
              <option value="service">{t.service}</option>
              <option value="educational">{t.educational}</option>
              <option value="governmental">{t.governmental}</option>
              <option value="office">{t.office}</option>
              <option value="shop">{t.shop}</option>
              <option value="workshop">{t.workshop}</option>
            </select>
            {fieldErrors.industry && (
              <p id="industry-error" className="auth-input-error" role="alert">
                {fieldErrors.industry}
              </p>
            )}
          </div>
          
          <div className="auth-field-group">
            <label htmlFor="subIndustry" className="auth-label">
              {t.specialization}
            </label>
            <input
              id="subIndustry"
              type="text"
              name="subIndustry"
              placeholder={t.specialization}
              value={formData.subIndustry}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.subIndustry ? "subIndustry-error" : undefined}
            />
            {fieldErrors.subIndustry && (
              <p id="subIndustry-error" className="auth-input-error" role="alert">
                {fieldErrors.subIndustry}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend">
          {t.authorizedPerson || 'Authorized Person'}
        </legend>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field-group">
            <label htmlFor="authorizedName" className="auth-label">
              {t.authorizedName}
            </label>
            <input
              id="authorizedName"
              type="text"
              name="authorizedName"
              placeholder={t.authorizedName}
              value={formData.authorizedName}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.authorizedName ? "authorizedName-error" : undefined}
            />
            {fieldErrors.authorizedName && (
              <p id="authorizedName-error" className="auth-input-error" role="alert">
                {fieldErrors.authorizedName}
              </p>
            )}
          </div>
          
          <div className="auth-field-group">
            <label htmlFor="authorizedPosition" className="auth-label">
              {t.authorizedPosition}
            </label>
            <input
              id="authorizedPosition"
              type="text"
              name="authorizedPosition"
              placeholder={t.authorizedPosition}
              value={formData.authorizedPosition}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.authorizedPosition ? "authorizedPosition-error" : undefined}
            />
            {fieldErrors.authorizedPosition && (
              <p id="authorizedPosition-error" className="auth-input-error" role="alert">
                {fieldErrors.authorizedPosition}
              </p>
            )}
          </div>
        </div>

        <div className="auth-field-group">
          <label htmlFor="companyKeywords" className="auth-label">
            {t.companyKeywords}
          </label>
          <input
            id="companyKeywords"
            type="text"
            name="companyKeywords"
            placeholder={t.companyKeywords}
            value={formData.companyKeywords}
            onChange={handleInputChange}
            className="auth-input-base auth-textarea"
            aria-describedby={fieldErrors.companyKeywords ? "companyKeywords-error" : undefined}
          />
          {fieldErrors.companyKeywords && (
            <p id="companyKeywords-error" className="auth-input-error" role="alert">
              {fieldErrors.companyKeywords}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend">
          {t.contactInfo || 'Contact Information'}
        </legend>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="auth-field-group">
            <label htmlFor="countryCode" className="auth-label">
              {t.countryCode}
            </label>
            <select
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="auth-select-base text-sm"
              aria-describedby={fieldErrors.countryCode ? "countryCode-error" : undefined}
            >
              <option value="" disabled>{t.countryCode}</option>
              {countries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            {fieldErrors.countryCode && (
              <p id="countryCode-error" className="auth-input-error" role="alert">
                {fieldErrors.countryCode}
              </p>
            )}
          </div>
          
          <div className="auth-field-group col-span-2">
            <label htmlFor="phone" className="auth-label">
              {t.mobile}
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder={t.mobile}
              value={formData.phone}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            {fieldErrors.phone && (
              <p id="phone-error" className="auth-input-error" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="auth-field-group">
          <label htmlFor="email" className="auth-label">
            {t.email || 'Email'}
          </label>
          <EmailValidator
            value={formData.email}
            onChange={handleEmailChange}
            onValidation={(result) => {
              console.log('Email validation result:', result);
            }}
          />
          {fieldErrors.email && (
            <p id="email-error" className="auth-input-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend">
          {t.security || 'Security'}
        </legend>
        
        <div className="auth-field-group">
          <label htmlFor="password" className="auth-label">
            {t.password}
          </label>
          <div className="auth-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t.password}
              value={formData.password}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
              aria-label={showPassword ? (t.hidePassword || 'Hide password') : (t.showPassword || 'Show password')}
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
              handleInputChange({
                target: {
                  name: 'password',
                  value: password
                }
              });
            }}
          />
          
          {fieldErrors.password && (
            <p id="password-error" className="auth-input-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="auth-field-group">
          <label htmlFor="confirmPassword" className="auth-label">
            {t.confirmPassword}
          </label>
          <div className="auth-password-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t.confirmPassword}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="auth-input-base"
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
              aria-label={showConfirmPassword ? (t.hidePassword || 'Hide password') : (t.showPassword || 'Show password')}
            >
              {showConfirmPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="auth-input-error" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </fieldset>
    </>
  );
};

export default CompanyForm;
