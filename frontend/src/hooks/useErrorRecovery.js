/**
 * useErrorRecovery Hook
 * 
 * React hook for using advanced error recovery strategies in components
 * 
 * Requirements:
 * - FR-ERR-8: Reset error boundary and re-render component on retry
 * - NFR-REL-1: Recover from component errors without full page reload in 95% of cases
 * 
 * Features:
 * - Automatic error recovery with smart strategies
 * - State preservation and restoration
 * - Circuit breaker integration
 * - Recovery statistics tracking
 * - Easy integration with existing components
 * 
 * Usage:
 * ```jsx
 * const MyComponent = () => {
 *   const {
 *     executeWithRecovery,
 *     saveState,
 *     isRecovering,
 *     recoveryAttempts,
 *     canRecover
 *   } = useErrorRecovery('MyComponent');
 * 
 *   const fetchData = async () => {
 *     return executeWithRecovery(async () => {
 *       const response = await api.get('/data');
 *       return response.data;
 *     }, {
 *       fallbackData: cachedData,
 *       onSuccess: (data) => setData(data),
 *       onFailure: (error) => console.error(error)
 *     });
 *   };
 * 
 *   return <div>...</div>;
 * };
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  recoverFromError,
  saveComponentState,
  cacheDataForFallback,
  getRecoveryStatistics,
  canAttemptRecovery,
  RecoveryStrategy
} from '../utils/errorRecoveryStrategies';

/**
 * useErrorRecovery Hook
 * 
 * @param {string} componentName - Name of the component (for tracking)
 * @param {Object} options - Hook options
 * @param {boolean} options.autoSaveState - Automatically save state on changes
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {Function} options.onRecoverySuccess - Callback on successful recovery
 * @param {Function} options.onRecoveryFailure - Callback on failed recovery
 * @returns {Object} Recovery utilities
 */
export const useErrorRecovery = (componentName, options = {}) => {
  const {
    autoSaveState = false,
    maxRetries = 3,
    onRecoverySuccess,
    onRecoveryFailure
  } = options;

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [lastRecoveryResult, setLastRecoveryResult] = useState(null);
  
  const stateRef = useRef(null);
  const cacheRef = useRef(new Map());

  /**
   * Check if recovery can be attempted (circuit breaker check)
   */
  const canRecover = useCallback(() => {
    return canAttemptRecovery(componentName);
  }, [componentName]);

  /**
   * Save component state for recovery
   */
  const saveState = useCallback((state) => {
    stateRef.current = state;
    saveComponentState(componentName, state);
  }, [componentName]);

  /**
   * Cache data for fallback
   */
  const cacheData = useCallback((key, data, ttl) => {
    cacheRef.current.set(key, data);
    cacheDataForFallback(key, data, ttl);
  }, []);

  /**
   * Execute function with automatic error recovery
   * 
   * @param {Function} fn - Async function to execute
   * @param {Object} context - Recovery context
   * @param {any} context.fallbackData - Fallback data if recovery fails
   * @param {string} context.cacheKey - Cache key for data
   * @param {Function} context.onSuccess - Success callback
   * @param {Function} context.onFailure - Failure callback
   * @param {Object} context.request - Request object for offline queueing
   * @returns {Promise<any>} Result or fallback data
   */
  const executeWithRecovery = useCallback(async (fn, context = {}) => {
    const {
      fallbackData,
      cacheKey,
      onSuccess,
      onFailure,
      request
    } = context;

    // Check if we can attempt recovery
    if (!canRecover()) {
      console.warn(`[useErrorRecovery] Circuit breaker open for ${componentName}`);
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw new Error('Circuit breaker open - too many failures');
    }

    try {
      // Execute the function
      const result = await fn();
      
      // Cache successful result if cache key provided
      if (cacheKey) {
        cacheData(cacheKey, result);
      }

      // Reset recovery attempts on success
      setRecoveryAttempts(0);
      setLastError(null);

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      if (onRecoverySuccess) {
        onRecoverySuccess(result);
      }

      return result;
    } catch (error) {
      console.error(`[useErrorRecovery] Error in ${componentName}:`, error);
      setLastError(error);

      // Check if we've exceeded max retries
      if (recoveryAttempts >= maxRetries) {
        console.error(`[useErrorRecovery] Max retries (${maxRetries}) exceeded for ${componentName}`);
        
        // Call failure callback
        if (onFailure) {
          onFailure(error);
        }
        if (onRecoveryFailure) {
          onRecoveryFailure(error);
        }

        // Return fallback data if available
        if (fallbackData !== undefined) {
          return fallbackData;
        }

        throw error;
      }

      // Attempt recovery
      setIsRecovering(true);
      setRecoveryAttempts(prev => prev + 1);

      try {
        const recoveryResult = await recoverFromError(error, {
          componentName,
          retryFn: fn,
          retryCount: recoveryAttempts,
          hasCache: cacheKey && cacheRef.current.has(cacheKey),
          cacheKey,
          request,
          onSuccess: (result) => {
            console.log(`[useErrorRecovery] Recovery successful for ${componentName}`);
            setRecoveryAttempts(0);
            setLastError(null);
            if (onSuccess) onSuccess(result.data);
            if (onRecoverySuccess) onRecoverySuccess(result.data);
          },
          onFailure: (result) => {
            console.error(`[useErrorRecovery] Recovery failed for ${componentName}`);
            if (onFailure) onFailure(result.error);
            if (onRecoveryFailure) onRecoveryFailure(result.error);
          }
        });

        setLastRecoveryResult(recoveryResult);

        if (recoveryResult.success) {
          return recoveryResult.data;
        }

        // Recovery failed, return fallback if available
        if (fallbackData !== undefined) {
          return fallbackData;
        }

        throw error;
      } finally {
        setIsRecovering(false);
      }
    }
  }, [
    componentName,
    recoveryAttempts,
    maxRetries,
    canRecover,
    cacheData,
    onRecoverySuccess,
    onRecoveryFailure
  ]);

  /**
   * Get recovery statistics for this component
   */
  const getStatistics = useCallback(() => {
    return getRecoveryStatistics(componentName);
  }, [componentName]);

  /**
   * Reset recovery state
   */
  const resetRecovery = useCallback(() => {
    setRecoveryAttempts(0);
    setLastError(null);
    setLastRecoveryResult(null);
    setIsRecovering(false);
  }, []);

  // Auto-save state if enabled
  useEffect(() => {
    if (autoSaveState && stateRef.current) {
      saveState(stateRef.current);
    }
  }, [autoSaveState, saveState]);

  return {
    // Main function
    executeWithRecovery,
    
    // State management
    saveState,
    cacheData,
    
    // Recovery state
    isRecovering,
    recoveryAttempts,
    canRecover: canRecover(),
    lastError,
    lastRecoveryResult,
    
    // Utilities
    getStatistics,
    resetRecovery
  };
};

/**
 * useRecoveryState Hook
 * 
 * Hook for managing component state with automatic recovery
 * Similar to useState but with recovery capabilities
 * 
 * @param {string} componentName - Component name
 * @param {any} initialState - Initial state
 * @returns {Array} [state, setState, recovery utilities]
 */
export const useRecoveryState = (componentName, initialState) => {
  const [state, setState] = useState(initialState);
  const recovery = useErrorRecovery(componentName, { autoSaveState: true });

  // Save state whenever it changes
  useEffect(() => {
    recovery.saveState(state);
  }, [state, recovery]);

  return [state, setState, recovery];
};

/**
 * useRecoveryCallback Hook
 * 
 * Hook for creating callbacks with automatic error recovery
 * Similar to useCallback but with recovery capabilities
 * 
 * @param {string} componentName - Component name
 * @param {Function} callback - Callback function
 * @param {Array} deps - Dependencies
 * @param {Object} options - Recovery options
 * @returns {Function} Wrapped callback with recovery
 */
export const useRecoveryCallback = (componentName, callback, deps, options = {}) => {
  const recovery = useErrorRecovery(componentName, options);

  return useCallback(
    (...args) => {
      return recovery.executeWithRecovery(
        () => callback(...args),
        options
      );
    },
    [recovery, callback, ...deps]
  );
};

export default useErrorRecovery;
