import React from 'react';
import countries from '../../data/countries.json';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordGenerator from './PasswordGenerator';
import EmailValidator from './EmailValidator';
import '../../pages/03_AuthPage.css';

const IndividualForm = ({ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily }) => {

  // معالج تغيير البريد الإلكتروني
  const handleEmailChange = (email) => {
    handleInputChange({ target: { name: 'email', value: email } });
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
              id="firstName"
              type="text"
              name="firstName"
              placeholder={t.firstName}
              value={formData.firstName}
              onChange={handleInputChange}
              className="auth-input-base"
              style={{ fontFamily }}
              aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
            />
            {fieldErrors.firstName && (
              <p id="firstName-error" className="auth-input-error" style={{ fontFamily }} role="alert">
                {fieldErrors.firstName}
              </p>
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
              aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
            />
            {fieldErrors.lastName && (
              <p id="lastName-error" className="auth-input-error" style={{ fontFamily }} role="alert">
                {fieldErrors.lastName}
              </p>
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
              aria-describedby={fieldErrors.gender ? "gender-error" : undefined}
            >
              <option value="" disabled>{t.gender}</option>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="preferNot">{t.preferNot}</option>
            </select>
            {fieldErrors.gender && (
              <p id="gender-error" className="auth-input-error" role="alert">
                {fieldErrors.gender}
              </p>
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
              required
              aria-describedby={fieldErrors.birthDate ? "birthDate-error" : undefined}
            />
            {fieldErrors.birthDate && (
              <p id="birthDate-error" className="auth-input-error" role="alert">
                {fieldErrors.birthDate}
              </p>
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
              <p id="education-error" className="auth-input-error" role="alert">
                {fieldErrors.education}
              </p>
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
              aria-describedby={fieldErrors.specialization ? "specialization-error" : undefined}
            />
            {fieldErrors.specialization && (
              <p id="specialization-error" className="auth-input-error" style={{ fontFamily }} role="alert">
                {fieldErrors.specialization}
              </p>
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
            aria-describedby={fieldErrors.interests ? "interests-error" : undefined}
          />
          {fieldErrors.interests && (
            <p id="interests-error" className="auth-input-error" style={{ fontFamily }} role="alert">
              {fieldErrors.interests}
            </p>
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
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            {fieldErrors.phone && (
              <p id="phone-error" className="auth-input-error" role="alert">
                {fieldErrors.phone}
              </p>
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
              <p id="email-error" className="auth-input-error" role="alert">
                {fieldErrors.email}
              </p>
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
              aria-describedby={fieldErrors.specialNeedType ? "specialNeedType-error" : undefined}
            >
              <option value="" disabled>{t.disabilityType}</option>
              <option value="visual">{t.visual}</option>
              <option value="hearing">{t.hearing}</option>
              <option value="speech">{t.speech}</option>
              <option value="mobility">{t.mobility}</option>
            </select>
            {fieldErrors.specialNeedType && (
              <p id="specialNeedType-error" className="auth-input-error" role="alert">
                {fieldErrors.specialNeedType}
              </p>
            )}
          </div>
        )}
      </fieldset>
    </>
  );
};

export default IndividualForm;
