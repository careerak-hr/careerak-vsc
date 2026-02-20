import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessAnimation from './SuccessAnimation';
import { feedbackVariants } from '../../utils/animationVariants';

/**
 * SuccessAnimationExamples Component
 * 
 * Demonstrates various success animation patterns.
 * Use this as a reference for implementing success animations throughout the app.
 */
const SuccessAnimationExamples = () => {
  const [showSuccess, setShowSuccess] = useState({});

  const triggerSuccess = (key) => {
    setShowSuccess(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setShowSuccess(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#304B60] mb-6">
        Success Animation Examples
      </h1>

      {/* Example 1: Simple Checkmark */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">1. Simple Checkmark</h2>
        <button
          onClick={() => triggerSuccess('checkmark')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Checkmark
        </button>
        <AnimatePresence>
          {showSuccess.checkmark && (
            <div className="mt-4">
              <SuccessAnimation variant="checkmark" size="md" color="green" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 2: Checkmark with Message */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">2. Checkmark with Message</h2>
        <button
          onClick={() => triggerSuccess('message')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Success Message
        </button>
        <AnimatePresence>
          {showSuccess.message && (
            <div className="mt-4">
              <SuccessAnimation variant="checkmark" size="md" color="green">
                <div className="text-green-600 font-medium">
                  Operation completed successfully!
                </div>
              </SuccessAnimation>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 3: Success Banner */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">3. Success Banner</h2>
        <button
          onClick={() => triggerSuccess('banner')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Success Banner
        </button>
        <AnimatePresence>
          {showSuccess.banner && (
            <motion.div
              variants={feedbackVariants.successSlideBottom}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
            >
              <SuccessAnimation variant="checkmark" size="sm" color="green" />
              <div className="ml-3">
                <h3 className="text-green-800 font-semibold">Success!</h3>
                <p className="text-green-600 text-sm">Your changes have been saved.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 4: Bounce Animation */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">4. Bounce Animation</h2>
        <button
          onClick={() => triggerSuccess('bounce')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Bounce
        </button>
        <AnimatePresence>
          {showSuccess.bounce && (
            <div className="mt-4">
              <SuccessAnimation variant="bounce" size="lg" color="green" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 5: Glow Effect */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">5. Glow Effect</h2>
        <button
          onClick={() => triggerSuccess('glow')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Glow
        </button>
        <AnimatePresence>
          {showSuccess.glow && (
            <div className="mt-4">
              <SuccessAnimation 
                variant="glow" 
                size="md" 
                color="green"
                className="bg-white rounded-full p-4"
              >
                <span className="text-green-600 font-medium">Saved!</span>
              </SuccessAnimation>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 6: Form Success */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">6. Form Success</h2>
        <button
          onClick={() => triggerSuccess('form')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Submit Form
        </button>
        <AnimatePresence>
          {showSuccess.form && (
            <motion.div
              variants={feedbackVariants.successFadeSlide}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-4 bg-green-50 border-l-4 border-green-500 p-4"
            >
              <div className="flex items-start">
                <SuccessAnimation variant="checkmark" size="sm" color="green" />
                <div className="ml-3">
                  <h3 className="text-green-800 font-semibold">Form submitted successfully!</h3>
                  <p className="text-green-600 text-sm mt-1">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 7: Toast Notification */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">7. Toast Notification</h2>
        <button
          onClick={() => triggerSuccess('toast')}
          className="px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c47050] transition-colors"
        >
          Show Toast
        </button>
        <AnimatePresence>
          {showSuccess.toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center border border-green-200 z-50"
            >
              <SuccessAnimation variant="checkmark" size="sm" color="green" />
              <span className="ml-3 text-green-800 font-medium">
                Action completed!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example 8: Button Success State */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">8. Button Success State</h2>
        <motion.button
          onClick={() => triggerSuccess('button')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            showSuccess.button
              ? 'bg-green-500 text-white'
              : 'bg-[#D48161] text-white hover:bg-[#c47050]'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {showSuccess.button ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                Saved!
              </motion.div>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Save Changes
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Usage Code Examples */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Basic Checkmark:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`<SuccessAnimation 
  variant="checkmark" 
  size="md" 
  color="green" 
/>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">With Message:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`<SuccessAnimation variant="checkmark" size="md" color="green">
  <div className="text-green-600">Success!</div>
</SuccessAnimation>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Using Variants Directly:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`import { feedbackVariants } from '@/utils/animationVariants';

<motion.div
  variants={feedbackVariants.successFadeSlide}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Success content
</motion.div>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimationExamples;
