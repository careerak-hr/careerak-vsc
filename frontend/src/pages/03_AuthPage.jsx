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
import StepperComponent from '../components/auth/StepperComponent';
import NavigationButtons from '../components/auth/NavigationButtons';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import EnhancedErrorMessage from '../components/auth/EnhancedErrorMessage';

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
  const [currentStep, setCurrentStep] = useState(1); // Stepper state (1-4)

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
    
    // Email validation helper
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    // Phone validation helper
    const isValidPhone = (phone) => {
      const phoneRegex = /^\d{7,15}$/;
      return phoneRegex.test(phone);
    };
    
    // Age validation helper (must be 18+)
    const isValidAge = (birthDate) => {
      if (!birthDate) return false;
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    };

    if (userType === 'individual') {
      // First Name
      if (!formData.firstName.trim()) {
        errors.firstName = t.errors?.firstNameRequired || 'الاسم الأول مطلوب';
      }
      
      // Last Name
      if (!formData.lastName.trim()) {
        errors.lastName = t.errors?.lastNameRequired || 'الاسم الأخير مطلوب';
      }
      
      // Country
      if (!formData.country) {
        errors.country = t.errors?.countryRequired || 'البلد مطلوب';
      }
      
      // City
      if (!formData.city.trim()) {
        errors.city = t.errors?.cityRequired || 'المدينة مطلوبة';
      }
      
      // Gender
      if (!formData.gender) {
        errors.gender = t.errors?.genderRequired || 'الجنس مطلوب';
      }
      
      // Birth Date
      if (!formData.birthDate) {
        errors.birthDate = t.errors?.birthDateRequired || 'تاريخ الميلاد مطلوب';
      } else if (!isValidAge(formData.birthDate)) {
        errors.birthDate = t.errors?.birthDateInvalid || 'يجب أن يكون عمرك 18 سنة على الأقل';
      }
      
      // Education
      if (!formData.education) {
        errors.education = t.errors?.educationRequired || 'المستوى العلمي مطلوب';
      }
      
      // Specialization
      if (!formData.specialization.trim()) {
        errors.specialization = t.errors?.specializationRequired || 'التخصص مطلوب';
      }
      
      // Interests
      if (!formData.interests.trim()) {
        errors.interests = t.errors?.interestsRequired || 'الاهتمامات مطلوبة';
      }
      
      // Country Code
      if (!formData.countryCode) {
        errors.countryCode = t.errors?.countryCodeRequired || 'كود البلد مطلوب';
      }
      
      // Phone
      if (!formData.phone.trim()) {
        errors.phone = t.errors?.phoneRequired || 'رقم الهاتف مطلوب';
      } else if (!isValidPhone(formData.phone)) {
        errors.phone = t.errors?.phoneInvalid || 'رقم الهاتف غير صحيح';
      }
      
      // Email (required for educated users)
      if (formData.education !== 'illiterate' && formData.education !== 'uneducated') {
        if (!formData.email.trim()) {
          errors.email = t.errors?.emailRequired || 'البريد الإلكتروني مطلوب';
        } else if (!isValidEmail(formData.email)) {
          errors.email = t.errors?.emailInvalid || 'البريد الإلكتروني غير صحيح';
        }
      }
      
      // Password
      if (!formData.password) {
        errors.password = t.errors?.passwordRequired || 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 8) {
        errors.password = t.errors?.passwordWeak || 'كلمة المرور ضعيفة';
      }
      
      // Confirm Password
      if (!formData.confirmPassword) {
        errors.confirmPassword = t.errors?.confirmPasswordRequired || 'تأكيد كلمة المرور مطلوب';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t.errors?.passwordMismatch || 'كلمات المرور غير متطابقة';
      }
      
      // Special Need Type (if special needs is checked)
      if (formData.isSpecialNeeds && !formData.specialNeedType) {
        errors.specialNeedType = t.errors?.specialNeedTypeRequired || 'نوع الاحتياج مطلوب';
      }
      
    } else if (userType === 'company') {
      // Company Name
      if (!formData.companyName.trim()) {
        errors.companyName = t.errors?.companyNameRequired || 'اسم المنشأة مطلوب';
      }
      
      // Country
      if (!formData.country) {
        errors.country = t.errors?.countryRequired || 'البلد مطلوب';
      }
      
      // City
      if (!formData.city.trim()) {
        errors.city = t.errors?.cityRequired || 'المدينة مطلوبة';
      }
      
      // Industry
      if (!formData.industry) {
        errors.industry = t.errors?.industryRequired || 'مجال العمل مطلوب';
      }
      
      // Sub Industry
      if (!formData.subIndustry.trim()) {
        errors.subIndustry = t.errors?.subIndustryRequired || 'التخصص مطلوب';
      }
      
      // Authorized Name
      if (!formData.authorizedName.trim()) {
        errors.authorizedName = t.errors?.authorizedNameRequired || 'اسم الشخص المفوض مطلوب';
      }
      
      // Authorized Position
      if (!formData.authorizedPosition.trim()) {
        errors.authorizedPosition = t.errors?.authorizedPositionRequired || 'وظيفة الشخص المفوض مطلوبة';
      }
      
      // Company Keywords
      if (!formData.companyKeywords.trim()) {
        errors.companyKeywords = t.errors?.companyKeywordsRequired || 'كلمات مفتاحية مطلوبة';
      }
      
      // Country Code
      if (!formData.countryCode) {
        errors.countryCode = t.errors?.countryCodeRequired || 'كود البلد مطلوب';
      }
      
      // Phone
      if (!formData.phone.trim()) {
        errors.phone = t.errors?.phoneRequired || 'رقم الهاتف مطلوب';
      } else if (!isValidPhone(formData.phone)) {
        errors.phone = t.errors?.phoneInvalid || 'رقم الهاتف غير صحيح';
      }
      
      // Email
      if (!formData.email.trim()) {
        errors.email = t.errors?.emailRequired || 'البريد الإلكتروني مطلوب';
      } else if (!isValidEmail(formData.email)) {
        errors.email = t.errors?.emailInvalid || 'البريد الإلكتروني غير صحيح';
      }
      
      // Password
      if (!formData.password) {
        errors.password = t.errors?.passwordRequired || 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 8) {
        errors.password = t.errors?.passwordWeak || 'كلمة المرور ضعيفة';
      }
      
      // Confirm Password
      if (!formData.confirmPassword) {
        errors.confirmPassword = t.errors?.confirmPasswordRequired || 'تأكيد كلمة المرور مطلوب';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t.errors?.passwordMismatch || 'كلمات المرور غير متطابقة';
      }
    }

    // Agreement (required for both)
    if (!formData.agreed) {
      errors.agreed = t.errors?.agreementRequired || 'يجب الموافقة على سياسة الخصوصية';
    }

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

  // Navigation Handlers (Requirement 5.6, 5.7)
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      // حفظ التقدم عند الانتقال للخطوة التالية
      if (userType) {
        saveProgress(currentStep + 1, { userType, ...formData });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // تخطي الخطوة الاختيارية (الخطوة 4 فقط - التفاصيل)
    if (currentStep === 4) {
      // الانتقال مباشرة للتسجيل النهائي
      if (validateForm()) {
        setShowConfirmPopup(true);
      }
    }
  };

  // التحقق من إمكانية الانتقال للخطوة التالية (Requirement 8.5)
  const isNextDisabled = () => {
    if (!userType) return true;

    // Email validation helper
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    switch (currentStep) {
      case 1: // المعلومات الأساسية (الاسم، البريد)
        if (userType === 'individual') {
          // للأفراد: الاسم الأول، الاسم الأخير، البريد (للمتعلمين)
          const hasBasicInfo = formData.firstName.trim() && formData.lastName.trim();
          
          // التحقق من البريد للمتعلمين فقط
          if (formData.education && formData.education !== 'illiterate' && formData.education !== 'uneducated') {
            return !hasBasicInfo || !formData.email.trim() || !isValidEmail(formData.email);
          }
          
          return !hasBasicInfo;
        } else {
          // للشركات: اسم المنشأة، البريد
          return !formData.companyName.trim() || !formData.email.trim() || !isValidEmail(formData.email);
        }
        
      case 2: // كلمة المرور (كلمة المرور، تأكيد كلمة المرور)
        // يجب ملء كلمة المرور وتأكيدها وأن تكونا متطابقتين
        if (!formData.password || !formData.confirmPassword) {
          return true;
        }
        if (formData.password !== formData.confirmPassword) {
          return true;
        }
        // التحقق من الحد الأدنى للطول (8 أحرف)
        if (formData.password.length < 8) {
          return true;
        }
        return false;
        
      case 3: // نوع الحساب (باحث عن عمل، شركة، مستقل)
        // نوع المستخدم يجب أن يكون محدداً بالفعل
        // هذه الخطوة تعرض النموذج الكامل حسب النوع
        // لذا نتحقق من الحقول الإجبارية حسب النوع
        if (userType === 'individual') {
          // للأفراد: البلد، المدينة، الجنس، تاريخ الميلاد، المستوى العلمي، التخصص، الاهتمامات، رقم الهاتف
          return !formData.country || 
                 !formData.city.trim() || 
                 !formData.gender || 
                 !formData.birthDate || 
                 !formData.education || 
                 !formData.specialization.trim() || 
                 !formData.interests.trim() ||
                 !formData.countryCode ||
                 !formData.phone.trim();
        } else {
          // للشركات: البلد، المدينة، مجال العمل، التخصص، اسم المفوض، وظيفة المفوض، الكلمات المفتاحية، رقم الهاتف
          return !formData.country || 
                 !formData.city.trim() || 
                 !formData.industry || 
                 !formData.subIndustry.trim() || 
                 !formData.authorizedName.trim() || 
                 !formData.authorizedPosition.trim() || 
                 !formData.companyKeywords.trim() ||
                 !formData.countryCode ||
                 !formData.phone.trim();
        }
        
      case 4: // التفاصيل (اختياري: الصورة، المدينة، المجال)
        // الخطوة الأخيرة اختيارية - يجب فقط الموافقة على سياسة الخصوصية
        return !formData.agreed;
        
      default:
        return false;
    }
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
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserTypeChange('individual');
              }
            }}
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
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserTypeChange('company');
              }
            }}
          >
            {t.companies}
          </button>
        </div>

        {/* Stepper Component - Shows registration progress */}
        {userType && (
          <StepperComponent
            currentStep={currentStep}
            totalSteps={4}
            onStepChange={setCurrentStep}
            language={language}
          />
        )}

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
          <form 
            onSubmit={handleRegisterClick} 
            noValidate 
            className="auth-form" 
            style={{ fontFamily }}
            onKeyDown={(e) => {
              // إرسال النموذج بـ Enter (Requirement 8.4)
              if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                handleRegisterClick(e);
              }
            }}
          >

            {/* Error Announcer for Screen Readers */}
            <FormErrorAnnouncer errors={fieldErrors} language={language} />

            {/* OAuth Buttons - at the top */}
            <OAuthButtons mode="register" />

            <div className="auth-photo-upload-container">
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="auth-photo-upload-box"
                tabIndex={0}
                aria-label={language === 'ar' ? 'رفع صورة الملف الشخصي' : language === 'fr' ? 'Télécharger une photo de profil' : 'Upload profile photo'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowPhotoModal(true);
                  }
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Your professional profile photo preview for job applications" className="auth-photo-upload-img" />
                ) : (
                  <span className="auth-photo-upload-placeholder" aria-hidden="true">📷</span>
                )}
              </button>
              <p className="auth-photo-upload-label" style={{ fontFamily }}>{t.uploadPhoto}</p>
              {fieldErrors.image && (
                <EnhancedErrorMessage
                  error={fieldErrors.image}
                  fieldName="image"
                  language={language}
                  onSuggestionClick={(action, fieldName) => {
                    console.log('Suggestion clicked:', action, fieldName);
                    if (action === 'focus_field') {
                      setShowPhotoModal(true);
                    }
                  }}
                />
              )}
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
                    tabIndex={0}
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
                    <EnhancedErrorMessage
                      error={fieldErrors.country}
                      fieldName="country"
                      language={language}
                      onSuggestionClick={(action, fieldName) => {
                        if (action === 'focus_field') {
                          document.getElementById('country')?.focus();
                        }
                      }}
                    />
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
                    tabIndex={0}
                    aria-describedby={fieldErrors.city ? "city-error" : undefined}
                  />
                  {fieldErrors.city && (
                    <EnhancedErrorMessage
                      error={fieldErrors.city}
                      fieldName="city"
                      language={language}
                      onSuggestionClick={(action, fieldName) => {
                        if (action === 'focus_field') {
                          document.getElementById('city')?.focus();
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </fieldset>

            {userType === 'individual' ? (
              <ComponentErrorBoundary componentName="IndividualForm">
                <IndividualForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily, language }} />
              </ComponentErrorBoundary>
            ) : (
              <ComponentErrorBoundary componentName="CompanyForm">
                <CompanyForm {...{ t, formData, handleInputChange, fieldErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isRTL, fontFamily, language }} />
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
                  tabIndex={0}
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
                  <EnhancedErrorMessage
                    error={fieldErrors.agreed}
                    fieldName="agreed"
                    language={language}
                    onSuggestionClick={(action, fieldName) => {
                      if (action === 'focus_field') {
                        document.getElementById('agreePolicy')?.focus();
                      } else if (action === 'show_info') {
                        setShowPolicy(true);
                      }
                    }}
                  />
                )}
              </div>
            </fieldset>

            {/* Navigation Buttons (Requirement 5.6, 5.7) */}
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={4}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSkip={handleSkip}
              isNextDisabled={isNextDisabled()}
              isLoading={isSubmitting}
              isOptionalStep={currentStep === 4}
              language={language}
            />

            <button
              type="submit"
              className="auth-submit-btn"
              tabIndex={0}
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