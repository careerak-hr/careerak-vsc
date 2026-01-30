import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import { PremiumCheckbox } from '../components/LuxuryCheckbox';

// Context & Services
import countries from '../data/countries.json';

// Styles
import '../styles/authPageStyles.css';

// Modals
import PolicyModal from '../components/modals/PolicyModal';
import PhotoOptionsModal from '../components/modals/PhotoOptionsModal';
import CropModal from '../components/modals/CropModal';

// Create cropped image utility
const createCroppedImage = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const SIZE = 256;
      canvas.width = SIZE;
      canvas.height = SIZE;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        SIZE,
        SIZE
      );

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

// AI Image Analysis Simulation
const analyzeImage = async (imageData, userType) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, randomly accept/reject images
  // In real implementation, this would call actual AI service
  const isValid = Math.random() > 0.3; // 70% acceptance rate
  
  return {
    isValid,
    message: isValid ? 'Image accepted' : 'Invalid image for selected user type'
  };
};

// Main Component
export default function AuthPage() {
  const navigate = useNavigate();
  const { language, login: performLogin } = useAuth();
  const t = useTranslate();
  const isRTL = language === 'ar';

  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [userType, setUserType] = useState(null); // 'individual' or 'company'
  const [showForm, setShowForm] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const [crop, setCrop] = useState({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    console.log("AuthPage loaded - music should continue from LoginPage");
  }, []);

  useEffect(() => {
    const updateSelectColors = () => {
      const selectElements = document.querySelectorAll('.auth-select');
      selectElements.forEach(select => {
        if (!select.value || select.value === '') {
          select.style.color = '#9CA3AF';
        } else {
          select.style.color = '#304B60';
        }
      });
    };
    updateSelectColors();
    const timeoutId = setTimeout(updateSelectColors, 100);
    return () => clearTimeout(timeoutId);
  }, [formData, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    if (e.target.tagName === 'SELECT') {
      if (value && value !== '') {
        e.target.style.color = '#304B60';
      } else {
        e.target.style.color = '#9CA3AF';
      }
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    
    if (!logoAnimated) {
      setLogoAnimated(true);
      setTimeout(() => {
        setShowForm(true);
      }, 800);
    } else {
      setShowForm(true);
    }
    
    setProfileImage(null);
    setFormData({
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
    setFieldErrors({});
  };

  const getPhoto = async (source) => {
    setShowPhotoModal(false);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
        width: 1000,
        height: 1000,
        correctOrientation: true,
        promptLabelHeader: source === CameraSource.Camera ? 'الكاميرا' : 'المعرض',
        promptLabelCancel: 'إلغاء',
        promptLabelPhoto: 'اختيار من المعرض',
        promptLabelPicture: 'التقاط صورة'
      });

      if (image.base64String) {
        const imageData = `data:image/jpeg;base64,${image.base64String}`;
        setTempImage(imageData);
        setShowCropModal(true);
      } else {
        setFieldErrors(prev => ({ ...prev, image: 'فشل في الحصول على الصورة. يرجى المحاولة مرة أخرى.' }));
      }
    } catch (error) {
      if (error.message && error.message.includes('User cancelled')) {
        return;
      }
      if (error.message && (error.message.includes('permission') || error.message.includes('denied'))) {
        setFieldErrors(prev => ({ ...prev, image: 'يرجى السماح بالوصول للكاميرا أو المعرض من إعدادات التطبيق' }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, image: 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.' }));
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsAnalyzing(true);
    const croppedImage = await createCroppedImage(tempImage, croppedAreaPixels);
    const analysisResult = await analyzeImage(croppedImage, userType);
    
    setIsAnalyzing(false);
    setShowCropModal(false);
    
    if (analysisResult.isValid) {
      setProfileImage(croppedImage);
      setTempImage(null);
      if (fieldErrors.image) {
        setFieldErrors(prev => ({ ...prev, image: '' }));
      }
    } else {
      setTempImage(null);
      setFieldErrors(prev => ({ 
        ...prev, 
        image: userType === 'individual' 
          ? 'إن الصورة التي تم رفعها ليست صورة شخصية' 
          : 'إن الصورة التي تم رفعها ليست لوجو'
      }));
    }
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
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
      }

      if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
      else if (formData.password.length < 6) errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      
      if (!formData.confirmPassword) errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'كلمات المرور غير متطابقة';
      
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
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
      
      if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
      else if (formData.password.length < 6) errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      
      if (!formData.confirmPassword) errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (!formData.agreed) errors.agreed = 'يجب الموافقة على سياسة الخصوصية';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const registrationData = {
        role: userType === 'individual' ? 'Employee' : 'HR',
        profilePicture: profileImage,
        ...formData
      };

      const response = await api.post('/users/register', registrationData);
      const { user, token } = response.data;

      await performLogin(user, token);

      // Navigate to the appropriate onboarding page
      if (user.role === 'HR') {
        navigate('/onboarding-companies', { replace: true });
      } else {
        navigate('/onboarding-individuals', { replace: true });
      }

    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.error || t.registrationError || 'An unexpected error occurred.';
      setFieldErrors({ form: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full p-4 bg-[#E3DAD1] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-input input-field-enabled`;
  const selectBase = `w-full p-4 bg-[#E3DAD1] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-select input-field-enabled`;

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none auth-page`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div className={`min-h-screen flex flex-col transition-all duration-1000 ${
        logoAnimated ? 'justify-start pt-4 pb-8' : 'justify-center'
      }`}>
        
        <div className="flex flex-col items-center px-6 pb-8">

          <div className={`mb-8 logo-animation ${
            logoAnimated 
              ? 'logo-animated' 
              : 'logo-initial'
          }`}>
            <div className={`rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden transition-all duration-800 ${
              logoAnimated ? 'w-36 h-36' : 'w-48 h-48'
            }`}>
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className={`flex gap-4 mb-8 w-full max-w-md user-type-buttons ${
            logoAnimated 
              ? 'buttons-animated' 
              : ''
          }`}>
            <button
              onClick={() => handleUserTypeChange('individual')}
              className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${
                userType === 'individual'
                  ? 'bg-[#304B60] text-[#D48161]'
                  : 'bg-[#E3DAD1] text-[#304B60] border-2 border-[#D48161]/20'
              }`}
            >
              {t.individuals}
            </button>
            <button
              onClick={() => handleUserTypeChange('company')}
              className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${
                userType === 'company'
                  ? 'bg-[#304B60] text-[#D48161]'
                  : 'bg-[#E3DAD1] text-[#304B60] border-2 border-[#D48161]/20'
              }`}
            >
              {t.companies}
            </button>
          </div>

          {userType && (
            <div className={`w-full max-w-md form-animation ${
              showForm 
                ? 'form-visible' 
                : 'form-hidden'
            }`}>
              <form onSubmit={handleRegisterClick} className="space-y-4 pb-8">

            <div className="text-center">
              <div
                onClick={() => setShowPhotoModal(true)}
                className="w-24 h-24 rounded-full border-4 border-[#304B60] mx-auto mb-2 cursor-pointer hover:scale-105 transition-all flex items-center justify-center bg-[#E3DAD1] shadow-lg"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-3xl text-[#304B60]">📷</span>
                )}
              </div>
              <p className="text-sm font-bold text-[#304B60]/60">{t.uploadPhoto}</p>
              {fieldErrors.image && <p className="text-red-600 font-bold text-sm mt-1">{fieldErrors.image}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={selectBase}
                required
              >
                <option value="" disabled hidden>{t.country}</option>
                {countries.map(c => (
                  <option key={c.key} value={c.key} className="text-[#304B60]">
                    {c.flag} {language === 'ar' ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="city"
                placeholder={t.city}
                value={formData.city}
                onChange={handleInputChange}
                className={inputBase}
              />
            </div>
            {fieldErrors.country && <p className="text-red-600 font-bold text-sm">{fieldErrors.country}</p>}
            {fieldErrors.city && <p className="text-red-600 font-bold text-sm">{fieldErrors.city}</p>}

            {userType === 'individual' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t.firstName}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder={t.lastName}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                {fieldErrors.firstName && <p className="text-red-600 font-bold text-sm">{fieldErrors.firstName}</p>}
                {fieldErrors.lastName && <p className="text-red-600 font-bold text-sm">{fieldErrors.lastName}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={selectBase}
                    required
                  >
                    <option value="" disabled hidden>{t.gender}</option>
                    <option value="male" className="text-[#304B60]">{t.male}</option>
                    <option value="female" className="text-[#304B60]">{t.female}</option>
                    <option value="preferNot" className="text-[#304B60]">{t.preferNot}</option>
                  </select>
                  <input
                    type="date"
                    name="birthDate"
                    data-placeholder={t.birthDate || "تاريخ الميلاد"}
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={inputBase}
                    onFocus={(e) => {
                      if (e.target.showPicker) {
                        try {
                          e.target.showPicker();
                        } catch (error) {
                          console.log('Date picker not available');
                        }
                      }
                    }}
                  />
                </div>
                {fieldErrors.gender && <p className="text-red-600 font-bold text-sm">{fieldErrors.gender}</p>}
                {fieldErrors.birthDate && <p className="text-red-600 font-bold text-sm">{fieldErrors.birthDate}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={selectBase}
                    required
                  >
                    <option value="" disabled hidden>{t.educationLevel}</option>
                    <option value="phd" className="text-[#304B60]">{t.phd}</option>
                    <option value="masters" className="text-[#304B60]">{t.masters}</option>
                    <option value="bachelors" className="text-[#304B60]">{t.bachelors}</option>
                    <option value="highSchool" className="text-[#304B60]">{t.highSchool}</option>
                    <option value="middleSchool" className="text-[#304B60]">{t.middleSchool}</option>
                    <option value="elementary" className="text-[#304B60]">{t.elementary}</option>
                    <option value="illiterate" className="text-[#304B60]">{t.illiterate}</option>
                    <option value="uneducated" className="text-[#304B60]">{t.uneducated}</option>
                  </select>
                  <input
                    type="text"
                    name="specialization"
                    placeholder={t.specialization}
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                {fieldErrors.education && <p className="text-red-600 font-bold text-sm">{fieldErrors.education}</p>}
                {fieldErrors.specialization && <p className="text-red-600 font-bold text-sm">{fieldErrors.specialization}</p>}

                <input
                  type="text"
                  name="interests"
                  placeholder={t.keywords}
                  value={formData.interests}
                  onChange={handleInputChange}
                  className={inputBase}
                />
                {fieldErrors.interests && <p className="text-red-600 font-bold text-sm">{fieldErrors.interests}</p>}

                <div className="relative">
                  <div className="flex">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="w-24 p-4 bg-[#E3DAD1] rounded-r-2xl border-2 border-[#D48161]/20 border-l-0 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-select input-field-enabled text-xs font-bold text-center"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <option value="" disabled hidden style={{ color: '#9CA3AF' }}>كود</option>
                      {countries.map(c => (
                        <option key={c.code} value={c.code} className="text-[#304B60] text-xs">
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
                      className="flex-1 p-4 bg-[#E3DAD1] rounded-l-2xl border-2 border-[#D48161]/20 border-r-0 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-input input-field-enabled font-bold text-center"
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                  </div>
                  
                  {(fieldErrors.countryCode || fieldErrors.phone) && (
                    <div className="mt-1">
                      {fieldErrors.countryCode && <p className="text-red-600 font-bold text-sm">{fieldErrors.countryCode}</p>}
                      {fieldErrors.phone && <p className="text-red-600 font-bold text-sm">{fieldErrors.phone}</p>}
                    </div>
                  )}
                </div>

                {(formData.education !== 'illiterate' && formData.education !== 'uneducated') && (
                  <>
                    <input
                      type="email"
                      name="email"
                      placeholder={t.email}
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputBase}
                    />
                    {fieldErrors.email && <p className="text-red-600 font-bold text-sm">{fieldErrors.email}</p>}
                  </>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t.password}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-600 font-bold text-sm">{fieldErrors.password}</p>}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t.confirmPassword}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                  >
                    {showConfirmPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-600 font-bold text-sm">{fieldErrors.confirmPassword}</p>}

                <div className={`flex items-center ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                  <PremiumCheckbox
                    id="specialNeeds"
                    checked={formData.isSpecialNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSpecialNeeds: e.target.checked }))}
                    label={t.disabilities}
                    labelClassName="text-sm font-bold text-[#304B60]/80"
                  />
                </div>

                {formData.isSpecialNeeds && (
                  <>
                    <select
                      name="specialNeedType"
                      value={formData.specialNeedType}
                      onChange={handleInputChange}
                      className={selectBase}
                      required
                    >
                      <option value="" disabled hidden>{t.disabilityType}</option>
                      <option value="visual" className="text-[#304B60]">{t.visual}</option>
                      <option value="hearing" className="text-[#304B60]">{t.hearing}</option>
                      <option value="speech" className="text-[#304B60]">{t.speech}</option>
                      <option value="mobility" className="text-[#304B60]">{t.mobility}</option>
                    </select>
                    {fieldErrors.specialNeedType && <p className="text-red-600 font-bold text-sm">{fieldErrors.specialNeedType}</p>}
                  </>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="companyName"
                  placeholder={t.companyName}
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={inputBase}
                />
                {fieldErrors.companyName && <p className="text-red-600 font-bold text-sm">{fieldErrors.companyName}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={selectBase}
                    required
                  >
                    <option value="" disabled hidden>{t.industry}</option>
                    <option value="industrial" className="text-[#304B60]">{t.industrial}</option>
                    <option value="commercial" className="text-[#304B60]">{t.commercial}</option>
                    <option value="service" className="text-[#304B60]">{t.service}</option>
                    <option value="educational" className="text-[#304B60]">{t.educational}</option>
                    <option value="governmental" className="text-[#304B60]">{t.governmental}</option>
                    <option value="office" className="text-[#304B60]">{t.office}</option>
                    <option value="shop" className="text-[#304B60]">{t.shop}</option>
                    <option value="workshop" className="text-[#304B60]">{t.workshop}</option>
                  </select>
                  <input
                    type="text"
                    name="subIndustry"
                    placeholder={t.specialization}
                    value={formData.subIndustry}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                {fieldErrors.industry && <p className="text-red-600 font-bold text-sm">{fieldErrors.industry}</p>}
                {fieldErrors.subIndustry && <p className="text-red-600 font-bold text-sm">{fieldErrors.subIndustry}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="authorizedName"
                    placeholder={t.authorizedName}
                    value={formData.authorizedName}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <input
                    type="text"
                    name="authorizedPosition"
                    placeholder={t.authorizedPosition}
                    value={formData.authorizedPosition}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                {fieldErrors.authorizedName && <p className="text-red-600 font-bold text-sm">{fieldErrors.authorizedName}</p>}
                {fieldErrors.authorizedPosition && <p className="text-red-600 font-bold text-sm">{fieldErrors.authorizedPosition}</p>}

                <input
                  type="text"
                  name="companyKeywords"
                  placeholder={t.companyKeywords}
                  value={formData.companyKeywords}
                  onChange={handleInputChange}
                  className={inputBase}
                />
                {fieldErrors.companyKeywords && <p className="text-red-600 font-bold text-sm">{fieldErrors.companyKeywords}</p>}

                <div className="relative">
                  <div className="flex">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="w-24 p-4 bg-[#E3DAD1] rounded-r-2xl border-2 border-[#D48161]/20 border-l-0 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-select input-field-enabled text-xs font-bold text-center"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <option value="" disabled hidden style={{ color: '#9CA3AF' }}>كود</option>
                      {countries.map(c => (
                        <option key={c.code} value={c.code} className="text-[#304B60] text-xs">
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
                      className="flex-1 p-4 bg-[#E3DAD1] rounded-l-2xl border-2 border-[#D48161]/20 border-r-0 focus:border-[#304B60] outline-none text-[#304B60] transition-all auth-input input-field-enabled font-bold text-center"
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                  </div>
                  
                  {(fieldErrors.countryCode || fieldErrors.phone) && (
                    <div className="mt-1">
                      {fieldErrors.countryCode && <p className="text-red-600 font-bold text-sm">{fieldErrors.countryCode}</p>}
                      {fieldErrors.phone && <p className="text-red-600 font-bold text-sm">{fieldErrors.phone}</p>}
                    </div>
                  )}
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder={t.email}
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputBase}
                />
                {fieldErrors.email && <p className="text-red-600 font-bold text-sm">{fieldErrors.email}</p>}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t.password}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-600 font-bold text-sm">{fieldErrors.password}</p>}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t.confirmPassword}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                  >
                    {showConfirmPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-600 font-bold text-sm">{fieldErrors.confirmPassword}</p>}
              </>
            )}

            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <PremiumCheckbox
                    id="agreePolicy"
                    checked={formData.agreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                />
                <span className="text-sm font-bold text-[#304B60]/80">
                    {t.agreePolicy}{' '}

                    <span
                        onClick={() => setShowPolicy(true)}
                        className="text-[#304B60] font-black underline cursor-pointer hover:text-[#D48161] transition-colors duration-200"
                    >
                        {t.privacyPolicy}
                    </span>
                </span>
            </div>

            {fieldErrors.agreed && <p className="text-red-600 font-bold text-sm">{fieldErrors.agreed}</p>}
            {fieldErrors.form && <p className="text-red-600 font-bold text-sm text-center">{fieldErrors.form}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#304B60] text-[#D48161] py-6 rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-all mt-8 mb-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin mx-auto"></div>
              ) : (
                t.register
              )}
            </button>
            </form>
          </div>
        )}
        
        </div>
      </div>

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
          tempImage={tempImage}
          crop={crop}
          setCrop={setCrop}
          onCropComplete={onCropComplete}
          onSave={handleCropSave}
          onClose={() => setShowCropModal(false)}
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

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-[#D48161]/20">
            <h3 className="text-xl font-black text-[#304B60] mb-4">{t.aiAnalyzing}</h3>
            <div className="w-24 h-24 rounded-full border-4 border-[#304B60] border-t-[#D48161] animate-spin mx-auto mb-6"></div>
          </div>
        </div>
      )}
    </div>
  );
}
