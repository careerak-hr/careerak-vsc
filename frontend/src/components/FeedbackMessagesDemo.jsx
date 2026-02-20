import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import { motion } from 'framer-motion';
import { feedbackVariants } from '../utils/animationVariants';
import './FeedbackMessages.css';

/**
 * FeedbackMessagesDemo Component
 * 
 * Demo component showing all error and success animation variants
 * This component is for testing and documentation purposes
 * 
 * Usage:
 * Import this component in your development environment to see all variants
 */
const FeedbackMessagesDemo = () => {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Error & Success Animations Demo
      </h1>

      {/* Error Messages Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Error Messages (Shake Animation)</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowError(!showError)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Toggle Error Message
          </button>

          {showError && (
            <>
              <ErrorMessage message="This is a default error message with shake animation" />
              
              <ErrorMessage 
                message="This is an error with custom icon" 
                icon="❌"
              />
              
              <ErrorMessage 
                message="This is an inline error message" 
                className="inline"
              />
              
              <ErrorMessage 
                message="This is a compact error message" 
                className="compact"
              />
              
              <ErrorMessage 
                message="This is a centered error message" 
                className="centered"
              />
            </>
          )}
        </div>
      </section>

      {/* Success Messages Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Success Messages (Bounce Animation)</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowSuccess(!showSuccess)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Toggle Success Message
          </button>

          {showSuccess && (
            <>
              <SuccessMessage message="This is a default success message with bounce animation" />
              
              <SuccessMessage 
                message="This is a success with custom icon" 
                icon="🎉"
              />
              
              <SuccessMessage 
                message="This is an inline success message" 
                className="inline"
              />
              
              <SuccessMessage 
                message="This is a compact success message" 
                className="compact"
              />
              
              <SuccessMessage 
                message="Profile updated successfully!" 
                variant="successScale"
              />
            </>
          )}
        </div>
      </section>

      {/* Warning Messages Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Warning Messages (Pulse Animation)</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowWarning(!showWarning)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Toggle Warning Message
          </button>

          {showWarning && (
            <motion.div
              variants={feedbackVariants.warningPulse}
              initial="initial"
              animate="animate"
              className="warning-message"
              role="alert"
            >
              <span className="warning-icon" aria-hidden="true">⚠️</span>
              <span className="warning-text">
                This is a warning message with pulse animation
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Form Example Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Form Example</h2>
        
        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
            />
            <ErrorMessage 
              message="Please enter a valid email address" 
              className="inline mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your password"
            />
            <ErrorMessage 
              message="Password must be at least 8 characters" 
              className="inline mt-1"
            />
          </div>

          <SuccessMessage 
            message="Form validation passed!" 
            className="mt-4"
          />
        </form>
      </section>

      {/* Animation Variants Info */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Available Animation Variants</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Error Animations:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>shake</code> - Horizontal shake animation (default)</li>
            <li><code>errorSlide</code> - Slide in from top with fade</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Success Animations:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>bounce</code> - Vertical bounce animation (default)</li>
            <li><code>successScale</code> - Scale in with spring</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Warning Animations:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>warningPulse</code> - Pulse animation (3 times)</li>
          </ul>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Usage Examples</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <pre className="text-sm overflow-x-auto">
{`// Basic error message
<ErrorMessage message="Invalid email address" />

// Error with custom icon
<ErrorMessage message="Error occurred" icon="❌" />

// Error with slide animation
<ErrorMessage message="Error" variant="errorSlide" />

// Basic success message
<SuccessMessage message="Saved successfully!" />

// Success with scale animation
<SuccessMessage message="Done!" variant="successScale" />

// Inline form error
<ErrorMessage 
  message="Required field" 
  className="inline mt-1"
/>

// Compact message
<ErrorMessage 
  message="Error" 
  className="compact"
/>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default FeedbackMessagesDemo;
