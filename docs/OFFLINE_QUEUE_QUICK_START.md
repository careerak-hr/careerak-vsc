# Offline Request Queue - Quick Start Guide

## What is it?

The Offline Request Queue automatically saves failed API requests when you're offline and retries them when your connection is restored.

## How it works

1. **You make an API call** → Request fails (offline)
2. **System queues the request** → Saved to localStorage
3. **Connection restored** → Requests automatically retry
4. **Success!** → Request completes, removed from queue

## Quick Examples

### 1. Automatic Queuing (No Code Needed!)

```javascript
import api from '../services/api';

// Just use the API normally - queuing happens automatically!
try {
  await api.post('/api/jobs', jobData);
} catch (error) {
  // If offline, request is already queued for retry
  console.log('Will retry when online');
}
```

### 2. Manual Queuing with Priority

```javascript
import { useOfflineContext } from '../context/OfflineContext';
import { RequestPriority } from '../utils/offlineRequestQueue';

const { queueRequest } = useOfflineContext();

queueRequest({
  method: 'POST',
  url: '/api/important',
  data: { message: 'Important data' },
  priority: RequestPriority.HIGH  // Will retry before MEDIUM/LOW
});
```

### 3. Check Queue Status

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const { queueSize, isProcessingQueue } = useOfflineContext();

console.log(`${queueSize} requests queued`);
console.log(`Processing: ${isProcessingQueue}`);
```

### 4. Manual Retry

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const { retryQueue, isOnline } = useOfflineContext();

if (isOnline) {
  const results = await retryQueue();
  console.log(`${results.success} succeeded, ${results.failed} failed`);
}
```

## Priority Levels

```javascript
RequestPriority.URGENT  // 4 - Auth, payments (retried first)
RequestPriority.HIGH    // 3 - Job applications, important actions
RequestPriority.MEDIUM  // 2 - Normal requests (default)
RequestPriority.LOW     // 1 - Non-critical requests
```

## What Gets Queued?

✅ **Queued automatically**:
- POST requests
- PUT requests
- PATCH requests
- DELETE requests
- When offline or network error

❌ **NOT queued**:
- GET requests (read-only, user can retry)
- Requests that fail with server errors (4xx, 5xx)

## UI Component

The `OfflineQueueStatus` component shows queue status in the bottom-right corner:

- 📊 Queue size
- ⏳ Processing status
- ✅ Retry results
- 🔄 Manual retry button
- 🗑️ Clear queue button

**Already added to App.jsx** - no setup needed!

## Configuration

Default settings (in `offlineRequestQueue.js`):

```javascript
MAX_QUEUE_SIZE = 50           // Max 50 requests
MAX_REQUEST_AGE = 24 hours    // Requests expire after 24h
MAX_RETRY_ATTEMPTS = 3        // Retry up to 3 times
INITIAL_RETRY_DELAY = 1s      // Start with 1s delay
```

## Retry Strategy

Exponential backoff:
- Retry 1: 1 second delay
- Retry 2: 2 seconds delay
- Retry 3: 4 seconds delay

## Storage

Requests are saved to localStorage:
- Key: `careerak_offline_queue`
- Survives page reloads
- Automatically cleaned (expired requests)

## Testing

### Test Offline Queuing

1. Open DevTools → Network tab
2. Set to "Offline"
3. Submit a form or make a POST request
4. Check queue size increases
5. Set to "Online"
6. Watch requests retry automatically

### Test Component

Use the example component:

```javascript
import OfflineQueueExample from '../examples/OfflineQueueExample';

// Render in your app to test all features
<OfflineQueueExample />
```

## Common Use Cases

### 1. Job Application Submission

```javascript
// User submits job application while offline
await api.post('/api/applications', applicationData);
// ✅ Automatically queued with HIGH priority
// ✅ Retries when online
// ✅ User notified of success
```

### 2. Profile Update

```javascript
// User updates profile while offline
await api.put('/api/profile', profileData);
// ✅ Automatically queued with MEDIUM priority
// ✅ Retries when online
```

### 3. Critical Action

```javascript
// Payment or auth action
queueRequest({
  method: 'POST',
  url: '/api/payment',
  data: paymentData,
  priority: RequestPriority.URGENT  // Retries first!
});
```

## Troubleshooting

### Queue not processing?
```javascript
// Manually trigger retry
const { retryQueue } = useOfflineContext();
await retryQueue();
```

### Clear stuck requests?
```javascript
// Clear entire queue
const { clearQueue } = useOfflineContext();
clearQueue();
```

### Check what's queued?
```javascript
// View all queued requests
const { getQueuedRequests } = useOfflineContext();
const requests = getQueuedRequests();
console.log(requests);
```

## Files Created

```
frontend/src/
├── utils/offlineRequestQueue.js       # Core queue logic
├── context/OfflineContext.jsx         # Updated with queue integration
├── services/api.js                    # Updated with auto-queuing
├── components/
│   ├── OfflineQueueStatus.jsx         # UI component
│   └── OfflineQueueStatus.css         # Styles
├── examples/
│   └── OfflineQueueExample.jsx        # Testing component
└── App.jsx                            # Updated with OfflineQueueStatus

docs/
├── OFFLINE_REQUEST_QUEUE.md           # Full documentation
└── OFFLINE_QUEUE_QUICK_START.md       # This file
```

## Next Steps

1. ✅ Test offline queuing in your app
2. ✅ Customize priorities for your use cases
3. ✅ Monitor queue in production
4. ⏭️ Implement task 3.4.4: Retry queued requests when online

## Full Documentation

See [OFFLINE_REQUEST_QUEUE.md](./OFFLINE_REQUEST_QUEUE.md) for complete documentation.

---

**Status**: ✅ Production Ready  
**Date**: 2026-02-19  
**Task**: 3.4.3 Queue failed API requests when offline
