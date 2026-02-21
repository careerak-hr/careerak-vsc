import React, { useState } from 'react';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';

/**
 * Test component to verify error boundary functionality
 * This component intentionally throws errors to test error boundaries
 */
const ErrorThrowingComponent = ({ shouldThrow, errorType }) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'render':
        throw new Error('Test render error from ErrorThrowingComponent');
      case 'async':
        setTimeout(() => {
          throw new Error('Test async error from ErrorThrowingComponent');
        }, 100);
        break;
      case 'null':
        const nullObject = null;
        return <div>{nullObject.property}</div>; // This will throw
      default:
        throw new Error('Default test error from ErrorThrowingComponent');
    }
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h3 className="text-green-800 font-semibold">Component Working Correctly</h3>
      <p className="text-green-700">No errors thrown. Error boundary is ready to catch errors.</p>
    </div>
  );
};

/**
 * Test harness for error boundaries
 */
const ErrorBoundaryTest = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorType, setErrorType] = useState('render');

  const triggerError = (type) => {
    setErrorType(type);
    setShouldThrow(true);
    // Reset after a short delay to allow testing multiple error types
    setTimeout(() => setShouldThrow(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-primary">Error Boundary Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => triggerError('render')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Trigger Render Error
          </button>
          <button
            onClick={() => triggerError('null')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Trigger Null Reference Error
          </button>
          <button
            onClick={() => setShouldThrow(false)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reset Component
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Component Error Boundary Test</h3>
          <ComponentErrorBoundary componentName="ErrorThrowingComponent">
            <ErrorThrowingComponent shouldThrow={shouldThrow} errorType={errorType} />
          </ComponentErrorBoundary>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Multiple Components Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComponentErrorBoundary componentName="TestComponent1">
              <ErrorThrowingComponent shouldThrow={false} errorType="render" />
            </ComponentErrorBoundary>
            <ComponentErrorBoundary componentName="TestComponent2">
              <ErrorThrowingComponent shouldThrow={false} errorType="render" />
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-blue-800 font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-blue-700 space-y-1">
          <li>• When error is triggered, ComponentErrorBoundary should catch it</li>
          <li>• Error should be logged to console with component name and timestamp</li>
          <li>• User-friendly error message should be displayed</li>
          <li>• Retry button should reset the error boundary</li>
          <li>• Other components should continue working normally</li>
          <li>• Page should not crash or reload</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;