import React, { useState, useEffect, useCallback } from 'react';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';

// Styles
import './03_AuthPage.css';

// Context & Services
import countries from '../data/countries.json';
import authTranslations from '../data/authTranslations.json';
import { createCroppedImage } from '../utils/imageUtils';

// Modals
import AgeCheckModal from '../components/modals/AgeCheckModal';
import GoodbyeModal from '../components/modals/GoodbyeModal';
import AIAnalysisModal from '../components/modals/AIAnalysisModal';
import PhotoOptionsModal from '../components/modals/PhotoOptionsModal';
import CropModal from '../components/modals/CropModal';
import PolicyModal from '../components/modals/PolicyModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';

// Form Components
import IndividualForm from '../components/auth/IndividualForm';
import CompanyForm from '../components/auth/CompanyForm';

// Main Component
export default function AuthPage() {
  const { language } = useAuth();
  const t = authTranslations[language] || authTranslations.ar;
  const isRTL = language === 'ar';

  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [showAgeCheck, setShowAgeCheck] = useState(true);
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false);
  const [userType, setUserType] = useState(null); // 'individual' or 'company'

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    countryCode: '',
    education: '',
    specialization: '',
    interests: '',
    birthDate: '',
    gender: '',
    isSpecialNeeds: false,
    specialNeedType: '',
    industry: '',
    subIndustry: '',
    authorizedName: '',
    authorizedPosition: '',
    companyKeywords: '',
    agreed: false
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Image States
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => setIsVisible(true), []);

  const handleAgeResponse = (isAbove18) => {
    if (isAbove18) {
      setShowAgeCheck(false);
    } else {
      setShowGoodbyeModal(true);
    }
  };

  const handleGoodbyeConfirm = () => {
    window.location.href = '/';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setProfileImage(null);
    setFormData(prev => ({
      ...prev,
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      country: '',
      city: '',
      countryCode: '',
      education: '',
      specialization: '',
      interests: '',
      birthDate: '',
      gender: '',
      isSpecialNeeds: false,
      specialNeedType: '',
      industry: '',
      subIndustry: '',
      authorizedName: '',
      authorizedPosition: '',
      companyKeywords: '',
      agreed: false
    }));
    setFieldErrors({});
  };

  const getPhoto = async (source) => {
    setShowPhotoModal(false);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source
      });
      setTempImage(`data:image/jpeg;base64,${image.base64String}`);
      setShowCropModal(true);
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    const cropped = await createCroppedImage(tempImage, croppedAreaPixels);
    setTempImage(null);
    setShowCropModal(false);
    setShowAIAnalysis(true);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setProfileImage(cropped);
      setShowAIAnalysis(false);
    }, 2000);
  };

  const handleAIAccept = () => {
    setProfileImage(tempImage);
    setShowAIAnalysis(false);
  };

  const handleAIReject = () => {
    setTempImage(null);
    setShowAIAnalysis(false);
    setFieldErrors(prev => ({ ...prev, image: t.invalidImage }));
  };

  const validateForm = () => {
    const errors = {};
    if (!profileImage) errors.image = 'يرجى رفع الصورة';

    if (userType === 'individual') {
      if (!formData.firstName.trim()) errors.firstName = 'الاسم الأول مطلوب';
      if (!formData.lastName.trim()) errors.lastName = 'الاسم الأخير مطلوب';
      if (!formData.country) errors.country = 'البلد مطلوب';
      if (!formData.city.trim()) errors.city = 'المدينة مطلوبة';
      if (!formData.gender) errors.gender = 'الجنس مطلوب';
      if (!formData.birthDate) errors.birthDate = 'تاريخ الميلاد مطلوب';
      if (!formData.education) errors.education = 'المستوى العلمي مطلوب';
      if (!formData.specialization.trim()) errors.specialization = 'التخصص مطلوب';
      if (!formData.interests.trim()) errors.interests = 'الاهتمامات مطلوبة';
      if (!formData.countryCode) errors.countryCode = 'كود البلد مطلوب';
      if (!formData.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
      if (formData.education !== 'illiterate' && formData.education !== 'uneducated') {
        if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
      }
      if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
      if (!formData.confirmPassword) errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'كلمات المرور غير متطابقة';
      if (formData.isSpecialNeeds && !formData.specialNeedType) errors.specialNeedType = 'نوع الاحتياج مطلوب';
    } else if (userType === 'company') {
      if (!formData.companyName.trim()) errors.companyName = 'اسم المنشأة مطلوب';
      if (!formData.country) errors.country = 'البلد مطلوب';
      if (!formData.city.trim()) errors.city = 'المدينة مطلوبة';
      if (!formData.industry) errors.industry = 'مجال العمل مطلوب';
      if (!formData.subIndustry.trim()) errors.subIndustry = 'التخصص مطلوب';
      if (!formData.authorizedName.trim()) errors.authorizedName = 'اسم الشخص المفوض مطلوب';
      if (!formData.authorizedPosition.trim()) errors.authorizedPosition = 'وظيفة الشخص المفوض مطلوبة';
      if (!formData.companyKeywords.trim()) errors.companyKeywords = 'كلمات مفتاحية مطلوبة';
      if (!formData.countryCode) errors.countryCode = 'كود البلد مطلوب';
      if (!formData.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
      if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
      if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
      if (!formData.confirmPassword) errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (!formData.agreed) errors.agreed = 'يجب الموافقة على سياسة الخصوصية';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmPopup(true);
    }
  };

  const handleFinalRegister = async () => {
    console.log('Registering user:', { userType, formData, profileImage });
  };

  if (showAgeCheck) {
    return <AgeCheckModal t={t} onResponse={handleAgeResponse} />;
  }

  if (showGoodbyeModal) {
    return <GoodbyeModal t={t} onConfirm={handleGoodbyeConfirm} />;
  }

  return (
    <div className={`auth-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="auth-page-content">

        <div className="auth-logo-container">
          <div className="auth-logo">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="auth-user-type-selector">
          <button
            onClick={() => handleUserTypeChange('individual')}
            className={`auth-user-type-btn ${
              userType === 'individual'
                ? 'auth-user-type-btn-active'
                : 'auth-user-type-btn-inactive'
            }`}
          >
            {t.individuals}
          </button>
          <button
            onClick={() => handleUserTypeChange('company')}
            className={`auth-user-type-btn ${
              userType === 'company'
                ? 'auth-user-type-btn-active'
                : 'auth-user-type-btn-inactive'
            }`}
          >
            {t.companies}
          </button>
        </div>

        {userType && (
          <form onSubmit={handleRegisterClick} noValidate className="auth-form">

            <div className="auth-photo-upload-container">
              <div
                onClick={() => setShowPhotoModal(true)}
                className="auth-photo-upload-box"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="auth-photo-upload-img" />
                ) : (
                  <span className="auth-photo-upload-placeholder">📷</span>
                )}
              </div>
              <p className="auth-photo-upload-label">{t.uploadPhoto}</p>
              {fieldErrors.image && <p className="auth-input-error">{fieldErrors.image}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="auth-select-base"
              >
                <option value="">{t.country}</option>
                {countries.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="city"
                placeholder={t.city}
                value={formData.city}
                onChange={handleInputChange}
                className="auth-input-base"
              />
            </div>
            {fieldErrors.country && <p className="auth-input-error">{fieldErrors.country}</p>}
            {fieldErrors.city && <p className="auth-input-error">{fieldErrors.city}</p>}

            {userType === 'individual' ? (
              <IndividualForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL }} />
            ) : (
              <CompanyForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL }} />
            )}

            <div className="auth-checkbox-container">
              <input
                type="checkbox"
                id="agreePolicy"
                checked={formData.agreed}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                className="auth-checkbox"
              />
              <label htmlFor="agreePolicy" className="auth-checkbox-label">
                <span
                  onClick={() => setShowPolicy(true)}
                  className="auth-policy-link"
                >
                  {t.agreePolicy}
                </span>
              </label>
            </div>
            {fieldErrors.agreed && <p className="auth-input-error">{fieldErrors.agreed}</p>}

            <button
              type="submit"
              className="auth-submit-btn"
            >
              {t.register}
            </button>
          </form>
        )}

        {showPhotoModal && (
          <PhotoOptionsModal
            t={t}
            onSelectFromGallery={() => getPhoto(CameraSource.Photos)}
            onTakePhoto={() => getPhoto(CameraSource.Camera)}
            onClose={() => setShowPhotoModal(false)}
          />
        )}

        {showCropModal && (
          <CropModal
            t={t}
            image={tempImage}
            crop={crop}
            zoom={zoom}
            setCrop={setCrop}
            setZoom={setZoom}
            onCropComplete={onCropComplete}
            onSave={handleCropSave}
            onClose={() => setShowCropModal(false)}
          />
        )}

        {showAIAnalysis && (
          <AIAnalysisModal
            t={t}
            image={tempImage}
            onAccept={handleAIAccept}
            onReject={handleAIReject}
            isAnalyzing={isAnalyzing}
          />
        )}

        {showPolicy && (
          <PolicyModal
            onClose={() => setShowPolicy(false)}
            onAgree={() => {
              setFormData(prev => ({ ...prev, agreed: true }));
              setShowPolicy(false);
            }}
          />
        )}

        {showConfirmPopup && (
          <ConfirmationModal
            isOpen={showConfirmPopup}
            onClose={() => setShowConfirmPopup(false)}
            onConfirm={handleFinalRegister}
            message={t.confirmData}
            confirmText={t.yes}
            cancelText={t.no}
            language={language}
          />
        )}
      </div>
    </div>
  );
}