import React, { useState, useCallback } from 'react';
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

  // Simple inline styles to avoid CSS conflicts
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#E3DAD1',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#E3DAD1',
    color: '#304B60',
    borderRadius: '16px',
    border: '2px solid rgba(212, 129, 97, 0.2)',
    outline: 'none',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '16px',
    fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif",
    pointerEvents: 'auto',
    cursor: 'text',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    touchAction: 'manipulation'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    color: '#9CA3AF'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#304B60',
    color: '#D48161',
    padding: '24px',
    borderRadius: '48px',
    fontWeight: 'bold',
    fontSize: '20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '32px',
    fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif"
  };

  return (
    <div style={containerStyle}>
      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ width: '144px', height: '144px', borderRadius: '50%', border: '4px solid #304B60', overflow: 'hidden' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* User Type Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', width: '100%', maxWidth: '400px' }}>
        <button
          onClick={() => handleUserTypeChange('individual')}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '18px',
            border: userType === 'individual' ? 'none' : '2px solid rgba(212, 129, 97, 0.2)',
            backgroundColor: userType === 'individual' ? '#304B60' : '#E3DAD1',
            color: userType === 'individual' ? '#D48161' : '#304B60',
            cursor: 'pointer'
          }}
        >
          {t.individuals}
        </button>
        <button
          onClick={() => handleUserTypeChange('company')}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '18px',
            border: userType === 'company' ? 'none' : '2px solid rgba(212, 129, 97, 0.2)',
            backgroundColor: userType === 'company' ? '#304B60' : '#E3DAD1',
            color: userType === 'company' ? '#D48161' : '#304B60',
            cursor: 'pointer'
          }}
        >
          {t.companies}
        </button>
      </div>

      {/* Form */}
      {userType && (
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <form onSubmit={handleRegisterClick} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Profile Image */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div 
                onClick={() => setShowPhotoModal(true)} 
                style={{ 
                  width: '96px', 
                  height: '96px', 
                  borderRadius: '50%', 
                  border: '4px solid #304B60', 
                  margin: '0 auto 8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#E3DAD1' 
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px', color: '#304B60' }}>📷</span>
                )}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(48, 75, 96, 0.6)', margin: 0 }}>{t.uploadPhoto}</p>
              {fieldErrors.image && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>{fieldErrors.image}</p>}
            </div>

            {/* Country and City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <select name="country" value={formData.country} onChange={handleInputChange} style={selectStyle} required>
                <option value="" disabled hidden>{t.country}</option>
                {countries.map(c => (
                  <option key={c.key} value={c.key} style={{ color: '#304B60' }}>{c.flag} {language === 'ar' ? c.name_ar : c.name_en}</option>
                ))}
              </select>
              <input type="text" name="city" placeholder={t.city} value={formData.city} onChange={handleInputChange} style={inputStyle} />
            </div>
            {fieldErrors.country && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.country}</p>}
            {fieldErrors.city && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.city}</p>}

            {/* Individual Fields */}
            {userType === 'individual' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" name="firstName" placeholder={t.firstName} value={formData.firstName} onChange={handleInputChange} style={inputStyle} />
                  <input type="text" name="lastName" placeholder={t.lastName} value={formData.lastName} onChange={handleInputChange} style={inputStyle} />
                </div>
                {fieldErrors.firstName && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.firstName}</p>}
                {fieldErrors.lastName && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.lastName}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} style={selectStyle} required>
                    <option value="" disabled hidden>{t.gender}</option>
                    <option value="male" style={{ color: '#304B60' }}>{t.male}</option>
                    <option value="female" style={{ color: '#304B60' }}>{t.female}</option>
                    <option value="preferNot" style={{ color: '#304B60' }}>{t.preferNot}</option>
                  </select>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} style={inputStyle} />
                </div>
                {fieldErrors.gender && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.gender}</p>}
                {fieldErrors.birthDate && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.birthDate}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select name="education" value={formData.education} onChange={handleInputChange} style={selectStyle} required>
                    <option value="" disabled hidden>{t.educationLevel}</option>
                    <option value="phd" style={{ color: '#304B60' }}>{t.phd}</option>
                    <option value="masters" style={{ color: '#304B60' }}>{t.masters}</option>
                    <option value="bachelors" style={{ color: '#304B60' }}>{t.bachelors}</option>
                    <option value="highSchool" style={{ color: '#304B60' }}>{t.highSchool}</option>
                    <option value="middleSchool" style={{ color: '#304B60' }}>{t.middleSchool}</option>
                    <option value="elementary" style={{ color: '#304B60' }}>{t.elementary}</option>
                    <option value="illiterate" style={{ color: '#304B60' }}>{t.illiterate}</option>
                    <option value="uneducated" style={{ color: '#304B60' }}>{t.uneducated}</option>
                  </select>
                  <input type="text" name="specialization" placeholder={t.specialization} value={formData.specialization} onChange={handleInputChange} style={inputStyle} />
                </div>
                {fieldErrors.education && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.education}</p>}
                {fieldErrors.specialization && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.specialization}</p>}

                <input type="text" name="interests" placeholder={t.keywords} value={formData.interests} onChange={handleInputChange} style={inputStyle} />
                {fieldErrors.interests && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.interests}</p>}

                <div style={{ display: 'flex', gap: '16px' }}>
                  <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} style={{ ...selectStyle, width: '112px' }}>
                    <option value="" disabled hidden>{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ color: '#304B60', fontSize: '12px' }}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input type="tel" name="phone" placeholder={t.mobile} value={formData.phone} onChange={handleInputChange} style={{ ...inputStyle, flex: 1 }} />
                </div>
                {(fieldErrors.countryCode || fieldErrors.phone) && (
                  <div>
                    {fieldErrors.countryCode && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>{fieldErrors.countryCode}</p>}
                    {fieldErrors.phone && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>{fieldErrors.phone}</p>}
                  </div>
                )}

                {(formData.education !== 'illiterate' && formData.education !== 'uneducated') && (
                  <>
                    <input type="email" name="email" placeholder={t.email} value={formData.email} onChange={handleInputChange} style={inputStyle} />
                    {fieldErrors.email && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.email}</p>}
                  </>
                )}

                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder={t.password} value={formData.password} onChange={handleInputChange} style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>{showPassword ? '👁️' : '🙈'}</button>
                </div>
                {fieldErrors.password && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.password}</p>}

                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder={t.confirmPassword} value={formData.confirmPassword} onChange={handleInputChange} style={inputStyle} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>{showConfirmPassword ? '👁️' : '🙈'}</button>
                </div>
                {fieldErrors.confirmPassword && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.confirmPassword}</p>}

                <div style={{ display: 'flex', alignItems: 'center', flexDirection: isRTL ? 'row' : 'row-reverse' }}>
                  <PremiumCheckbox id="specialNeeds" checked={formData.isSpecialNeeds} onChange={(e) => setFormData(prev => ({ ...prev, isSpecialNeeds: e.target.checked }))} label={t.disabilities} labelClassName="text-sm font-bold text-[#304B60]/80" />
                </div>

                {formData.isSpecialNeeds && (
                  <>
                    <select name="specialNeedType" value={formData.specialNeedType} onChange={handleInputChange} style={selectStyle} required>
                      <option value="" disabled hidden>{t.disabilityType}</option>
                      <option value="visual" style={{ color: '#304B60' }}>{t.visual}</option>
                      <option value="hearing" style={{ color: '#304B60' }}>{t.hearing}</option>
                      <option value="speech" style={{ color: '#304B60' }}>{t.speech}</option>
                      <option value="mobility" style={{ color: '#304B60' }}>{t.mobility}</option>
                    </select>
                    {fieldErrors.specialNeedType && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.specialNeedType}</p>}
                  </>
                )}

                <div style={{ paddingTop: '8px', display: 'flex', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'flex-start', gap: '12px' }}>
                  <PremiumCheckbox id="agreePolicy" checked={formData.agreed} onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))} />
                  <label htmlFor="agreePolicy" style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(48, 75, 96, 0.8)' }}>
                    {t.agreePolicy}{' '}
                    <span onClick={(e) => { e.preventDefault(); setShowPolicy(true); }} style={{ color: '#304B60', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>{t.privacyPolicy}</span>
                  </label>
                </div>
                {fieldErrors.agreed && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginTop: '-8px' }}>{fieldErrors.agreed}</p>}
              </>
            )}

            {/* Company Fields */}
            {userType === 'company' && (
              <>
                <input type="text" name="companyName" placeholder={t.companyName} value={formData.companyName} onChange={handleInputChange} style={inputStyle} />
                {fieldErrors.companyName && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.companyName}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select name="industry" value={formData.industry} onChange={handleInputChange} style={selectStyle} required>
                    <option value="" disabled hidden>{t.industry}</option>
                    <option value="industrial" style={{ color: '#304B60' }}>{t.industrial}</option>
                    <option value="commercial" style={{ color: '#304B60' }}>{t.commercial}</option>
                    <option value="service" style={{ color: '#304B60' }}>{t.service}</option>
                    <option value="educational" style={{ color: '#304B60' }}>{t.educational}</option>
                    <option value="governmental" style={{ color: '#304B60' }}>{t.governmental}</option>
                    <option value="office" style={{ color: '#304B60' }}>{t.office}</option>
                    <option value="shop" style={{ color: '#304B60' }}>{t.shop}</option>
                    <option value="workshop" style={{ color: '#304B60' }}>{t.workshop}</option>
                  </select>
                  <input type="text" name="subIndustry" placeholder={t.specialization} value={formData.subIndustry} onChange={handleInputChange} style={inputStyle} />
                </div>
                {fieldErrors.industry && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.industry}</p>}
                {fieldErrors.subIndustry && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.subIndustry}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" name="authorizedName" placeholder={t.authorizedName} value={formData.authorizedName} onChange={handleInputChange} style={inputStyle} />
                  <input type="text" name="authorizedPosition" placeholder={t.authorizedPosition} value={formData.authorizedPosition} onChange={handleInputChange} style={inputStyle} />
                </div>
                {fieldErrors.authorizedName && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.authorizedName}</p>}
                {fieldErrors.authorizedPosition && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.authorizedPosition}</p>}

                <input type="text" name="companyKeywords" placeholder={t.companyKeywords} value={formData.companyKeywords} onChange={handleInputChange} style={inputStyle} />
                {fieldErrors.companyKeywords && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.companyKeywords}</p>}

                <div style={{ display: 'flex', gap: '16px' }}>
                  <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} style={{ ...selectStyle, width: '112px' }}>
                    <option value="" disabled hidden>{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ color: '#304B60', fontSize: '12px' }}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input type="tel" name="phone" placeholder={t.mobile} value={formData.phone} onChange={handleInputChange} style={{ ...inputStyle, flex: 1 }} />
                </div>
                {(fieldErrors.countryCode || fieldErrors.phone) && (
                  <div>
                    {fieldErrors.countryCode && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>{fieldErrors.countryCode}</p>}
                    {fieldErrors.phone && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>{fieldErrors.phone}</p>}
                  </div>
                )}

                <input type="email" name="email" placeholder={t.email} value={formData.email} onChange={handleInputChange} style={inputStyle} />
                {fieldErrors.email && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.email}</p>}

                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder={t.password} value={formData.password} onChange={handleInputChange} style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>{showPassword ? '👁️' : '🙈'}</button>
                </div>
                {fieldErrors.password && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.password}</p>}

                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder={t.confirmPassword} value={formData.confirmPassword} onChange={handleInputChange} style={inputStyle} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>{showConfirmPassword ? '👁️' : '🙈'}</button>
                </div>
                {fieldErrors.confirmPassword && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>{fieldErrors.confirmPassword}</p>}

                <div style={{ paddingTop: '8px', display: 'flex', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'flex-end', gap: '12px' }}>
                  <PremiumCheckbox id="agreePolicy" checked={formData.agreed} onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))} />
                  <label htmlFor="agreePolicy" style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(48, 75, 96, 0.8)' }}>
                    {t.agreePolicy}{' '}
                    <span onClick={(e) => { e.preventDefault(); setShowPolicy(true); }} style={{ color: '#304B60', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>{t.privacyPolicy}</span>
                  </label>
                </div>
                {fieldErrors.agreed && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginTop: '-8px' }}>{fieldErrors.agreed}</p>}
              </>
            )}

            {fieldErrors.form && <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', padding: '8px' }}>{fieldErrors.form}</p>}

            <button type="submit" disabled={loading || isAnalyzing} style={{ ...buttonStyle, opacity: (loading || isAnalyzing) ? 0.5 : 1 }}>
              {loading || isAnalyzing ? '⏳' : t.register}
            </button>
          </form>
        </div>
      )}

      {/* Modals */}
      {showPhotoModal && <PhotoOptionsModal t={t} onSelectFromGallery={() => getPhoto(CameraSource.Photos)} onTakePhoto={() => getPhoto(CameraSource.Camera)} onClose={() => setShowPhotoModal(false)} />}
      {showCropModal && <CropModal t={t} tempImage={tempImage} crop={crop} setCrop={setCrop} onCropComplete={onCropComplete} onSave={handleCropSave} onClose={() => setShowCropModal(false)} />}
      {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} onAgree={() => { setFormData(prev => ({ ...prev, agreed: true })); setShowPolicy(false); }} />}
      {isAnalyzing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#E3DAD1', borderRadius: '48px', padding: '32px', maxWidth: '384px', width: '100%', textAlign: 'center', border: '2px solid rgba(212, 129, 97, 0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#304B60', marginBottom: '16px' }}>{t.aiAnalyzing}</h3>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid #304B60', borderTop: '4px solid #D48161', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}