# Offline Request Queue - Implementation Guide

## Overview

The Offline Request Queue system automatically queues failed API requests when the user is offline and retries them when the connection is restored. This ensures data integrity and provides a seamless user experience even with intermittent connectivity.

## Requirements

- **FR-PWA-9**: Queue failed API requests when offline and retry when online
- **NFR-REL-3**: Queue failed API requests when offline and retry when online

## Architecture

### Components

1. **offlineRequestQueue.js** - Core queue management utility
2. **OfflineContext.jsx** - React context for offline state management
3. **OfflineQueueStatus.jsx** - UI component for queue status display
4. **api.js** - API client with automatic queue integration
5. **networkErrorHandler.js** - Network error detection and handling

### Data Flow

```
User Action → API Request → Network Error → Queue Request → localStorage
                                                                    ↓
User Online → Process Queue → Retry Requests → Success/Failure → Update UI
```

## Features

### 1. Automatic Queuing

Failed requests are automatically queued when:
- User is offline (navigator.onLine === false)
- Network error occurs (timeout, connection refused, etc.)
- Request method is POST, PUT, PATCH, or DELETE

**Note**: GET requests are NOT queued as they are read-only and can be retried manually.

### 2. Request Prioritization

Requests are prioritized using 4 levels:
- **URGENT (4)**: Critical operations (e.g., emergency notifications)
- **HIGH (3)**: Important operations (e.g., job applications)
- **MEDIUM (2)**: Normal operations (default)
- **LOW (1)**: Background operations (e.g., analytics)

### 3. Request Deduplication

Identical requests are automatically deduplicated based on:
- HTTP method
- URL
- Request body data

### 4. Exponential Backoff

Failed retries use exponential backoff:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay

### 5. Persistent Storage

Queue is persisted to localStorage:
- Survives page reloads
- Survives browser restarts
- Automatic cleanup of expired requests (24 hours)

### 6. Automatic Retry

When connection is restored:
- Queue is automatically processed
- Requests are retried in priority order
- Results are displayed to the user

## Usage

### Basic Usage

```javascript
import { queueRequest, RequestPriority } from '../utils/offlineRequestQueue';

// Queue a request manually
queueRequest({
  method: 'POST',
  url: '/api/jobs/apply',
  data: { jobId: '123', userId: '456' },
  headers: { 'Content-Type': 'application/json' },
  priority: RequestPriority.HIGH
});
```

### Using OfflineContext

```javascript
import { useOfflineContext } from '../context/OfflineContext';

function MyComponent() {
  const {
    isOnline,
    isOffline,
    queueSize,
    isProcessingQueue,
    retryResults,
    queueRequest,
    retryQueue,
    clearQueue
  } = useOfflineContext();

  const handleSubmit = async (data) => {
    try {
      await api.post('/api/jobs/apply', data);
    } catch (error) {
      if (!isOnline) {
        // Automatically queued by error handler
        console.log('Request queued for retry when online');
      }
    }
  };

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      {queueSize > 0 && (
        <p>{queueSize} requests queued</p>
      )}
      {isProcessingQueue && (
        <p>Retrying queued requests...</p>
      )}
      {retryResults && (
        <div>
          <p>Success: {retryResults.success}</p>
          <p>Failed: {retryResults.failed}</p>
          <p>Retry: {retryResults.retry}</p>
        </div>
      )}
      <button onClick={handleSubmit}>Submit</button>
      {isOnline && queueSize > 0 && (
        <button onClick={retryQueue}>Retry Now</button>
      )}
    </div>
  );
}
```

### Automatic Integration with API Client

The queue is automatically integrated with the API client through error interceptors:

```javascript
// In api.js
import { createAxiosErrorHandler } from '../utils/networkErrorHandler';

api.interceptors.response.use(
  (response) => response,
  createAxiosErrorHandler({
    language: 'ar',
    onError: (networkError) => {
      // Automatically queues request if offline
      console.log('Network error:', networkError.type);
    }
  })
);
```

## Configuration

### Queue Settings

```javascript
// In offlineRequestQueue.js
const QUEUE_STORAGE_KEY = 'careerak_offline_queue';
const MAX_QUEUE_SIZE = 50;                    // Maximum requests in queue
const MAX_REQUEST_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRY_ATTEMPTS = 3;                 // Maximum retry attempts
const INITIAL_RETRY_DELAY = 1000;             // 1 second
```

### Queueable Methods

```javascript
const QUEUEABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
```

## API Reference

### queueRequest(request)

Queue a request for retry when online.

**Parameters:**
- `request.method` (string): HTTP method
- `request.url` (string): Request URL
- `request.data` (object): Request body data
- `request.headers` (object): Request headers
- `request.priority` (number): Request priority (1-4)

**Returns:** `boolean` - True if request was queued

### processQueue(api)

Process all queued requests.

**Parameters:**
- `api` (function): Axios instance or API function

**Returns:** `Promise<Object>` - Results of processing
```javascript
{
  success: 2,  // Number of successful requests
  failed: 1,   // Number of failed requests
  retry: 0     // Number of requests that will retry
}
```

### getQueue()

Get all queued requests.

**Returns:** `Array` - Array of queued requests

### getQueueSize()

Get number of queued requests.

**Returns:** `number` - Queue size

### clearQueue()

Clear all queued requests.

**Returns:** `void`

### onRetry(callback)

Register callback for retry events.

**Parameters:**
- `callback` (function): Callback function `(event, data) => void`

**Events:**
- `start`: Queue processing started
- `success`: Request succeeded
- `retry`: Request will retry
- `failed`: Request failed (max retries reached)
- `complete`: Queue processing complete

**Returns:** `function` - Unsubscribe function

## UI Components

### OfflineQueueStatus

Displays queue status with:
- Queue size indicator
- Retry button (when online)
- Clear button
- Processing indicator
- Retry results summary

```jsx
import OfflineQueueStatus from './components/OfflineQueueStatus';

<OfflineQueueStatus />
```

### OfflineIndicator

Displays offline/online status:
- Offline banner when connection is lost
- Reconnection message when connection is restored

```jsx
import OfflineIndicator from './components/OfflineIndicator';

<OfflineIndicator />
```

## Testing

### Unit Tests

```bash
npm test -- offline-retry.test.js --run
```

**Test Coverage:**
- Request queuing (POST, PUT, PATCH, DELETE)
- Request deduplication
- Priority sorting
- Queue processing and retry
- Exponential backoff
- Persistent storage
- Queue management
- Integration with OfflineContext

### Integration Tests

```bash
npm test -- offline-functionality.integration.test.jsx --run
```

**Test Coverage:**
- Offline detection
- Automatic retry when online
- UI component integration
- Service worker integration

## Best Practices

### 1. Set Appropriate Priority

```javascript
// Critical operations
queueRequest({ ...request, priority: RequestPriority.URGENT });

// Important operations
queueRequest({ ...request, priority: RequestPriority.HIGH });

// Normal operations (default)
queueRequest({ ...request, priority: RequestPriority.MEDIUM });

// Background operations
queueRequest({ ...request, priority: RequestPriority.LOW });
```

### 2. Handle Queue Results

```javascript
const { retryResults } = useOfflineContext();

useEffect(() => {
  if (retryResults) {
    if (retryResults.success > 0) {
      showSuccessMessage(`${retryResults.success} requests succeeded`);
    }
    if (retryResults.failed > 0) {
      showErrorMessage(`${retryResults.failed} requests failed`);
    }
  }
}, [retryResults]);
```

### 3. Provide User Feedback

```javascript
const { isOffline, queueSize } = useOfflineContext();

if (isOffline && queueSize > 0) {
  return (
    <div className="offline-notice">
      <p>You are offline</p>
      <p>{queueSize} requests will be sent when you're back online</p>
    </div>
  );
}
```

### 4. Clear Queue When Appropriate

```javascript
// Clear queue on logout
const handleLogout = () => {
  clearQueue();
  // ... logout logic
};

// Clear queue on critical errors
const handleCriticalError = () => {
  clearQueue();
  // ... error handling
};
```

## Troubleshooting

### Queue Not Processing

**Problem**: Queue is not automatically processed when connection is restored.

**Solution**:
1. Check if OfflineProvider is wrapping your app
2. Verify navigator.onLine is working correctly
3. Check browser console for errors
4. Manually trigger retry: `retryQueue()`

### Requests Not Being Queued

**Problem**: Failed requests are not being added to the queue.

**Solution**:
1. Verify request method is POST, PUT, PATCH, or DELETE
2. Check if queue is full (max 50 requests)
3. Verify error is a network error (not 4xx/5xx)
4. Check browser console for queue logs

### Queue Persisting After Logout

**Problem**: Queue persists after user logs out.

**Solution**:
```javascript
// Clear queue on logout
const handleLogout = () => {
  clearQueue();
  localStorage.removeItem('token');
  // ... rest of logout logic
};
```

### Duplicate Requests

**Problem**: Same request is queued multiple times.

**Solution**:
- Queue automatically deduplicates based on method, URL, and data
- If duplicates persist, check if data is different (timestamps, etc.)
- Consider using a unique identifier in request data

## Performance Considerations

### Memory Usage

- Queue is limited to 50 requests
- Oldest requests are removed when limit is reached
- Expired requests (>24 hours) are automatically removed

### Network Usage

- Requests are retried sequentially (not in parallel)
- Exponential backoff prevents network flooding
- Failed requests are removed after 3 attempts

### Storage Usage

- Queue is stored in localStorage
- Average request size: ~1KB
- Maximum storage: ~50KB (50 requests × 1KB)

## Security Considerations

### Authentication Tokens

- Tokens are included in queued requests
- Tokens may expire before retry
- Consider refreshing tokens before retry

```javascript
// In OfflineContext.jsx
const handleOnline = async () => {
  // Refresh token if needed
  const token = localStorage.getItem('token');
  if (isTokenExpired(token)) {
    await refreshToken();
  }
  
  // Process queue
  await processQueue(api);
};
```

### Sensitive Data

- Queue is stored in localStorage (not encrypted)
- Avoid queuing requests with sensitive data
- Consider clearing queue on logout

### Request Validation

- Validate requests before queuing
- Check user permissions before retry
- Handle authorization errors gracefully

## Future Enhancements

### Phase 2

- [ ] Background sync API integration
- [ ] IndexedDB storage for larger queues
- [ ] Request encryption for sensitive data
- [ ] Selective retry (user chooses which requests)
- [ ] Request editing before retry

### Phase 3

- [ ] Conflict resolution for concurrent edits
- [ ] Optimistic UI updates
- [ ] Request merging (combine similar requests)
- [ ] Advanced retry strategies (custom backoff)
- [ ] Analytics and monitoring

## Related Documentation

- [PWA Implementation Guide](./PWA_IMPLEMENTATION.md)
- [Network Error Handling](./NETWORK_ERROR_HANDLING.md)
- [Offline Functionality](./OFFLINE_FUNCTIONALITY.md)
- [Service Worker Guide](./SERVICE_WORKER_GUIDE.md)

## Support

For issues or questions:
- Check browser console for error logs
- Review test files for usage examples
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: ✅ Complete and Tested
