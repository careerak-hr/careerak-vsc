import React from 'react';
import PropTypes from 'prop-types';
import './ProgressIndicator.css';

/**
 * ProgressIndicator Component
 * 
 * Displays the current step, completed steps, and remaining steps in the multi-step form.
 * Allows clickable navigation to completed steps.
 * 
 * Requirements: 7.2
 */
const ProgressIndicator = ({
  currentStep = 1,
  totalSteps = 5,
  steps = [],
  onStepClick = null,
  className = ''
}) => {
  // Default step labels if not provided
  const defaultSteps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Education & Experience' },
    { id: 3, label: 'Skills & Languages' },
    { id: 4, label: 'Documents & Questions' },
    { id: 5, label: 'Review & Submit' }
  ];

  const stepList = steps.length > 0 ? steps : defaultSteps.slice(0, totalSteps);

  // Determine if a step is clickable (only completed steps)
  const isStepClickable = (stepId) => {
    return stepId < currentStep && onStepClick !== null;
  };

  // Handle step click
  const handleStepClick = (stepId) => {
    if (isStepClickable(stepId)) {
      onStepClick(stepId);
    }
  };

  // Get step status
  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'remaining';
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`progress-indicator ${className}`} role="navigation" aria-label="Form progress">
      {/* Progress bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin="1"
          aria-valuemax={totalSteps}
        />
      </div>

      {/* Step indicators */}
      <div className="steps-container">
        {stepList.map((step) => {
          const status = getStepStatus(step.id);
          const clickable = isStepClickable(step.id);

          return (
            <div
              key={step.id}
              className={`step-item ${status} ${clickable ? 'clickable' : ''}`}
              onClick={() => handleStepClick(step.id)}
              onKeyPress={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStepClick(step.id);
                }
              }}
              role={clickable ? 'button' : 'listitem'}
              tabIndex={clickable ? 0 : -1}
              aria-current={status === 'current' ? 'step' : undefined}
              aria-label={`Step ${step.id}: ${step.label}${status === 'completed' ? ' (completed)' : ''}${status === 'current' ? ' (current)' : ''}`}
            >
              <div className="step-circle">
                {status === 'completed' ? (
                  <span className="step-check" aria-hidden="true">✓</span>
                ) : (
                  <span className="step-number">{step.id}</span>
                )}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Step counter */}
      <div className="step-counter" aria-live="polite">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

ProgressIndicator.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  onStepClick: PropTypes.func,
  className: PropTypes.string
};

export default ProgressIndicator;
