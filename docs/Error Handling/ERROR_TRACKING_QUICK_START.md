# Error Tracking - Quick Start Guide

## 🚀 5-Minute Setup (Sentry)

### 1. Install Sentry

```bash
cd frontend
npm install @sentry/react
```

### 2. Get Your DSN

1. Sign up at https://sentry.io (free)
2. Create a React project
3. Copy your DSN

### 3. Add Environment Variables

Create `frontend/.env`:

```env
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_SERVICE=sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
VITE_APP_VERSION=1.0.0
```

### 4. Uncomment Sentry Code

Open `frontend/src/utils/errorTracking.js`:

**Find and uncomment these sections:**

#### Section 1: initSentry()
```javascript
const initSentry = (config) => {
  // UNCOMMENT THIS:
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
};
```

#### Section 2: sendToSentry()
```javascript
const sendToSentry = (errorData) => {
  // UNCOMMENT THIS:
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
};
```

#### Section 3: setUserContext() - Sentry case
```javascript
case 'sentry':
  // UNCOMMENT THIS:
  import * as Sentry from '@sentry/react';
  Sentry.setUser({
    id: userContext.id,
    email: userContext.email,
    username: userContext.username,
    role: userContext.role,
  });
  break;
```

#### Section 4: clearUserContext() - Sentry case
```javascript
case 'sentry':
  // UNCOMMENT THIS:
  import * as Sentry from '@sentry/react';
  Sentry.setUser(null);
  break;
```

#### Section 5: addBreadcrumb() - Sentry case
```javascript
case 'sentry':
  // UNCOMMENT THIS:
  import * as Sentry from '@sentry/react';
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category,
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
  });
  break;
```

### 5. Initialize in App

Update `frontend/src/App.jsx`:

```javascript
import { useEffect } from 'react';
import { initErrorTracking, setUserContext } from './utils/errorTracking';

function App() {
  const { user } = useApp();

  // Initialize error tracking
  useEffect(() => {
    initErrorTracking({
      service: import.meta.env.VITE_ERROR_TRACKING_SERVICE,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      sampleRate: 1.0,
      ignoreErrors: [
        'ResizeObserver loop',
        'Network request failed',
      ],
    });
  }, []);

  // Set user context
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

### 6. Test

Add a test button:

```javascript
<button onClick={() => { throw new Error('Test Sentry'); }}>
  Test Error
</button>
```

Click it and check your Sentry dashboard!

---

## 📝 Common Usage

### Log Errors

```javascript
import { logError } from './utils/errorTracking';

try {
  await fetchData();
} catch (error) {
  logError(error, {
    component: 'MyComponent',
    action: 'fetchData',
    userId: user._id,
  });
}
```

### Add Context

```javascript
logError(error, {
  component: 'JobForm',
  action: 'submit',
  userId: user._id,
  extra: {
    jobId: job._id,
    formData: { title: job.title },
  },
});
```

### Track User Actions

```javascript
import { addBreadcrumb } from './utils/errorTracking';

addBreadcrumb({
  message: 'User clicked Apply',
  category: 'ui',
  data: { jobId: '123' },
});
```

---

## 🔧 Other Services

### LogRocket

```bash
npm install logrocket
```

```env
VITE_ERROR_TRACKING_SERVICE=logrocket
VITE_LOGROCKET_APP_ID=your-app-id/your-app-name
```

Uncomment LogRocket sections in `errorTracking.js`

### Rollbar

```bash
npm install rollbar
```

```env
VITE_ERROR_TRACKING_SERVICE=rollbar
VITE_ROLLBAR_ACCESS_TOKEN=your-access-token
```

Uncomment Rollbar sections in `errorTracking.js`

### Bugsnag

```bash
npm install @bugsnag/js @bugsnag/plugin-react
```

```env
VITE_ERROR_TRACKING_SERVICE=bugsnag
VITE_BUGSNAG_API_KEY=your-api-key
```

Uncomment Bugsnag sections in `errorTracking.js`

---

## 📚 Full Documentation

See `docs/ERROR_TRACKING_INTEGRATION.md` for:
- Detailed setup for each service
- Advanced configuration
- Best practices
- Troubleshooting
- Cost optimization

---

## ✅ Checklist

- [ ] Install service SDK
- [ ] Get DSN/API key
- [ ] Add environment variables
- [ ] Uncomment service code in `errorTracking.js`
- [ ] Initialize in `App.jsx`
- [ ] Test with sample error
- [ ] Check service dashboard
- [ ] Configure sample rate
- [ ] Add ignore patterns
- [ ] Set up user context

---

**Need Help?**
- Full docs: `docs/ERROR_TRACKING_INTEGRATION.md`
- Email: careerak.hr@gmail.com
