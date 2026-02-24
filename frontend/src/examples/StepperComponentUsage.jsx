import React, { useState } from 'react';
import StepperComponent from '../components/auth/StepperComponent';

/**
 * StepperComponent Usage Example
 * 
 * This example demonstrates how to use the StepperComponent
 * in a multi-step registration form.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function StepperComponentUsage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState('ar');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step) => {
    // يمكن الانتقال فقط للخطوات المكتملة (الخطوات السابقة)
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Stepper Component Example</h1>

      {/* Language Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label>Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Stepper Component */}
      <StepperComponent
        currentStep={currentStep}
        totalSteps={4}
        onStepChange={handleStepChange}
        language={language}
      />

      {/* Step Content */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px' 
      }}>
        <h2>Step {currentStep} Content</h2>
        <p>This is the content for step {currentStep}</p>

        {currentStep === 1 && (
          <div>
            <h3>Basic Information</h3>
            <p>Name, Email, etc.</p>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3>Password</h3>
            <p>Password, Confirm Password</p>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3>Account Type</h3>
            <p>Individual, Company, Freelancer</p>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3>Details</h3>
            <p>Profile Picture, City, Field</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        marginTop: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between' 
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentStep === 1 ? '#e5e7eb' : '#304B60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === 4}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentStep === 4 ? '#e5e7eb' : '#304B60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentStep === 4 ? 'not-allowed' : 'pointer'
          }}
        >
          {currentStep === 4 ? 'Complete' : 'Next'}
        </button>
      </div>

      {/* Features Demonstrated */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ Progress bar showing completion percentage (Requirement 5.2)</li>
          <li>✅ 4 steps with emoji icons (Requirement 5.3)</li>
          <li>✅ Current step highlighted with ring effect (Requirement 5.3)</li>
          <li>✅ Completed steps marked with checkmark (Requirement 5.4)</li>
          <li>✅ Click on completed steps to go back (Requirement 5.5)</li>
          <li>✅ Multi-language support (ar, en, fr)</li>
          <li>✅ Responsive design for mobile</li>
          <li>✅ Accessibility features (ARIA labels, keyboard navigation)</li>
          <li>✅ Uses emoji icons (no external dependencies)</li>
        </ul>
      </div>

      {/* Usage Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
        <h3>Usage Instructions:</h3>
        <pre style={{ backgroundColor: '#1f2937', color: '#f3f4f6', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`import StepperComponent from '../components/auth/StepperComponent';

function MyForm() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <StepperComponent
      currentStep={currentStep}
      totalSteps={4}
      onStepChange={setCurrentStep}
      language="ar"
    />
  );
}`}
        </pre>
      </div>
    </div>
  );
}
