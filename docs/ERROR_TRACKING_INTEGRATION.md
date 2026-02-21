# Error Tracking Service Integration Guide

## Overview

This document provides a comprehensive guide for integrating error tracking services into the Careerak platform. The infrastructure is already prepared and ready for integration with popular error tracking services.

**Status**: ✅ Infrastructure Ready  
**Date**: 2026-02-21  
**Task**: 7.3.4 - Prepare for future error tracking service integration

---

## Table of Contents

1. [Architecture](#architecture)
2. [Supported Services](#supported-services)
3. [Quick Start](#quick-start)
4. [Service-Specific Integration](#service-specific-integration)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)
8. [Testing](#testing)

---

## Architecture

### Error Tracking Flow

```
Error Occurs
    ↓
Error Boundary Catches Error
    ↓
logError() Called
    ↓
Error Data Prepared (component, user, context)
    ↓
beforeSend() Filter (optional)
    ↓
Sample Rate Check
    ↓
Send to Service (Sentry/LogRocket/etc.)
```

### File Structure

```
frontend/src/
├── utils/
│   └── errorTracking.js          # Main error tracking utility
├── components/
│   └── ErrorBoundary/
│       ├── RouteErrorBoundary.jsx      # Uses logError()
│       └── ComponentErrorBoundary.jsx  # Uses logError()
└── App.jsx                        # Initialize error tracking
```

---

## Supported Services

### 1. Sentry (Recommended)
- **Website**: https://sentry.io
- **Free Tier**: 5,000 errors/month
- **Features**: Error tracking, performance monitoring, session replay
- **Best For**: Production error monitoring

### 2. LogRocket
- **Website**: https://logrocket.com
- **Free Tier**: 1,000 sessions/month
- **Features**: Session replay, error tracking, performance monitoring
- **Best For**: Debugging user sessions

### 3. Rollbar
- **Website**: https://rollbar.com
- **Free Tier**: 5,000 events/month
- **Features**: Error tracking, deployment tracking
- **Best For**: Simple error tracking

### 4. Bugsnag
- **Website**: https://bugsnag.com
- **Free Tier**: 7,500 errors/month
- **Features**: Error tracking, stability monitoring
- **Best For**: Mobile and web error tracking

### 5. Custom Service
- **Best For**: Internal error tracking API

---

## Quick Start

### Step 1: Choose a Service

For this example, we'll use **Sentry** (recommended).

### Step 2: Install Dependencies

```bash
cd frontend
npm install @sentry/react
```

### Step 3: Get Your DSN

1. Sign up at https://sentry.io
2. Create a new project (React)
3. Copy your DSN (looks like: `https://xxx@sentry.io/xxx`)

### Step 4: Configure Environment Variables

Create or update `frontend/.env`:

```env
# Error Tracking
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_SERVICE=sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
VITE_APP_VERSION=1.0.0
```

### Step 5: Uncomment Sentry Code

Open `frontend/src/utils/errorTracking.js` and uncomment the Sentry initialization code:

```javascript
// Find this section and uncomment:
const initSentry = (config) => {
  // Uncomment these lines:
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    // ... rest of config
  });
};
```

### Step 6: Initialize in App

Update `frontend/src/App.jsx`:

```javascript
import { useEffect } from 'react';
import { initErrorTracking, setUserContext } from './utils/errorTracking';

function App() {
  const { user } = useApp();

  // Initialize error tracking on app load
  useEffect(() => {
    initErrorTracking({
      service: import.meta.env.VITE_ERROR_TRACKING_SERVICE,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE, // 'development' or 'production'
      release: import.meta.env.VITE_APP_VERSION,
      sampleRate: 1.0, // Track 100% of errors
      ignoreErrors: [
        'ResizeObserver loop',
        'Network request failed',
      ],
    });
  }, []);

  // Update user context when user logs in
  useEffect(() => {
    if (user) {
      setUserContext({
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    }
  }, [user]);

  return (
    // Your app content
  );
}
```

### Step 7: Test

Trigger a test error:

```javascript
// Add this button temporarily
<button onClick={() => { throw new Error('Test error'); }}>
  Test Error Tracking
</button>
```

Check your Sentry dashboard to see the error!

---

## Service-Specific Integration

### Sentry Integration

#### 1. Install

```bash
npm install @sentry/react
```

#### 2. Uncomment Code

In `frontend/src/utils/errorTracking.js`, uncomment:
- `initSentry()` function
- `sendToSentry()` function
- User context code in `setUserContext()`

#### 3. Configure

```javascript
initErrorTracking({
  service: 'sentry',
  dsn: 'https://xxx@sentry.io/xxx',
  environment: 'production',
  release: '1.0.0',
  sampleRate: 1.0,
  ignoreErrors: ['ResizeObserver loop'],
});
```

#### 4. Advanced Features

```javascript
// Session Replay
Sentry.init({
  // ... other config
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});

// Performance Monitoring
Sentry.init({
  // ... other config
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1, // 10% of transactions
});
```

---

### LogRocket Integration

#### 1. Install

```bash
npm install logrocket
```

#### 2. Uncomment Code

In `frontend/src/utils/errorTracking.js`, uncomment:
- `initLogRocket()` function
- `sendToLogRocket()` function
- User context code in `setUserContext()`

#### 3. Configure

```javascript
initErrorTracking({
  service: 'logrocket',
  dsn: 'your-app-id/your-app-name',
  release: '1.0.0',
});
```

#### 4. Sanitize Sensitive Data

```javascript
LogRocket.init('your-app-id', {
  network: {
    requestSanitizer: request => {
      // Remove sensitive headers
      if (request.headers['Authorization']) {
        request.headers['Authorization'] = '[REDACTED]';
      }
      return request;
    },
  },
});
```

---

### Rollbar Integration

#### 1. Install

```bash
npm install rollbar
```

#### 2. Uncomment Code

In `frontend/src/utils/errorTracking.js`, uncomment:
- `initRollbar()` function
- `sendToRollbar()` function

#### 3. Configure

```javascript
initErrorTracking({
  service: 'rollbar',
  dsn: 'your-access-token',
  environment: 'production',
  release: '1.0.0',
});
```

---

### Bugsnag Integration

#### 1. Install

```bash
npm install @bugsnag/js @bugsnag/plugin-react
```

#### 2. Uncomment Code

In `frontend/src/utils/errorTracking.js`, uncomment:
- `initBugsnag()` function
- `sendToBugsnag()` function
- User context code in `setUserContext()`

#### 3. Configure

```javascript
initErrorTracking({
  service: 'bugsnag',
  dsn: 'your-api-key',
  environment: 'production',
  release: '1.0.0',
});
```

---

### Custom Service Integration

#### 1. Backend API Endpoint

Create an endpoint to receive errors:

```javascript
// backend/src/routes/errorRoutes.js
router.post('/errors', async (req, res) => {
  const { error, timestamp, component, userId, extra } = req.body;
  
  // Save to database
  await ErrorLog.create({
    message: error.message,
    stack: error.stack,
    timestamp,
    component,
    userId,
    extra,
  });
  
  res.status(200).json({ success: true });
});
```

#### 2. Frontend Configuration

```javascript
initErrorTracking({
  service: 'custom',
  enabled: true,
});
```

#### 3. Implement sendToCustomService

In `frontend/src/utils/errorTracking.js`, uncomment and modify:

```javascript
const sendToCustomService = (errorData) => {
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(errorData),
  }).catch(err => {
    console.error('[ErrorTracking] Failed to send error:', err);
  });
};
```

---

## Usage Examples

### Basic Error Logging

```javascript
import { logError } from './utils/errorTracking';

try {
  // Some code that might fail
  await fetchJobs();
} catch (error) {
  logError(error, {
    component: 'JobPostingsPage',
    action: 'fetchJobs',
    userId: user._id,
  });
}
```

### With Extra Context

```javascript
logError(error, {
  component: 'JobApplicationForm',
  action: 'submitApplication',
  userId: user._id,
  extra: {
    jobId: job._id,
    jobTitle: job.title,
    formData: { /* sanitized form data */ },
  },
});
```

### Different Error Levels

```javascript
// Error level (default)
logError(error, {
  component: 'PaymentPage',
  action: 'processPayment',
  level: 'error',
});

// Warning level
logError(new Error('API slow response'), {
  component: 'JobsAPI',
  action: 'fetchJobs',
  level: 'warning',
});

// Info level
logError(new Error('User navigated away'), {
  component: 'CheckoutPage',
  action: 'navigation',
  level: 'info',
});
```

### Adding Breadcrumbs

```javascript
import { addBreadcrumb } from './utils/errorTracking';

// Track user actions
addBreadcrumb({
  message: 'User clicked Apply button',
  category: 'ui',
  level: 'info',
  data: { jobId: '123', jobTitle: 'Software Engineer' },
});

// Track API calls
addBreadcrumb({
  message: 'Fetching job details',
  category: 'api',
  level: 'info',
  data: { endpoint: '/api/jobs/123' },
});

// Track navigation
addBreadcrumb({
  message: 'Navigated to profile page',
  category: 'navigation',
  level: 'info',
  data: { from: '/jobs', to: '/profile' },
});
```

### Setting User Context

```javascript
import { setUserContext, clearUserContext } from './utils/errorTracking';

// On login
const handleLogin = async (credentials) => {
  const user = await login(credentials);
  
  setUserContext({
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
};

// On logout
const handleLogout = () => {
  clearUserContext();
  logout();
};
```

---

## Configuration

### Environment Variables

```env
# Enable/disable error tracking
VITE_ERROR_TRACKING_ENABLED=true

# Service name
VITE_ERROR_TRACKING_SERVICE=sentry

# Service-specific DSN/API key
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_LOGROCKET_APP_ID=your-app-id/your-app-name
VITE_ROLLBAR_ACCESS_TOKEN=your-access-token
VITE_BUGSNAG_API_KEY=your-api-key

# App version
VITE_APP_VERSION=1.0.0
```

### Advanced Configuration

```javascript
initErrorTracking({
  service: 'sentry',
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  
  // Sample rate (0.0 to 1.0)
  sampleRate: 0.5, // Track 50% of errors
  
  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Network request failed',
    /^Non-Error promise rejection/,
  ],
  
  // Modify error before sending
  beforeSend: (errorData) => {
    // Filter out errors from specific components
    if (errorData.component === 'TestComponent') {
      return null; // Don't send
    }
    
    // Sanitize sensitive data
    if (errorData.extra.password) {
      errorData.extra.password = '[REDACTED]';
    }
    
    return errorData;
  },
});
```

---

## Best Practices

### 1. Don't Track Everything

```javascript
// ❌ Bad: Track every minor issue
logError(new Error('User closed modal'));

// ✅ Good: Track actual errors
try {
  await saveData();
} catch (error) {
  logError(error, { component: 'DataForm', action: 'save' });
}
```

### 2. Provide Context

```javascript
// ❌ Bad: No context
logError(error);

// ✅ Good: Rich context
logError(error, {
  component: 'JobApplicationForm',
  action: 'submitApplication',
  userId: user._id,
  extra: {
    jobId: job._id,
    jobTitle: job.title,
    applicationStep: 'resume-upload',
  },
});
```

### 3. Sanitize Sensitive Data

```javascript
// ❌ Bad: Expose sensitive data
logError(error, {
  extra: {
    password: user.password,
    creditCard: payment.cardNumber,
  },
});

// ✅ Good: Sanitize sensitive data
logError(error, {
  extra: {
    hasPassword: !!user.password,
    cardLast4: payment.cardNumber.slice(-4),
  },
});
```

### 4. Use Sample Rates in Production

```javascript
// ✅ Good: Sample high-volume errors
initErrorTracking({
  service: 'sentry',
  sampleRate: 0.1, // Track 10% of errors
  beforeSend: (errorData) => {
    // Always track critical errors
    if (errorData.component === 'PaymentProcessor') {
      return errorData; // Track 100%
    }
    // Sample other errors at 10%
    return errorData;
  },
});
```

### 5. Add Breadcrumbs for Context

```javascript
// Track user journey
addBreadcrumb({
  message: 'User viewed job listing',
  category: 'navigation',
  data: { jobId: '123' },
});

addBreadcrumb({
  message: 'User clicked Apply button',
  category: 'ui',
  data: { jobId: '123' },
});

// When error occurs, breadcrumbs provide context
try {
  await submitApplication();
} catch (error) {
  logError(error, { component: 'ApplicationForm' });
  // Error will include breadcrumbs showing user journey
}
```

### 6. Set User Context Early

```javascript
// ✅ Good: Set user context on login
useEffect(() => {
  if (user) {
    setUserContext({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  }
}, [user]);

// All subsequent errors will include user info
```

---

## Testing

### Test Error Tracking

```javascript
// Add a test button (development only)
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => {
    throw new Error('Test error tracking');
  }}>
    Test Error
  </button>
)}
```

### Test Different Error Types

```javascript
// Component error
const TestErrorComponent = () => {
  throw new Error('Component render error');
};

// Async error
const testAsyncError = async () => {
  throw new Error('Async operation error');
};

// Network error
const testNetworkError = async () => {
  try {
    await fetch('/api/nonexistent');
  } catch (error) {
    logError(error, {
      component: 'TestComponent',
      action: 'testNetworkError',
    });
  }
};
```

### Verify in Dashboard

1. Trigger test errors
2. Check service dashboard (Sentry/LogRocket/etc.)
3. Verify error details:
   - Error message and stack trace
   - Component name
   - User information
   - Extra context
   - Breadcrumbs

---

## Troubleshooting

### Error Tracking Not Working

1. **Check if enabled**:
   ```javascript
   import { isEnabled, getConfig } from './utils/errorTracking';
   console.log('Enabled:', isEnabled());
   console.log('Config:', getConfig());
   ```

2. **Check environment variables**:
   ```javascript
   console.log('DSN:', import.meta.env.VITE_SENTRY_DSN);
   console.log('Service:', import.meta.env.VITE_ERROR_TRACKING_SERVICE);
   ```

3. **Check console for errors**:
   - Look for `[ErrorTracking]` logs
   - Check for initialization errors

4. **Verify service SDK is installed**:
   ```bash
   npm list @sentry/react
   ```

### Errors Not Appearing in Dashboard

1. **Check sample rate**: Increase to 1.0 for testing
2. **Check beforeSend filter**: Ensure it's not filtering out errors
3. **Check ignoreErrors**: Ensure error message isn't ignored
4. **Check service dashboard**: May take a few minutes to appear

### Too Many Errors

1. **Increase sample rate**:
   ```javascript
   sampleRate: 0.1, // Track only 10%
   ```

2. **Filter specific errors**:
   ```javascript
   ignoreErrors: [
     'ResizeObserver loop',
     'Network request failed',
   ],
   ```

3. **Use beforeSend to filter**:
   ```javascript
   beforeSend: (errorData) => {
     if (errorData.component === 'NoiseComponent') {
       return null;
     }
     return errorData;
   },
   ```

---

## Cost Optimization

### Free Tier Limits

- **Sentry**: 5,000 errors/month
- **LogRocket**: 1,000 sessions/month
- **Rollbar**: 5,000 events/month
- **Bugsnag**: 7,500 errors/month

### Stay Within Free Tier

1. **Use sample rates**:
   ```javascript
   sampleRate: 0.2, // Track 20% of errors
   ```

2. **Ignore common errors**:
   ```javascript
   ignoreErrors: [
     'ResizeObserver loop',
     'Network request failed',
     'Non-Error promise rejection',
   ],
   ```

3. **Filter development errors**:
   ```javascript
   beforeSend: (errorData) => {
     if (errorData.environment === 'development') {
       return null;
     }
     return errorData;
   },
   ```

4. **Group similar errors**: Most services automatically group similar errors

---

## Next Steps

1. ✅ Choose an error tracking service
2. ✅ Install dependencies
3. ✅ Configure environment variables
4. ✅ Uncomment service-specific code
5. ✅ Initialize in App.jsx
6. ✅ Test with sample errors
7. ✅ Monitor dashboard
8. ✅ Optimize configuration

---

## Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [LogRocket Documentation](https://docs.logrocket.com/docs)
- [Rollbar Documentation](https://docs.rollbar.com/docs/javascript)
- [Bugsnag Documentation](https://docs.bugsnag.com/platforms/javascript/)

---

## Support

For questions or issues:
- Check the troubleshooting section above
- Review service-specific documentation
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-21  
**Version**: 1.0.0  
**Status**: ✅ Ready for Integration
