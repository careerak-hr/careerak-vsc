# Offline Request Queue - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Basic Setup (Already Done!)

The offline request queue is already integrated and working. No setup required!

### 2. How It Works

```
User Offline → API Request Fails → Automatically Queued → User Online → Automatically Retried
```

### 3. Test It Now

**Step 1**: Open your app in the browser

**Step 2**: Open DevTools (F12) → Network tab → Set throttling to "Offline"

**Step 3**: Try to submit a form or make an API request

**Step 4**: Check the console - you'll see:
```
[OfflineQueue] Request queued: POST__api_jobs_apply_...
```

**Step 5**: Set throttling back to "Online"

**Step 6**: Watch the magic happen:
```
[OfflineQueue] Processing 1 queued requests
[OfflineQueue] Request succeeded: POST__api_jobs_apply_...
```

## 📊 Using in Your Components

### Option 1: Automatic (Recommended)

Just use the API client normally. Queuing happens automatically!

```javascript
import api from '../services/api';

const handleSubmit = async (data) => {
  try {
    await api.post('/api/jobs/apply', data);
    showSuccess('Application submitted!');
  } catch (error) {
    // If offline, request is automatically queued
    showError('Request queued for retry when online');
  }
};
```

### Option 2: Manual Control

Use the OfflineContext for more control:

```javascript
import { useOfflineContext } from '../context/OfflineContext';

function MyComponent() {
  const { isOnline, queueSize, retryQueue } = useOfflineContext();

  return (
    <div>
      <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      {queueSize > 0 && (
        <div>
          <p>📦 {queueSize} requests queued</p>
          {isOnline && (
            <button onClick={retryQueue}>Retry Now</button>
          )}
        </div>
      )}
    </div>
  );
}
```

## 🎯 Common Use Cases

### 1. Job Application

```javascript
const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/api/jobs/${jobId}/apply`, applicationData);
    showSuccess('Application submitted!');
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      showInfo('You are offline. Application will be submitted when you\'re back online.');
    } else {
      showError('Failed to submit application. Please try again.');
    }
    throw error;
  }
};
```

### 2. Profile Update

```javascript
const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, profileData);
    showSuccess('Profile updated!');
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      showInfo('Changes will be saved when you\'re back online.');
    }
    throw error;
  }
};
```

### 3. Message Sending

```javascript
import { RequestPriority } from '../utils/offlineRequestQueue';

const sendMessage = async (conversationId, message) => {
  try {
    const response = await api.post(`/api/chat/messages`, {
      conversationId,
      message,
      priority: RequestPriority.HIGH // High priority for messages
    });
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      showInfo('Message will be sent when you\'re back online.');
    }
    throw error;
  }
};
```

## 🎨 UI Components

### Show Queue Status

```jsx
import OfflineQueueStatus from './components/OfflineQueueStatus';

function App() {
  return (
    <div>
      {/* Your app content */}
      <OfflineQueueStatus />
    </div>
  );
}
```

### Show Offline Indicator

```jsx
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <div>
      <OfflineIndicator />
      {/* Your app content */}
    </div>
  );
}
```

## 🔧 Configuration

### Set Request Priority

```javascript
import { queueRequest, RequestPriority } from '../utils/offlineRequestQueue';

// Critical operations (e.g., emergency notifications)
queueRequest({
  method: 'POST',
  url: '/api/emergency',
  data: { ... },
  priority: RequestPriority.URGENT
});

// Important operations (e.g., job applications)
queueRequest({
  method: 'POST',
  url: '/api/jobs/apply',
  data: { ... },
  priority: RequestPriority.HIGH
});

// Normal operations (default)
queueRequest({
  method: 'POST',
  url: '/api/profile',
  data: { ... },
  priority: RequestPriority.MEDIUM
});

// Background operations (e.g., analytics)
queueRequest({
  method: 'POST',
  url: '/api/analytics',
  data: { ... },
  priority: RequestPriority.LOW
});
```

## 📱 Testing

### Manual Testing

1. **Test Offline Queuing**:
   ```
   DevTools → Network → Offline → Submit form → Check console
   ```

2. **Test Automatic Retry**:
   ```
   DevTools → Network → Online → Watch console for retry
   ```

3. **Test Queue Persistence**:
   ```
   Queue requests → Refresh page → Check queue still exists
   ```

### Automated Testing

```bash
# Run offline queue tests
npm test -- offline-retry.test.js --run

# Run integration tests
npm test -- offline-functionality.integration.test.jsx --run
```

## 🐛 Troubleshooting

### Queue Not Working?

**Check 1**: Is OfflineProvider wrapping your app?
```jsx
// In ApplicationShell.jsx
<OfflineProvider>
  <AppProvider>
    {/* Your app */}
  </AppProvider>
</OfflineProvider>
```

**Check 2**: Is the request method queueable?
- ✅ POST, PUT, PATCH, DELETE
- ❌ GET (not queued)

**Check 3**: Check browser console for logs:
```
[OfflineQueue] Request queued: ...
[OfflineQueue] Processing queue: ...
```

### Requests Not Retrying?

**Check 1**: Are you online?
```javascript
console.log('Online:', navigator.onLine);
```

**Check 2**: Is queue empty?
```javascript
import { getQueueSize } from '../utils/offlineRequestQueue';
console.log('Queue size:', getQueueSize());
```

**Check 3**: Manually trigger retry:
```javascript
const { retryQueue } = useOfflineContext();
await retryQueue();
```

## 📚 Learn More

- [Full Documentation](./OFFLINE_REQUEST_QUEUE.md)
- [PWA Implementation](./PWA_IMPLEMENTATION.md)
- [Network Error Handling](./NETWORK_ERROR_HANDLING.md)

## 💡 Tips

1. **Always provide user feedback** when offline
2. **Set appropriate priorities** for different operations
3. **Clear queue on logout** to avoid stale requests
4. **Test offline scenarios** regularly
5. **Monitor queue size** to detect issues

## 🎉 That's It!

You're now ready to use the offline request queue. It works automatically, but you have full control when you need it.

**Questions?** Check the [full documentation](./OFFLINE_REQUEST_QUEUE.md) or contact careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use
