import React, { useState, useEffect, useCallback } from 'react';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';

// Styles
import './03_AuthPage.css';

// Context & Services
import countries from '../data/countries.json';
import authTranslations from '../data/authTranslations.json';
import { createCroppedImage, analyzeImage } from '../utils/imageUtils';

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
import OAuthButtons from '../components/auth/OAuthButtons';
import ProgressRestoration from '../components/auth/ProgressRestoration';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';

// Accessibility Components
import FormErrorAnnouncer from '../components/Accessibility/FormErrorAnnouncer';
import ButtonSpinner from '../components/Loading/ButtonSpinner';

// SEO
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

// OAuth Styles
import '../components/auth/OAuthButtons.css';

// Progress Saver
import { saveProgress, loadProgress, clearProgress, getProgressInfo } from '../utils/progressSaver';

// Main Component
export default function AuthPage() {
  const { language } = useAuth();
  const seo = useSEO('auth', {});
  const t = authTranslations[language] || authTranslations.ar;
  const isRTL = language === 'ar';
  
  // الخطوط المعتمدة حسب اللغة
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : 
                     language === 'fr' ? 'EB Garamond, serif' : 
                     'Cormorant Garamond, serif';

  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [showAgeCheck, setShowAgeCheck] = useState(true);
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false);
  const [userType, setUserType] = useState(null); // 'individual' or 'company'
  const [showProgressRestoration, setShowProgressRestoration] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for registration

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
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // موقع القص
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // معاملات القص بالبكسل
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Modal States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => setIsVisible(true), []);

  // تحميل التقدم المحفوظ عند تحميل الصفحة (Requirement 6.2)
  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      const info = getProgressInfo();
      setProgressInfo(info);
      setShowProgressRestoration(true);
      console.log('📦 Saved progress found:', info);
    }
  }, []);

  // التحقق من حالة الأذونات عند تحميل الصفحة
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await Camera.checkPermissions();
        console.log('📱 Current permissions:', permissions);
        
        if (permissions.camera === 'prompt' || permissions.photos === 'prompt') {
          console.log('ℹ️ Permissions not yet requested');
        } else if (permissions.camera === 'denied' || permissions.photos === 'denied') {
          console.warn('⚠️ Permissions previously denied');
        } else {
          console.log('✅ Permissions already granted');
        }
      } catch (error) {
        console.log('ℹ️ Running in web browser - permissions check skipped');
      }
    };
    
    checkPermissions();
  }, []);

  const handleAgeResponse = (isAbove18) => {
    console.log('👤 Age response:', isAbove18 ? 'Above 18' : 'Below 18');
    
    if (isAbove18) {
      // المستخدم فوق 18 - يدخل للتطبيق
      console.log('✅ User is above 18, allowing access');
      setShowAgeCheck(false);
    } else {
      // المستخدم تحت 18 - يظهر رسالة الوداع
      console.log('❌ User is below 18, showing goodbye message');
      setShowAgeCheck(false); // إخفاء رسالة التحقق أولاً
      setShowGoodbyeModal(true); // ثم إظهار رسالة الوداع
    }
  };

  const handleGoodbyeConfirm = async () => {
    console.log('👋 User confirmed goodbye, exiting app...');
    
    try {
      // محاولة الخروج من التطبيق على الأجهزة المحمولة
      const { App } = await import('@capacitor/app');
      await App.exitApp();
      console.log('✅ App exited successfully');
    } catch (error) {
      // في حالة المتصفح أو فشل الخروج، نعود للصفحة الرئيسية
      console.log('ℹ️ Running in browser or exit failed, redirecting to home');
      window.location.href = '/';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    // حفظ التقدم تلقائياً بعد كل تغيير (Requirement 6.1)
    if (userType) {
      const updatedData = { ...formData, [name]: value };
      saveProgress(1, { userType, ...updatedData });
    }
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
    
    // حفظ نوع المستخدم (Requirement 6.1)
    saveProgress(1, { userType: type });
  };

  const getPhoto = async (source) => {
    setShowPhotoModal(false);
    
    try {
      // طلب الأذونات أولاً
      console.log('📱 Requesting camera permissions...');
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      
      console.log('📱 Permissions status:', permissions);
      
      // التحقق من الأذونات
      if (permissions.camera === 'denied' || permissions.photos === 'denied') {
        console.error('❌ Camera permissions denied');
        setFieldErrors(prev => ({ 
          ...prev, 
          image: t.permissionDenied || 'تم رفض الإذن. يرجى السماح بالوصول للكاميرا والصور من إعدادات التطبيق.' 
        }));
        return;
      }
      
      console.log('✅ Permissions granted, opening camera...');
      
      // التقاط الصورة
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source,
        width: 1024,
        height: 1024
      });
      
      console.log('✅ Photo captured successfully');
      setTempImage(`data:image/jpeg;base64,${image.base64String}`);
      setShowCropModal(true);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      
      // معالجة الأخطاء المختلفة
      if (error.message && error.message.includes('permission')) {
        setFieldErrors(prev => ({ 
          ...prev, 
          image: t.permissionDenied || 'تم رفض الإذن. يرجى السماح بالوصول للكاميرا والصور.' 
        }));
      } else if (error.message && error.message.includes('cancel')) {
        console.log('ℹ️ User cancelled photo selection');
      } else {
        setFieldErrors(prev => ({ 
          ...prev, 
          image: t.cameraError || 'حدث خطأ أثناء التقاط الصورة. يرجى المحاولة مرة أخرى.' 
        }));
      }
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    console.log('✂️ Crop complete, pixels:', croppedPixels);
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      console.log('✂️ Cropping image...');
      const cropped = await createCroppedImage(tempImage, croppedAreaPixels);
      console.log('✅ Image cropped successfully');
      
      setTempImage(cropped);
      setShowCropModal(false);
      setShowAIAnalysis(true);
      setIsAnalyzing(true);
      setAnalysisResult(null);

      // التحليل الذكي الحقيقي
      console.log('🤖 Starting AI analysis for userType:', userType);
      const result = await analyzeImage(cropped, userType);
      console.log('🤖 AI analysis completed:', result);
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('❌ Crop error:', error);
      setFieldErrors(prev => ({ 
        ...prev, 
        image: t.cropError || 'حدث خطأ أثناء قص الصورة. يرجى المحاولة مرة أخرى.' 
      }));
      setShowCropModal(false);
    }
  };

  const handleAIAccept = () => {
    console.log('✅ User accepted AI analysis');
    setProfileImage(tempImage);
    setTempImage(null);
    setAnalysisResult(null);
    setShowAIAnalysis(false);
    if (fieldErrors.image) {
      setFieldErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleAIReject = () => {
    console.log('❌ User rejected AI analysis');
    setTempImage(null);
    setAnalysisResult(null);
    setShowAIAnalysis(false);
    
    // رسالة خطأ مخصصة بناءً على نتيجة التحليل
    let errorMessage = t.invalidImage || 'الصورة غير مناسبة. يرجى اختيار صورة أخرى.';
    if (analysisResult && !analysisResult.isValid) {
      errorMessage = analysisResult.reason;
    }
    
    setFieldErrors(prev => ({ 
      ...prev, 
      image: errorMessage
    }));
  };

  const validateForm = () => {
    const errors = {};
    // الصورة اختيارية - تم إزالة التحقق الإجباري

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
    setIsSubmitting(true);
    try {
      console.log('Registering user:', { userType, formData, profileImage });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // مسح التقدم المحفوظ بعد إكمال التسجيل (Requirement 6.5)
      clearProgress();
      console.log('🗑️ Progress cleared after successful registration');
      
      // Close confirmation popup after successful registration
      setShowConfirmPopup(false);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // استرجاع التقدم المحفوظ (Requirement 6.3)
  const handleRestoreProgress = () => {
    const savedProgress = loadProgress();
    if (savedProgress && savedProgress.data) {
      const { userType: savedUserType, ...savedData } = savedProgress.data;
      
      // استرجاع نوع المستخدم
      if (savedUserType) {
        setUserType(savedUserType);
      }
      
      // استرجاع البيانات (بدون كلمة المرور - Requirement 6.7)
      setFormData(prev => ({
        ...prev,
        ...savedData,
        password: '', // لا نسترجع كلمة المرور
        confirmPassword: '' // لا نسترجع تأكيد كلمة المرور
      }));
      
      setShowProgressRestoration(false);
      console.log('✅ Progress restored successfully');
    }
  };

  // بدء من جديد (Requirement 6.4)
  const handleStartOver = () => {
    clearProgress();
    setShowProgressRestoration(false);
    setProgressInfo(null);
    console.log('🔄 Starting over - progress cleared');
  };

  if (showAgeCheck) {
    return <AgeCheckModal t={t} onResponse={handleAgeResponse} language={language} />;
  }

  if (showGoodbyeModal) {
    return <GoodbyeModal t={t} onConfirm={handleGoodbyeConfirm} language={language} />;
  }

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1" className={`auth-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <div className="auth-page-content" style={{ fontFamily }}>

        <div className="auth-logo-container">
          <div className="auth-logo">
            <img src="/logo.jpg" alt="Careerak logo - Create your professional account" className="w-full h-full object-cover" />
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
            style={{ fontFamily }}
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
            style={{ fontFamily }}
          >
            {t.companies}
          </button>
        </div>

        {/* Progress Restoration Component */}
        {showProgressRestoration && progressInfo && (
          <ProgressRestoration
            progressInfo={progressInfo}
            onRestore={handleRestoreProgress}
            onClear={handleStartOver}
            language={language}
          />
        )}

        {userType && (
          <form onSubmit={handleRegisterClick} noValidate className="auth-form" style={{ fontFamily }}>

            {/* Error Announcer for Screen Readers */}
            <FormErrorAnnouncer errors={fieldErrors} language={language} />

            {/* OAuth Buttons - at the top */}
            <OAuthButtons mode="register" />

            <div className="auth-photo-upload-container">
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="auth-photo-upload-box"
                aria-label={language === 'ar' ? 'رفع صورة الملف الشخصي' : language === 'fr' ? 'Télécharger une photo de profil' : 'Upload profile photo'}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Your professional profile photo preview for job applications" className="auth-photo-upload-img" />
                ) : (
                  <span className="auth-photo-upload-placeholder" aria-hidden="true">📷</span>
                )}
              </button>
              <p className="auth-photo-upload-label" style={{ fontFamily }}>{t.uploadPhoto}</p>
              {fieldErrors.image && <p className="auth-input-error" style={{ fontFamily }}>{fieldErrors.image}</p>}
            </div>

            <fieldset className="auth-fieldset">
              <legend className="auth-legend" style={{ fontFamily }}>
                {t.location || 'Location'}
              </legend>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="auth-field-group">
                  <label htmlFor="country" className="auth-label" style={{ fontFamily }}>
                    {t.country}
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="auth-select-base"
                    style={{ fontFamily }}
                    aria-describedby={fieldErrors.country ? "country-error" : undefined}
                  >
                    <option value="" disabled>{t.country}</option>
                    {countries.map(c => (
                      <option key={c.key} value={c.key}>
                        {c.flag} {language === 'ar' ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.country && (
                    <p id="country-error" className="auth-input-error" style={{ fontFamily }} role="alert">
                      {fieldErrors.country}
                    </p>
                  )}
                </div>
                
                <div className="auth-field-group">
                  <label htmlFor="city" className="auth-label" style={{ fontFamily }}>
                    {t.city}
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder={t.city}
                    value={formData.city}
                    onChange={handleInputChange}
                    className="auth-input-base"
                    style={{ fontFamily }}
                    aria-describedby={fieldErrors.city ? "city-error" : undefined}
                  />
                  {fieldErrors.city && (
                    <p id="city-error" className="auth-input-error" style={{ fontFamily }} role="alert">
                      {fieldErrors.city}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {userType === 'individual' ? (
              <ComponentErrorBoundary componentName="IndividualForm">
                <IndividualForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily }} />
              </ComponentErrorBoundary>
            ) : (
              <ComponentErrorBoundary componentName="CompanyForm">
                <CompanyForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily }} />
              </ComponentErrorBoundary>
            )}

            <fieldset className="auth-fieldset">
              <legend className="auth-legend" style={{ fontFamily }}>
                {t.agreement || 'Agreement'}
              </legend>
              
              <div className="auth-checkbox-container">
                <input
                  type="checkbox"
                  id="agreePolicy"
                  checked={formData.agreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                  className="auth-checkbox"
                  aria-checked={formData.agreed}
                  aria-describedby={fieldErrors.agreed ? "agreed-error" : "policy-description"}
                />
                <label htmlFor="agreePolicy" className="auth-checkbox-label">
                  <span
                    onClick={() => setShowPolicy(true)}
                    className="auth-policy-link"
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowPolicy(true);
                      }
                    }}
                    aria-label={t.viewPolicy || 'View privacy policy'}
                  >
                    {t.agreePolicy}
                  </span>
                </label>
                <p id="policy-description" className="sr-only">
                  {t.policyDescription || 'Check this box to agree to our privacy policy and terms of service'}
                </p>
                {fieldErrors.agreed && (
                  <p id="agreed-error" className="auth-input-error" role="alert">
                    {fieldErrors.agreed}
                  </p>
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? <ButtonSpinner color="white" ariaLabel={t.loading || 'Processing...'} /> : t.register}
            </button>
          </form>
        )}

        {showPhotoModal && (
          <ComponentErrorBoundary componentName="PhotoOptionsModal">
            <PhotoOptionsModal
              t={t}
              onSelectFromGallery={() => getPhoto(CameraSource.Photos)}
              onTakePhoto={() => getPhoto(CameraSource.Camera)}
              onClose={() => setShowPhotoModal(false)}
            />
          </ComponentErrorBoundary>
        )}

        {showCropModal && (
          <ComponentErrorBoundary componentName="CropModal">
            <CropModal
              t={t}
              image={tempImage}
              crop={crop}
              setCrop={setCrop}
              onCropComplete={onCropComplete}
              onSave={handleCropSave}
              onClose={() => setShowCropModal(false)}
              language={language}
            />
          </ComponentErrorBoundary>
        )}

        {showAIAnalysis && (
          <ComponentErrorBoundary componentName="AIAnalysisModal">
            <AIAnalysisModal
              t={t}
              image={tempImage}
              onAccept={handleAIAccept}
              onReject={handleAIReject}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              userType={userType}
              language={language}
            />
          </ComponentErrorBoundary>
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
    </main>
    </>
  );
}