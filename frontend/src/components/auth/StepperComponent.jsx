import React from 'react';
import './StepperComponent.css';

/**
 * StepperComponent
 * مؤشر خطوات التسجيل مع progress bar
 * 4 خطوات: المعلومات الأساسية، كلمة المرور، نوع الحساب، التفاصيل
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
function StepperComponent({ currentStep = 1, totalSteps = 4, onStepChange, language = 'ar' }) {
  const isRTL = language === 'ar';
  
  // تعريف الخطوات مع الأيقونات والترجمات
  const steps = [
    { 
      number: 1, 
      title: {
        ar: 'المعلومات الأساسية',
        en: 'Basic Info',
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
      icon: '📋' // Clipboard icon
    }
  ];
  
  // حساب نسبة التقدم
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  // التحقق من حالة كل خطوة
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };
  
  // معالج النقر على الخطوة
  const handleStepClick = (stepNumber) => {
    // السماح بالعودة للخطوات المكتملة فقط
    if (stepNumber < currentStep && onStepChange) {
      onStepChange(stepNumber);
    }
  };
  
  return (
    <div className="stepper-component" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Bar */}
      <div className="stepper-progress-bar">
        <div 
          className="stepper-progress-fill" 
          style={{ 
            width: `${progressPercentage}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
      
      {/* Steps Container */}
      <div className="stepper-steps-container">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const isClickable = step.number < currentStep;
          
          return (
            <div 
              key={step.number} 
              className={`stepper-step-item ${status}`}
              onClick={() => handleStepClick(step.number)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Step Circle */}
              <div className={`stepper-step-circle ${status}`}>
                {status === 'completed' ? (
                  <span className="stepper-check-icon">✓</span>
                ) : (
                  <span className="stepper-step-icon">{step.icon}</span>
                )}
              </div>
              
              {/* Step Title */}
              <span className={`stepper-step-title ${status}`}>
                {step.title[language] || step.title.ar}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepperComponent;
