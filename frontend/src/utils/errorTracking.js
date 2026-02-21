/**
 * Error Tracking Service Integration Utility
 * 
 * This module provides a unified interface for error tracking services.
 * It's designed to be easily integrated with services like:
 * - Sentry (https://sentry.io)
 * - LogRocket (https://logrocket.com)
 * - Rollbar (https://rollbar.com)
 * - Bugsnag (https://bugsnag.com)
 * - Custom error tracking solutions
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp)
 * - Prepare infrastructure for future error tracking service
 * 
 * Usage:
 * import { initErrorTracking, logError, setUserContext } from './utils/errorTracking';
 * 
 * // Initialize (in App.jsx or index.jsx)
 * initErrorTracking({
 *   dsn: 'your-service-dsn',
 *   environment: 'production',
 *   release: '1.0.0'
 * });
 * 
 * // Log errors
 * logError(error, {
 *   component: 'JobCard',
 *   action: 'fetchJobs',
 *   userId: user._id
 * });
 * 
 * // Set user context
 * setUserContext({
 *   id: user._id,
 *   email: user.email,
 *   role: user.role
 * });
 */

// Configuration state
let errorTrackingConfig = {
  enabled: false,
  service: null, // 'sentry' | 'logrocket' | 'rollbar' | 'bugsnag' | 'custom'
  dsn: null,
  environment: 'development',
  release: null,
  sampleRate: 1.0, // 0.0 to 1.0 (percentage of errors to track)
  beforeSend: null, // Optional callback to modify error before sending
  ignoreErrors: [], // Array of error messages to ignore
};

// User context state
let userContext = {
  id: null,
  email: null,
  username: null,
  role: null,
};

/**
 * Initialize error tracking service
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.service - Service name ('sentry', 'logrocket', etc.)
 * @param {string} config.dsn - Data Source Name (service-specific)
 * @param {string} config.environment - Environment ('development', 'staging', 'production')
 * @param {string} config.release - Release version
 * @param {number} config.sampleRate - Sample rate (0.0 to 1.0)
 * @param {Function} config.beforeSend - Callback to modify error before sending
 * @param {Array<string>} config.ignoreErrors - Error messages to ignore
 * 
 * @example
 * // Sentry integration
 * initErrorTracking({
 *   service: 'sentry',
 *   dsn: 'https://xxx@sentry.io/xxx',
 *   environment: 'production',
 *   release: '1.0.0',
 *   sampleRate: 0.5, // Track 50% of errors
 *   ignoreErrors: ['Network request failed', 'ResizeObserver loop']
 * });
 */
export const initErrorTracking = (config = {}) => {
  // Only enable in production by default
  const shouldEnable = config.enabled !== undefined 
    ? config.enabled 
    : process.env.NODE_ENV === 'production';

  errorTrackingConfig = {
    ...errorTrackingConfig,
    ...config,
    enabled: shouldEnable,
  };

  if (!errorTrackingConfig.enabled) {
    console.log('[ErrorTracking] Disabled in', process.env.NODE_ENV);
    return;
  }

  // Initialize service-specific SDK
  switch (errorTrackingConfig.service) {
    case 'sentry':
      initSentry(config);
      break;
    case 'logrocket':
      initLogRocket(config);
      break;
    case 'rollbar':
      initRollbar(config);
      break;
    case 'bugsnag':
      initBugsnag(config);
      break;
    case 'custom':
      // Custom implementation
      console.log('[ErrorTracking] Custom service initialized');
      break;
    default:
      console.warn('[ErrorTracking] No service specified. Error tracking is prepared but not active.');
  }
};

/**
 * Initialize Sentry
 * 
 * To use Sentry:
 * 1. Install: npm install @sentry/react
 * 2. Uncomment the code below
 * 3. Configure DSN in environment variables
 */
const initSentry = (config) => {
  console.log('[ErrorTracking] Sentry initialization prepared');
  
  // Uncomment when ready to use Sentry:
  /*
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    sampleRate: config.sampleRate || 1.0,
    beforeSend: config.beforeSend,
    ignoreErrors: config.ignoreErrors || [],
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  
  console.log('[ErrorTracking] Sentry initialized');
  */
};

/**
 * Initialize LogRocket
 * 
 * To use LogRocket:
 * 1. Install: npm install logrocket
 * 2. Uncomment the code below
 * 3. Configure app ID in environment variables
 */
const initLogRocket = (config) => {
  console.log('[ErrorTracking] LogRocket initialization prepared');
  
  // Uncomment when ready to use LogRocket:
  /*
  import LogRocket from 'logrocket';
  
  LogRocket.init(config.dsn, {
    release: config.release,
    console: {
      shouldAggregateConsoleErrors: true,
    },
    network: {
      requestSanitizer: request => {
        // Sanitize sensitive data
        if (request.headers['Authorization']) {
          request.headers['Authorization'] = '[REDACTED]';
        }
        return request;
      },
    },
  });
  
  console.log('[ErrorTracking] LogRocket initialized');
  */
};

/**
 * Initialize Rollbar
 * 
 * To use Rollbar:
 * 1. Install: npm install rollbar
 * 2. Uncomment the code below
 * 3. Configure access token in environment variables
 */
const initRollbar = (config) => {
  console.log('[ErrorTracking] Rollbar initialization prepared');
  
  // Uncomment when ready to use Rollbar:
  /*
  import Rollbar from 'rollbar';
  
  const rollbar = new Rollbar({
    accessToken: config.dsn,
    environment: config.environment,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          code_version: config.release,
        },
      },
    },
  });
  
  window.rollbar = rollbar;
  console.log('[ErrorTracking] Rollbar initialized');
  */
};

/**
 * Initialize Bugsnag
 * 
 * To use Bugsnag:
 * 1. Install: npm install @bugsnag/js @bugsnag/plugin-react
 * 2. Uncomment the code below
 * 3. Configure API key in environment variables
 */
const initBugsnag = (config) => {
  console.log('[ErrorTracking] Bugsnag initialization prepared');
  
  // Uncomment when ready to use Bugsnag:
  /*
  import Bugsnag from '@bugsnag/js';
  import BugsnagPluginReact from '@bugsnag/plugin-react';
  
  Bugsnag.start({
    apiKey: config.dsn,
    releaseStage: config.environment,
    appVersion: config.release,
    plugins: [new BugsnagPluginReact()],
  });
  
  console.log('[ErrorTracking] Bugsnag initialized');
  */
};

/**
 * Log an error to the tracking service
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 * @param {string} context.component - Component name where error occurred
 * @param {string} context.action - Action being performed when error occurred
 * @param {string} context.userId - User ID (if authenticated)
 * @param {Object} context.extra - Additional custom data
 * @param {string} context.level - Error level ('error', 'warning', 'info')
 * 
 * @example
 * logError(new Error('Failed to fetch jobs'), {
 *   component: 'JobPostingsPage',
 *   action: 'fetchJobs',
 *   userId: user._id,
 *   extra: { filters: { location: 'Algiers' } },
 *   level: 'error'
 * });
 */
export const logError = (error, context = {}) => {
  if (!errorTrackingConfig.enabled) {
    // Still log to console in development
    console.error('[ErrorTracking] Error:', error);
    console.error('[ErrorTracking] Context:', context);
    return;
  }

  // Check if error should be ignored
  if (shouldIgnoreError(error)) {
    console.log('[ErrorTracking] Ignoring error:', error.message);
    return;
  }

  // Check sample rate
  if (Math.random() > errorTrackingConfig.sampleRate) {
    console.log('[ErrorTracking] Error not sampled');
    return;
  }

  // Prepare error data
  const errorData = {
    error,
    timestamp: new Date().toISOString(),
    component: context.component || 'Unknown',
    action: context.action || 'Unknown',
    userId: context.userId || userContext.id,
    userEmail: userContext.email,
    userRole: userContext.role,
    environment: errorTrackingConfig.environment,
    release: errorTrackingConfig.release,
    url: window.location.href,
    userAgent: navigator.userAgent,
    extra: context.extra || {},
    level: context.level || 'error',
  };

  // Apply beforeSend callback if provided
  let finalErrorData = errorData;
  if (errorTrackingConfig.beforeSend) {
    finalErrorData = errorTrackingConfig.beforeSend(errorData);
    if (!finalErrorData) {
      console.log('[ErrorTracking] Error filtered by beforeSend');
      return;
    }
  }

  // Send to service
  sendToService(finalErrorData);
};

/**
 * Check if error should be ignored
 */
const shouldIgnoreError = (error) => {
  if (!error || !error.message) return false;
  
  return errorTrackingConfig.ignoreErrors.some(pattern => {
    if (typeof pattern === 'string') {
      return error.message.includes(pattern);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(error.message);
    }
    return false;
  });
};

/**
 * Send error to tracking service
 */
const sendToService = (errorData) => {
  switch (errorTrackingConfig.service) {
    case 'sentry':
      sendToSentry(errorData);
      break;
    case 'logrocket':
      sendToLogRocket(errorData);
      break;
    case 'rollbar':
      sendToRollbar(errorData);
      break;
    case 'bugsnag':
      sendToBugsnag(errorData);
      break;
    case 'custom':
      sendToCustomService(errorData);
      break;
    default:
      console.log('[ErrorTracking] Error prepared but no service configured:', errorData);
  }
};

/**
 * Send to Sentry
 */
const sendToSentry = (errorData) => {
  // Uncomment when Sentry is installed:
  /*
  import * as Sentry from '@sentry/react';
  
  Sentry.withScope((scope) => {
    scope.setTag('component', errorData.component);
    scope.setTag('action', errorData.action);
    scope.setUser({
      id: errorData.userId,
      email: errorData.userEmail,
      role: errorData.userRole,
    });
    scope.setContext('extra', errorData.extra);
    scope.setLevel(errorData.level);
    
    Sentry.captureException(errorData.error);
  });
  */
  
  console.log('[ErrorTracking] Would send to Sentry:', errorData);
};

/**
 * Send to LogRocket
 */
const sendToLogRocket = (errorData) => {
  // Uncomment when LogRocket is installed:
  /*
  import LogRocket from 'logrocket';
  
  LogRocket.captureException(errorData.error, {
    tags: {
      component: errorData.component,
      action: errorData.action,
    },
    extra: errorData.extra,
  });
  */
  
  console.log('[ErrorTracking] Would send to LogRocket:', errorData);
};

/**
 * Send to Rollbar
 */
const sendToRollbar = (errorData) => {
  // Uncomment when Rollbar is installed:
  /*
  if (window.rollbar) {
    window.rollbar.error(errorData.error, {
      component: errorData.component,
      action: errorData.action,
      userId: errorData.userId,
      ...errorData.extra,
    });
  }
  */
  
  console.log('[ErrorTracking] Would send to Rollbar:', errorData);
};

/**
 * Send to Bugsnag
 */
const sendToBugsnag = (errorData) => {
  // Uncomment when Bugsnag is installed:
  /*
  import Bugsnag from '@bugsnag/js';
  
  Bugsnag.notify(errorData.error, (event) => {
    event.addMetadata('context', {
      component: errorData.component,
      action: errorData.action,
    });
    event.setUser(errorData.userId, errorData.userEmail);
    event.addMetadata('extra', errorData.extra);
    event.severity = errorData.level;
  });
  */
  
  console.log('[ErrorTracking] Would send to Bugsnag:', errorData);
};

/**
 * Send to custom service
 * 
 * Implement your custom error tracking logic here
 */
const sendToCustomService = (errorData) => {
  // Example: Send to your own backend API
  /*
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorData),
  }).catch(err => {
    console.error('[ErrorTracking] Failed to send error:', err);
  });
  */
  
  console.log('[ErrorTracking] Would send to custom service:', errorData);
};

/**
 * Set user context for error tracking
 * 
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.username - Username
 * @param {string} user.role - User role
 * 
 * @example
 * setUserContext({
 *   id: user._id,
 *   email: user.email,
 *   username: user.username,
 *   role: user.role
 * });
 */
export const setUserContext = (user) => {
  userContext = {
    id: user.id || user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  if (!errorTrackingConfig.enabled) {
    console.log('[ErrorTracking] User context set:', userContext);
    return;
  }

  // Set user context in service
  switch (errorTrackingConfig.service) {
    case 'sentry':
      // Uncomment when Sentry is installed:
      /*
      import * as Sentry from '@sentry/react';
      Sentry.setUser({
        id: userContext.id,
        email: userContext.email,
        username: userContext.username,
        role: userContext.role,
      });
      */
      break;
    case 'logrocket':
      // Uncomment when LogRocket is installed:
      /*
      import LogRocket from 'logrocket';
      LogRocket.identify(userContext.id, {
        email: userContext.email,
        name: userContext.username,
        role: userContext.role,
      });
      */
      break;
    case 'rollbar':
      // Uncomment when Rollbar is installed:
      /*
      if (window.rollbar) {
        window.rollbar.configure({
          payload: {
            person: {
              id: userContext.id,
              email: userContext.email,
              username: userContext.username,
            },
          },
        });
      }
      */
      break;
    case 'bugsnag':
      // Uncomment when Bugsnag is installed:
      /*
      import Bugsnag from '@bugsnag/js';
      Bugsnag.setUser(userContext.id, userContext.email, userContext.username);
      */
      break;
  }

  console.log('[ErrorTracking] User context updated');
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUserContext = () => {
  userContext = {
    id: null,
    email: null,
    username: null,
    role: null,
  };

  if (!errorTrackingConfig.enabled) {
    console.log('[ErrorTracking] User context cleared');
    return;
  }

  // Clear user context in service
  switch (errorTrackingConfig.service) {
    case 'sentry':
      // Uncomment when Sentry is installed:
      /*
      import * as Sentry from '@sentry/react';
      Sentry.setUser(null);
      */
      break;
    case 'logrocket':
      // Uncomment when LogRocket is installed:
      /*
      import LogRocket from 'logrocket';
      LogRocket.identify(null);
      */
      break;
  }

  console.log('[ErrorTracking] User context cleared');
};

/**
 * Add breadcrumb (for debugging context)
 * 
 * @param {Object} breadcrumb - Breadcrumb data
 * @param {string} breadcrumb.message - Breadcrumb message
 * @param {string} breadcrumb.category - Category (e.g., 'navigation', 'api', 'ui')
 * @param {string} breadcrumb.level - Level ('info', 'warning', 'error')
 * @param {Object} breadcrumb.data - Additional data
 * 
 * @example
 * addBreadcrumb({
 *   message: 'User clicked Apply button',
 *   category: 'ui',
 *   level: 'info',
 *   data: { jobId: '123' }
 * });
 */
export const addBreadcrumb = (breadcrumb) => {
  if (!errorTrackingConfig.enabled) {
    console.log('[ErrorTracking] Breadcrumb:', breadcrumb);
    return;
  }

  // Add breadcrumb to service
  switch (errorTrackingConfig.service) {
    case 'sentry':
      // Uncomment when Sentry is installed:
      /*
      import * as Sentry from '@sentry/react';
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: breadcrumb.level || 'info',
        data: breadcrumb.data,
      });
      */
      break;
    case 'logrocket':
      // Uncomment when LogRocket is installed:
      /*
      import LogRocket from 'logrocket';
      LogRocket.track(breadcrumb.message, breadcrumb.data);
      */
      break;
  }
};

/**
 * Get current error tracking configuration
 */
export const getConfig = () => {
  return { ...errorTrackingConfig };
};

/**
 * Check if error tracking is enabled
 */
export const isEnabled = () => {
  return errorTrackingConfig.enabled;
};

// Export default object with all functions
export default {
  initErrorTracking,
  logError,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  getConfig,
  isEnabled,
};
