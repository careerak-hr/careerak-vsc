# Offline Detection Implementation

## Overview
This document describes the offline detection implementation for the Careerak platform, which enables the application to detect when users lose internet connectivity and handle it gracefully.

## Requirements Addressed
- **FR-PWA-9**: When the user is offline, the system shall queue failed API requests and retry when online
- **NFR-REL-2**: The system shall maintain offline functionality for previously visited pages
- **NFR-REL-3**: The system shall queue failed API requests when offline and retry when online

## Implementation

### 1. useOffline Hook
**Location**: `frontend/src/hooks/useOffline.js`

A simple React hook that provides basic online/offline status detection.

**Features**:
- Detects online/offline status using `navigator.onLine`
- Listens to `online` and `offline` browser events
- Returns `{ isOnline, isOffline }` state

**Usage**:
```javascript
import useOffline from '../hooks/useOffline';

function MyComponent() {
  const { isOnline, isOffline } = useOffline();
  
  return (
    <div>
      {isOffline && <p>You are offline</p>}
      {isOnline && <p>You are online</p>}
    </div>
  );
}
```

### 2. OfflineContext
**Location**: `frontend/src/context/OfflineContext.jsx`

A React Context that provides advanced offline detection features throughout the application.

**Features**:
- Online/offline status detection
- Request queueing for offline scenarios
- "Was offline" flag for showing reconnection messages
- Queue management (add, clear, get queued requests)

**API**:
```javascript
{
  isOnline: boolean,           // Current online status
  isOffline: boolean,          // Current offline status
  wasOffline: boolean,         // True for 5s after reconnection
  offlineQueue: Array,         // Array of queued requests
  queueRequest: (request) => void,    // Add request to queue
  clearQueue: () => void,             // Clear all queued requests
  getQueuedRequests: () => Array      // Get all queued requests
}
```

**Usage**:
```javascript
import { useOfflineContext } from '../context/OfflineContext';

function MyComponent() {
  const { isOffline, queueRequest } = useOfflineContext();
  
  const handleSubmit = async (data) => {
    if (isOffline) {
      // Queue for later
      queueRequest({
        url: '/api/submit',
        method: 'POST',
        data: data
      });
      alert('Request queued for when you are back online');
    } else {
      // Submit immediately
      await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  };
  
  return <button onClick={handleSubmit}>Submit</button>;
}
```

### 3. Integration with ApplicationShell
**Location**: `frontend/src/components/ApplicationShell.jsx`

The `OfflineProvider` is integrated into the application's provider hierarchy:

```
ErrorBoundary
  └─ ThemeProvider
      └─ OfflineProvider  ← Added here
          └─ AppProvider
              └─ Router
                  └─ App Components
```

This ensures offline detection is available throughout the entire application.

## Browser Events

The implementation uses two native browser events:

1. **`online` event**: Fired when the browser gains network connectivity
2. **`offline` event**: Fired when the browser loses network connectivity

These events are automatically triggered by the browser when:
- Network cable is unplugged/plugged
- WiFi is disabled/enabled
- Mobile data is turned off/on
- Airplane mode is toggled

## Testing

### Manual Testing
1. Open the application in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Change dropdown from "Online" to "Offline"
5. Observe the offline detection in action
6. Change back to "Online" to test reconnection

### Example Component
See `frontend/src/examples/OfflineDetectionExample.jsx` for comprehensive examples including:
- Simple status display
- Request queueing
- Conditional rendering
- Form handling with offline support

## Use Cases

### 1. Show Offline Banner
```javascript
function OfflineBanner() {
  const { isOffline } = useOffline();
  
  if (!isOffline) return null;
  
  return (
    <div className="offline-banner">
      ⚠️ You are offline. Some features may not be available.
    </div>
  );
}
```

### 2. Queue API Requests
```javascript
function DataForm() {
  const { isOffline, queueRequest } = useOfflineContext();
  
  const handleSubmit = (formData) => {
    if (isOffline) {
      queueRequest({
        url: '/api/data',
        method: 'POST',
        data: formData,
        timestamp: Date.now()
      });
      showNotification('Data will be sent when you are back online');
    } else {
      submitData(formData);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Disable Features When Offline
```javascript
function UploadButton() {
  const { isOffline } = useOffline();
  
  return (
    <button 
      disabled={isOffline}
      title={isOffline ? 'Upload requires internet connection' : 'Upload file'}
    >
      Upload
    </button>
  );
}
```

### 4. Show Reconnection Message
```javascript
function ReconnectionNotification() {
  const { wasOffline } = useOfflineContext();
  
  if (!wasOffline) return null;
  
  return (
    <div className="reconnection-message">
      ✅ Connection restored! Syncing data...
    </div>
  );
}
```

## Architecture Decisions

### Why Two Implementations?

1. **useOffline Hook**: 
   - Lightweight
   - No context overhead
   - Perfect for simple status checks
   - Can be used in any component

2. **OfflineContext**:
   - Centralized state management
   - Request queueing functionality
   - Shared across entire app
   - Better for complex offline scenarios

### Request Queue Structure

Each queued request contains:
```javascript
{
  url: string,        // API endpoint
  method: string,     // HTTP method (GET, POST, etc.)
  data: object,       // Request payload
  timestamp: number   // When it was queued
}
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic online/offline detection
- ✅ Request queueing
- ✅ Context provider
- ✅ Simple hook

### Phase 2 (Planned - Task 3.4.3)
- Queue retry logic when coming back online
- Automatic request replay
- Queue persistence in localStorage
- Request deduplication

### Phase 3 (Planned - Task 3.4.4)
- Retry with exponential backoff
- Request prioritization
- Conflict resolution
- Sync status indicators

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 14+ | ✅ Full |
| Firefox | 41+ | ✅ Full |
| Safari | 5+ | ✅ Full |
| Edge | 12+ | ✅ Full |
| iOS Safari | 5+ | ✅ Full |
| Chrome Mobile | All | ✅ Full |

## Performance Considerations

- Event listeners are properly cleaned up on unmount
- No polling - uses native browser events
- Minimal re-renders (only on status change)
- Queue stored in memory (consider localStorage for persistence)

## Security Considerations

- Queue is stored in memory only (cleared on page refresh)
- No sensitive data should be stored in queue without encryption
- Consider implementing queue encryption for sensitive operations

## Related Tasks

- ✅ Task 3.4.1: Implement offline detection (Current)
- ⏳ Task 3.4.2: Show offline indicator in UI
- ⏳ Task 3.4.3: Queue failed API requests when offline
- ⏳ Task 3.4.4: Retry queued requests when online
- ⏳ Task 3.4.5: Test offline functionality for key features

## References

- [MDN: Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [MDN: Online and offline events](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/Online_and_offline_events)
- [PWA Offline Detection Best Practices](https://web.dev/offline-cookbook/)

---

**Last Updated**: 2026-02-19  
**Status**: ✅ Implemented  
**Task**: 3.4.1 Implement offline detection
