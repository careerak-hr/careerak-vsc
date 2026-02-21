import React, { useState } from 'react';
import ComponentErrorBoundary from './ComponentErrorBoundary';

/**
 * Example usage of ComponentErrorBoundary with Retry functionality
 * 
 * This demonstrates how the retry button re-renders the component
 * and allows recovery from errors.
 */

// Example 1: Component that can recover from errors
const UnstableComponent = ({ shouldFail }) => {
  if (shouldFail) {
    throw new Error('Component failed to render');
  }
  return (
    <div className="p-4 bg-green-100 rounded">
      <h3>✅ Component rendered successfully!</h3>
      <p>The component is working properly now.</p>
    </div>
  );
};

// Example 2: Component with random failures
const RandomFailureComponent = () => {
  const shouldFail = Math.random() > 0.7; // 30% chance of failure
  
  if (shouldFail) {
    throw new Error('Random failure occurred');
  }
  
  return (
    <div className="p-4 bg-blue-100 rounded">
      <h3>✅ Component loaded successfully!</h3>
      <p>Try refreshing - there's a 30% chance it will fail.</p>
    </div>
  );
};

// Example 3: Component with network simulation
const NetworkComponent = ({ isOnline }) => {
  if (!isOnline) {
    throw new Error('Network connection failed');
  }
  
  return (
    <div className="p-4 bg-purple-100 rounded">
      <h3>✅ Data loaded from network!</h3>
      <p>Network connection is stable.</p>
    </div>
  );
};

/**
 * Demo page showing ComponentErrorBoundary retry functionality
 */
export const ComponentErrorBoundaryDemo = () => {
  const [shouldFail, setShouldFail] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [randomKey, setRandomKey] = useState(0);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        ComponentErrorBoundary - Retry Functionality Demo
      </h1>

      {/* Example 1: Controlled Error */}
      <section className="border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Example 1: Controlled Error Recovery
        </h2>
        <p className="mb-4 text-gray-600">
          This component fails initially. Click "Fix Component" then click the 
          "Retry" button in the error UI to recover.
        </p>
        
        <button
          onClick={() => setShouldFail(!shouldFail)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {shouldFail ? 'Fix Component' : 'Break Component'}
        </button>

        <ComponentErrorBoundary componentName="UnstableComponent">
          <UnstableComponent shouldFail={shouldFail} />
        </ComponentErrorBoundary>
      </section>

      {/* Example 2: Random Failures */}
      <section className="border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Example 2: Random Failures (30% chance)
        </h2>
        <p className="mb-4 text-gray-600">
          This component has a 30% chance of failing. Keep clicking "Retry" 
          until it succeeds!
        </p>

        <button
          onClick={() => setRandomKey(prev => prev + 1)}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Force Re-render
        </button>

        <ComponentErrorBoundary 
          componentName="RandomFailureComponent"
          key={randomKey}
        >
          <RandomFailureComponent />
        </ComponentErrorBoundary>
      </section>

      {/* Example 3: Network Simulation */}
      <section className="border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Example 3: Network Error Recovery
        </h2>
        <p className="mb-4 text-gray-600">
          Simulates a network error. Toggle "Connect Network" then click 
          "Retry" to recover.
        </p>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          {isOnline ? 'Disconnect Network' : 'Connect Network'}
        </button>

        <ComponentErrorBoundary componentName="NetworkComponent">
          <NetworkComponent isOnline={isOnline} />
        </ComponentErrorBoundary>
      </section>

      {/* Example 4: Custom Fallback */}
      <section className="border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Example 4: Custom Fallback UI
        </h2>
        <p className="mb-4 text-gray-600">
          You can provide a custom fallback instead of the default error UI.
        </p>

        <ComponentErrorBoundary 
          componentName="CustomFallbackComponent"
          fallback={
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded">
              <h3 className="text-red-700 font-bold">Custom Error Message</h3>
              <p className="text-red-600">This is a custom fallback UI.</p>
            </div>
          }
        >
          <UnstableComponent shouldFail={true} />
        </ComponentErrorBoundary>
      </section>

      {/* Example 5: Error Callback */}
      <section className="border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Example 5: Error Logging Callback
        </h2>
        <p className="mb-4 text-gray-600">
          Errors can be logged to external services using the onError callback.
          Check the console for error logs.
        </p>

        <ComponentErrorBoundary 
          componentName="LoggingComponent"
          onError={(error, errorInfo, componentName) => {
            console.log('🔴 Error logged to external service:');
            console.log('Component:', componentName);
            console.log('Error:', error.message);
            console.log('Stack:', errorInfo.componentStack);
          }}
        >
          <UnstableComponent shouldFail={true} />
        </ComponentErrorBoundary>
      </section>

      {/* Usage Instructions */}
      <section className="border-2 border-blue-300 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Basic Usage:</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{`<ComponentErrorBoundary componentName="MyComponent">
  <MyComponent />
</ComponentErrorBoundary>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">With Custom Fallback:</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{`<ComponentErrorBoundary 
  componentName="MyComponent"
  fallback={<div>Custom error message</div>}
>
  <MyComponent />
</ComponentErrorBoundary>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">With Error Callback:</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{`<ComponentErrorBoundary 
  componentName="MyComponent"
  onError={(error, errorInfo, componentName) => {
    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }}
>
  <MyComponent />
</ComponentErrorBoundary>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentErrorBoundaryDemo;
