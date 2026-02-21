/**
 * Advanced Error Recovery Strategies
 * 
 * Requirements:
 * - FR-ERR-8: Reset error boundary and re-render component on retry
 * - NFR-REL-1: Recover from component errors without full page reload in 95% of cases
 * 
 * This module provides advanced error recovery strategies that go beyond simple retry:
 * - Automatic recovery with fallback strategies
 * - State restoration after errors
 * - Graceful degradation
 * - Circuit breaker pattern
 * - Recovery history tracking
 * - Smart retry with context awareness
 * 
 * Integration with existing systems:
 * - Works with RouteErrorBoundary and ComponentErrorBoundary
 * - Uses networkErrorHandler for network-specific recovery
 * - Uses offlineRequestQueue for offline scenarios
 * - Uses errorTracking for monitoring recovery success rates
 */

import { logError } from './errorTracking';
import { detectNetworkErrorType, NetworkErrorTypes, isRetryableError } from './networkErrorHandler';
import { queueRequest, processQueue } from './offlineRequestQueue';

/**
 * Recovery strategy types
 */
export const RecoveryStrategy = {
  RETRY: 'RETRY',                           // Simple retry
  RETRY_WITH_BACKOFF: 'RETRY_WITH_BACKOFF', // Retry with exponential backoff
  FALLBACK_UI: 'FALLBACK_UI',               // Show fallback UI
  GRACEFUL_DEGRADATION: 'GRACEFUL_DEGRADATION', // Reduce functionality
  STATE_RESTORATION: 'STATE_RESTORATION',   // Restore previous state
  CACHE_FALLBACK: 'CACHE_FALLBACK',         // Use cached data
  OFFLINE_QUEUE: 'OFFLINE_QUEUE',           // Queue for later
  CIRCUIT_BREAKER: 'CIRCUIT_BREAKER',       // Stop trying temporarily
  RELOAD_COMPONENT: 'RELOAD_COMPONENT',     // Reload just the component
  RELOAD_PAGE: 'RELOAD_PAGE',               // Full page reload (last resort)
};

/**
 * Circuit breaker states
 */
const CircuitState = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Failing, stop trying
  HALF_OPEN: 'HALF_OPEN' // Testing if recovered
};

/**
 * Recovery history for tracking success rates
 */
class RecoveryHistory {
  constructor() {
    this.history = new Map(); // componentName -> { attempts, successes, failures, lastAttempt }
  }

  recordAttempt(componentName, success) {
    if (!this.history.has(componentName)) {
      this.history.set(componentName, {
        attempts: 0,
        successes: 0,
        failures: 0,
        lastAttempt: null,
        lastSuccess: null,
        lastFailure: null
      });
    }

    const record = this.history.get(componentName);
    record.attempts++;
    record.lastAttempt = Date.now();

    if (success) {
      record.successes++;
      record.lastSuccess = Date.now();
    } else {
      record.failures++;
      record.lastFailure = Date.now();
    }

    this.history.set(componentName, record);
  }

  getSuccessRate(componentName) {
    const record = this.history.get(componentName);
    if (!record || record.attempts === 0) return 0;
    return record.successes / record.attempts;
  }

  getRecord(componentName) {
    return this.history.get(componentName) || null;
  }

  clear(componentName) {
    if (componentName) {
      this.history.delete(componentName);
    } else {
      this.history.clear();
    }
  }
}

/**
 * Circuit breaker for preventing repeated failures
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  canAttempt() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log('[CircuitBreaker] Transitioning to HALF_OPEN');
        return true;
      }
      return false;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      return true;
    }

    return false;
  }

  recordSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        console.log('[CircuitBreaker] Transitioning to CLOSED');
      }
    }
  }

  recordFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      console.log(`[CircuitBreaker] Transitioning to OPEN until ${new Date(this.nextAttempt).toISOString()}`);
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

/**
 * Error Recovery Manager
 * Coordinates recovery strategies and tracks success rates
 */
class ErrorRecoveryManager {
  constructor() {
    this.history = new RecoveryHistory();
    this.circuitBreakers = new Map(); // componentName -> CircuitBreaker
    this.stateCache = new Map(); // componentName -> savedState
    this.dataCache = new Map(); // cacheKey -> { data, timestamp, ttl }
  }

  /**
   * Get or create circuit breaker for component
   */
  getCircuitBreaker(componentName) {
    if (!this.circuitBreakers.has(componentName)) {
      this.circuitBreakers.set(componentName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(componentName);
  }

  /**
   * Determine best recovery strategy for error
   */
  determineStrategy(error, context = {}) {
    const { componentName, retryCount = 0, hasCache = false, hasFallback = false } = context;

    // Check circuit breaker
    if (componentName) {
      const circuitBreaker = this.getCircuitBreaker(componentName);
      if (!circuitBreaker.canAttempt()) {
        console.log(`[Recovery] Circuit breaker OPEN for ${componentName}`);
        return hasFallback ? RecoveryStrategy.FALLBACK_UI : RecoveryStrategy.GRACEFUL_DEGRADATION;
      }
    }

    // Network errors
    if (error.networkError || error.isNetworkError) {
      const errorType = detectNetworkErrorType(error);

      // Offline - queue for later
      if (errorType === NetworkErrorTypes.OFFLINE_ERROR) {
        return RecoveryStrategy.OFFLINE_QUEUE;
      }

      // Retryable network errors
      if (isRetryableError(errorType) && retryCount < 3) {
        return RecoveryStrategy.RETRY_WITH_BACKOFF;
      }

      // Use cache if available
      if (hasCache) {
        return RecoveryStrategy.CACHE_FALLBACK;
      }

      // Show fallback UI
      if (hasFallback) {
        return RecoveryStrategy.FALLBACK_UI;
      }

      return RecoveryStrategy.GRACEFUL_DEGRADATION;
    }

    // Component errors
    if (error.componentStack || context.isComponentError) {
      // First attempt - try simple retry
      if (retryCount === 0) {
        return RecoveryStrategy.RETRY;
      }

      // Second attempt - try state restoration
      if (retryCount === 1 && this.hasStateCache(componentName)) {
        return RecoveryStrategy.STATE_RESTORATION;
      }

      // Third attempt - reload component
      if (retryCount === 2) {
        return RecoveryStrategy.RELOAD_COMPONENT;
      }

      // Use fallback if available
      if (hasFallback) {
        return RecoveryStrategy.FALLBACK_UI;
      }

      // Last resort - graceful degradation
      return RecoveryStrategy.GRACEFUL_DEGRADATION;
    }

    // Default strategy
    return retryCount < 2 ? RecoveryStrategy.RETRY : RecoveryStrategy.FALLBACK_UI;
  }

  /**
   * Execute recovery strategy
   */
  async executeStrategy(strategy, error, context = {}) {
    const { componentName, retryFn, fallbackUI, onSuccess, onFailure } = context;

    console.log(`[Recovery] Executing strategy: ${strategy} for ${componentName || 'unknown'}`);

    try {
      let result;

      switch (strategy) {
        case RecoveryStrategy.RETRY:
          result = await this.retry(retryFn);
          break;

        case RecoveryStrategy.RETRY_WITH_BACKOFF:
          result = await this.retryWithBackoff(retryFn, context);
          break;

        case RecoveryStrategy.FALLBACK_UI:
          result = { success: true, data: fallbackUI, strategy };
          break;

        case RecoveryStrategy.GRACEFUL_DEGRADATION:
          result = await this.gracefulDegradation(error, context);
          break;

        case RecoveryStrategy.STATE_RESTORATION:
          result = await this.restoreState(componentName, retryFn);
          break;

        case RecoveryStrategy.CACHE_FALLBACK:
          result = await this.useCacheFallback(context.cacheKey);
          break;

        case RecoveryStrategy.OFFLINE_QUEUE:
          result = await this.queueForLater(context.request);
          break;

        case RecoveryStrategy.CIRCUIT_BREAKER:
          result = { success: false, message: 'Circuit breaker open', strategy };
          break;

        case RecoveryStrategy.RELOAD_COMPONENT:
          result = await this.reloadComponent(componentName, retryFn);
          break;

        case RecoveryStrategy.RELOAD_PAGE:
          this.reloadPage();
          result = { success: true, strategy };
          break;

        default:
          result = { success: false, message: 'Unknown strategy', strategy };
      }

      // Record success/failure
      if (componentName) {
        this.history.recordAttempt(componentName, result.success);
        const circuitBreaker = this.getCircuitBreaker(componentName);
        if (result.success) {
          circuitBreaker.recordSuccess();
        } else {
          circuitBreaker.recordFailure();
        }
      }

      // Log recovery attempt
      logError(error, {
        component: componentName || 'Unknown',
        action: 'error-recovery',
        level: result.success ? 'info' : 'warning',
        extra: {
          strategy,
          success: result.success,
          retryCount: context.retryCount || 0
        }
      });

      // Call callbacks
      if (result.success && onSuccess) {
        onSuccess(result);
      } else if (!result.success && onFailure) {
        onFailure(result);
      }

      return result;
    } catch (recoveryError) {
      console.error('[Recovery] Strategy execution failed:', recoveryError);
      
      if (componentName) {
        this.history.recordAttempt(componentName, false);
        this.getCircuitBreaker(componentName).recordFailure();
      }

      return { success: false, error: recoveryError, strategy };
    }
  }

  /**
   * Simple retry
   */
  async retry(retryFn) {
    if (!retryFn) {
      return { success: false, message: 'No retry function provided' };
    }

    try {
      const result = await retryFn();
      return { success: true, data: result, strategy: RecoveryStrategy.RETRY };
    } catch (error) {
      return { success: false, error, strategy: RecoveryStrategy.RETRY };
    }
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(retryFn, context = {}) {
    const { retryCount = 0, maxRetries = 3, baseDelay = 1000 } = context;

    if (!retryFn) {
      return { success: false, message: 'No retry function provided' };
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await retryFn();
        return { success: true, data: result, strategy: RecoveryStrategy.RETRY_WITH_BACKOFF, attempts: attempt + 1 };
      } catch (error) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`[Recovery] Retry attempt ${attempt + 1} failed, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return { success: false, error, strategy: RecoveryStrategy.RETRY_WITH_BACKOFF, attempts: attempt + 1 };
        }
      }
    }
  }

  /**
   * Graceful degradation - reduce functionality but keep app working
   */
  async gracefulDegradation(error, context = {}) {
    console.log('[Recovery] Applying graceful degradation');
    
    // Return a minimal working state
    return {
      success: true,
      data: {
        degraded: true,
        message: 'Some features are temporarily unavailable',
        error: error.message
      },
      strategy: RecoveryStrategy.GRACEFUL_DEGRADATION
    };
  }

  /**
   * Save component state for recovery
   */
  saveState(componentName, state) {
    this.stateCache.set(componentName, {
      state,
      timestamp: Date.now()
    });
    console.log(`[Recovery] State saved for ${componentName}`);
  }

  /**
   * Check if state cache exists
   */
  hasStateCache(componentName) {
    return this.stateCache.has(componentName);
  }

  /**
   * Restore previous state
   */
  async restoreState(componentName, retryFn) {
    const cached = this.stateCache.get(componentName);
    
    if (!cached) {
      console.log(`[Recovery] No cached state for ${componentName}`);
      return { success: false, message: 'No cached state' };
    }

    console.log(`[Recovery] Restoring state for ${componentName}`);
    
    try {
      // Try to retry with restored state
      if (retryFn) {
        const result = await retryFn(cached.state);
        return { success: true, data: result, restoredState: cached.state, strategy: RecoveryStrategy.STATE_RESTORATION };
      }
      
      return { success: true, data: cached.state, strategy: RecoveryStrategy.STATE_RESTORATION };
    } catch (error) {
      return { success: false, error, strategy: RecoveryStrategy.STATE_RESTORATION };
    }
  }

  /**
   * Cache data for fallback
   */
  cacheData(key, data, ttl = 300000) { // 5 minutes default
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`[Recovery] Data cached: ${key}`);
  }

  /**
   * Use cached data as fallback
   */
  async useCacheFallback(cacheKey) {
    const cached = this.dataCache.get(cacheKey);
    
    if (!cached) {
      console.log(`[Recovery] No cached data for ${cacheKey}`);
      return { success: false, message: 'No cached data' };
    }

    // Check if cache is still valid
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      console.log(`[Recovery] Cached data expired for ${cacheKey}`);
      this.dataCache.delete(cacheKey);
      return { success: false, message: 'Cache expired' };
    }

    console.log(`[Recovery] Using cached data for ${cacheKey}`);
    return { success: true, data: cached.data, fromCache: true, strategy: RecoveryStrategy.CACHE_FALLBACK };
  }

  /**
   * Queue request for later (offline scenario)
   */
  async queueForLater(request) {
    if (!request) {
      return { success: false, message: 'No request to queue' };
    }

    const queued = queueRequest(request);
    
    if (queued) {
      console.log('[Recovery] Request queued for later');
      return { success: true, queued: true, strategy: RecoveryStrategy.OFFLINE_QUEUE };
    }

    return { success: false, message: 'Failed to queue request' };
  }

  /**
   * Reload component (force re-mount)
   */
  async reloadComponent(componentName, retryFn) {
    console.log(`[Recovery] Reloading component: ${componentName}`);
    
    // Clear component state
    this.stateCache.delete(componentName);
    
    // Try retry function
    if (retryFn) {
      try {
        const result = await retryFn();
        return { success: true, data: result, reloaded: true, strategy: RecoveryStrategy.RELOAD_COMPONENT };
      } catch (error) {
        return { success: false, error, strategy: RecoveryStrategy.RELOAD_COMPONENT };
      }
    }

    return { success: true, reloaded: true, strategy: RecoveryStrategy.RELOAD_COMPONENT };
  }

  /**
   * Reload entire page (last resort)
   */
  reloadPage() {
    console.log('[Recovery] Reloading page (last resort)');
    window.location.reload();
  }

  /**
   * Get recovery statistics
   */
  getStatistics(componentName) {
    if (componentName) {
      return {
        component: componentName,
        history: this.history.getRecord(componentName),
        successRate: this.history.getSuccessRate(componentName),
        circuitBreaker: this.getCircuitBreaker(componentName).getState()
      };
    }

    // Get all statistics
    const stats = {
      components: {},
      overall: {
        totalAttempts: 0,
        totalSuccesses: 0,
        totalFailures: 0
      }
    };

    this.history.history.forEach((record, name) => {
      stats.components[name] = {
        ...record,
        successRate: this.history.getSuccessRate(name),
        circuitBreaker: this.getCircuitBreaker(name).getState()
      };
      stats.overall.totalAttempts += record.attempts;
      stats.overall.totalSuccesses += record.successes;
      stats.overall.totalFailures += record.failures;
    });

    stats.overall.successRate = stats.overall.totalAttempts > 0
      ? stats.overall.totalSuccesses / stats.overall.totalAttempts
      : 0;

    return stats;
  }

  /**
   * Reset recovery state
   */
  reset(componentName) {
    if (componentName) {
      this.history.clear(componentName);
      this.stateCache.delete(componentName);
      const circuitBreaker = this.circuitBreakers.get(componentName);
      if (circuitBreaker) {
        circuitBreaker.reset();
      }
      console.log(`[Recovery] Reset state for ${componentName}`);
    } else {
      this.history.clear();
      this.stateCache.clear();
      this.dataCache.clear();
      this.circuitBreakers.clear();
      console.log('[Recovery] Reset all recovery state');
    }
  }
}

// Create singleton instance
const recoveryManager = new ErrorRecoveryManager();

/**
 * Main recovery function - determines and executes best recovery strategy
 * 
 * @param {Error} error - The error to recover from
 * @param {Object} context - Recovery context
 * @param {string} context.componentName - Name of component where error occurred
 * @param {Function} context.retryFn - Function to retry
 * @param {React.Component} context.fallbackUI - Fallback UI component
 * @param {number} context.retryCount - Current retry count
 * @param {boolean} context.hasCache - Whether cached data is available
 * @param {string} context.cacheKey - Cache key for data
 * @param {Object} context.request - Request object for offline queueing
 * @param {Function} context.onSuccess - Success callback
 * @param {Function} context.onFailure - Failure callback
 * @returns {Promise<Object>} Recovery result
 */
export const recoverFromError = async (error, context = {}) => {
  const strategy = recoveryManager.determineStrategy(error, context);
  return recoveryManager.executeStrategy(strategy, error, context);
};

/**
 * Save component state for potential recovery
 */
export const saveComponentState = (componentName, state) => {
  recoveryManager.saveState(componentName, state);
};

/**
 * Cache data for fallback
 */
export const cacheDataForFallback = (key, data, ttl) => {
  recoveryManager.cacheData(key, data, ttl);
};

/**
 * Get recovery statistics
 */
export const getRecoveryStatistics = (componentName) => {
  return recoveryManager.getStatistics(componentName);
};

/**
 * Reset recovery state
 */
export const resetRecoveryState = (componentName) => {
  recoveryManager.reset(componentName);
};

/**
 * Check if component can attempt recovery (circuit breaker check)
 */
export const canAttemptRecovery = (componentName) => {
  return recoveryManager.getCircuitBreaker(componentName).canAttempt();
};

// Export recovery manager for advanced usage
export { recoveryManager, RecoveryStrategy, CircuitState };

export default {
  recoverFromError,
  saveComponentState,
  cacheDataForFallback,
  getRecoveryStatistics,
  resetRecoveryState,
  canAttemptRecovery,
  RecoveryStrategy,
  CircuitState
};
