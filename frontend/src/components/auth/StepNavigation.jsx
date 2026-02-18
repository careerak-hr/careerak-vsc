import React from 'react';
import './StepNavigation.css';

/**
 * StepNavigation
 * أزرار التنقل بين خطوات التسجيل
 * - أزرار "التالي" و "السابق"
 * - زر "تخطي" للخطوات الاختيارية
 * - تعطيل "التالي" حتى ملء الحقول
 * 
 * Requirements: 5.7, 5.8
 */
function StepNavigation({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  onSkip,
  isNextDisabled = false,
  isSkippable = false,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      previous: 'السابق',
      next: 'التالي',
      skip: 'تخطي',
      finish: 'إنهاء'
    },
    en: {
      previous: 'Previous',
      next: 'Next',
      skip: 'Skip',
      finish: 'Finish'
    },
    fr: {
      previous: 'Précédent',
      next: 'Suivant',
      skip: 'Passer',
      finish: 'Terminer'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  // تحديد نص زر "التالي" (التالي أو إنهاء)
  const nextButtonText = currentStep === totalSteps ? t.finish : t.next;
  
  // إظهار زر "السابق" فقط إذا لم نكن في الخطوة الأولى
  const showPrevious = currentStep > 1;
  
  return (
    <div className="step-navigation" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="step-navigation-buttons">
        {/* زر السابق */}
        {showPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="step-nav-btn step-nav-btn-secondary"
          >
            {isRTL ? '→' : '←'} {t.previous}
          </button>
        )}
        
        {/* زر تخطي (للخطوات الاختيارية) */}
        {isSkippable && (
          <button
            type="button"
            onClick={onSkip}
            className="step-nav-btn step-nav-btn-skip"
          >
            {t.skip}
          </button>
        )}
        
        {/* زر التالي/إنهاء */}
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`step-nav-btn step-nav-btn-primary ${isNextDisabled ? 'disabled' : ''}`}
        >
          {nextButtonText} {isRTL ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}

export default StepNavigation;
