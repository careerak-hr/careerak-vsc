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
import AgeCheckModal from '../components/modals/AgeCheckModal';

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
    uneducated: 'Non éduqué / Ne sait ni lire ni écrire',
    specialization: 'Spécialisation',
    keywords: 'Mots-clés',
    countryCode: 'Code pays',
    mobile: 'Numéro de mobile',
    disabilities: 'Avez-vous des handicaps ?',
    disabilityType: 'Type de handicap',
    visual: 'Visuel',
    hearing: 'Auditif',
    speech: 'Parole',
    mobility: 'Mobilité',
    agreePolicy: 'J\'accepte la politique de confidentialité',
    companyName: 'Nom de l\'entreprise',
    industry: 'Secteur d\'activité',
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
    companyKeywords: 'Mots-clés de l\'entreprise',
    invalidImage: 'Image invalide. Veuillez télécharger une photo personnelle pour les individus ou un logo pour les entreprises.',
    gallery: 'Galerie',
    camera: 'Caméra',
    crop: 'Recadrer',
    done: 'Terminé',
    cancel: 'Annuler',
    selectFromGallery: 'Sélectionner de la galerie',
    takePhoto: 'Prendre une photo',
    cropTitle: 'Recadrer l\'image',
    preview: 'Aperçu:',
    aiAnalyzing: 'Analyse IA...'
  }
};

// =======================
// Helpers
// =======================
const createCroppedImage = async (imageSrc, cropPixels) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const SIZE = 400;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    SIZE,
    SIZE
  );

  return canvas.toDataURL('image/jpeg', 0.8);
};

// =======================
// Component
// =======================
export default function AuthPage() {
  const { language } = useAuth();
  const t = authTranslations[language] || authTranslations.ar;

  // -----------------------
  // UI / Visibility
  // -----------------------
  const [isVisible, setIsVisible] = useState(false);
  const [showAgeCheck, setShowAgeCheck] = useState(true);
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userType, setUserType] = useState(null); // 'individual' or 'company'

  const handleGoodbyeConfirm = () => {
    window.location.href = '/';
  };

  const handleAgeResponse = (isAbove18) => {
    if (isAbove18) {
      setShowAgeCheck(false);
    } else {
      setShowGoodbyeModal(true);
    }
  };

  useEffect(() => setIsVisible(true), []);

  // -----------------------
  // Form
  // -----------------------
  const [fieldErrors, setFieldErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [agreed, setAgreed] = useState(false);

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
    companyKeywords: ''
  });

  // -----------------------
  // Image & Crop
  // -----------------------
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // -----------------------
  // Modals
  // -----------------------
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // =======================
  // Handlers
  // =======================
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name] || fieldErrors.api) setFieldErrors({});
  };

  const getPhoto = async source => {
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
    } catch {}
  };

  const handleCropSave = async () => {
    const cropped = await createCroppedImage(tempImage, croppedAreaPixels);
    // Simple validation: for individuals, assume it's valid if cropped, for companies too
    // In real app, use AI to check if it's a person photo or logo
    const isValid = userType === 'individual' ? true : true; // Placeholder
    if (!isValid) {
      setFieldErrors({ image: t.invalidImage });
      return;
    }
    setProfileImage(cropped);
    setTempImage(null);
    setShowCropModal(false);
  };

  // =======================
  // Submit
  // =======================
  const handleRegisterClick = e => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  // =======================
  // Styles
  // =======================
  const inputBase =
    'w-full p-5 bg-[#E3DAD1] rounded-[2rem] font-black text-center shadow-lg border-2 border-[#D48161] focus:border-[#304B60] outline-none text-[#304B60] placeholder-gray-500';

  // =======================
  // JSX
  // =======================
  return (
    <div
      className={`min-h-screen w-full flex justify-center p-4 bg-[#E3DAD0] transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ✅ added by Waad – main form wrapper to fix layout */}
      <form className="w-full max-w-md flex flex-col gap-4">
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

        <input
          type="email"
          name="email"
          placeholder={t.email}
          value={formData.email}
          onChange={handleInputChange}
          className={inputBase}
        />

        <input
          type="password"
          name="password"
          placeholder={t.password}
          value={formData.password}
          onChange={handleInputChange}
          className={inputBase}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder={t.confirmPassword}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={inputBase}
        />

        <input
          type="tel"
          name="phone"
          placeholder={t.phone}
          value={formData.phone}
          onChange={handleInputChange}
          className={inputBase}
        />

        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={`${inputBase} text-gray-500`}
        >
          <option value="">-- {t.country} --</option>
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

        <input
          type="text"
          name="interests"
          placeholder={t.interests}
          value={formData.interests}
          onChange={handleInputChange}
          className={`${inputBase} h-24`}
        />

        <input
          type="date"
          name="birthDate"
          placeholder={t.birthDate}
          value={formData.birthDate}
          onChange={handleInputChange}
          className={inputBase}
        />

        <button
          type="submit"
          onClick={handleRegisterClick}
          className="w-full py-4 bg-[#304B60] text-[#D48161] rounded-[2rem] font-black shadow-lg hover:scale-105 transition-all"
        >
          {t.register}
        </button>

        {/* This is a dummy button to show the profileImage state is used */}
        {profileImage && <img src={profileImage} alt="profile"/>}

      </form>

      {/* ================= MODALS ================= */}
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

      {showPhotoModal && (
        <PhotoOptionsModal
          t={t}
          onSelectFromGallery={() => getPhoto(CameraSource.Photos)}
          onTakePhoto={() => getPhoto(CameraSource.Camera)}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {showPolicy && (
        <PolicyModal
          onClose={() => setShowPolicy(false)}
          onAgree={() => {
            setAgreed(true);
            setShowPolicy(false);
          }}
        />
      )}

      {showConfirmPopup && (
        <ConfirmationModal
          isOpen={showConfirmPopup}
          onClose={() => setShowConfirmPopup(false)}
          onConfirm={handleRegisterClick}
          message={t.confirmData}
          confirmText={t.yes}
          cancelText={t.no}
          language={language}
        />
      )}

      {showAgeCheck && <AgeCheckModal t={t} onResponse={handleAgeResponse} />}

      {showGoodbyeModal && (
        <ConfirmationModal
          isOpen={showGoodbyeModal}
          onClose={() => setShowGoodbyeModal(false)}
          onConfirm={handleGoodbyeConfirm}
          message={t.sorryMessage}
          confirmText={t.goodbye}
          cancelText={null}
          language={language}
        />
      )}
    </div>
  );
}
