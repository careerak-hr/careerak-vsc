import React, { useState } from 'react';
import NavigationButtons from '../components/auth/NavigationButtons';

/**
 * NavigationButtonsUsage - مثال على استخدام مكون NavigationButtons
 * 
 * يوضح هذا المثال:
 * 1. كيفية استخدام أزرار التنقل في نموذج متعدد الخطوات
 * 2. كيفية التعامل مع الخطوات الاختيارية
 * 3. كيفية تعطيل زر "التالي" حتى ملء الحقول المطلوبة
 * 4. كيفية عرض حالة التحميل عند الإرسال
 */
export default function NavigationButtonsUsage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '' // اختياري
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  // التحقق من إمكانية الانتقال للخطوة التالية
  const isNextDisabled = () => {
    switch (currentStep) {
      case 1: // الاسم (مطلوب)
        return !formData.name.trim();
      case 2: // البريد (مطلوب)
        return !formData.email.trim();
      case 3: // كلمة المرور (مطلوبة)
        return !formData.password.trim();
      case 4: // السيرة الذاتية (اختياري)
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Skipping optional step 4');
    // في الخطوة الاختيارية، يمكن تخطيها والانتقال للإرسال
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('📤 Submitting form:', formData);
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Form submitted successfully');
      alert('تم التسجيل بنجاح!');
    } catch (error) {
      console.error('❌ Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">الخطوة 1: الاسم</h2>
            <input
              type="text"
              placeholder="أدخل اسمك"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600">* مطلوب</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">الخطوة 2: البريد الإلكتروني</h2>
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600">* مطلوب</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">الخطوة 3: كلمة المرور</h2>
            <input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-600">* مطلوب</p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">الخطوة 4: السيرة الذاتية (اختياري)</h2>
            <textarea
              placeholder="أدخل سيرتك الذاتية (اختياري)"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
              rows={4}
            />
            <p className="text-sm text-gray-600">
              ℹ️ هذه الخطوة اختيارية - يمكنك تخطيها بالنقر على زر "تخطي"
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          مثال على استخدام NavigationButtons
        </h1>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              الخطوة {currentStep} من {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          isNextDisabled={isNextDisabled()}
          isLoading={isSubmitting}
          isOptionalStep={currentStep === 4} // الخطوة 4 اختيارية
          language="ar"
        />

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">معلومات التصحيح:</h3>
          <ul className="text-sm space-y-1">
            <li>الخطوة الحالية: {currentStep}</li>
            <li>زر "التالي" معطل: {isNextDisabled() ? 'نعم' : 'لا'}</li>
            <li>خطوة اختيارية: {currentStep === 4 ? 'نعم' : 'لا'}</li>
            <li>يظهر زر "تخطي": {currentStep === 4 ? 'نعم' : 'لا'}</li>
            <li>جاري الإرسال: {isSubmitting ? 'نعم' : 'لا'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
