import React, { useState } from 'react';
import ButtonSpinner from './ButtonSpinner';

/**
 * ButtonSpinner Demo Component
 * 
 * Demonstrates ButtonSpinner usage in different button states
 */
const ButtonSpinnerDemo = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 bg-[#E3DAD1] min-h-screen">
      <h1 className="text-3xl font-bold text-[#304B60] mb-8">
        ButtonSpinner Component Demo
      </h1>

      {/* Primary Button with Spinner */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Primary Button</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-6 py-3 bg-[#304B60] text-white rounded-lg hover:bg-[#243a4d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <ButtonSpinner color="white" />
              <span>Processing...</span>
            </>
          ) : (
            'Submit Form'
          )}
        </button>
      </div>

      {/* Accent Button with Spinner */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Accent Button</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-6 py-3 bg-[#D48161] text-white rounded-lg hover:bg-[#c06f51] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <ButtonSpinner color="white" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Outline Button with Spinner */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Outline Button</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-6 py-3 bg-transparent border-2 border-[#304B60] text-[#304B60] rounded-lg hover:bg-[#304B60] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <ButtonSpinner color="primary" />
              <span>Loading...</span>
            </>
          ) : (
            'Load Data'
          )}
        </button>
      </div>

      {/* Small Button with Spinner */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Small Button</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-4 py-2 text-sm bg-[#304B60] text-white rounded hover:bg-[#243a4d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <ButtonSpinner color="white" className="w-3 h-3" />
              <span>Wait...</span>
            </>
          ) : (
            'Quick Action'
          )}
        </button>
      </div>

      {/* Icon Button with Spinner */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Icon Button</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="w-12 h-12 bg-[#D48161] text-white rounded-full hover:bg-[#c06f51] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          aria-label={loading ? 'Processing' : 'Refresh'}
        >
          {loading ? (
            <ButtonSpinner color="white" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      {/* Color Variants */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#304B60]">Color Variants</h2>
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-[#304B60] rounded">
            <ButtonSpinner color="white" />
          </div>
          <div className="p-4 bg-white border-2 border-[#304B60] rounded">
            <ButtonSpinner color="primary" />
          </div>
          <div className="p-4 bg-white border-2 border-[#D48161] rounded">
            <ButtonSpinner color="accent" />
          </div>
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="mt-8 p-4 bg-white rounded-lg border-2 border-[#304B60]">
        <h3 className="text-lg font-semibold text-[#304B60] mb-2">
          Accessibility Features
        </h3>
        <ul className="list-disc list-inside space-y-1 text-[#304B60]">
          <li>Screen reader announcements with aria-live="polite"</li>
          <li>role="status" for loading state</li>
          <li>Respects prefers-reduced-motion setting</li>
          <li>Customizable aria-label for context</li>
          <li>Buttons disabled during loading</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonSpinnerDemo;
