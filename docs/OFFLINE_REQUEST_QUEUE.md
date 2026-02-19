# Offline Request Queue System

## Overview

The Offline Request Queue system automatically queues failed API requests when the user is offline and retries them when the connection is restored. This ensures data integrity and provides a seamless user experience even with intermittent connectivity.

**Date Added**: 2026-02-19  
**Status**: ✅ Complete and Active

## Requirements

- **FR-PWA-9**: Queue failed API requests when offline and retry when online
- **NFR-REL-3**: Queue failed API requests when offline and retry when online

## Features

### Core Features
- ✅ Automatic queuing of failed requests when offline
- ✅ Automatic retry when connection is restored
- ✅ Request deduplication (prevents duplicate requests)
- ✅ Exponential backoff for retries
- ✅ Request prioritization (URGENT, HIGH, MEDIUM, LOW)
- ✅ Persistent storage (localStorage)
- ✅ Request expiration (24 hours)
- ✅ Manual retry trigger
- ✅ Queue management (view, clear)
- ✅ Real-time status updates

### Supported Request Methods
- POST
- PUT
- PATCH
- DELETE

**Note**: GET requests are not queued as they are typically read-only and can be retried by the user.

## Architecture

### File Structure

```
frontend/src/
├── utils/
│   └── offlineRequestQueue.js       # Core queue logic
├── context/
│   └── OfflineContext.jsx           # React context integration
├── services/
│   └── api.js                       # Axios interceptor integration
├── components/
│   ├── OfflineQueueStatus.jsx       # UI component
│   └── OfflineQueueStatus.css       # Styles
└── examples/
    └── OfflineQueueExample.jsx      # Usage examples
```

### Components

#### 1. OfflineRequestQueue (Core)
**File**: `frontend/src/utils/offlineRequestQueue.js`

The core queue management class that handles:
- Request queuing and dequeuing
- Priority sorting
- Retry logic with exponential backoff
- Persistence to localStorage
- Request deduplication

#### 2. OfflineContext (Integration)
**File**: `frontend/src/context/OfflineContext.jsx`

React context that provides:
- Online/offline status
- Queue size tracking
- Queue processing status
- Retry results
- Queue management functions

#### 3. API Interceptor (Automation)
**File**: `frontend/src/services/api.js`

Axios response interceptor that:
- Detects network errors
- Automatically queues failed requests
- Determines request priority based on URL patterns

#### 4. OfflineQueueStatus (UI)
**File**: `frontend/src/components/OfflineQueueStatus.jsx`

Visual component that displays:
- Queue size indicator
- Processing status
- Retry results
- Manual retry button
- Clear queue button

## Usage

### Automatic Queuing

All POST, PUT, PATCH, DELETE requests that fail due to network errors are automatically queued:

```javascript
import api from '../services/api';

// This will be automatically queued if it fails due to network error
try {
  await api.post('/api/jobs', jobData);
} catch (error) {
  // Request is already queued if offline
  console.log('Request failed, will retry when online');
}
```

### Manual Queuing

You can manually queue a request with custom priority:

```javascript
import { useOfflineContext } from '../context/OfflineContext';
import { RequestPriority } from '../utils/offlineRequestQueue';

const { queueRequest } = useOfflineContext();

// Queue a high-priority request
queueRequest({
  method: 'POST',
  url: '/api/important-action',
  data: { /* request data */ },
  priority: RequestPriority.HIGH
});
```

### Priority Levels

```javascript
import { RequestPriority } from '../utils/offlineRequestQueue';

RequestPriority.URGENT  // 4 - Critical requests (auth, payments)
RequestPriority.HIGH    // 3 - Important requests (job applications)
RequestPriority.MEDIUM  // 2 - Normal requests (default)
RequestPriority.LOW     // 1 - Non-critical requests
```

### Automatic Priority Assignment

The API interceptor automatically assigns priorities based on URL patterns:

- **URGENT**: `/auth/`, `/login`
- **HIGH**: `/job`, `/application`
- **MEDIUM**: All other requests (default)

### Manual Retry

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const { retryQueue, isOnline } = useOfflineContext();

// Manually trigger retry
if (isOnline) {
  const results = await retryQueue();
  console.log('Retry results:', results);
  // { success: 5, failed: 1, retry: 2 }
}
```

### View Queued Requests

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const { getQueuedRequests, queueSize } = useOfflineContext();

// Get all queued requests
const requests = getQueuedRequests();
console.log(`${queueSize} requests in queue:`, requests);
```

### Clear Queue

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const { clearQueue } = useOfflineContext();

// Clear all queued requests
clearQueue();
```

### Listen to Retry Events

```javascript
import { onRetry } from '../utils/offlineRequestQueue';

// Subscribe to retry events
const unsubscribe = onRetry((event, data) => {
  switch (event) {
    case 'start':
      console.log('Starting to process queue:', data.queueSize);
      break;
    case 'success':
      console.log('Request succeeded:', data.request);
      break;
    case 'retry':
      console.log('Request will retry:', data.request, data.retryCount);
      break;
    case 'failed':
      console.log('Request failed permanently:', data.request);
      break;
    case 'complete':
      console.log('Queue processing complete:', data);
      break;
  }
});

// Cleanup
return () => unsubscribe();
```

## Configuration

### Queue Settings

```javascript
// In offlineRequestQueue.js
const MAX_QUEUE_SIZE = 50;              // Maximum number of queued requests
const MAX_REQUEST_AGE = 24 * 60 * 60 * 1000;  // 24 hours
const MAX_RETRY_ATTEMPTS = 3;           // Maximum retry attempts per request
const INITIAL_RETRY_DELAY = 1000;       // 1 second initial delay
```

### Retry Strategy

The queue uses exponential backoff for retries:

```
Retry 1: 1 second delay
Retry 2: 2 seconds delay
Retry 3: 4 seconds delay
```

Formula: `delay = INITIAL_RETRY_DELAY * 2^retryCount`

## Request Lifecycle

### 1. Request Fails
```
User makes API call → Network error → Interceptor catches error
```

### 2. Queuing Decision
```
Check if offline → Check if method is queueable (POST/PUT/PATCH/DELETE)
→ Generate request ID → Check for duplicates → Add to queue
```

### 3. Queue Storage
```
Add to in-memory queue → Sort by priority → Save to localStorage
```

### 4. Connection Restored
```
Online event fires → Load queue from storage → Process requests by priority
```

### 5. Retry Process
```
For each request:
  Calculate delay → Wait → Make API call
  → Success: Remove from queue
  → Failure: Increment retry count or remove if max retries reached
```

## UI Components

### OfflineQueueStatus

The `OfflineQueueStatus` component displays the queue status in the bottom-right corner:

**Features**:
- Queue size indicator
- Processing spinner
- Retry results summary
- Manual retry button (when online)
- Clear queue button

**Visibility**:
- Hidden when queue is empty and not processing
- Automatically appears when requests are queued
- Shows retry results for 10 seconds after processing

**Styling**:
- Follows Careerak design standards
- Supports dark mode
- Responsive design
- RTL support for Arabic

## Storage

### localStorage Key
```
careerak_offline_queue
```

### Storage Format
```json
[
  {
    "id": "POST_api_jobs_message_test_timestamp_1234567890",
    "method": "POST",
    "url": "/api/jobs",
    "data": { "title": "Job Title" },
    "headers": { "Authorization": "Bearer token" },
    "priority": 3,
    "timestamp": 1234567890,
    "retryCount": 0,
    "maxRetries": 3
  }
]
```

## Error Handling

### Network Errors
- Automatically queued for retry
- User sees error message
- Request will retry when online

### Server Errors (4xx, 5xx)
- NOT queued (server is reachable)
- User sees error message
- User must manually retry

### Max Retries Reached
- Request removed from queue
- User notified via retry results
- Request must be manually resubmitted

### Queue Full
- Oldest request removed
- New request added
- User should be notified

## Testing

### Manual Testing

1. **Test Automatic Queuing**:
   - Go offline (disable network)
   - Submit a form or make a POST request
   - Check queue size increases
   - Go online
   - Verify request is retried automatically

2. **Test Priority**:
   - Queue multiple requests with different priorities
   - Go online
   - Verify URGENT requests are retried first

3. **Test Persistence**:
   - Queue some requests while offline
   - Reload the page
   - Verify queue is restored from localStorage

4. **Test Expiration**:
   - Queue a request
   - Manually change timestamp in localStorage to 25 hours ago
   - Reload page
   - Verify expired request is removed

### Example Component

See `frontend/src/examples/OfflineQueueExample.jsx` for a complete testing interface.

## Performance Considerations

### Memory Usage
- Queue limited to 50 requests
- Each request ~1-2KB
- Total memory: ~50-100KB

### localStorage Usage
- Queue stored as JSON string
- Typical size: 10-50KB
- Cleaned up automatically (expired requests)

### Network Impact
- Requests retried sequentially (not parallel)
- Exponential backoff prevents server overload
- Priority-based processing

## Security Considerations

### Token Expiration
- Queued requests include auth tokens
- Tokens may expire before retry
- Server should handle expired tokens gracefully

### Sensitive Data
- Request data stored in localStorage (unencrypted)
- Consider excluding sensitive fields
- Clear queue on logout

### Request Validation
- Server should validate all requests
- Don't trust queued requests blindly
- Implement idempotency keys for critical operations

## Future Enhancements

### Phase 2
- [ ] Encrypted storage for sensitive data
- [ ] Idempotency key generation
- [ ] Request grouping (batch retry)
- [ ] Conflict resolution for concurrent edits
- [ ] Background sync API integration

### Phase 3
- [ ] Smart retry scheduling (based on network quality)
- [ ] Request compression
- [ ] Analytics and monitoring
- [ ] User notifications for failed requests
- [ ] Request preview before retry

## Troubleshooting

### Queue Not Processing
**Problem**: Requests stay in queue after going online

**Solutions**:
1. Check browser console for errors
2. Verify `navigator.onLine` is true
3. Manually trigger retry with `retryQueue()`
4. Check if requests are expired (>24 hours)

### Duplicate Requests
**Problem**: Same request appears multiple times in queue

**Solutions**:
1. Check request ID generation
2. Verify deduplication logic
3. Clear queue and retry

### localStorage Full
**Problem**: Cannot save queue to localStorage

**Solutions**:
1. Clear old data from localStorage
2. Reduce MAX_QUEUE_SIZE
3. Implement queue rotation (remove oldest)

### Requests Not Queuing
**Problem**: Failed requests not added to queue

**Solutions**:
1. Verify request method is POST/PUT/PATCH/DELETE
2. Check if error is network error (not server error)
3. Verify `navigator.onLine` is false
4. Check browser console for errors

## API Reference

### OfflineRequestQueue

```javascript
import offlineQueue from '../utils/offlineRequestQueue';

// Enqueue a request
offlineQueue.enqueue({
  method: 'POST',
  url: '/api/endpoint',
  data: { /* data */ },
  priority: RequestPriority.HIGH
});

// Process queue
await offlineQueue.processQueue(api);

// Get queue
const queue = offlineQueue.getQueue();

// Get queue size
const size = offlineQueue.getQueueSize();

// Clear queue
offlineQueue.clearQueue();

// Listen to events
const unsubscribe = offlineQueue.onRetry((event, data) => {
  console.log(event, data);
});
```

### useOfflineContext Hook

```javascript
import { useOfflineContext } from '../context/OfflineContext';

const {
  isOnline,           // boolean
  isOffline,          // boolean
  wasOffline,         // boolean (true for 5s after reconnection)
  queueSize,          // number
  isProcessingQueue,  // boolean
  retryResults,       // { success, failed, retry } | null
  queueRequest,       // (request) => boolean
  clearQueue,         // () => void
  getQueuedRequests,  // () => Array
  retryQueue          // () => Promise<results>
} = useOfflineContext();
```

## Related Documentation

- [PWA Support](./PWA_SUPPORT.md)
- [Offline Detection](./OFFLINE_DETECTION.md)
- [Service Worker](./SERVICE_WORKER.md)
- [API Caching](./API_CACHE_GUIDE.md)

## Support

For issues or questions:
- Check browser console for errors
- Review this documentation
- Test with `OfflineQueueExample` component
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-19  
**Version**: 1.0.0  
**Status**: Production Ready ✅
