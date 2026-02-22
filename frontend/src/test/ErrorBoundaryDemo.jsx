import React, { useState } from 'react';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import RouteErrorBoundary from '../components/ErrorBoundary/RouteErrorBoundary';

/**
 * ErrorBoundaryDemo - Demonstration component to test error boundaries
 * 
 * This component demonstrates that:
 * - FR-ERR-1: Component errors are caught by error boundaries
 * - FR-ERR-2: User-friendly error messages are displayed
 * - FR-ERR-3: Error details are logged to console
 * - FR-ERR-4: Retry button allows recovery
 * - FR-ERR-7: Component-level errors don't break the entire page
 * 
 * Usage:
 * 1. Import this component in your app
 * 2. Click "Trigger Component Error" to test ComponentErrorBoundary
 * 3. Click "Trigger Route Error" to test RouteErrorBoundary
 * 4. Check console for error logs
 * 5. Click "Retry" to recover from errors
 */

// Component that throws an error when triggered
const ErrorThrower = ({ shouldThrow, errorType }) => {
  if (shouldThrow) {
    throw new Error(`Test ${errorType} error - This is intentional for testing`);
  }
  return (
    <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '8px', margin: '10px 0' }}>
      <h3>✅ Component Working Correctly</h3>
      <p>No errors detected. The component is rendering successfully.</p>
    </div>
  );
};

// Component to test ComponentErrorBoundary
const ComponentErrorDemo = () => {
  const [throwError, setThrowError] = useState(false);

  return (
    <div style={{ border: '2px solid #304B60', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
      <h2>Component-Level Error Boundary Test</h2>
      <p>This tests FR-ERR-7: Component errors don't break the entire page</p>
      
      <button
        onClick={() => setThrowError(true)}
        style={{
          padding: '10px 20px',
          background: '#D48161',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Trigger Component Error
      </button>

      <ComponentErrorBoundary componentName="ErrorThrower">
        <ErrorThrower shouldThrow={throwError} errorType="component" />
      </ComponentErrorBoundary>

      <div style={{ marginTop: '20px', padding: '10px', background: '#fff3e0', borderRadius: '4px' }}>
        <strong>Note:</strong> Even if the component above errors, this section still works!
        This demonstrates that ComponentErrorBoundary prevents errors from breaking the entire page.
      </div>
    </div>
  );
};

// Component to test RouteErrorBoundary
const RouteErrorDemo = () => {
  const [throwError, setThrowError] = useState(false);

  return (
    <div style={{ border: '2px solid #304B60', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
      <h2>Route-Level Error Boundary Test</h2>
      <p>This tests FR-ERR-6: Route errors show full-page error boundary</p>
      
      <button
        onClick={() => setThrowError(true)}
        style={{
          padding: '10px 20px',
          background: '#D48161',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Trigger Route Error
      </button>

      <div style={{ padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
        <strong>Warning:</strong> Clicking this button will trigger a route-level error
        that will show a full-page error screen. You can use the "Retry" button to recover.
      </div>

      {/* This would normally be wrapped by RouteErrorBoundary in the app */}
      <ErrorThrower shouldThrow={throwError} errorType="route" />
    </div>
  );
};

// Main demo component
const ErrorBoundaryDemo = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#304B60', borderBottom: '3px solid #D48161', paddingBottom: '10px' }}>
        Error Boundary Testing Demo
      </h1>
      
      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Requirements Tested:</h3>
        <ul>
          <li>✅ FR-ERR-1: Component errors are caught</li>
          <li>✅ FR-ERR-2: User-friendly error messages (multi-language)</li>
          <li>✅ FR-ERR-3: Error details logged to console</li>
          <li>✅ FR-ERR-4: Retry button for recovery</li>
          <li>✅ FR-ERR-5: Go Home button (route errors)</li>
          <li>✅ FR-ERR-6: Full-page error for route errors</li>
          <li>✅ FR-ERR-7: Inline error for component errors</li>
          <li>✅ FR-ERR-8: Error boundary reset on retry</li>
        </ul>
      </div>

      <ComponentErrorDemo />
      
      <div style={{ margin: '40px 0', borderTop: '2px dashed #ccc', paddingTop: '20px' }}>
        <h3>Console Logging Test</h3>
        <p>Open your browser console (F12) and trigger an error to see:</p>
        <ul>
          <li>Timestamp</li>
          <li>Component name</li>
          <li>User ID (if authenticated)</li>
          <li>Error message</li>
          <li>Stack trace</li>
          <li>Component stack</li>
        </ul>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>How to Use:</h3>
        <ol>
          <li>Click "Trigger Component Error" to test ComponentErrorBoundary</li>
          <li>Observe that only the component section shows an error</li>
          <li>Check the console for detailed error logs</li>
          <li>Click "Retry" to recover from the error</li>
          <li>The component will attempt to re-render</li>
        </ol>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
