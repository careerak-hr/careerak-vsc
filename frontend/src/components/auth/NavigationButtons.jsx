import React from 'react';
import './NavigationButtons.css';

/**
 * NavigationButtons - أزرار التنقل بين خطوات التسجيل
 * 
 * @param {number} currentStep - الخطوة الحالية (1-4)
 * @param {number} totalSteps - إجمالي عدد الخطوات (4)
 * @param {function} onNext - دالة الانتقال للخطوة التالية
 * @param {function} onPrevious - دالة العودة للخطوة السابقة
 * @param {function} onSkip - دالة تخطي الخطوة (للخطوات الاختيارية)
 * @param {boolean} isNextDisabled - تعطيل زر "التالي" حتى ملء الحقول المطلوبة
 * @param {boolean} isLoading - حالة التحميل عند الإرسال
 * @param {boolean} isOptionalStep - هل الخطوة الحالية اختيارية؟
 * @param {string} language - اللغة الحالية (ar, en, fr)
 * 
 * Requirements: 5.6, 5.7, 8.5
 */
export default function NavigationButtons({
  currentStep,
  totalSteps = 4,
  onNext,
  onPrevious,
  onSkip,
  isNextDisabled = false,
  isLoading = false,
  isOptionalStep = false,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      next: 'التالي',
      previous: 'السابق',
      skip: 'تخطي',
      submit: 'إرسال',
      loading: 'جاري الإرسال...'
    },
    en: {
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      submit: 'Submit',
      loading: 'Submitting...'
    },
    fr: {
      next: 'Suivant',
      previous: 'Précédent',
      skip: 'Passer',
      submit: 'Soumettre',
      loading: 'Envoi en cours...'
    }
  };

  const t = translations[language] || translations.ar;

  // تحديد نص زر "التالي" (Requirement 5.6)
  const isLastStep = currentStep === totalSteps;
  const nextButtonText = isLoading ? t.loading : (isLastStep ? t.submit : t.next);

  // إظهار زر "السابق" فقط إذا لم نكن في الخطوة الأولى (Requirement 5.6)
  const showPreviousButton = currentStep > 1;

  // إظهار زر "تخطي" فقط للخطوات الاختيارية (Requirement 5.7)
  const showSkipButton = isOptionalStep && !isLastStep;

  return (
    <div className="navigation-buttons-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* زر "السابق" (Requirement 5.6) */}
      {showPreviousButton && (
        <button
          type="button"
          onClick={onPrevious}
          className="navigation-btn navigation-btn-secondary"
          tabIndex={0}
          disabled={isLoading}
          aria-label={t.previous}
        >
          {isRTL ? '→' : '←'} {t.previous}
        </button>
      )}

      {/* Spacer لدفع الأزرار إلى الجوانب */}
      <div className="navigation-spacer" />

      {/* زر "تخطي" (Requirement 5.7) */}
      {showSkipButton && (
        <button
          type="button"
          onClick={onSkip}
          className="navigation-btn navigation-btn-skip"
          tabIndex={0}
          disabled={isLoading}
          aria-label={t.skip}
        >
          {t.skip}
        </button>
      )}

      {/* زر "التالي" أو "إرسال" (Requirement 5.6, 8.5) */}
      <button
        type={isLastStep ? 'submit' : 'button'}
        onClick={!isLastStep ? onNext : undefined}
        className="navigation-btn navigation-btn-primary"
        tabIndex={0}
        disabled={isNextDisabled || isLoading}
        aria-label={nextButtonText}
        aria-busy={isLoading}
      >
        {nextButtonText} {!isLastStep && (isRTL ? '←' : '→')}
        
        {/* Loading Spinner (Requirement 8.5) */}
        {isLoading && (
          <span className="navigation-btn-spinner" aria-hidden="true">
            <svg className="navigation-spinner-icon" viewBox="0 0 24 24">
              <circle
                className="navigation-spinner-circle"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
}
