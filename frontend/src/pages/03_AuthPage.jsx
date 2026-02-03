import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import { PremiumCheckbox } from '../components/LuxuryCheckbox';
import countries from '../data/countries.json';
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
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { language, login: performLogin } = useAuth();
  const t = useTranslate();
  const isRTL = language === 'ar';

  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', password: '', confirmPassword: '',
    phone: '', country: '', city: '', countryCode: '', education: '', specialization: '',
    interests: '', birthDate: '', gender: '', isSpecialNeeds: false, specialNeedType: '',
    industry: '', subIndustry: '', authorizedName: '', authorizedPosition: '', companyKeywords: '',
    agreed: false
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setProfileImage(null);
    const currentAgreement = formData.agreed;
    setFormData({
      firstName: '', lastName: '', companyName: '', email: '', password: '', confirmPassword: '',
      phone: '', country: '', city: '', countryCode: '', education: '', specialization: '',
      interests: '', birthDate: '', gender: '', isSpecialNeeds: false, specialNeedType: '',
      industry: '', subIndustry: '', authorizedName: '', authorizedPosition: '', companyKeywords: '',
      agreed: currentAgreement
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
        correctOrientation: true
      });
      if (image.base64String) {
        const imageData = `data:image/jpeg;base64,${image.base64String}`;
        setTempImage(imageData);
        setShowCropModal(true);
      }
    } catch (error) {
      if (error.message?.includes('User cancelled')) return;
      setFieldErrors(prev => ({ ...prev, image: t.photoError }));
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    setIsAnalyzing(true);
    const croppedImage = await createCroppedImage(tempImage, croppedAreaPixels);
    setProfileImage(croppedImage);
    setTempImage(null);
    if (fieldErrors.image) {
      setFieldErrors(prev => ({ ...prev, image: '' }));
    }
    setShowCropModal(false);
    setIsAnalyzing(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!profileImage) errors.image = t.uploadPhotoError;

    if (userType === 'individual') {
      if (!formData.firstName.trim()) errors.firstName = t.firstNameRequired;
      if (!formData.lastName.trim()) errors.lastName = t.lastNameRequired;
      if (!formData.country) errors.country = t.countryRequired;
      if (!formData.city.trim()) errors.city = t.cityRequired;
      if (!formData.gender) errors.gender = t.genderRequired;
      if (!formData.birthDate) errors.birthDate = t.birthDateRequired;
      if (!formData.education) errors.education = t.educationRequired;
      if (!formData.specialization.trim()) errors.specialization = t.specializationRequired;
      if (!formData.interests.trim()) errors.interests = t.keywordsRequired;
      if (!formData.countryCode) errors.countryCode = t.countryCodeRequired;
      if (!formData.phone.trim()) errors.phone = t.phoneRequired;

      if (formData.education !== 'illiterate' && formData.education !== 'uneducated') {
        if (!formData.email.trim()) errors.email = t.emailRequired;
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t.emailInvalid;
      }

      if (!formData.password) errors.password = t.passwordRequired;
      else if (formData.password.length < 8) errors.password = t.passwordLengthError;
      
      if (!formData.confirmPassword) errors.confirmPassword = t.confirmPasswordRequired;
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = t.passwordsDontMatch;
      
      if (formData.isSpecialNeeds && !formData.specialNeedType) errors.specialNeedType = t.disabilityTypeRequired;
    } else if (userType === 'company') {
      if (!formData.companyName.trim()) errors.companyName = t.companyNameRequired;
      if (!formData.country) errors.country = t.countryRequired;
      if (!formData.city.trim()) errors.city = t.cityRequired;
      if (!formData.industry) errors.industry = t.industryRequired;
      if (!formData.subIndustry.trim()) errors.subIndustry = t.specializationRequired;
      if (!formData.authorizedName.trim()) errors.authorizedName = t.authorizedNameRequired;
      if (!formData.authorizedPosition.trim()) errors.authorizedPosition = t.authorizedPositionRequired;
      if (!formData.companyKeywords.trim()) errors.companyKeywords = t.keywordsRequired;
      if (!formData.countryCode) errors.countryCode = t.countryCodeRequired;
      if (!formData.phone.trim()) errors.phone = t.phoneRequired;
      if (!formData.email.trim()) errors.email = t.emailRequired;
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t.emailInvalid;
      
      if (!formData.password) errors.password = t.passwordRequired;
      else if (formData.password.length < 8) errors.password = t.passwordLengthError;
      
      if (!formData.confirmPassword) errors.confirmPassword = t.confirmPasswordRequired;
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = t.passwordsDontMatch;
    }

    if (!formData.agreed) errors.agreed = t.mustAgree;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      const registrationData = {
        role: userType === 'individual' ? 'Employee' : 'HR',
        profileImage: profileImage,
        ...formData
      };

      const response = await api.post('/users/register', registrationData);
      const { user, token } = response.data;

      await performLogin(user, token);

      if (user.role === 'HR') {
        navigate('/onboarding-companies', { replace: true });
      } else {
        navigate('/onboarding-individuals', { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || t.registrationError || 'An unexpected error occurred.';
      setFieldErrors({ form: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Font style based on language
  const fontStyle = {
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3DAD1] via-[#F5F1EC] to-[#E8DDD4] relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D48161]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#304B60]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#D48161]/5 to-transparent rounded-full animate-spin-slow"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Logo */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#304B60] to-[#D48161] rounded-full blur-lg opacity-20 animate-pulse"></div>
            <div className="relative w-32 h-32 rounded-full border-4 border-gradient-to-r from-[#304B60] to-[#D48161] shadow-2xl overflow-hidden bg-white">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#304B60] to-[#D48161] mb-2" style={fontStyle}>
            {t.createAccount}
          </h1>
          <p className="text-[#304B60]/60 font-semibold" style={fontStyle}>{t.joinCommunity}</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-8 w-full max-w-md">
          <button
            onClick={() => handleUserTypeChange('individual')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              userType === 'individual' 
                ? 'bg-gradient-to-r from-[#304B60] to-[#2A4154] text-[#D48161] shadow-xl border-2 border-[#D48161]/30' 
                : 'bg-white/80 backdrop-blur-sm text-[#304B60] border-2 border-[#304B60]/20 hover:border-[#304B60]/40 hover:shadow-lg'
            }`}
            style={fontStyle}
          >
            <span className="block text-sm opacity-75 mb-1">{t.forIndividuals}</span>
            {t.individuals}
          </button>
          <button
            onClick={() => handleUserTypeChange('company')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              userType === 'company' 
                ? 'bg-gradient-to-r from-[#304B60] to-[#2A4154] text-[#D48161] shadow-xl border-2 border-[#D48161]/30' 
                : 'bg-white/80 backdrop-blur-sm text-[#304B60] border-2 border-[#304B60]/20 hover:border-[#304B60]/40 hover:shadow-lg'
            }`}
            style={fontStyle}
          >
            <span className="block text-sm opacity-75 mb-1">{t.forCompanies}</span>
            {t.companies}
          </button>
        </div>

        {/* Form Container */}
        {userType && (
          <div className={`w-full max-w-md transition-all duration-500 transform ${userType ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <form onSubmit={handleRegisterClick} className="space-y-6">
                
                {/* Profile Image */}
                <div className="text-center mb-6">
                  <div 
                    onClick={() => setShowPhotoModal(true)} 
                    className="relative w-24 h-24 mx-auto mb-3 cursor-pointer group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#304B60] to-[#D48161] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-full h-full rounded-full border-4 border-gradient-to-r from-[#304B60] to-[#D48161] overflow-hidden bg-white shadow-xl group-hover:scale-105 transition-transform">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5F1EC] to-[#E8DDD4]">
                          <span className="text-3xl text-[#304B60]/60">📷</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#D48161] to-[#C67A5A] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">+</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#304B60]/70" style={fontStyle}>{t.uploadPhoto}</p>
                  {fieldErrors.image && <p className="text-red-500 font-semibold text-sm mt-2">{fieldErrors.image}</p>}
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm"
                      style={fontStyle}
                      required
                    >
                      <option value="" disabled hidden>{t.country}</option>
                      {countries.map(c => (
                        <option key={c.key} value={c.key} className="text-[#304B60]">
                          {c.flag} {language === 'ar' ? c.name_ar : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="city" 
                      placeholder={t.city} 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                      style={fontStyle}
                    />
                  </div>
                </div>
                {(fieldErrors.country || fieldErrors.city) && (
                  <div className="text-red-500 font-semibold text-sm">
                    {fieldErrors.country && <p>{fieldErrors.country}</p>}
                    {fieldErrors.city && <p>{fieldErrors.city}</p>}
                  </div>
                )}

                {/* Individual Fields */}
                {userType === 'individual' && (
                  <>
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="firstName" 
                        placeholder={t.firstName} 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <input 
                        type="text" 
                        name="lastName" 
                        placeholder={t.lastName} 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.firstName || fieldErrors.lastName) && (
                      <div className="text-red-500 font-semibold text-sm">
                        {fieldErrors.firstName && <p>{fieldErrors.firstName}</p>}
                        {fieldErrors.lastName && <p>{fieldErrors.lastName}</p>}
                      </div>
                    )}

                    {/* Gender and Birth Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm"
                        style={fontStyle}
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
                        value={formData.birthDate} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.gender || fieldErrors.birthDate) && (
                      <div className="text-red-500 font-semibold text-sm">
                        {fieldErrors.gender && <p>{fieldErrors.gender}</p>}
                        {fieldErrors.birthDate && <p>{fieldErrors.birthDate}</p>}
                      </div>
                    )}

                    {/* Education and Specialization */}
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="education" 
                        value={formData.education} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm"
                        style={fontStyle}
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
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.education || fieldErrors.specialization) && (
                      <div className="text-red-500 font-semibold text-sm">
                        {fieldErrors.education && <p>{fieldErrors.education}</p>}
                        {fieldErrors.specialization && <p>{fieldErrors.specialization}</p>}
                      </div>
                    )}

                    {/* Keywords */}
                    <input 
                      type="text" 
                      name="interests" 
                      placeholder={t.keywords} 
                      value={formData.interests} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                      style={fontStyle}
                    />
                    {fieldErrors.interests && <p className="text-red-500 font-semibold text-sm">{fieldErrors.interests}</p>}

                    {/* Phone */}
                    <div className="flex gap-3">
                      <select 
                        name="countryCode" 
                        value={formData.countryCode} 
                        onChange={handleInputChange} 
                        className="w-24 p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm text-xs"
                        style={fontStyle}
                      >
                        <option value="" disabled hidden>{t.countryCode}</option>
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
                        className="flex-1 p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.countryCode || fieldErrors.phone) && (
                      <div className="text-red-500 font-semibold text-sm text-center">
                        {fieldErrors.countryCode && <p>{fieldErrors.countryCode}</p>}
                        {fieldErrors.phone && <p>{fieldErrors.phone}</p>}
                      </div>
                    )}

                    {/* Email (conditional) */}
                    {(formData.education !== 'illiterate' && formData.education !== 'uneducated') && (
                      <>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder={t.email} 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                          style={fontStyle}
                        />
                        {fieldErrors.email && <p className="text-red-500 font-semibold text-sm">{fieldErrors.email}</p>}
                      </>
                    )}

                    {/* Password Fields */}
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder={t.password} 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                      >
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-500 font-semibold text-sm">{fieldErrors.password}</p>}

                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        placeholder={t.confirmPassword} 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                      >
                        {showConfirmPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-red-500 font-semibold text-sm">{fieldErrors.confirmPassword}</p>}

                    {/* Special Needs */}
                    <div className={`flex items-center justify-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                      <PremiumCheckbox 
                        id="specialNeeds" 
                        checked={formData.isSpecialNeeds} 
                        onChange={(e) => setFormData(prev => ({ ...prev, isSpecialNeeds: e.target.checked }))} 
                        label={t.disabilities} 
                        labelClassName="text-sm font-semibold text-[#304B60]/80" 
                      />
                    </div>

                    {formData.isSpecialNeeds && (
                      <>
                        <select 
                          name="specialNeedType" 
                          value={formData.specialNeedType} 
                          onChange={handleInputChange} 
                          className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm"
                          style={fontStyle}
                          required
                        >
                          <option value="" disabled hidden>{t.disabilityType}</option>
                          <option value="visual" className="text-[#304B60]">{t.visual}</option>
                          <option value="hearing" className="text-[#304B60]">{t.hearing}</option>
                          <option value="speech" className="text-[#304B60]">{t.speech}</option>
                          <option value="mobility" className="text-[#304B60]">{t.mobility}</option>
                        </select>
                        {fieldErrors.specialNeedType && <p className="text-red-500 font-semibold text-sm">{fieldErrors.specialNeedType}</p>}
                      </>
                    )}

                    {/* Agreement */}
                    <div className={`flex items-center justify-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <PremiumCheckbox 
                        id="agreePolicy" 
                        checked={formData.agreed} 
                        onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))} 
                      />
                      <label htmlFor="agreePolicy" className="text-sm font-semibold text-[#304B60]/80" style={fontStyle}>
                        {t.agreePolicy}{' '}
                        <span 
                          onClick={(e) => { e.preventDefault(); setShowPolicy(true); }} 
                          className="text-[#D48161] font-bold underline cursor-pointer hover:text-[#C67A5A] transition-colors"
                        >
                          {t.privacyPolicy}
                        </span>
                      </label>
                    </div>
                    {fieldErrors.agreed && <p className="text-red-500 font-semibold text-sm text-center">{fieldErrors.agreed}</p>}
                  </>
                )}

                {/* Company Fields */}
                {userType === 'company' && (
                  <>
                    {/* Company Name */}
                    <input 
                      type="text" 
                      name="companyName" 
                      placeholder={t.companyName} 
                      value={formData.companyName} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                      style={fontStyle}
                    />
                    {fieldErrors.companyName && <p className="text-red-500 font-semibold text-sm">{fieldErrors.companyName}</p>}

                    {/* Industry and Specialization */}
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="industry" 
                        value={formData.industry} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm"
                        style={fontStyle}
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
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.industry || fieldErrors.subIndustry) && (
                      <div className="text-red-500 font-semibold text-sm">
                        {fieldErrors.industry && <p>{fieldErrors.industry}</p>}
                        {fieldErrors.subIndustry && <p>{fieldErrors.subIndustry}</p>}
                      </div>
                    )}

                    {/* Authorized Person */}
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="authorizedName" 
                        placeholder={t.authorizedName} 
                        value={formData.authorizedName} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <input 
                        type="text" 
                        name="authorizedPosition" 
                        placeholder={t.authorizedPosition} 
                        value={formData.authorizedPosition} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.authorizedName || fieldErrors.authorizedPosition) && (
                      <div className="text-red-500 font-semibold text-sm">
                        {fieldErrors.authorizedName && <p>{fieldErrors.authorizedName}</p>}
                        {fieldErrors.authorizedPosition && <p>{fieldErrors.authorizedPosition}</p>}
                      </div>
                    )}

                    {/* Company Keywords */}
                    <input 
                      type="text" 
                      name="companyKeywords" 
                      placeholder={t.companyKeywords} 
                      value={formData.companyKeywords} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                      style={fontStyle}
                    />
                    {fieldErrors.companyKeywords && <p className="text-red-500 font-semibold text-sm">{fieldErrors.companyKeywords}</p>}

                    {/* Phone */}
                    <div className="flex gap-3">
                      <select 
                        name="countryCode" 
                        value={formData.countryCode} 
                        onChange={handleInputChange} 
                        className="w-24 p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold transition-all shadow-sm text-xs"
                        style={fontStyle}
                      >
                        <option value="" disabled hidden>{t.countryCode}</option>
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
                        className="flex-1 p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                    </div>
                    {(fieldErrors.countryCode || fieldErrors.phone) && (
                      <div className="text-red-500 font-semibold text-sm text-center">
                        {fieldErrors.countryCode && <p>{fieldErrors.countryCode}</p>}
                        {fieldErrors.phone && <p>{fieldErrors.phone}</p>}
                      </div>
                    )}

                    {/* Email */}
                    <input 
                      type="email" 
                      name="email" 
                      placeholder={t.email} 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                      style={fontStyle}
                    />
                    {fieldErrors.email && <p className="text-red-500 font-semibold text-sm">{fieldErrors.email}</p>}

                    {/* Password Fields */}
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder={t.password} 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                      >
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-500 font-semibold text-sm">{fieldErrors.password}</p>}

                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        placeholder={t.confirmPassword} 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-gradient-to-r from-white to-[#F8F6F3] text-[#304B60] rounded-xl border-2 border-[#E3DAD1] focus:border-[#D48161] focus:ring-2 focus:ring-[#D48161]/20 outline-none font-semibold text-center transition-all shadow-sm placeholder:text-[#304B60]/50"
                        style={fontStyle}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors`}
                      >
                        {showConfirmPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-red-500 font-semibold text-sm">{fieldErrors.confirmPassword}</p>}

                    {/* Agreement */}
                    <div className={`flex items-center justify-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <PremiumCheckbox 
                        id="agreePolicy" 
                        checked={formData.agreed} 
                        onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))} 
                      />
                      <label htmlFor="agreePolicy" className="text-sm font-semibold text-[#304B60]/80" style={fontStyle}>
                        {t.agreePolicy}{' '}
                        <span 
                          onClick={(e) => { e.preventDefault(); setShowPolicy(true); }} 
                          className="text-[#D48161] font-bold underline cursor-pointer hover:text-[#C67A5A] transition-colors"
                        >
                          {t.privacyPolicy}
                        </span>
                      </label>
                    </div>
                    {fieldErrors.agreed && <p className="text-red-500 font-semibold text-sm text-center">{fieldErrors.agreed}</p>}
                  </>
                )}

                {/* Form Error */}
                {fieldErrors.form && (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-semibold text-sm">{fieldErrors.form}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading || isAnalyzing} 
                  className={`w-full py-5 px-8 bg-gradient-to-r from-[#304B60] to-[#2A4154] text-[#D48161] rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 transform ${
                    (loading || isAnalyzing) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-3xl active:scale-95'
                  } border-2 border-[#D48161]/20`}
                  style={fontStyle}
                >
                  {loading || isAnalyzing ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin"></div>
                      <span>{isAnalyzing ? t.aiAnalyzing : t.processing}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      {t.register}
                      <span>✨</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/20">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#304B60] to-[#D48161] rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-[#304B60] to-[#D48161] rounded-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#304B60] mb-2" style={fontStyle}>
              {t.aiAnalyzing}
            </h3>
            <p className="text-[#304B60]/70 text-sm" style={fontStyle}>
              {t.pleaseWait}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}