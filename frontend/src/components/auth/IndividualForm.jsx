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
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder={t.firstName}
          value={formData.firstName}
          onChange={handleInputChange}
          className="auth-input-base"
          style={{ fontFamily }}
        />
        <input
          type="text"
          name="lastName"
          placeholder={t.lastName}
          value={formData.lastName}
          onChange={handleInputChange}
          className="auth-input-base"
          style={{ fontFamily }}
        />
      </div>
      {fieldErrors.firstName && <p className="auth-input-error" style={{ fontFamily }}>{fieldErrors.firstName}</p>}
      {fieldErrors.lastName && <p className="auth-input-error" style={{ fontFamily }}>{fieldErrors.lastName}</p>}

      <div className="grid grid-cols-2 gap-4">
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="auth-select-base"
        >
          <option value="" disabled selected>{t.gender}</option>
          <option value="male">{t.male}</option>
          <option value="female">{t.female}</option>
          <option value="preferNot">{t.preferNot}</option>
        </select>
        <input
          type="date"
          name="birthDate"
          placeholder={t.birthDatePlaceholder || t.birthDate}
          value={formData.birthDate}
          onChange={handleInputChange}
          className="auth-input-base"
          required
        />
      </div>
      {fieldErrors.gender && <p className="auth-input-error">{fieldErrors.gender}</p>}
      {fieldErrors.birthDate && <p className="auth-input-error">{fieldErrors.birthDate}</p>}

      <div className="grid grid-cols-2 gap-4">
        <select
          name="education"
          value={formData.education}
          onChange={handleInputChange}
          className="auth-select-base"
        >
          <option value="" disabled selected>{t.educationLevel}</option>
          <option value="phd">{t.phd}</option>
          <option value="masters">{t.masters}</option>
          <option value="bachelors">{t.bachelors}</option>
          <option value="highSchool">{t.highSchool}</option>
          <option value="middleSchool">{t.middleSchool}</option>
          <option value="elementary">{t.elementary}</option>
          <option value="illiterate">{t.illiterate}</option>
          <option value="uneducated">{t.uneducated}</option>
        </select>
        <input
          type="text"
          name="specialization"
          placeholder={t.specialization}
          value={formData.specialization}
          onChange={handleInputChange}
          className="auth-input-base"
        />
      </div>
      {fieldErrors.education && <p className="auth-input-error">{fieldErrors.education}</p>}
      {fieldErrors.specialization && <p className="auth-input-error">{fieldErrors.specialization}</p>}

      <input
        type="text"
        name="interests"
        placeholder={t.interests}
        value={formData.interests}
        onChange={handleInputChange}
        className="auth-input-base auth-textarea"
      />
      {fieldErrors.interests && <p className="auth-input-error">{fieldErrors.interests}</p>}

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

      {(formData.education !== 'illiterate' && formData.education !== 'uneducated') && (
        <EmailValidator
          value={formData.email}
          onChange={handleEmailChange}
          onValidation={(result) => {
            // يمكن استخدام النتيجة لتحديث حالة التحقق
            console.log('Email validation result:', result);
          }}
        />
      )}
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
            // يمكن استخدام هذا لتعطيل زر التسجيل إذا كانت كلمة المرور ضعيفة
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

      <div className="auth-checkbox-container">
        <input
          type="checkbox"
          id="specialNeeds"
          checked={formData.isSpecialNeeds}
          onChange={(e) => handleInputChange({ target: { name: 'isSpecialNeeds', value: e.target.checked } })}
          className="auth-checkbox"
        />
        <label htmlFor="specialNeeds" className="auth-checkbox-label">
          {t.disabilities}
        </label>
      </div>

      {formData.isSpecialNeeds && (
        <select
          name="specialNeedType"
          value={formData.specialNeedType}
          onChange={handleInputChange}
          className="auth-select-base"
        >
          <option value="" disabled selected>{t.disabilityType}</option>
          <option value="visual">{t.visual}</option>
          <option value="hearing">{t.hearing}</option>
          <option value="speech">{t.speech}</option>
          <option value="mobility">{t.mobility}</option>
        </select>
      )}
      {fieldErrors.specialNeedType && <p className="auth-input-error">{fieldErrors.specialNeedType}</p>}
    </>
  );
};

export default IndividualForm;
