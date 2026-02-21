/**
 * useNetworkError Hook
 * 
 * Requirements:
 * - FR-ERR-9: When network errors occur, the system shall display specific network error messages with retry options
 * 
 * This hook provides:
 * - Easy network error handling in React components
 * - Automatic error type detection and message generation
 * - Retry functionality with exponential backoff
 * - Integration with existing error boundaries
 * - Multi-language support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  handleNetworkError, 
  retryWithBackoff,
  monitorNetworkStatus 
} from '../utils/networkErrorHandler';

/**
 * Hook for handling network errors with retry functionality
 * 
 * @param {Object} options - Hook options
 * @param {string} options.component - Component name for error tracking
 * @param {boolean} options.autoRetryOnline - Auto-retry when coming back online
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onRetry - Retry callback
 * @param {Function} options.onSuccess - Success callback
 * @returns {Object} Network error handling utilities
 */
export const useNetworkError = (options = {}) => {
  const {
    component = 'Unknown',
    autoRetryOnline = true,
    maxRetries = 3,
    onError,
    onRetry,
    onSuccess
  } = options;

  const { language } = useApp();
  const [networkError, setNetworkError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const lastFailedRequestRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Monitor network status
  useEffect(() => {
    if (!autoRetryOnline) return;

    const cleanup = monitorNetworkStatus(
      () => {
        setIsOnline(true);
        // Auto-retry the last failed request when coming back online
        if (networkError && lastFailedRequestRef.current && retryCount < maxRetries) {
          handleAutoRetry();
        }
      },
      () => {
        setIsOnline(false);
      }
    );

    return cleanup;
  }, [autoRetryOnline, networkError, retryCount, maxRetries]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle network error
   * 
   * @param {Error} error - Network error
   * @param {Function} retryFn - Function to retry
   * @param {string} action - Action being performed
   * @returns {Object} Processed network error
   */
  const handleError = useCallback((error, retryFn, action = 'api-request') => {
    const processedError = handleNetworkError(error, {
      language,
      component,
      action,
      context: {
        retryCount,
        isOnline,
        timestamp: new Date().toISOString()
      }
    });

    // Store the retry function for auto-retry
    lastFailedRequestRef.current = retryFn;
    
    // Set the network error state
    setNetworkError(processedError);
    
    // Call error callback
    if (onError) {
      onError(processedError);
    }

    return processedError;
  }, [language, component, retryCount, isOnline, onError]);

  /**
   * Retry the last failed request
   */
  const retry = useCallback(async () => {
    if (!lastFailedRequestRef.current || isRetrying) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Call retry callback
      if (onRetry) {
        onRetry(retryCount + 1);
      }

      const result = await retryWithBackoff(lastFailedRequestRef.current, {
        maxRetries: 1, // Single retry attempt (we handle the count ourselves)
        baseDelay: networkError?.retryDelay || 2000,
        onRetry: (attempt, delay) => {
          console.log(`[useNetworkError] Retry attempt ${attempt} in ${delay}ms`);
        }
      });

      // Success - clear error state
      clearError();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (retryError) {
      console.error('[useNetworkError] Retry failed:', retryError);
      
      // Update error with new retry count
      const updatedError = handleNetworkError(retryError, {
        language,
        component,
        action: 'retry',
        context: {
          retryCount: retryCount + 1,
          isOnline,
          timestamp: new Date().toISOString()
        }
      });
      
      setNetworkError(updatedError);
      throw retryError;
    } finally {
      setIsRetrying(false);
    }
  }, [lastFailedRequestRef.current, isRetrying, retryCount, networkError, language, component, isOnline, onRetry, onSuccess]);

  /**
   * Auto-retry when coming back online
   */
  const handleAutoRetry = useCallback(async () => {
    if (!lastFailedRequestRef.current || isRetrying) {
      return;
    }

    // Delay auto-retry slightly to ensure connection is stable
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await retry();
      } catch (error) {
        console.error('[useNetworkError] Auto-retry failed:', error);
      }
    }, 1000);
  }, [retry, isRetrying]);

  /**
   * Clear the current network error
   */
  const clearError = useCallback(() => {
    setNetworkError(null);
    setRetryCount(0);
    lastFailedRequestRef.current = null;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  /**
   * Execute a function with network error handling
   * 
   * @param {Function} fn - Function to execute
   * @param {string} action - Action name for error tracking
   * @returns {Promise} Promise that resolves with the result or rejects with network error
   */
  const executeWithErrorHandling = useCallback(async (fn, action = 'api-request') => {
    try {
      clearError(); // Clear any previous errors
      const result = await fn();
      return result;
    } catch (error) {
      const processedError = handleError(error, fn, action);
      throw processedError;
    }
  }, [handleError, clearError]);

  /**
   * Create a wrapped version of an async function with automatic error handling
   * 
   * @param {Function} fn - Async function to wrap
   * @param {string} action - Action name for error tracking
   * @returns {Function} Wrapped function
   */
  const wrapWithErrorHandling = useCallback((fn, action = 'api-request') => {
    return async (...args) => {
      return executeWithErrorHandling(() => fn(...args), action);
    };
  }, [executeWithErrorHandling]);

  return {
    // State
    networkError,
    isRetrying,
    retryCount,
    isOnline,
    hasError: !!networkError,
    canRetry: !!networkError?.isRetryable && !!lastFailedRequestRef.current,
    
    // Actions
    handleError,
    retry,
    clearError,
    executeWithErrorHandling,
    wrapWithErrorHandling,
    
    // Utilities
    isRetryableError: networkError?.isRetryable || false,
    errorType: networkError?.type,
    errorMessage: networkError?.message,
    retryDelay: networkError?.retryDelay || 2000
  };
};

/**
 * Hook for handling network errors in API calls specifically
 * 
 * @param {Object} options - Hook options
 * @returns {Object} API-specific network error handling utilities
 */
export const useApiError = (options = {}) => {
  const networkErrorHook = useNetworkError({
    component: 'API',
    ...options
  });

  /**
   * Execute an API call with error handling
   * 
   * @param {Function} apiCall - API call function
   * @param {string} endpoint - API endpoint name for tracking
   * @returns {Promise} Promise that resolves with API response
   */
  const executeApiCall = useCallback(async (apiCall, endpoint = 'unknown') => {
    return networkErrorHook.executeWithErrorHandling(apiCall, `api-${endpoint}`);
  }, [networkErrorHook.executeWithErrorHandling]);

  /**
   * Wrap an API function with automatic error handling
   * 
   * @param {Function} apiFunction - API function to wrap
   * @param {string} endpoint - API endpoint name for tracking
   * @returns {Function} Wrapped API function
   */
  const wrapApiCall = useCallback((apiFunction, endpoint = 'unknown') => {
    return networkErrorHook.wrapWithErrorHandling(apiFunction, `api-${endpoint}`);
  }, [networkErrorHook.wrapWithErrorHandling]);

  return {
    ...networkErrorHook,
    executeApiCall,
    wrapApiCall
  };
};

export default useNetworkError;