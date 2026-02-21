import React, { useState } from 'react';
import { useApiError } from '../../hooks/useNetworkError';
import NetworkError from './NetworkError';
import api from '../../services/api';

/**
 * NetworkErrorExample - Example component demonstrating network error handling
 * 
 * This component shows how to:
 * - Use the useApiError hook for automatic error handling
 * - Display network errors with the NetworkError component
 * - Implement retry functionality
 * - Handle different types of network errors
 */
const NetworkErrorExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const {
    networkError,
    isRetrying,
    hasError,
    canRetry,
    retry,
    clearError,
    executeApiCall
  } = useApiError({
    component: 'NetworkErrorExample',
    onError: (error) => {
      console.log('Network error occurred:', error);
    },
    onRetry: (attempt) => {
      console.log(`Retry attempt ${attempt}`);
    },
    onSuccess: (result) => {
      console.log('Request succeeded:', result);
    }
  });

  // Example API calls that might fail
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await executeApiCall(
        () => api.get('/jobs'),
        'fetch-jobs'
      );
      setData(response.data);
    } catch (error) {
      // Error is already handled by the hook
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithTimeout = async () => {
    setLoading(true);
    try {
      const response = await executeApiCall(
        () => api.get('/slow-endpoint', { timeout: 1000 }),
        'fetch-timeout'
      );
      setData(response.data);
    } catch (error) {
      console.error('Request timed out:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNonExistent = async () => {
    setLoading(true);
    try {
      const response = await executeApiCall(
        () => api.get('/non-existent-endpoint'),
        'fetch-404'
      );
      setData(response.data);
    } catch (error) {
      console.error('Endpoint not found:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateOffline = async () => {
    // Temporarily override navigator.onLine
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    setLoading(true);
    try {
      const response = await executeApiCall(
        () => api.get('/jobs'),
        'fetch-offline'
      );
      setData(response.data);
    } catch (error) {
      console.error('Offline error:', error);
    } finally {
      setLoading(false);
      // Restore original online status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: originalOnLine
      });
    }
  };

  const handleRetry = async () => {
    try {
      await retry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Network Error Handling Examples</h1>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Jobs'}
        </button>
        
        <button
          onClick={fetchWithTimeout}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Timeout Test
        </button>
        
        <button
          onClick={fetchNonExistent}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          404 Test
        </button>
        
        <button
          onClick={simulateOffline}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Offline Test
        </button>
      </div>

      {/* Clear Error Button */}
      {hasError && (
        <div className="mb-4">
          <button
            onClick={clearError}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Network Error Display */}
      {hasError && (
        <div className="mb-6">
          <NetworkError
            error={networkError}
            onRetry={handleRetry}
            onDismiss={clearError}
            size="medium"
            showDetails={true}
            autoRetryOnline={true}
            maxAutoRetries={3}
          />
        </div>
      )}

      {/* Success Data Display */}
      {data && !hasError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Error State Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Error State Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Has Error:</strong> {hasError ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Retrying:</strong> {isRetrying ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Can Retry:</strong> {canRetry ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Error Type:</strong> {networkError?.type || 'None'}
          </div>
          <div className="col-span-2">
            <strong>Error Message:</strong> {networkError?.message || 'None'}
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click the buttons above to simulate different network error scenarios</li>
          <li>• Each error type will display a specific message and retry option</li>
          <li>• The "Offline Test" simulates being offline (auto-retries when "online")</li>
          <li>• Use the "Clear Error" button to manually dismiss errors</li>
          <li>• Check the browser console for detailed error logging</li>
        </ul>
      </div>

      {/* Code Example */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Code Example</h3>
        <pre className="text-sm overflow-auto">
{`import { useApiError } from '../hooks/useNetworkError';
import NetworkError from '../components/ErrorBoundary/NetworkError';

const MyComponent = () => {
  const {
    networkError,
    hasError,
    executeApiCall,
    retry,
    clearError
  } = useApiError({
    component: 'MyComponent'
  });

  const fetchData = async () => {
    try {
      const response = await executeApiCall(
        () => api.get('/data'),
        'fetch-data'
      );
      // Handle success
    } catch (error) {
      // Error automatically handled by hook
    }
  };

  return (
    <div>
      {hasError && (
        <NetworkError
          error={networkError}
          onRetry={retry}
          onDismiss={clearError}
        />
      )}
      {/* Your component content */}
    </div>
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default NetworkErrorExample;