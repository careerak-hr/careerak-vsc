import React, { useState, useEffect } from 'react';
import { useApplicationForm } from '../../context/ApplicationContext';
import { useFormKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';
import PersonalInfoStep from './PersonalInfoStep';
import EducationExperienceStep from './EducationExperienceStep';
import SkillsLanguagesStep from './SkillsLanguagesStep';
import DocumentsQuestionsStep from './DocumentsQuestionsStep';
import ReviewSubmitStep from './ReviewSubmitStep';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import './MultiStepForm.css';

const STEPS = [
  { id: 1, title: 'Personal Information', component: PersonalInfoStep },
  { id: 2, title: 'Education & Experience', component: EducationExperienceStep },
  { id: 3, title: 'Skills & Languages', component: SkillsLanguagesStep },
  { id: 4, title: 'Documents & Questions', component: DocumentsQuestionsStep },
  { id: 5, title: 'Review & Submit', component: ReviewSubmitStep },
];

function MultiStepForm({ onSave, onCancel }) {
  const {
    currentStep,
    setStep,
    formData,
    errors,
    setErrors,
    isSaving,
  } = useApplicationForm();

  const [stepErrors, setStepErrors] = useState({});
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Keyboard navigation
  useFormKeyboardNavigation({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSave: handleSave,
    onSubmit: () => {/* Will be implemented in task 12 */},
    onCancel,
    isLastStep: currentStep === STEPS.length,
    isFirstStep: currentStep === 1,
    disabled: isSaving
  });

  // Show shortcuts help with ? key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target;
        const isInputField = target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.tagName === 'SELECT';
        
        if (!isInputField) {
          e.preventDefault();
          setShowShortcutsHelp(true);
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.fullName?.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;

      case 2: // Education & Experience
        // Education validation
        if (formData.education.length === 0) {
          newErrors.education = 'At least one education entry is required';
        } else {
          formData.education.forEach((entry, index) => {
            if (!entry.degree?.trim()) {
              newErrors[`education_${index}_degree`] = 'Degree is required';
            }
            if (!entry.institution?.trim()) {
              newErrors[`education_${index}_institution`] = 'Institution is required';
            }
          });
        }
        break;

      case 3: // Skills & Languages
        // At least one skill category should have entries
        const hasSkills = 
          formData.computerSkills.length > 0 ||
          formData.softwareSkills.length > 0 ||
          formData.otherSkills.length > 0;
        
        if (!hasSkills) {
          newErrors.skills = 'At least one skill is required';
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  // Handle next button
  const handleNext = () => {
    const validationErrors = validateStep(currentStep);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStepErrors(validationErrors);
      return;
    }

    // Clear errors and move to next step
    setErrors({});
    setStepErrors({});
    setStep(currentStep + 1);
  };

  // Handle previous button (no validation)
  const handlePrevious = () => {
    setStep(currentStep - 1);
  };

  // Handle save draft
  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  // Get current step component
  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  return (
    <div className="multi-step-form" role="form" aria-label="Job application form">
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        language="en" // TODO: Get from context
      />

      {/* Keyboard Shortcuts Button */}
      <button
        type="button"
        className="shortcuts-help-button"
        onClick={() => setShowShortcutsHelp(true)}
        aria-label="Show keyboard shortcuts (Press ? for help)"
        title="Keyboard shortcuts (?)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" strokeWidth={2} />
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
      {/* Progress Indicator */}
      <nav className="progress-indicator" role="navigation" aria-label="Application progress">
        <ol className="progress-steps-list" role="list">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className={`progress-step ${
                step.id === currentStep ? 'active' : ''
              } ${step.id < currentStep ? 'completed' : ''}`}
              role="listitem"
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              <div 
                className="step-number"
                aria-label={`Step ${step.id} of ${STEPS.length}: ${step.title}`}
              >
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <div className="step-title">{step.title}</div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div 
        className="step-content" 
        role="region" 
        aria-label={`Step ${currentStep}: ${STEPS[currentStep - 1]?.title}`}
        aria-live="polite"
      >
        {CurrentStepComponent ? (
          <CurrentStepComponent errors={stepErrors} />
        ) : (
          <div className="step-placeholder">
            <p>This step will be implemented in the next task.</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="step-navigation" role="navigation" aria-label="Form navigation">
        <div className="nav-left">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={isSaving}
              aria-label="Go to previous step (Alt+P)"
              title="Previous (Alt+P)"
            >
              Previous
            </button>
          )}
        </div>

        <div className="nav-center">
          <button
            type="button"
            className="btn-outline"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save application as draft (Ctrl+S)"
            aria-live="polite"
            aria-busy={isSaving}
            title="Save Draft (Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>

        <div className="nav-right">
          {currentStep < STEPS.length ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              disabled={isSaving}
              aria-label="Go to next step (Alt+N)"
              title="Next (Alt+N)"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {/* Will be implemented in task 12 */}}
              disabled={isSaving}
              aria-label="Submit application (Ctrl+Enter)"
              title="Submit (Ctrl+Enter)"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(stepErrors).length > 0 && (
        <div 
          className="error-summary" 
          role="alert" 
          aria-live="assertive"
          aria-atomic="true"
        >
          <p><strong>Please fix the following errors before proceeding:</strong></p>
          <ul role="list">
            {Object.values(stepErrors).map((error, index) => (
              <li key={index} role="listitem">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultiStepForm;
