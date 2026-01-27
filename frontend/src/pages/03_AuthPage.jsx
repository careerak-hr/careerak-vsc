import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { App } from '@capacitor/app';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Context & Services
import countries from '../data/countries.json';

// Modals
import PolicyModal from '../components/modals/PolicyModal';

// Age Check Modal Component
const AgeCheckModal = ({ t, onResponse }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#304B60]">
        <h2 className="text-2xl font-black text-[#304B60] mb-6">{t.ageCheckTitle}</h2>
        <p className="text-lg font-bold text-[#304B60]/80 mb-8">{t.ageCheckMessage}</p>
        <div className="flex gap-4">
          <button
            onClick={() => onResponse(true)}
            className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {t.above18}
          </button>
          <button
            onClick={() => onResponse(false)}
            className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {t.below18}
          </button>
        </div>
      </div>
    </div>
  );
};

// Goodbye Modal Component
const GoodbyeModal = ({ t, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#304B60]">
        <p className="text-lg font-bold text-[#304B60]/80 mb-8">{t.sorryMessage}</p>
        <button
          onClick={onConfirm}
          className="bg-[#304B60] text-[#D48161] py-4 px-8 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
        >
          {t.goodbye}
        </button>
      </div>
    </div>
  );
};

// Photo Options Modal Component
const PhotoOptionsModal = ({ t, onSelectFromGallery, onTakePhoto, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-[#D48161]/20">
        <h3 className="text-xl font-black text-[#304B60] mb-6">{t.uploadPhoto}</h3>
        <div className="space-y-4">
          <button
            onClick={onSelectFromGallery}
            className="w-full bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            📷 {t.selectFromGallery}
          </button>
          <button
            onClick={onTakePhoto}
            className="w-full bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            📸 {t.takePhoto}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Crop Modal Component
const CropModal = ({ t, tempImage, crop, setCrop, onCropComplete, onSave, onClose }) => {
  const imgRef = useRef();
  
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
  }, [setCrop]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] p-6 rounded-[2rem] shadow-2xl w-full max-w-md text-center border-4 border-[#304B60]">
        <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.cropTitle}</h3>
        {tempImage && (
          <div className="flex justify-center mb-4">
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)} 
              onComplete={onCropComplete} 
              aspect={1} 
              circularCrop={true}
            >
              <img 
                ref={imgRef} 
                src={tempImage} 
                onLoad={onImageLoad} 
                alt="Crop me" 
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-xl font-black"
          >
            {t.cancel}
          </button>
          <button 
            onClick={onSave} 
            className="flex-1 bg-[#304B60] text-[#D48161] py-3 rounded-xl font-black"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const { language, startBgMusic } = useAuth();
  const t = useTranslate();
  const isRTL = language === 'ar';

  // UI States
  const [isVisible, setIsVisible] = useState(false);
  const [showAgeCheck, setShowAgeCheck] = useState(false); // تبدأ بـ false
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
  const [crop, setCrop] = useState({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // إظهار رسالة التحقق من العمر في كل مرة يتم فتح الصفحة
    setShowAgeCheck(true);
    
    // تشغيل الموسيقى الخلفية عند دخول الصفحة إذا لم تكن تعمل
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled) {
      // تأخير قصير للسماح للصفحة بالتحميل
      setTimeout(() => {
        if (startBgMusic) {
          startBgMusic();
        }
      }, 100);
    }
  }, [startBgMusic]);

  const handleAgeResponse = (isAbove18) => {
    if (isAbove18) {
      setShowAgeCheck(false);
    } else {
      setShowGoodbyeModal(true);
    }
  };

  const handleGoodbyeConfirm = () => {
    App.exitApp();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
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
    if (!croppedAreaPixels) return;
    
    setIsAnalyzing(true);
    const croppedImage = await createCroppedImage(tempImage, croppedAreaPixels);
    
    // Simulate AI analysis
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

      // Email is required unless illiterate or uneducated
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
    if (validateForm()) {
      // Registration logic here
      console.log('Registering user:', { userType, formData, profileImage });
      // Navigate to appropriate page based on user type
      alert('تم التسجيل بنجاح!');
    }
  };

  if (showAgeCheck) {
    return <AgeCheckModal t={t} onResponse={handleAgeResponse} />;
  }

  if (showGoodbyeModal) {
    return <GoodbyeModal t={t} onConfirm={handleGoodbyeConfirm} />;
  }

  const inputBase = `w-full p-4 bg-[#E3DAD1] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] placeholder-gray-400 transition-all`;
  const selectBase = `w-full p-4 bg-[#E3DAD1] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] transition-all`;

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col items-center p-6 pt-12">

        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-8 w-full max-w-md">
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
          <form onSubmit={handleRegisterClick} className="w-full max-w-md space-y-4">

            {/* Photo Upload */}
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

            {/* Country and City */}
            <div className="grid grid-cols-2 gap-4">
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={selectBase}
              >
                <option value="" className="text-gray-400">{t.country}</option>
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
                {/* Individual Fields */}
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
                  >
                    <option value="" className="text-gray-400">{t.gender}</option>
                    <option value="male" className="text-[#304B60]">{t.male}</option>
                    <option value="female" className="text-[#304B60]">{t.female}</option>
                    <option value="preferNot" className="text-[#304B60]">{t.preferNot}</option>
                  </select>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={inputBase}
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
                  >
                    <option value="" className="text-gray-400">{t.educationLevel}</option>
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

                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className={`${selectBase} text-sm`}
                  >
                    <option value="" className="text-gray-400">{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="text-[#304B60]">
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
                    className={`${inputBase} col-span-2`}
                  />
                </div>
                {fieldErrors.countryCode && <p className="text-red-600 font-bold text-sm">{fieldErrors.countryCode}</p>}
                {fieldErrors.phone && <p className="text-red-600 font-bold text-sm">{fieldErrors.phone}</p>}

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

                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <input
                    type="checkbox"
                    id="specialNeeds"
                    checked={formData.isSpecialNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSpecialNeeds: e.target.checked }))}
                    className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#E3DAD1]"
                  />
                  <label htmlFor="specialNeeds" className="text-sm font-bold text-[#304B60]/80 cursor-pointer">
                    {t.disabilities}
                  </label>
                </div>

                {formData.isSpecialNeeds && (
                  <>
                    <select
                      name="specialNeedType"
                      value={formData.specialNeedType}
                      onChange={handleInputChange}
                      className={selectBase}
                    >
                      <option value="" className="text-gray-400">{t.disabilityType}</option>
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
                {/* Company Fields */}
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
                  >
                    <option value="" className="text-gray-400">{t.industry}</option>
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

                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className={`${selectBase} text-sm`}
                  >
                    <option value="" className="text-gray-400">{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="text-[#304B60]">
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
                    className={`${inputBase} col-span-2`}
                  />
                </div>
                {fieldErrors.countryCode && <p className="text-red-600 font-bold text-sm">{fieldErrors.countryCode}</p>}
                {fieldErrors.phone && <p className="text-red-600 font-bold text-sm">{fieldErrors.phone}</p>}

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

            {/* Privacy Policy Agreement */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <input
                type="checkbox"
                id="agreePolicy"
                checked={formData.agreed}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#E3DAD1]"
              />
              <label htmlFor="agreePolicy" className="text-sm font-bold text-[#304B60]/80 cursor-pointer">
                {t.agreePolicy}
                <span
                  onClick={() => setShowPolicy(true)}
                  className="text-[#304B60] underline cursor-pointer ml-1"
                >
                  (سياسة الخصوصية)
                </span>
              </label>
            </div>
            {fieldErrors.agreed && <p className="text-red-600 font-bold text-sm">{fieldErrors.agreed}</p>}

            <button
              type="submit"
              className="w-full bg-[#304B60] text-[#D48161] py-6 rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-all mt-6"
            >
              {t.register}
            </button>
          </form>
        )}

        {/* Modals */}
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
    </div>
  );
}

