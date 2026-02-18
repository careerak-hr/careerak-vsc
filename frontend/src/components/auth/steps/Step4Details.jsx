import React from 'react';
import countries from '../../../data/countries.json';
import './RegistrationSteps.css';

/**
 * Step 4: Details
 * الخطوة الرابعة - التفاصيل الإضافية (اختيارية)
 * - الصورة الشخصية
 * - المدينة
 * - المجال/التخصص
 * 
 * Requirements: 5.1
 */
function Step4Details({ 
  formData, 
  handleInputChange, 
  fieldErrors,
  profileImage,
  onPhotoClick,
  userType,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      title: 'التفاصيل الإضافية (اختياري)',
      uploadPhoto: 'إضافة صورة شخصية',
      country: 'البلد',
      city: 'المدينة',
      specialization: 'التخصص',
      interests: 'الاهتمامات',
      industry: 'مجال العمل',
      subIndustry: 'التخصص',
      phone: 'رقم الهاتف',
      countryCode: 'كود البلد',
      optional: '(اختياري)'
    },
    en: {
      title: 'Additional Details (Optional)',
      uploadPhoto: 'Add Profile Photo',
      country: 'Country',
      city: 'City',
      specialization: 'Specialization',
      interests: 'Interests',
      industry: 'Industry',
      subIndustry: 'Sub-Industry',
      phone: 'Phone Number',
      countryCode: 'Country Code',
      optional: '(Optional)'
    },
    fr: {
      title: 'Détails supplémentaires (Facultatif)',
      uploadPhoto: 'Ajouter une photo de profil',
      country: 'Pays',
      city: 'Ville',
      specialization: 'Spécialisation',
      interests: 'Intérêts',
      industry: 'Industrie',
      subIndustry: 'Sous-industrie',
      phone: 'Numéro de téléphone',
      countryCode: 'Code pays',
      optional: '(Facultatif)'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  return (
    <div className="registration-step" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="step-title">{t.title}</h3>
      
      {/* الصورة الشخصية */}
      <div className="form-field">
        <div
          onClick={onPhotoClick}
          className="auth-photo-upload-box"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="auth-photo-upload-img" />
          ) : (
            <span className="auth-photo-upload-placeholder">📷</span>
          )}
        </div>
        <p className="auth-photo-upload-label">{t.uploadPhoto} {t.optional}</p>
        {fieldErrors.image && <p className="auth-input-error">{fieldErrors.image}</p>}
      </div>
      
      {/* البلد والمدينة */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-field">
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`auth-select-base ${fieldErrors.country ? 'error' : ''}`}
          >
            <option value="" disabled>{t.country}</option>
            {countries.map(c => (
              <option key={c.key} value={c.key}>
                {c.flag} {language === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
          {fieldErrors.country && (
            <p className="auth-input-error">{fieldErrors.country}</p>
          )}
        </div>
        
        <div className="form-field">
          <input
            type="text"
            name="city"
            placeholder={t.city}
            value={formData.city}
            onChange={handleInputChange}
            className={`auth-input-base ${fieldErrors.city ? 'error' : ''}`}
          />
          {fieldErrors.city && (
            <p className="auth-input-error">{fieldErrors.city}</p>
          )}
        </div>
      </div>
      
      {/* حقول خاصة بالأفراد */}
      {userType === 'individual' && (
        <>
          <div className="form-field">
            <input
              type="text"
              name="specialization"
              placeholder={t.specialization}
              value={formData.specialization}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.specialization ? 'error' : ''}`}
            />
            {fieldErrors.specialization && (
              <p className="auth-input-error">{fieldErrors.specialization}</p>
            )}
          </div>
          
          <div className="form-field">
            <input
              type="text"
              name="interests"
              placeholder={t.interests}
              value={formData.interests}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.interests ? 'error' : ''}`}
            />
            {fieldErrors.interests && (
              <p className="auth-input-error">{fieldErrors.interests}</p>
            )}
          </div>
        </>
      )}
      
      {/* حقول خاصة بالشركات */}
      {userType === 'company' && (
        <>
          <div className="form-field">
            <input
              type="text"
              name="industry"
              placeholder={t.industry}
              value={formData.industry}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.industry ? 'error' : ''}`}
            />
            {fieldErrors.industry && (
              <p className="auth-input-error">{fieldErrors.industry}</p>
            )}
          </div>
          
          <div className="form-field">
            <input
              type="text"
              name="subIndustry"
              placeholder={t.subIndustry}
              value={formData.subIndustry}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.subIndustry ? 'error' : ''}`}
            />
            {fieldErrors.subIndustry && (
              <p className="auth-input-error">{fieldErrors.subIndustry}</p>
            )}
          </div>
        </>
      )}
      
      {/* رقم الهاتف */}
      <div className="grid grid-cols-3 gap-4">
        <div className="form-field">
          <input
            type="text"
            name="countryCode"
            placeholder={t.countryCode}
            value={formData.countryCode}
            onChange={handleInputChange}
            className={`auth-input-base ${fieldErrors.countryCode ? 'error' : ''}`}
          />
          {fieldErrors.countryCode && (
            <p className="auth-input-error">{fieldErrors.countryCode}</p>
          )}
        </div>
        
        <div className="form-field col-span-2">
          <input
            type="tel"
            name="phone"
            placeholder={t.phone}
            value={formData.phone}
            onChange={handleInputChange}
            className={`auth-input-base ${fieldErrors.phone ? 'error' : ''}`}
          />
          {fieldErrors.phone && (
            <p className="auth-input-error">{fieldErrors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step4Details;
