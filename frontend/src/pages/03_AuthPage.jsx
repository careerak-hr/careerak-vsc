import React, { useState, useEffect, useCallback } from 'react';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';

// Context & Services
import countries from '../data/countries.json';

// Modals
import PhotoOptionsModal from '../components/modals/PhotoOptionsModal';
import CropModal from '../components/modals/CropModal';
import PolicyModal from '../components/modals/PolicyModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const authTranslations = {
  ar: {
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    phone: 'رقم الهاتف',
    country: 'البلد',
    city: 'المدينة',
    interests: 'الاهتمامات',
    birthDate: 'تاريخ الميلاد',
    register: 'تسجيل',
    confirmData: 'هل أنت متأكد من البيانات المدخلة؟',
    yes: 'نعم',
    no: 'لا',
    ageError: 'يجب أن يكون عمرك 18 سنة على الأقل',
    above18: 'عمري فوق 18',
    below18: 'عمري تحت 18',
    ageCheckTitle: 'التحقق من العمر',
    ageCheckMessage: 'هل عمرك فوق 18 سنة؟',
    sorryMessage: 'عذراً، نأسف لعدم إمكانية استخدامك لتطبيق كاريرك بسبب سياسة التطبيق',
    goodbye: 'حسناً، وداعاً',
    individuals: 'أفراد',
    companies: 'شركات',
    uploadPhoto: 'رفع الصورة',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    preferNot: 'أرغب عدم التحديد',
    educationLevel: 'المستوى العلمي',
    phd: 'دكتوراة',
    masters: 'ماجستير',
    bachelors: 'بكالوريوس',
    highSchool: 'ثانوية',
    middleSchool: 'متوسطة / إعدادية',
    elementary: 'ابتدائية / أساسية',
    illiterate: 'غير متعلم / أقرأ وأكتب',
    uneducated: 'أمّي / لا أقرأ ولا أكتب',
    specialization: 'التخصص',
    keywords: 'الكلمات المفتاحية',
    countryCode: 'كود البلد',
    mobile: 'رقم الجوال',
    disabilities: 'هل أنت من ذوي الهمم؟',
    disabilityType: 'نوع الاحتياج',
    visual: 'بصري',
    hearing: 'سمعي',
    speech: 'نطقي',
    mobility: 'حركي',
    agreePolicy: 'أوافق على سياسة الخصوصية',
    companyName: 'اسم المنشأة',
    industry: 'مجال عمل الشركة',
    industrial: 'شركة صناعية',
    commercial: 'شركة تجارية',
    service: 'شركة خدمية',
    educational: 'مؤسسة تعليمية / أكاديمية',
    governmental: 'مؤسسة حكومية',
    office: 'مكتب',
    shop: 'محل',
    workshop: 'ورشة',
    authorizedName: 'اسم الشخص المفوض',
    authorizedPosition: 'وظيفة الشخص المفوض',
    companyKeywords: 'كلمات مفتاحية عن الشركة',
    invalidImage: 'الصورة غير صالحة. يرجى رفع صورة شخصية للأفراد أو لوجو للشركات.',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    crop: 'قص',
    done: 'تم',
    cancel: 'إلغاء',
    selectFromGallery: 'اختر من المعرض',
    takePhoto: 'التقط صورة',
    cropTitle: 'قص الصورة',
    preview: 'معاينة:',
    aiAnalyzing: 'تحليل بالذكاء الاصطناعي...'
  },
  en: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone Number',
    country: 'Country',
    city: 'City',
    interests: 'Interests',
    birthDate: 'Birth Date',
    register: 'Register',
    confirmData: 'Are you sure about the entered data?',
    yes: 'Yes',
    no: 'No',
    ageError: 'You must be at least 18 years old',
    above18: 'I am above 18',
    below18: 'I am below 18',
    ageCheckTitle: 'Age Verification',
    ageCheckMessage: 'Are you above 18 years old?',
    sorryMessage: 'Sorry, we regret that you cannot use Careerak app due to our policy',
    goodbye: 'Okay, goodbye',
    individuals: 'Individuals',
    companies: 'Companies',
    uploadPhoto: 'Upload Photo',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    preferNot: 'Prefer not to say',
    educationLevel: 'Education Level',
    phd: 'PhD',
    masters: 'Masters',
    bachelors: 'Bachelors',
    highSchool: 'High School',
    middleSchool: 'Middle School',
    elementary: 'Elementary',
    illiterate: 'Illiterate / Can read and write',
    uneducated: 'Uneducated / Cannot read or write',
    specialization: 'Specialization',
    keywords: 'Keywords',
    countryCode: 'Country Code',
    mobile: 'Mobile Number',
    disabilities: 'Do you have disabilities?',
    disabilityType: 'Disability Type',
    visual: 'Visual',
    hearing: 'Hearing',
    speech: 'Speech',
    mobility: 'Mobility',
    agreePolicy: 'I agree to the privacy policy',
    companyName: 'Company Name',
    industry: 'Company Industry',
    industrial: 'Industrial Company',
    commercial: 'Commercial Company',
    service: 'Service Company',
    educational: 'Educational Institution',
    governmental: 'Governmental Institution',
    office: 'Office',
    shop: 'Shop',
    workshop: 'Workshop',
    authorizedName: 'Authorized Person Name',
    authorizedPosition: 'Authorized Person Position',
    companyKeywords: 'Company Keywords',
    invalidImage: 'Invalid image. Please upload a personal photo for individuals or a logo for companies.',
    gallery: 'Gallery',
    camera: 'Camera',
    crop: 'Crop',
    done: 'Done',
    cancel: 'Cancel',
    selectFromGallery: 'Select from Gallery',
    takePhoto: 'Take Photo',
    cropTitle: 'Crop Image',
    preview: 'Preview:',
    aiAnalyzing: 'AI Analyzing...'
  },
  fr: {
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    phone: 'Numéro de téléphone',
    country: 'Pays',
    city: 'Ville',
    interests: 'Intérêts',
    birthDate: 'Date de naissance',
    register: 'S\'inscrire',
    confirmData: 'Êtes-vous sûr des données saisies ?',
    yes: 'Oui',
    no: 'Non',
    ageError: 'Vous devez avoir au moins 18 ans',
    above18: 'J\'ai plus de 18 ans',
    below18: 'J\'ai moins de 18 ans',
    ageCheckTitle: 'Vérification de l\'âge',
    ageCheckMessage: 'Avez-vous plus de 18 ans ?',
    sorryMessage: 'Désolé, nous regrettons que vous ne puissiez pas utiliser l\'application Careerak en raison de notre politique',
    goodbye: 'D\'accord, au revoir',
    individuals: 'Individus',
    companies: 'Entreprises',
    uploadPhoto: 'Télécharger une photo',
    gender: 'Genre',
    male: 'Homme',
    female: 'Femme',
    preferNot: 'Préfère ne pas dire',
    educationLevel: 'Niveau d\'éducation',
    phd: 'Doctorat',
    masters: 'Maîtrise',
    bachelors: 'Licence',
    highSchool: 'Lycée',
    middleSchool: 'Collège',
    elementary: 'École primaire',
    illiterate: 'Analphabète / Sait lire et écrire',
    uneducated: 'Analphabète / Ne sait ni lire ni écrire',
    specialization: 'Spécialisation',
    keywords: 'Mots-clés',
    countryCode: 'Code pays',
    mobile: 'Numéro de portable',
    disabilities: 'Avez-vous des handicaps ?',
    disabilityType: 'Type de handicap',
    visual: 'Visuel',
    hearing: 'Auditif',
    speech: 'Parole',
    mobility: 'Mobilité',
    agreePolicy: 'J\'accepte la politique de confidentialité',
    companyName: 'Nom de l\'établissement',
    industry: 'Secteur d\'activité de l\'entreprise',
    industrial: 'Entreprise industrielle',
    commercial: 'Entreprise commerciale',
    service: 'Entreprise de services',
    educational: 'Institution éducative',
    governmental: 'Institution gouvernementale',
    office: 'Bureau',
    shop: 'Magasin',
    workshop: 'Atelier',
    authorizedName: 'Nom de la personne autorisée',
    authorizedPosition: 'Poste de la personne autorisée',
    companyKeywords: 'Mots-clés sur l\'entreprise',
    invalidImage: 'Image invalide. Veuillez télécharger une photo personnelle pour les individus ou un logo pour les entreprises.',
    gallery: 'Galerie',
    camera: 'Caméra',
    crop: 'Rogner',
    done: 'Terminé',
    cancel: 'Annuler',
    selectFromGallery: 'Sélectionner dans la galerie',
    takePhoto: 'Prendre une photo',
    cropTitle: 'Rogner l\'image',
    preview: 'Aperçu :',
    aiAnalyzing: 'Analyse IA...'
  }
};

// Age Check Modal Component
const AgeCheckModal = ({ t, onResponse }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-[#D48161]/20">
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
            className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-[#D48161]/20">
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

// AI Analysis Component
const AIAnalysisModal = ({ t, image, onAccept, onReject, isAnalyzing }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-[#D48161]/20">
        <h3 className="text-xl font-black text-[#304B60] mb-4">{t.aiAnalyzing}</h3>
        <div className="w-24 h-24 rounded-full border-4 border-[#304B60] border-t-[#D48161] animate-spin mx-auto mb-6"></div>
        {image && (
          <img
            src={image}
            alt="Analyzing"
            className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-[#304B60]"
          />
        )}
        <div className="flex gap-4">
          <button
            onClick={onAccept}
            disabled={isAnalyzing}
            className="flex-1 bg-[#304B60] text-[#D48161] py-3 rounded-2xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {t.done}
          </button>
          <button
            onClick={onReject}
            disabled={isAnalyzing}
            className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {t.cancel}
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

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // For demo purposes, always accept the image
      // In real app, implement actual AI analysis
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

      // Email is required unless illiterate or uneducated
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
    // Registration logic here
    console.log('Registering user:', { userType, formData, profileImage });
    // Navigate to appropriate page based on user type
  };

  if (showAgeCheck) {
    return <AgeCheckModal t={t} onResponse={handleAgeResponse} />;
  }

  if (showGoodbyeModal) {
    return <GoodbyeModal t={t} onConfirm={handleGoodbyeConfirm} />;
  }

  const inputBase = 'w-full p-4 bg-[#F5F5F5] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] placeholder-gray-400 transition-all';
  const selectBase = 'w-full p-4 bg-[#F5F5F5] rounded-2xl font-bold text-center shadow-lg border-2 border-[#D48161]/20 focus:border-[#304B60] outline-none text-[#304B60] transition-all';

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
                : 'bg-[#F5F5F5] text-[#304B60] border-2 border-[#D48161]/20'
            }`}
          >
            {t.individuals}
          </button>
          <button
            onClick={() => handleUserTypeChange('company')}
            className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${
              userType === 'company'
                ? 'bg-[#304B60] text-[#D48161]'
                : 'bg-[#F5F5F5] text-[#304B60] border-2 border-[#D48161]/20'
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
                className="w-24 h-24 rounded-full border-4 border-[#304B60] mx-auto mb-2 cursor-pointer hover:scale-105 transition-all flex items-center justify-center bg-[#F5F5F5]"
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
                    <option value="">{t.gender}</option>
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="preferNot">{t.preferNot}</option>
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
                    <option value="">{t.educationLevel}</option>
                    <option value="phd">{t.phd}</option>
                    <option value="masters">{t.masters}</option>
                    <option value="bachelors">{t.bachelors}</option>
                    <option value="highSchool">{t.highSchool}</option>
                    <option value="middleSchool">{t.middleSchool}</option>
                    <option value="elementary">{t.elementary}</option>
                    <option value="illiterate">{t.illiterate}</option>
                    <option value="uneducated">{t.uneducated}</option>
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
                  placeholder={t.interests}
                  value={formData.interests}
                  onChange={handleInputChange}
                  className={`${inputBase} h-20`}
                />
                {fieldErrors.interests && <p className="text-red-600 font-bold text-sm">{fieldErrors.interests}</p>}

                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className={`${selectBase} text-sm`}
                  >
                    <option value="">{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
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
                  <input
                    type="email"
                    name="email"
                    placeholder={t.email}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                )}
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

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="specialNeeds"
                    checked={formData.isSpecialNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSpecialNeeds: e.target.checked }))}
                    className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#F5F5F5]"
                  />
                  <label htmlFor="specialNeeds" className="text-sm font-bold text-[#304B60]/80 cursor-pointer">
                    {t.disabilities}
                  </label>
                </div>

                {formData.isSpecialNeeds && (
                  <select
                    name="specialNeedType"
                    value={formData.specialNeedType}
                    onChange={handleInputChange}
                    className={selectBase}
                  >
                    <option value="">{t.disabilityType}</option>
                    <option value="visual">{t.visual}</option>
                    <option value="hearing">{t.hearing}</option>
                    <option value="speech">{t.speech}</option>
                    <option value="mobility">{t.mobility}</option>
                  </select>
                )}
                {fieldErrors.specialNeedType && <p className="text-red-600 font-bold text-sm">{fieldErrors.specialNeedType}</p>}
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
                    <option value="">{t.industry}</option>
                    <option value="industrial">{t.industrial}</option>
                    <option value="commercial">{t.commercial}</option>
                    <option value="service">{t.service}</option>
                    <option value="educational">{t.educational}</option>
                    <option value="governmental">{t.governmental}</option>
                    <option value="office">{t.office}</option>
                    <option value="shop">{t.shop}</option>
                    <option value="workshop">{t.workshop}</option>
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
                  className={`${inputBase} h-20`}
                />
                {fieldErrors.companyKeywords && <p className="text-red-600 font-bold text-sm">{fieldErrors.companyKeywords}</p>}

                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className={`${selectBase} text-sm`}
                  >
                    <option value="">{t.countryCode}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
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
                    type="password"
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
                    type="password"
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="agreePolicy"
                checked={formData.agreed}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#F5F5F5]"
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
