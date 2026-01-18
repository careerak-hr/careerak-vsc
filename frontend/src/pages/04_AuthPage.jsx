import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import Cropper from 'react-easy-crop';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import PolicyPage from './14_PolicyPage';

const countries = [
  { code: '+970', flag: '🇵🇸', name: 'فلسطين', nameEn: 'Palestine' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن', nameEn: 'Jordan' },
  { code: '+964', flag: 'العراق', name: 'العراق' },
  { code: '+963', flag: '🇸🇾', name: 'سوريا', nameEn: 'Syria' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان', nameEn: 'Lebanon' },
  { code: '+966', flag: '🇸🇦', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'قطر', nameEn: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين', nameEn: 'Bahrain' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات العربية المتحدة', nameEn: 'UAE' },
  { code: '+968', flag: '🇴🇲', name: 'عمان', nameEn: 'Oman' },
  { code: '+967', flag: '🇾🇪', name: 'اليمن', nameEn: 'Yemen' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت', nameEn: 'Kuwait' },
  { code: '+20', flag: '🇪🇬', name: 'مصر', nameEn: 'Egypt' },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا', nameEn: 'Libya' },
  { code: '+216', flag: '🇹🇳', name: 'تونس', nameEn: 'Tunisia' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب', nameEn: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر', nameEn: 'Algeria' },
  { code: '+222', flag: '🇲🇷', name: 'موريتانيا', nameEn: 'Mauritania' },
  { code: '+249', flag: '🇸🇩', name: 'السودان', nameEn: 'Sudan' },
  { code: '+252', flag: '🇸🇴', name: 'الصومال', nameEn: 'Somalia' },
  { code: '+253', flag: '🇩🇯', name: 'جيبوتي', nameEn: 'Djibouti' },
  { code: '+269', flag: '🇰🇲', name: 'جزر القمر', nameEn: 'Comoros' },
  { code: '+1', flag: '🇺🇸', name: 'USA', nameEn: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK', nameEn: 'UK' },
  { code: '+33', flag: '🇫🇷', name: 'France', nameEn: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', nameEn: 'Germany' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', nameEn: 'Turkey' },
];

const translations = {
  ar: {
    signup: "حساب جديد", firstName: "الاسم الأول", lastName: "الاسم الأخير",
    companyName: "اسم المنشأة", country: "اختر البلد", mustAgree: "يرجى الموافقة على السياسة",
    loading: "جاري التحميل...", aiAnalyzing: "تحليل ذكي محلي... 🤖",
    invalidFace: "⚠️ عذراً، هذه ليست صورة وجه بشرية حقيقية. يرجى التقاط صورة واضحة لوجهك.",
    invalidLogo: "⚠️ عذراً، هذا ليس شعاراً (Logo) صالحاً للمنشأة. يرجى رفع شعار رسمي.",
    email: "البريد الإلكتروني", emailOptional: "البريد الإلكتروني (اختياري)", phone: "رقم الجوال", password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور", alreadyHave: "لديك حساب بالفعل؟", loginNow: "سجل دخولك الآن",
    eduLevel: "المستوى العلمي", determination: "هل أنت من ذوي الهمم؟", needType: "نوع الاحتياج",
    yes: "نعم", no: "لا", visual: "بصري", hearing: "سمعي", speech: "نطقي", motor: "حركي",
    levels: ["دكتوراة", "ماجستير", "بكالوريوس", "ثانوية", "اعدادية / متوسطة", "ابتدائية / اساسية", "غير متعلم / أقرأ وأكتب", "أمي / لا أقرأ ولا أكتب"],
    companyIndustry: "مجال عمل الشركة",
    industries: ["شركة صناعية", "شركة تجارية", "شركة خدمية", "مؤسسة تعليمية / أكاديمية", "مؤسسة حكومية", "مكتب", "محل", "ورشة"],
    authorizedName: "اسم الشخص المفوض", authorizedPosition: "وظيفة الشخص المفوض",
    confirmData: "متأكد من كامل البيانات ومسؤول عنها", cropTitle: "تحديد الصورة",
    passMatch: "كلمات المرور غير متطابقة", photoReq: "يرجى رفع صورة شخصية"
  }
};

export default function AuthPage() {
  const { language, login: performContextLogin } = useAuth();
  const lang = language || 'ar';
  const t = translations[lang] || translations.ar;
  const navigate = useNavigate();

  const [userType, setUserType] = useState('individuals');
  const [agreed, setAgreed] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imgAnalyzing, setImgAnalyzing] = useState(false);
  const [imgError, setImgError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', password: '',
    confirmPassword: '', phone: '', country: '', countryCode: '',
    education: '', isSpecialNeeds: false, specialNeedType: '',
    industry: '', authorizedName: '', authorizedPosition: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { setIsVisible(true); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const onCropComplete = useCallback((activeArea, activeAreaPixels) => {
    setCroppedAreaPixels(activeAreaPixels);
  }, []);

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
    } catch (e) {}
  };

  // --- دالة الفحص المحلي الجذري دون الحاجة للسيرفر ---
  const validateImageLocally = (base64Str, type) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100; // تصغير للتحليل السريع
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100).data;

        let score = 0;
        if (type === 'face') {
          // خوارزمية فحص تدرج البشرة والحيوية (Smart Skin & Feature Check)
          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i], g = imageData[i+1], b = imageData[i+2];
            // منطق تمييز تدرج البشرة البشرية
            if (r > 95 && g > 40 && b > 20 && (Math.max(r,g,b) - Math.min(r,g,b) > 15) && Math.abs(r-g) > 15 && r > g && r > b) {
              score++;
            }
          }
          // إذا كانت صورة قطة أو جماد، لن تحقق هذه النسبة من تدرج البشرة
          resolve(score > 800);
        } else {
          // خوارزمية فحص اللوجو (Graphic & Contrast Detection)
          let uniqueColors = new Set();
          for (let i = 0; i < imageData.length; i += 40) {
            uniqueColors.add(`${imageData[i]},${imageData[i+1]},${imageData[i+2]}`);
          }
          // الشعارات تتميز ببساطة الألوان والتباين العالي عكس الصور الطبيعية المشتتة
          resolve(uniqueColors.size < 40);
        }
      };
    });
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      setShowCropModal(false);
      setImgAnalyzing(true);
      setImgError('');
      setProfileImage(null);

      // الفحص المحلي الفوري
      const isValid = await validateImageLocally(croppedImage, userType === 'companies' ? 'logo' : 'face');

      setTimeout(() => {
        if (isValid) {
          setProfileImage(croppedImage);
          setImgError('');
        } else {
          setImgError(userType === 'companies' ? t.invalidLogo : t.invalidFace);
          setProfileImage(null);
        }
        setImgAnalyzing(false);
      }, 1500); // محاكاة وقت المعالجة للجمالية فقط

    } catch (e) {
      console.error(e);
      setImgAnalyzing(false);
    }
  };

  const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.country) errors.country = lang === 'ar' ? "يرجى اختيار البلد" : "Select Country";
    if (userType === 'individuals') {
      if (!formData.firstName) errors.firstName = lang === 'ar' ? "الاسم الأول مطلوب" : "First Name required";
      if (!formData.lastName) errors.lastName = lang === 'ar' ? "الاسم الأخير مطلوب" : "Last Name required";
      if (!formData.education) errors.education = lang === 'ar' ? "يرجى اختيار المستوى التعليمي" : "Select Education";
    } else {
      if (!formData.companyName) errors.companyName = lang === 'ar' ? "اسم المنشأة مطلوب" : "Company Name required";
      if (!formData.industry) errors.industry = lang === 'ar' ? "يرجى اختيار مجال العمل" : "Select Industry";
      if (!formData.authorizedName) errors.authorizedName = lang === 'ar' ? "اسم المفوض مطلوب" : "Authorized Name required";
      if (!formData.authorizedPosition) errors.authorizedPosition = lang === 'ar' ? "وظيفة المفوض مطلوبة" : "Authorized Position required";
    }
    if (!formData.phone) errors.phone = lang === 'ar' ? "رقم الجوال مطلوب" : "Phone required";
    if (!formData.countryCode) errors.countryCode = lang === 'ar' ? "مفتاح الدولة مطلوب" : "Code required";
    if (!formData.email) errors.email = lang === 'ar' ? "البريد مطلوب" : "Email required";
    if (!formData.password) errors.password = lang === 'ar' ? "كلمة المرور مطلوبة" : "Password required";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t.passMatch;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (imgAnalyzing) return;
    if (!profileImage) { setImgError(t.photoReq); return; }
    if (!agreed) { setFieldErrors(p => ({...p, agreed: t.mustAgree})); return; }
    setShowConfirmPopup(true);
  };

  const performRegister = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    try {
      const payload = { ...formData, profileImage, role: userType === 'companies' ? 'HR' : 'Employee' };
      const res = await userService.register(payload);
      await performContextLogin(res.data.user, res.data.token);

      const user = res.data.user;
      const isIlliterate = user.education === 'أمي / لا أقرأ ولا أكتب' || user.education === 'Illiterate';
      const isBlind = user.isSpecialNeeds && user.specialNeedType === 'بصري';

      if (isIlliterate && isBlind) navigate('/onboarding-ultimate');
      else if (isIlliterate) navigate('/onboarding-illiterate');
      else if (isBlind) navigate('/onboarding-visual');
      else navigate(user.role === 'HR' ? '/onboarding-companies' : '/onboarding-individuals');

    } catch (err) {
      setFieldErrors({ api: err.response?.data?.error || "Error" });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full p-5 bg-white/60 rounded-[2rem] font-black text-center shadow-sm border-2 border-transparent focus:border-[#1A365D]/20 outline-none transition-all";
  const errorText = "text-[10px] text-[#FF0000] font-black px-6 mt-1";

  const PLACEHOLDER_COLOR = "#A1A1A1";
  const ACTIVE_COLOR = "#1A365D";

  return (
    <div className={`min-h-screen w-full flex flex-col items-center p-4 bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showPolicy && <div className="fixed inset-0 z-[12000] bg-white overflow-y-auto"><PolicyPage /><button onClick={() => { setAgreed(true); setShowPolicy(false); }} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs py-5 bg-[#1A365D] text-white rounded-2xl font-black shadow-2xl">{lang === 'ar' ? 'أوافق' : 'I Agree'}</button></div>}

      <div className="w-full max-w-lg flex flex-col items-center mt-4">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="Logo" className="h-28 w-28 mx-auto rounded-full shadow-2xl mb-4 border-[3px] border-[#1A365D]" />
          <h2 className="text-4xl font-black text-[#1A365D] italic">{t.signup}</h2>
        </div>

        <div className="flex gap-2 p-1 bg-white/30 rounded-2xl mb-6 w-full shadow-inner">
          <button type="button" onClick={() => setUserType('individuals')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${userType === 'individuals' ? 'bg-[#1A365D] text-white shadow-lg' : 'text-[#1A365D]/40'}`}>{lang === 'ar' ? 'أفراد' : 'Individuals'}</button>
          <button type="button" onClick={() => setUserType('companies')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${userType === 'companies' ? 'bg-[#1A365D] text-white shadow-lg' : 'text-[#1A365D]/40'}`}>{lang === 'ar' ? 'شركات' : 'Companies'}</button>
        </div>

        <form onSubmit={handleRegisterClick} className="w-full space-y-4 pb-10" noValidate>
          <div className="flex flex-col items-center mb-2">
            <button type="button" onClick={() => setShowPhotoModal(true)} className="w-36 h-36 rounded-full bg-white/50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden relative active:scale-95 transition-all">
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <span className="text-7xl opacity-20">👤</span>}
              {imgAnalyzing && (
                <div className="absolute inset-0 bg-[#1A365D]/60 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] text-white font-bold">{t.aiAnalyzing}</span>
                </div>
              )}
            </button>
            {imgError && <div className="px-6 text-center mt-2 animate-shake"><p style={{ color: '#FF0000', fontWeight: '900', fontSize: '11px' }}>{imgError}</p></div>}
          </div>

          <div className="w-full">
            <select name="country" value={formData.country} onChange={handleInputChange} className={`${inputBase} appearance-none`} style={{ color: !formData.country ? PLACEHOLDER_COLOR : ACTIVE_COLOR }} required>
              <option value="" disabled>-- {t.country} --</option>
              {countries.map(c => <option key={c.nameEn} value={c.nameEn} style={{color: ACTIVE_COLOR}}>{c.flag} {lang === 'ar' ? c.name : c.nameEn}</option>)}
            </select>
            {fieldErrors.country && <p className={errorText}>{fieldErrors.country}</p>}
          </div>

          {userType === 'individuals' ? (
            <>
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="w-full">
                  <input type="text" name="firstName" placeholder={t.firstName} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
                  {fieldErrors.firstName && <p className={errorText}>{fieldErrors.firstName}</p>}
                </div>
                <div className="w-full">
                  <input type="text" name="lastName" placeholder={t.lastName} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
                  {fieldErrors.lastName && <p className={errorText}>{fieldErrors.lastName}</p>}
                </div>
              </div>
              <div className="w-full">
                <select name="education" value={formData.education} onChange={handleInputChange} className={`${inputBase} appearance-none`} style={{ color: !formData.education ? PLACEHOLDER_COLOR : ACTIVE_COLOR }} required>
                  <option value="" disabled>-- {t.eduLevel} --</option>
                  {t.levels.map(l => <option key={l} value={l} style={{color: ACTIVE_COLOR}}>{l}</option>)}
                </select>
                {fieldErrors.education && <p className={errorText}>{fieldErrors.education}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="w-full">
                <input type="text" name="companyName" placeholder={t.companyName} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
                {fieldErrors.companyName && <p className={errorText}>{fieldErrors.companyName}</p>}
              </div>
              <div className="w-full">
                <select name="industry" value={formData.industry} onChange={handleInputChange} className={`${inputBase} appearance-none`} style={{ color: !formData.industry ? PLACEHOLDER_COLOR : ACTIVE_COLOR }} required>
                  <option value="" disabled>-- {t.companyIndustry} --</option>
                  {t.industries.map(ind => <option key={ind} value={ind} style={{color: ACTIVE_COLOR}}>{ind}</option>)}
                </select>
                {fieldErrors.industry && <p className={errorText}>{fieldErrors.industry}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full">
                  <input type="text" name="authorizedName" placeholder={t.authorizedName} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400 text-xs`} />
                  {fieldErrors.authorizedName && <p className={errorText}>{fieldErrors.authorizedName}</p>}
                </div>
                <div className="w-full">
                  <input type="text" name="authorizedPosition" placeholder={t.authorizedPosition} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400 text-xs`} />
                  {fieldErrors.authorizedPosition && <p className={errorText}>{fieldErrors.authorizedPosition}</p>}
                </div>
              </div>
            </>
          )}

          <div className="w-full flex gap-2 items-start">
            <div className="flex-1">
              <input type="tel" name="phone" placeholder={t.phone} onChange={handleInputChange} className="w-full p-5 bg-white/60 text-[#1A365D] placeholder:text-gray-400 rounded-[2rem] font-black text-center shadow-sm outline-none border-2 border-transparent focus:border-[#1A365D]/20 h-[68px]" />
              {fieldErrors.phone && <p className={errorText}>{fieldErrors.phone}</p>}
            </div>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-32 p-5 bg-white/60 rounded-[2rem] outline-none font-black text-center shadow-sm appearance-none border-2 border-transparent h-[68px]"
              style={{ color: !formData.countryCode ? PLACEHOLDER_COLOR : ACTIVE_COLOR }}
              required
            >
              <option value="" disabled>--</option>
              {countries.map(c => <option key={c.code} value={c.code} style={{color: ACTIVE_COLOR}}>{c.flag} {c.code}</option>)}
            </select>
          </div>

          <div className="w-full">
            <input type="email" name="email" placeholder={t.email} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
            {fieldErrors.email && <p className={errorText}>{fieldErrors.email}</p>}
          </div>

          <div className="w-full space-y-4">
            <div className="relative">
              <input type={showPass ? "text" : "password"} name="password" placeholder={t.password} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">{showPass ? '👁️' : '🙈'}</button>
              {fieldErrors.password && <p className={errorText}>{fieldErrors.password}</p>}
            </div>
            <div className="relative">
              <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" placeholder={t.confirmPassword} onChange={handleInputChange} className={`${inputBase} text-[#1A365D] placeholder:text-gray-400`} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">{showConfirmPass ? '👁️' : '🙈'}</button>
              {fieldErrors.confirmPassword && <p className={errorText}>{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          {userType === 'individuals' && (
            <div className="p-6 bg-white/30 rounded-[2.5rem] space-y-4 shadow-inner border border-white/50">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-[#1A365D]/60">{t.determination}</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isSpecialNeeds" checked={formData.isSpecialNeeds === true} onChange={() => setFormData(p => ({...p, isSpecialNeeds: true}))} className="w-5 h-5" /><span className="text-xs font-black text-[#1A365D]">{t.yes}</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isSpecialNeeds" checked={formData.isSpecialNeeds === false} onChange={() => setFormData(p => ({...p, isSpecialNeeds: false}))} className="w-5 h-5" /><span className="text-xs font-black text-[#1A365D]">{t.no}</span></label>
                </div>
              </div>
              {formData.isSpecialNeeds && (
                <div className="w-full">
                  <select name="specialNeedType" value={formData.specialNeedType} onChange={handleInputChange} className={`${inputBase} !p-4 !text-xs appearance-none`} style={{ color: !formData.specialNeedType ? PLACEHOLDER_COLOR : ACTIVE_COLOR }} required>
                    <option value="" disabled>-- {t.needType} --</option>
                    <option value="بصري" style={{color: ACTIVE_COLOR}}>{t.visual}</option>
                    <option value="سمعي" style={{color: ACTIVE_COLOR}}>{t.hearing}</option>
                    <option value="نطقي" style={{color: ACTIVE_COLOR}}>{t.speech}</option>
                    <option value="حركي" style={{color: ACTIVE_COLOR}}>{t.motor}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="w-full">
            <div className="flex items-center gap-4 px-6 py-2 text-[11px] font-bold text-[#1A365D]/40">
              <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if(e.target.checked) setFieldErrors(p => { const n={...p}; delete n.agreed; return n; }) }} className="w-5 h-5 rounded-lg border-white text-[#1A365D] bg-white/50" />
              <p>{lang === 'ar' ? 'أوافق على' : 'I agree to'} <button type="button" onClick={() => setShowPolicy(true)} className="text-[#1A365D] underline font-black">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</button></p>
            </div>
            {fieldErrors.agreed && <p className={errorText}>{fieldErrors.agreed}</p>}
          </div>

          {fieldErrors.api && <div className="p-4 bg-red-100 text-[#FF0000] rounded-2xl text-[11px] font-black text-center border border-red-200">{fieldErrors.api}</div>}

          <button type="submit" disabled={loading || imgAnalyzing} className="w-full py-7 rounded-[3rem] bg-[#1A365D] text-white font-black shadow-2xl active:scale-95 transition-all text-2xl mt-4">
            {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : t.signup}
          </button>
        </form>
      </div>

      {showPhotoModal && (
        <div className="fixed inset-0 z-[13000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-[#1A365D] font-black text-xl mb-8">{lang === 'ar' ? 'إضافة صورة' : 'Add Photo'}</h3>
            <div className="space-y-4">
              <button onClick={() => getPhoto(CameraSource.Camera)} className="w-full py-5 bg-gray-50 text-[#1A365D] rounded-[1.5rem] font-black">📷 {lang === 'ar' ? 'الكاميرا' : 'Camera'}</button>
              <button onClick={() => getPhoto(CameraSource.Photos)} className="w-full py-5 bg-gray-50 text-[#1A365D] rounded-[1.5rem] font-black">🖼️ {lang === 'ar' ? 'المعرض' : 'Gallery'}</button>
              <button onClick={() => setShowPhotoModal(false)} className="w-full py-4 text-gray-400 font-bold">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 z-[14000] bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden mb-6">
            <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="w-full space-y-4 max-w-xs">
            <button onClick={handleCropSave} className="w-full py-5 bg-[#1A365D] text-white rounded-2xl font-black text-xl shadow-lg">{lang === 'ar' ? 'حفظ الصورة' : 'Save Image'}</button>
            <button onClick={() => setShowCropModal(false)} className="w-full py-4 text-white/60 font-bold">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {showConfirmPopup && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xs text-center shadow-2xl">
            <p className="text-[#1A365D] font-black text-lg mb-8 leading-relaxed">{t.confirmData}</p>
            <div className="flex gap-4">
              <button onClick={performRegister} className="flex-1 py-4 bg-[#1A365D] text-white rounded-2xl font-black shadow-lg">{t.yes}</button>
              <button onClick={() => setShowConfirmPopup(false)} className="flex-1 py-4 border-2 border-[#1A365D] text-[#1A365D] rounded-2xl font-black">{t.no}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
