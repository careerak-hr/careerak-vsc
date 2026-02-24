import React, { useEffect, useRef } from 'react';
import countries from '../../data/countries.json';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordGenerator from './PasswordGenerator';
import EmailValidator from './EmailValidator';
import EnhancedErrorMessage from './EnhancedErrorMessage';
import '../../pages/03_AuthPage.css';

const CompanyForm = ({ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, language }) => {
  // Ref للحقل الأول (Requirement 8.2)
  const firstFieldRef = useRef(null);

  // التركيز التلقائي على أول حقل عند تحميل المكون (Requirement 8.2)
  useEffect(() => {
    if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, []);

  // معالج تغيير البريد الإلكتروني
  const handleEmailChange = (email) => {
    handleInputChange({ target: { name: 'email', value: email } });
  };

  // معالج النقر على الاقتراحات
  const handleSuggestionClick = (action, fieldName) => {
    console.log('Suggestion clicked:', action, fieldName);
    
    // تنفيذ الإجراءات المختلفة
    switch (action) {
      case 'focus_field':
        // التركيز على الحقل
        const field = document.getElementById(fieldName);
        if (field) field.focus();
        break;
      
      case 'show_password':
        // إظهار كلمة المرور
        if (fieldName === 'password') setShowPassword(true);
        if (fieldName === 'confirmPassword') setShowConfirmPassword(true);
        break;
      
      case 'generate_password':
        // فتح مولد كلمة المرور (يمكن إضافة modal أو trigger)
        console.log('Generate password clicked');
        break;
      
      case 'login':
        // إعادة توجيه لصفحة تسجيل الدخول
        window.location.href = '/login';
        break;
      
      case 'forgot_password':
        // إعادة توجيه لصفحة استرجاع كلمة المرور
        window.location.href = '/forgot-password';
        break;
      
      default:
        console.log('Action not implemented:', action);
    }
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
            ref={firstFieldRef}
            id="companyName"
            type="text"
            name="companyName"
            placeholder={t.companyName}
            value={formData.companyName}
            onChange={handleInputChange}
            className="auth-input-base"
            tabIndex={0}
            aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
          />
          {fieldErrors.companyName && (
            <EnhancedErrorMessage
              error={fieldErrors.companyName}
              fieldName="companyName"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
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
              tabIndex={0}
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
              <EnhancedErrorMessage
                error={fieldErrors.industry}
                fieldName="industry"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
              tabIndex={0}
              aria-describedby={fieldErrors.subIndustry ? "subIndustry-error" : undefined}
            />
            {fieldErrors.subIndustry && (
              <EnhancedErrorMessage
                error={fieldErrors.subIndustry}
                fieldName="subIndustry"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
              tabIndex={0}
              aria-describedby={fieldErrors.authorizedName ? "authorizedName-error" : undefined}
            />
            {fieldErrors.authorizedName && (
              <EnhancedErrorMessage
                error={fieldErrors.authorizedName}
                fieldName="authorizedName"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
              tabIndex={0}
              aria-describedby={fieldErrors.authorizedPosition ? "authorizedPosition-error" : undefined}
            />
            {fieldErrors.authorizedPosition && (
              <EnhancedErrorMessage
                error={fieldErrors.authorizedPosition}
                fieldName="authorizedPosition"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
            tabIndex={0}
            aria-describedby={fieldErrors.companyKeywords ? "companyKeywords-error" : undefined}
          />
          {fieldErrors.companyKeywords && (
            <EnhancedErrorMessage
              error={fieldErrors.companyKeywords}
              fieldName="companyKeywords"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
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
              tabIndex={0}
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
              <EnhancedErrorMessage
                error={fieldErrors.countryCode}
                fieldName="countryCode"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
              tabIndex={0}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            {fieldErrors.phone && (
              <EnhancedErrorMessage
                error={fieldErrors.phone}
                fieldName="phone"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
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
            <EnhancedErrorMessage
              error={fieldErrors.email}
              fieldName="email"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
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
              tabIndex={0}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
              tabIndex={0}
              aria-label={showPassword ? (t.hidePassword || 'Hide password') : (t.showPassword || 'Show password')}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
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
            <EnhancedErrorMessage
              error={fieldErrors.password}
              fieldName="password"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
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
              tabIndex={0}
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
              tabIndex={0}
              aria-label={showConfirmPassword ? (t.hidePassword || 'Hide password') : (t.showPassword || 'Show password')}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <EnhancedErrorMessage
              error={fieldErrors.confirmPassword}
              fieldName="confirmPassword"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </div>
      </fieldset>
    </>
  );
};

export default CompanyForm;
