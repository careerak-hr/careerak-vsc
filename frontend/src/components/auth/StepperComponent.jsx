import React from 'react';
import './StepperComponent.css';

/**
 * StepperComponent - مكون عرض خطوات التسجيل
 * 
 * @param {number} currentStep - الخطوة الحالية (1-4)
 * @param {number} totalSteps - إجمالي عدد الخطوات (4)
 * @param {function} onStepChange - دالة تغيير الخطوة
 * @param {string} language - اللغة الحالية (ar, en, fr)
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function StepperComponent({ currentStep, totalSteps = 4, onStepChange, language = 'ar' }) {
  const isRTL = language === 'ar';
  
  // تعريف الخطوات الأربعة مع الأيقونات والعناوين
  const steps = [
    { 
      number: 1, 
      title: {
        ar: 'المعلومات الأساسية',
        en: 'Basic Information',
        fr: 'Informations de base'
      },
      icon: '👤' // User icon
    },
    { 
      number: 2, 
      title: {
        ar: 'كلمة المرور',
        en: 'Password',
        fr: 'Mot de passe'
      },
      icon: '🔒' // Lock icon
    },
    { 
      number: 3, 
      title: {
        ar: 'نوع الحساب',
        en: 'Account Type',
        fr: 'Type de compte'
      },
      icon: '💼' // Briefcase icon
    },
    { 
      number: 4, 
      title: {
        ar: 'التفاصيل',
        en: 'Details',
        fr: 'Détails'
      },
      icon: '📄' // Document icon
    }
  ];

  // حساب النسبة المئوية للتقدم (Requirement 5.1)
  const progressPercentage = (currentStep / totalSteps) * 100;

  // معالجة النقر على خطوة (Requirement 5.5)
  const handleStepClick = (stepNumber) => {
    // يمكن النقر فقط على الخطوات المكتملة للعودة إليها
    if (stepNumber < currentStep && onStepChange) {
      onStepChange(stepNumber);
    }
  };

  return (
    <div className="stepper-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Bar (Requirement 5.2) */}
      <div className="stepper-progress-bar-container">
        <div className="stepper-progress-bar-bg">
          <div
            className="stepper-progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin="1"
            aria-valuemax={totalSteps}
            aria-label={`Step ${currentStep} of ${totalSteps}`}
          />
        </div>
      </div>

      {/* Steps (Requirement 5.3, 5.4, 5.5) */}
      <div className="stepper-steps-container">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = isCompleted;

          return (
            <div
              key={step.number}
              className={`stepper-step ${isClickable ? 'stepper-step-clickable' : ''}`}
              onClick={() => handleStepClick(step.number)}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              aria-label={`${step.title[language]} - ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}`}
              aria-current={isCurrent ? 'step' : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStepClick(step.number);
                }
              }}
            >
              {/* Step Icon/Number (Requirement 5.3, 5.4) */}
              <div
                className={`
                  stepper-step-icon
                  ${isCompleted ? 'stepper-step-icon-completed' : ''}
                  ${isCurrent ? 'stepper-step-icon-current' : ''}
                  ${!isCompleted && !isCurrent ? 'stepper-step-icon-upcoming' : ''}
                `}
              >
                {isCompleted ? (
                  <span className="stepper-icon-emoji" aria-hidden="true">✓</span>
                ) : (
                  <span className="stepper-icon-emoji" aria-hidden="true">{step.icon}</span>
                )}
              </div>

              {/* Step Title (Requirement 5.3) */}
              <span
                className={`
                  stepper-step-title
                  ${isCurrent ? 'stepper-step-title-current' : ''}
                `}
              >
                {step.title[language]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
