import React, { useEffect, useRef } from 'react';
import countries from '../../data/countries.json';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordGenerator from './PasswordGenerator';
import EmailValidator from './EmailValidator';
import EnhancedErrorMessage from './EnhancedErrorMessage';
import '../../pages/03_AuthPage.css';

const IndividualForm = ({ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily, language }) => {
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
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.personalInfo || 'Personal Information'}
        </legend>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field-group">
            <label htmlFor="firstName" className="auth-label" style={{ fontFamily }}>
              {t.firstName}
            </label>
            <input
              ref={firstFieldRef}
              id="firstName"
              type="text"
              name="firstName"
              placeholder={t.firstName}
              value={formData.firstName}
              onChange={handleInputChange}
              className="auth-input-base"
              style={{ fontFamily }}
              tabIndex={0}
              aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
            />
            {fieldErrors.firstName && (
              <EnhancedErrorMessage
                error={fieldErrors.firstName}
                fieldName="firstName"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
          
          <div className="auth-field-group">
            <label htmlFor="lastName" className="auth-label" style={{ fontFamily }}>
              {t.lastName}
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              placeholder={t.lastName}
              value={formData.lastName}
              onChange={handleInputChange}
              className="auth-input-base"
              style={{ fontFamily }}
              tabIndex={0}
              aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
            />
            {fieldErrors.lastName && (
              <EnhancedErrorMessage
                error={fieldErrors.lastName}
                fieldName="lastName"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.demographics || 'Demographics'}
        </legend>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field-group">
            <label htmlFor="gender" className="auth-label" style={{ fontFamily }}>
              {t.gender}
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="auth-select-base"
              tabIndex={0}
              aria-describedby={fieldErrors.gender ? "gender-error" : undefined}
            >
              <option value="" disabled>{t.gender}</option>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="preferNot">{t.preferNot}</option>
            </select>
            {fieldErrors.gender && (
              <EnhancedErrorMessage
                error={fieldErrors.gender}
                fieldName="gender"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
          
          <div className="auth-field-group">
            <label htmlFor="birthDate" className="auth-label" style={{ fontFamily }}>
              {t.birthDate}
            </label>
            <input
              id="birthDate"
              type="date"
              name="birthDate"
              placeholder={t.birthDatePlaceholder || t.birthDate}
              value={formData.birthDate}
              onChange={handleInputChange}
              className="auth-input-base"
              tabIndex={0}
              required
              aria-describedby={fieldErrors.birthDate ? "birthDate-error" : undefined}
            />
            {fieldErrors.birthDate && (
              <EnhancedErrorMessage
                error={fieldErrors.birthDate}
                fieldName="birthDate"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.education || 'Education & Skills'}
        </legend>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field-group">
            <label htmlFor="education" className="auth-label" style={{ fontFamily }}>
              {t.educationLevel}
            </label>
            <select
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="auth-select-base"
              tabIndex={0}
              aria-describedby={fieldErrors.education ? "education-error" : undefined}
            >
              <option value="" disabled>{t.educationLevel}</option>
              <option value="phd">{t.phd}</option>
              <option value="masters">{t.masters}</option>
              <option value="bachelors">{t.bachelors}</option>
              <option value="highSchool">{t.highSchool}</option>
              <option value="middleSchool">{t.middleSchool}</option>
              <option value="elementary">{t.elementary}</option>
              <option value="illiterate">{t.illiterate}</option>
              <option value="uneducated">{t.uneducated}</option>
            </select>
            {fieldErrors.education && (
              <EnhancedErrorMessage
                error={fieldErrors.education}
                fieldName="education"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
          
          <div className="auth-field-group">
            <label htmlFor="specialization" className="auth-label" style={{ fontFamily }}>
              {t.specialization}
            </label>
            <input
              id="specialization"
              type="text"
              name="specialization"
              placeholder={t.specialization}
              value={formData.specialization}
              onChange={handleInputChange}
              className="auth-input-base"
              tabIndex={0}
              aria-describedby={fieldErrors.specialization ? "specialization-error" : undefined}
            />
            {fieldErrors.specialization && (
              <EnhancedErrorMessage
                error={fieldErrors.specialization}
                fieldName="specialization"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
        </div>

        <div className="auth-field-group">
          <label htmlFor="interests" className="auth-label" style={{ fontFamily }}>
            {t.interests}
          </label>
          <input
            id="interests"
            type="text"
            name="interests"
            placeholder={t.interests}
            value={formData.interests}
            onChange={handleInputChange}
            className="auth-input-base auth-textarea"
            tabIndex={0}
            aria-describedby={fieldErrors.interests ? "interests-error" : undefined}
          />
          {fieldErrors.interests && (
            <EnhancedErrorMessage
              error={fieldErrors.interests}
              fieldName="interests"
              language={language || 'ar'}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </div>
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.contactInfo || 'Contact Information'}
        </legend>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="auth-field-group">
            <label htmlFor="countryCode" className="auth-label" style={{ fontFamily }}>
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
            <label htmlFor="phone" className="auth-label" style={{ fontFamily }}>
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

        {(formData.education !== 'illiterate' && formData.education !== 'uneducated') && (
          <div className="auth-field-group">
            <label htmlFor="email" className="auth-label" style={{ fontFamily }}>
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
        )}
      </fieldset>

      <fieldset className="auth-fieldset">
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.security || 'Security'}
        </legend>
        
        <div className="auth-field-group">
          <label htmlFor="password" className="auth-label" style={{ fontFamily }}>
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
          <label htmlFor="confirmPassword" className="auth-label" style={{ fontFamily }}>
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

      <fieldset className="auth-fieldset">
        <legend className="auth-legend" style={{ fontFamily }}>
          {t.accessibility || 'Accessibility'}
        </legend>
        
        <div className="auth-checkbox-container">
          <input
            type="checkbox"
            id="specialNeeds"
            checked={formData.isSpecialNeeds}
            onChange={(e) => handleInputChange({ target: { name: 'isSpecialNeeds', value: e.target.checked } })}
            className="auth-checkbox"
            tabIndex={0}
            aria-checked={formData.isSpecialNeeds}
            aria-describedby="specialNeeds-description"
          />
          <label htmlFor="specialNeeds" className="auth-checkbox-label">
            {t.disabilities}
          </label>
          <p id="specialNeeds-description" className="sr-only">
            {t.disabilitiesDescription || 'Check this if you have any special accessibility needs'}
          </p>
        </div>

        {formData.isSpecialNeeds && (
          <div className="auth-field-group">
            <label htmlFor="specialNeedType" className="auth-label" style={{ fontFamily }}>
              {t.disabilityType}
            </label>
            <select
              id="specialNeedType"
              name="specialNeedType"
              value={formData.specialNeedType}
              onChange={handleInputChange}
              className="auth-select-base"
              tabIndex={0}
              aria-describedby={fieldErrors.specialNeedType ? "specialNeedType-error" : undefined}
            >
              <option value="" disabled>{t.disabilityType}</option>
              <option value="visual">{t.visual}</option>
              <option value="hearing">{t.hearing}</option>
              <option value="speech">{t.speech}</option>
              <option value="mobility">{t.mobility}</option>
            </select>
            {fieldErrors.specialNeedType && (
              <EnhancedErrorMessage
                error={fieldErrors.specialNeedType}
                fieldName="specialNeedType"
                language={language || 'ar'}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
        )}
      </fieldset>
    </>
  );
};

export default IndividualForm;
