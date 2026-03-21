# دليل استخدام Stepper Component

## نظرة عامة
تم تنفيذ نظام Stepper كامل للتسجيل مع 4 خطوات:
1. المعلومات الأساسية (الاسم، البريد)
2. كلمة المرور (مع مؤشر القوة ومولد كلمات المرور)
3. نوع الحساب (فرد أو شركة)
4. التفاصيل (الصورة، المدينة، المجال)

## المكونات المتاحة

### 1. StepperComponent
مؤشر التقدم مع الخطوات الأربعة

```jsx
import { StepperComponent } from './components/auth';

<StepperComponent
  currentStep={currentStep}
  totalSteps={4}
  onStepChange={handleStepChange}
  language={language}
/>
```

### 2. StepNavigation
أزرار التنقل (السابق، التالي، تخطي)

```jsx
import { StepNavigation } from './components/auth';

<StepNavigation
  currentStep={currentStep}
  totalSteps={4}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onSkip={handleSkip}
  isNextDisabled={!isStepValid}
  isSkippable={currentStep === 4}
  language={language}
/>
```

### 3. Registration Steps
الخطوات الأربعة للتسجيل

```jsx
import { 
  Step1BasicInfo, 
  Step2Password, 
  Step3AccountType, 
  Step4Details 
} from './components/auth';

// Step 1
<Step1BasicInfo
  formData={formData}
  handleInputChange={handleInputChange}
  fieldErrors={fieldErrors}
  userType={userType}
  language={language}
/>

// Step 2
<Step2Password
  formData={formData}
  handleInputChange={handleInputChange}
  fieldErrors={fieldErrors}
  showPassword={showPassword}
  setShowPassword={setShowPassword}
  showConfirmPassword={showConfirmPassword}
  setShowConfirmPassword={setShowConfirmPassword}
  language={language}
/>

// Step 3
<Step3AccountType
  userType={userType}
  onUserTypeChange={handleUserTypeChange}
  language={language}
/>

// Step 4
<Step4Details
  formData={formData}
  handleInputChange={handleInputChange}
  fieldErrors={fieldErrors}
  profileImage={profileImage}
  onPhotoClick={() => setShowPhotoModal(true)}
  userType={userType}
  language={language}
/>
```

## مثال كامل للاستخدام

```jsx
import React, { useState } from 'react';
import { 
  StepperComponent, 
  StepNavigation,
  Step1BasicInfo,
  Step2Password,
  Step3AccountType,
  Step4Details
} from './components/auth';

function AuthPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
    specialization: '',
    interests: '',
    industry: '',
    subIndustry: '',
    phone: '',
    countryCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const language = 'ar'; // أو من context
  
  // التحقق من صحة الخطوة الحالية
  const validateCurrentStep = () => {
    const errors = {};
    
    switch (currentStep) {
      case 1:
        if (userType === 'individual') {
          if (!formData.firstName.trim()) errors.firstName = 'مطلوب';
          if (!formData.lastName.trim()) errors.lastName = 'مطلوب';
        } else if (userType === 'company') {
          if (!formData.companyName.trim()) errors.companyName = 'مطلوب';
        }
        if (!formData.email.trim()) errors.email = 'مطلوب';
        break;
        
      case 2:
        if (!formData.password) errors.password = 'مطلوب';
        if (!formData.confirmPassword) errors.confirmPassword = 'مطلوب';
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'كلمات المرور غير متطابقة';
        }
        break;
        
      case 3:
        if (!userType) errors.userType = 'يجب اختيار نوع الحساب';
        break;
        
      case 4:
        // الخطوة 4 اختيارية - لا توجد حقول إلزامية
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // الانتقال للخطوة التالية
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // إنهاء التسجيل
        handleFinalSubmit();
      }
    }
  };
  
  // العودة للخطوة السابقة
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // تخطي الخطوة (للخطوة 4 فقط)
  const handleSkip = () => {
    if (currentStep === 4) {
      handleFinalSubmit();
    }
  };
  
  // تغيير الخطوة من Stepper
  const handleStepChange = (step) => {
    setCurrentStep(step);
  };
  
  // تغيير نوع المستخدم
  const handleUserTypeChange = (type) => {
    setUserType(type);
  };
  
  // معالج تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // إرسال النموذج النهائي
  const handleFinalSubmit = async () => {
    console.log('Submitting registration:', { userType, formData, profileImage });
    // إرسال البيانات للـ backend
  };
  
  // عرض الخطوة الحالية
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            userType={userType}
            language={language}
          />
        );
      case 2:
        return (
          <Step2Password
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            language={language}
          />
        );
      case 3:
        return (
          <Step3AccountType
            userType={userType}
            onUserTypeChange={handleUserTypeChange}
            language={language}
          />
        );
      case 4:
        return (
          <Step4Details
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            profileImage={profileImage}
            onPhotoClick={() => {/* فتح modal الصورة */}}
            userType={userType}
            language={language}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="auth-page">
      {/* Stepper */}
      <StepperComponent
        currentStep={currentStep}
        totalSteps={4}
        onStepChange={handleStepChange}
        language={language}
      />
      
      {/* Current Step Content */}
      <div className="step-content">
        {renderCurrentStep()}
      </div>
      
      {/* Navigation Buttons */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        isNextDisabled={!validateCurrentStep()}
        isSkippable={currentStep === 4}
        language={language}
      />
    </div>
  );
}

export default AuthPage;
```

## الميزات

### StepperComponent
- ✅ Progress bar يعرض النسبة المئوية
- ✅ 4 خطوات مع أيقونات مميزة
- ✅ تمييز الخطوة الحالية بلون مختلف
- ✅ علامة ✓ للخطوات المكتملة
- ✅ إمكانية النقر للعودة للخطوات السابقة
- ✅ دعم RTL/LTR
- ✅ تصميم متجاوب

### StepNavigation
- ✅ زر "السابق" (يظهر من الخطوة 2)
- ✅ زر "التالي" (يتحول لـ "إنهاء" في الخطوة الأخيرة)
- ✅ زر "تخطي" للخطوات الاختيارية
- ✅ تعطيل "التالي" حتى ملء الحقول المطلوبة
- ✅ دعم RTL/LTR
- ✅ تصميم متجاوب

### Registration Steps
- ✅ Step 1: المعلومات الأساسية (الاسم، البريد)
- ✅ Step 2: كلمة المرور (مع مؤشر القوة ومولد)
- ✅ Step 3: نوع الحساب (فرد/شركة)
- ✅ Step 4: التفاصيل (اختياري)
- ✅ دعم 3 لغات (ar, en, fr)
- ✅ تصميم متجاوب

## التصميم

### الألوان
- Primary: #304B60 (كحلي)
- Secondary: #E3DAD1 (بيج)
- Accent: #D48161 (نحاسي)
- Success: #10b981 (أخضر)
- Error: #ef4444 (أحمر)

### الخطوط
- العربية: Amiri, Cairo, serif
- الإنجليزية: Cormorant Garamond, serif
- الفرنسية: EB Garamond, serif

## ملاحظات
- جميع المكونات تدعم RTL/LTR
- التصميم متجاوب على جميع الأجهزة
- الخطوة 4 اختيارية ويمكن تخطيها
- يمكن العودة للخطوات السابقة من Stepper
- التحقق من الحقول يتم قبل الانتقال للخطوة التالية

## Requirements المطبقة
- ✅ 5.1: Stepper في أعلى الصفحة مع 4 خطوات
- ✅ 5.2: Progress bar يعرض النسبة المئوية
- ✅ 5.3: أيقونات لكل خطوة
- ✅ 5.4: الخطوة الحالية مميزة بلون مختلف
- ✅ 5.5: الخطوات المكتملة بعلامة ✓
- ✅ 5.6: إمكانية العودة للخطوات السابقة
- ✅ 5.7: أزرار "التالي" و "السابق"
- ✅ 5.8: زر "تخطي" للخطوات الاختيارية

تاريخ الإنشاء: 2026-02-18
