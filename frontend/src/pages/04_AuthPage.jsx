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
  { code: '+964', flag: '🇮🇶', name: 'العراق', nameEn: 'Iraq' },
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
];

const translations = {
  ar: {
    signup: "حساب جديد", firstName: "الاسم الأول", lastName: "الاسم الأخير",
    companyName: "اسم المنشأة", country: "اختر البلد", city: "المدينة", mustAgree: "يرجى الموافقة على السياسة",
    loading: "جاري التحميل...", aiAnalyzing: "تحليل ذكي محلي... 🤖",
    invalidFace: "⚠️ عذراً، هذه ليست صورة وجه بشرية حقيقية.",
    invalidLogo: "⚠️ عذراً، هذا ليس شعاراً صالحاً.",
    email: "البريد الإلكتروني", phone: "رقم الجوال", password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور", eduLevel: "المستوى العلمي",
    determination: "هل أنت من ذوي الهمم؟", specialization: "التخصص / المجال",
    interests: "الاهتمامات", companyIndustry: "مجال العمل",
    authorizedName: "اسم المفوض", authorizedPosition: "وظيفة المفوض",
    confirmData: "هل أنت متأكد من البيانات؟", yes: "نعم", no: "لا",
    levels: ["دكتوراة", "ماجستير", "بكالوريوس", "ثانوية", "اعدادية", "ابتدائية", "غير متعلم", "أمي"],
    industries: ["صناعية", "تجارية", "خدمية", "تعليمية", "حكومية", "مكتب", "محل", "ورشة"],
    photoReq: "يرجى رفع صورة"
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
    confirmPassword: '', phone: '', country: '', city: '', countryCode: '',
    education: '', specialization: '', interests: '',
    isSpecialNeeds: false, specialNeedType: '',
    industry: '', subIndustry: '', companyKeywords: '',
    authorizedName: '', authorizedPosition: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { setIsVisible(true); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name] || fieldErrors.api) setFieldErrors({});
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

  const handleCropSave = async () => {
    try {
      const image = new Image();
      image.src = tempImage;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const TARGET_SIZE = 400;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, TARGET_SIZE, TARGET_SIZE);
        setProfileImage(canvas.toDataURL('image/jpeg', 0.6));
        setShowCropModal(false);
      };
    } catch (e) {
      console.error(e);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.country) errors.country = "يرجى اختيار البلد";
    if (!formData.email) errors.email = "البريد مطلوب";
    if (!formData.password || formData.password.length < 8) errors.password = "كلمة المرور يجب أن تكون 8 رموز على الأقل";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "كلمات المرور غير متطابقة";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!profileImage) { setImgError(t.photoReq); return; }
    if (!agreed) { setFieldErrors({agreed: "يرجى الموافقة على السياسة"}); return; }
    setShowConfirmPopup(true);
  };

  const performRegister = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    try {
      const payload = {
        ...formData,
        educationLevel: formData.education,
        companyIndustry: formData.industry,
        profileImage,
        role: userType === 'companies' ? 'HR' : 'Employee'
      };

      const res = await userService.register(payload);
      await performContextLogin(res.data.user, res.data.token);
      navigate(res.data.user.role === 'HR' ? '/onboarding-companies' : '/onboarding-individuals');

    } catch (err) {
      // ✅ إظهار تفاصيل الخطأ الحقيقي من أطلس
      const serverError = err.response?.data?.error || "خطأ غير معروف";
      const serverDetails = err.response?.data?.details || "";
      setFieldErrors({ api: `❌ فشل في أطلس: ${serverError} (${serverDetails})` });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full p-5 bg-white/60 rounded-[2rem] font-black text-center shadow-sm border-2 border-transparent focus:border-[#1A365D]/20 outline-none transition-all";
  const errorText = "text-[10px] text-[#FF0000] font-black px-6 mt-1";

  return (
    <div className={`min-h-screen w-full flex flex-col items-center p-4 bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`} dir="rtl">
      {showPolicy && <div className="fixed inset-0 z-[12000] bg-white overflow-y-auto"><PolicyPage /><button onClick={() => { setAgreed(true); setShowPolicy(false); }} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs py-5 bg-[#1A365D] text-white rounded-2xl font-black shadow-2xl">أوافق</button></div>}

      <div className="w-full max-w-lg flex flex-col items-center mt-4">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="Logo" className="h-28 w-28 mx-auto rounded-full shadow-2xl mb-4 border-[3px] border-[#1A365D]" />
          <h2 className="text-4xl font-black text-[#1A365D] italic">{t.signup}</h2>
        </div>

        <div className="flex gap-2 p-1 bg-white/30 rounded-2xl mb-6 w-full shadow-inner">
          <button type="button" onClick={() => setUserType('individuals')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${userType === 'individuals' ? 'bg-[#1A365D] text-white shadow-lg' : 'text-[#1A365D]/40'}`}>أفراد</button>
          <button type="button" onClick={() => setUserType('companies')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${userType === 'companies' ? 'bg-[#1A365D] text-white shadow-lg' : 'text-[#1A365D]/40'}`}>شركات</button>
        </div>

        <form onSubmit={handleRegisterClick} className="w-full space-y-4 pb-10">
          {/* صورة الملف الشخصي */}
          <div className="flex flex-col items-center mb-2">
            <button type="button" onClick={() => setShowPhotoModal(true)} className="w-36 h-36 rounded-full bg-white/50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden relative">
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <span className="text-7xl opacity-20">👤</span>}
            </button>
            {imgError && <p className={errorText}>{imgError}</p>}
          </div>

          {/* الحقول الأساسية */}
          <div className="grid grid-cols-2 gap-3">
            <select name="country" onChange={handleInputChange} className={inputBase}>
              <option value="">-- اختر البلد --</option>
              {countries.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
            </select>
            <input type="text" name="city" placeholder="المدينة" onChange={handleInputChange} className={inputBase} />
          </div>

          {userType === 'individuals' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="firstName" placeholder="الاسم الأول" onChange={handleInputChange} className={inputBase} />
                <input type="text" name="lastName" placeholder="الاسم الأخير" onChange={handleInputChange} className={inputBase} />
              </div>
              <select name="education" onChange={handleInputChange} className={inputBase}>
                <option value="">-- المستوى العلمي --</option>
                {t.levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </>
          ) : (
            <input type="text" name="companyName" placeholder="اسم المنشأة" onChange={handleInputChange} className={inputBase} />
          )}

          <div className="flex gap-2">
            <input type="tel" name="phone" placeholder="رقم الجوال" onChange={handleInputChange} className="flex-1 p-5 bg-white/60 rounded-[2rem] font-black text-center shadow-sm border-2 border-transparent" />
            <select name="countryCode" onChange={handleInputChange} className="w-24 p-5 bg-white/60 rounded-[2rem] font-black text-center shadow-sm">
              <option value="">كود</option>
              {countries.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>

          <input type="email" name="email" placeholder="البريد الإلكتروني" onChange={handleInputChange} className={inputBase} />

          <div className="relative">
            <input type={showPass ? "text" : "password"} name="password" placeholder="كلمة المرور" onChange={handleInputChange} className={inputBase} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30">👁️</button>
          </div>
          <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" placeholder="تأكيد كلمة المرور" onChange={handleInputChange} className={inputBase} />

          <div className="flex items-center gap-4 px-6 py-2 text-[11px] font-bold text-[#1A365D]/40">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded-lg" />
            <p>أوافق على <button type="button" onClick={() => setShowPolicy(true)} className="underline font-black text-[#1A365D]">سياسة الخصوصية</button></p>
          </div>

          {fieldErrors.api && <div className="p-4 bg-red-100 text-[#FF0000] rounded-2xl text-[11px] font-black text-center border border-red-200">{fieldErrors.api}</div>}

          <button type="submit" disabled={loading} className="w-full py-7 rounded-[3rem] bg-[#1A365D] text-white font-black shadow-2xl active:scale-95 transition-all text-2xl">
            {loading ? "جاري التسجيل..." : "حساب جديد"}
          </button>
        </form>
      </div>

      {/* المودالات المعتادة */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-[13000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-[#1A365D] font-black text-xl mb-8">إضافة صورة</h3>
            <div className="space-y-4">
              <button onClick={() => getPhoto(CameraSource.Camera)} className="w-full py-5 bg-gray-50 text-[#1A365D] rounded-[1.5rem] font-black">📷 الكاميرا</button>
              <button onClick={() => getPhoto(CameraSource.Photos)} className="w-full py-5 bg-gray-50 text-[#1A365D] rounded-[1.5rem] font-black">🖼️ المعرض</button>
              <button onClick={() => setShowPhotoModal(false)} className="w-full py-4 text-gray-400 font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 z-[14000] bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden mb-6">
            <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <button onClick={handleCropSave} className="w-full max-w-xs py-5 bg-[#1A365D] text-white rounded-2xl font-black text-xl shadow-lg">حفظ الصورة</button>
        </div>
      )}

      {showConfirmPopup && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xs text-center shadow-2xl">
            <p className="text-[#1A365D] font-black text-lg mb-8 leading-relaxed">هل أنت متأكد من صحة البيانات؟</p>
            <div className="flex gap-4">
              <button onClick={performRegister} className="flex-1 py-4 bg-[#1A365D] text-white rounded-2xl font-black shadow-lg">نعم</button>
              <button onClick={() => setShowConfirmPopup(false)} className="flex-1 py-4 border-2 border-[#1A365D] text-[#1A365D] rounded-2xl font-black">لا</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
