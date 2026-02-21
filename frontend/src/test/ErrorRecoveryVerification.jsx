import React, { useState } from 'react';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import RouteErrorBoundary from '../components/ErrorBoundary/RouteErrorBoundary';

/**
 * Error Recovery Verification Component
 * Task 7.6.7: Verify error recovery works
 * 
 * This component provides comprehensive manual testing for error recovery functionality
 * Requirements: FR-ERR-1 through FR-ERR-10, NFR-REL-1
 */

// Test component that can throw different types of errors
const ErrorTestComponent = ({ errorType, shouldThrow, componentName }) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'render':
        throw new Error(`Render error from ${componentName}`);
      case 'null':
        const nullObj = null;
        return <div>{nullObj.property}</div>;
      case 'undefined':
        const undefinedObj = undefined;
        return <div>{undefinedObj.method()}</div>;
      case 'type':
        const num = 123;
        return <div>{num.toUpperCase()}</div>;
      default:
        throw new Error(`Default error from ${componentName}`);
    }
  }

  return (
    <div className="p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
          {componentName} - Working Correctly ✓
        </h3>
      </div>
      <p className="mt-2 text-green-700 dark:text-green-300">
        No errors. Component is rendering successfully.
      </p>
    </div>
  );
};

// Network error simulation component
const NetworkErrorComponent = ({ shouldFail }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (shouldFail) {
        throw new Error('Network request failed');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: 'Data loaded successfully!' });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 border-2 border-red-500 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Network Error</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error.message}</p>
        <button
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">Loading...</p>
      </div>
    );
  }

  if (data) {
    return (
      <div className="p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Success!</h3>
        <p className="mt-2 text-green-700 dark:text-green-300">{data.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 rounded-lg">
      <button
        onClick={fetchData}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Load Data
      </button>
    </div>
  );
};

const ErrorRecoveryVerification = () => {
  const [componentErrors, setComponentErrors] = useState({
    component1: false,
    component2: false,
    component3: false,
  });
  const [errorTypes, setErrorTypes] = useState({
    component1: 'render',
    component2: 'null',
    component3: 'undefined',
  });
  const [networkFail, setNetworkFail] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const triggerError = (componentName, errorType) => {
    setComponentErrors(prev => ({ ...prev, [componentName]: true }));
    setErrorTypes(prev => ({ ...prev, [componentName]: errorType }));
    
    // Log test result
    addTestResult(`Triggered ${errorType} error in ${componentName}`, 'info');
  };

  const resetComponent = (componentName) => {
    setComponentErrors(prev => ({ ...prev, [componentName]: false }));
    addTestResult(`Reset ${componentName}`, 'success');
  };

  const resetAll = () => {
    setComponentErrors({
      component1: false,
      component2: false,
      component3: false,
    });
    setNetworkFail(false);
    setTestResults([]);
  };

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Error Recovery Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Task 7.6.7: Comprehensive error recovery testing
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Test Objectives
            </h2>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>✓ Verify component errors are caught (FR-ERR-1)</li>
              <li>✓ Verify retry functionality works (FR-ERR-4, FR-ERR-8)</li>
              <li>✓ Verify error isolation (FR-ERR-7)</li>
              <li>✓ Verify error logging (FR-ERR-3)</li>
              <li>✓ Verify 95%+ recovery rate (NFR-REL-1)</li>
            </ul>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Component 1 Controls */}
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Component 1</h3>
              <div className="space-y-2">
                <button
                  onClick={() => triggerError('component1', 'render')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Trigger Render Error
                </button>
                <button
                  onClick={() => triggerError('component1', 'null')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Trigger Null Error
                </button>
                <button
                  onClick={() => resetComponent('component1')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Reset Component
                </button>
              </div>
            </div>

            {/* Component 2 Controls */}
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Component 2</h3>
              <div className="space-y-2">
                <button
                  onClick={() => triggerError('component2', 'undefined')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Trigger Undefined Error
                </button>
                <button
                  onClick={() => triggerError('component2', 'type')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Trigger Type Error
                </button>
                <button
                  onClick={() => resetComponent('component2')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Reset Component
                </button>
              </div>
            </div>

            {/* Component 3 Controls */}
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Component 3</h3>
              <div className="space-y-2">
                <button
                  onClick={() => triggerError('component3', 'render')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Trigger Render Error
                </button>
                <button
                  onClick={() => resetComponent('component3')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Reset Component
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={resetAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset All
            </button>
            <button
              onClick={() => setNetworkFail(!networkFail)}
              className={`px-6 py-2 rounded ${
                networkFail 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {networkFail ? 'Enable Network' : 'Simulate Network Failure'}
            </button>
          </div>
        </div>

        {/* Test Components Grid */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Component 1 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Test Component 1
            </h3>
            <ComponentErrorBoundary componentName="TestComponent1">
              <ErrorTestComponent
                errorType={errorTypes.component1}
                shouldThrow={componentErrors.component1}
                componentName="Component 1"
              />
            </ComponentErrorBoundary>
          </div>

          {/* Component 2 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Test Component 2
            </h3>
            <ComponentErrorBoundary componentName="TestComponent2">
              <ErrorTestComponent
                errorType={errorTypes.component2}
                shouldThrow={componentErrors.component2}
                componentName="Component 2"
              />
            </ComponentErrorBoundary>
          </div>

          {/* Component 3 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Test Component 3
            </h3>
            <ComponentErrorBoundary componentName="TestComponent3">
              <ErrorTestComponent
                errorType={errorTypes.component3}
                shouldThrow={componentErrors.component3}
                componentName="Component 3"
              />
            </ComponentErrorBoundary>
          </div>
        </div>

        {/* Network Error Test */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Network Error Test (FR-ERR-9)
          </h3>
          <NetworkErrorComponent shouldFail={networkFail} />
        </div>

        {/* Test Results Log */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Results Log
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No test results yet. Trigger some errors to see logs.
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    result.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : result.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  }`}
                >
                  <span className="font-mono text-sm">[{result.timestamp}]</span>{' '}
                  {result.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            Testing Instructions
          </h2>
          <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2 list-decimal list-inside">
            <li>Open browser DevTools Console to see error logs</li>
            <li>Trigger errors in different components</li>
            <li>Verify error UI displays correctly</li>
            <li>Click "Retry" button in error UI</li>
            <li>Verify component attempts to re-render</li>
            <li>Click "Reset Component" to fix the error</li>
            <li>Click "Retry" again to verify successful recovery</li>
            <li>Verify other components continue working (error isolation)</li>
            <li>Test network error simulation</li>
            <li>Check console for complete error logs with timestamps</li>
          </ol>
        </div>

        {/* Expected Results */}
        <div className="mt-6 p-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            Expected Results
          </h2>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>✓ Errors caught by ComponentErrorBoundary</li>
            <li>✓ Error UI displays inline (doesn't break page)</li>
            <li>✓ Other components continue working</li>
            <li>✓ Retry button resets error boundary</li>
            <li>✓ After reset, component renders successfully</li>
            <li>✓ Console shows detailed error logs</li>
            <li>✓ Error messages in current language</li>
            <li>✓ 95%+ recovery success rate</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorRecoveryVerification;
