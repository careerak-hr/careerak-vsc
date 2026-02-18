import React from 'react';
import './RegistrationSteps.css';

/**
 * Step 1: BasicInfo
 * الخطوة الأولى - المعلومات الأساسية
 * - الاسم (للأفراد) أو اسم المنشأة (للشركات)
 * - البريد الإلكتروني
 * 
 * Requirements: 5.1
 */
function Step1BasicInfo({ 
  formData, 
  handleInputChange, 
  fieldErrors, 
  userType,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      companyName: 'اسم المنشأة',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'example@email.com'
    },
    en: {
      firstName: 'First Name',
      lastName: 'Last Name',
      companyName: 'Company Name',
      email: 'Email',
      emailPlaceholder: 'example@email.com'
    },
    fr: {
      firstName: 'Prénom',
      lastName: 'Nom',
      companyName: 'Nom de l\'entreprise',
      email: 'Email',
      emailPlaceholder: 'exemple@email.com'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  return (
    <div className="registration-step" dir={isRTL ? 'rtl' : 'ltr'}>
      {userType === 'individual' ? (
        <>
          {/* الاسم الأول */}
          <div className="form-field">
            <input
              type="text"
              name="firstName"
              placeholder={t.firstName}
              value={formData.firstName}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.firstName ? 'error' : ''}`}
            />
            {fieldErrors.firstName && (
              <p className="auth-input-error">{fieldErrors.firstName}</p>
            )}
          </div>
          
          {/* الاسم الأخير */}
          <div className="form-field">
            <input
              type="text"
              name="lastName"
              placeholder={t.lastName}
              value={formData.lastName}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.lastName ? 'error' : ''}`}
            />
            {fieldErrors.lastName && (
              <p className="auth-input-error">{fieldErrors.lastName}</p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* اسم المنشأة */}
          <div className="form-field">
            <input
              type="text"
              name="companyName"
              placeholder={t.companyName}
              value={formData.companyName}
              onChange={handleInputChange}
              className={`auth-input-base ${fieldErrors.companyName ? 'error' : ''}`}
            />
            {fieldErrors.companyName && (
              <p className="auth-input-error">{fieldErrors.companyName}</p>
            )}
          </div>
        </>
      )}
      
      {/* البريد الإلكتروني */}
      <div className="form-field">
        <input
          type="email"
          name="email"
          placeholder={t.email}
          value={formData.email}
          onChange={handleInputChange}
          className={`auth-input-base ${fieldErrors.email ? 'error' : ''}`}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p className="auth-input-error">{fieldErrors.email}</p>
        )}
      </div>
    </div>
  );
}

export default Step1BasicInfo;
