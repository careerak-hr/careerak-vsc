import React, { useState } from 'react';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import LoadingButton from '../components/common/LoadingButton';

/**
 * Button Spinner Integration Examples
 * 
 * Demonstrates proper button spinner usage across different scenarios
 * 
 * Requirements:
 * - FR-LOAD-3: Display spinner inside button and disable it during processing
 * - Property LOAD-3: button.loading = true → button.disabled = true
 */

const ButtonSpinnerIntegration = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

  const handleSubmit1 = async () => {
    setLoading1(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading1(false);
  };

  const handleSubmit2 = async () => {
    setLoading2(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading2(false);
  };

  const handleSubmit3 = async () => {
    setLoading3(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading3(false);
  };

  return (
    <div className="p-8 space-y-8 bg-[#E3DAD1] min-h-screen">
      <h1 className="text-3xl font-bold text-[#304B60] mb-8">
        Button Spinner Integration Examples
      </h1>

      {/* Example 1: Manual ButtonSpinner Integration */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          1. Manual ButtonSpinner Integration
        </h2>
        <p className="text-gray-700 mb-4">
          Use ButtonSpinner directly in your button with conditional rendering
        </p>
        <button
          onClick={handleSubmit1}
          disabled={loading1}
          className="px-6 py-3 bg-[#D48161] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:bg-[#c06d4f] min-w-[150px]"
        >
          {loading1 ? (
            <ButtonSpinner color="white" ariaLabel="Processing..." />
          ) : (
            'Submit Form'
          )}
        </button>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<button
  onClick={handleSubmit}
  disabled={loading}
  className="..."
>
  {loading ? (
    <ButtonSpinner color="white" ariaLabel="Processing..." />
  ) : (
    'Submit Form'
  )}
</button>`}
        </pre>
      </section>

      {/* Example 2: LoadingButton Component */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          2. LoadingButton Component
        </h2>
        <p className="text-gray-700 mb-4">
          Use the LoadingButton component for automatic spinner handling
        </p>
        <LoadingButton
          onClick={handleSubmit2}
          loading={loading2}
          variant="primary"
          loadingText="Processing..."
        >
          Save Changes
        </LoadingButton>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<LoadingButton
  onClick={handleSubmit}
  loading={loading}
  variant="primary"
  loadingText="Processing..."
>
  Save Changes
</LoadingButton>`}
        </pre>
      </section>

      {/* Example 3: Form Submit Button */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          3. Form Submit Button
        </h2>
        <p className="text-gray-700 mb-4">
          Proper integration in form submission
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit3();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-4 py-2 border-2 border-[#D4816180] rounded-lg focus:outline-none focus:border-[#D4816180]"
            disabled={loading3}
          />
          <button
            type="submit"
            disabled={loading3}
            className="px-6 py-3 bg-[#304B60] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:bg-[#243a4d] min-w-[150px]"
          >
            {loading3 ? (
              <ButtonSpinner color="white" ariaLabel="Submitting..." />
            ) : (
              'Submit'
            )}
          </button>
        </form>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<form onSubmit={handleSubmit}>
  <input disabled={loading} />
  <button type="submit" disabled={loading}>
    {loading ? (
      <ButtonSpinner color="white" ariaLabel="Submitting..." />
    ) : (
      'Submit'
    )}
  </button>
</form>`}
        </pre>
      </section>

      {/* Best Practices */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          Best Practices
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Always disable the button when loading is true</li>
          <li>Use ButtonSpinner with appropriate color (white for dark buttons)</li>
          <li>Provide descriptive aria-label for screen readers</li>
          <li>Set minimum width to prevent layout shift</li>
          <li>Use transition effects for smooth state changes</li>
          <li>Disable form inputs during submission</li>
          <li>Handle errors and reset loading state in finally block</li>
        </ul>
      </section>

      {/* Common Patterns */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          Common Patterns
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[#304B60] mb-2">Pattern 1: Async Handler</h3>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setLoading(false);
  }
};`}
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-[#304B60] mb-2">Pattern 2: Form Submission</h3>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const formData = new FormData(e.target);
    await submitForm(formData);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};`}
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-[#304B60] mb-2">Pattern 3: Multiple Buttons</h3>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`const [loadingStates, setLoadingStates] = useState({
  save: false,
  delete: false,
  cancel: false
});

const handleAction = async (action) => {
  setLoadingStates(prev => ({ ...prev, [action]: true }));
  try {
    await performAction(action);
  } finally {
    setLoadingStates(prev => ({ ...prev, [action]: false }));
  }
};`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonSpinnerIntegration;
