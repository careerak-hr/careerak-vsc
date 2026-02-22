# Image Error Handling Implementation

## Overview

Comprehensive error handling for image loading in the Careerak platform, including retry functionality, fallback images, multi-language error messages, and error logging.

**Task**: 8.3.4 Handle image load errors  
**Requirements**: FR-LOAD-6  
**Status**: ✅ Complete  
**Date**: 2026-02-21

---

## Features Implemented

### 1. Retry Functionality ✅
- Users can retry loading failed images with a single click
- Retry button appears automatically on error
- Can be disabled with `showRetry={false}`
- Tracks retry count for analytics

### 2. Fallback Images ✅
- Specify a fallback image URL to show if primary image fails
- Fallback image is tried before showing error UI
- Useful for profile pictures, logos, and thumbnails
- Example: `/default-avatar.png`

### 3. Multi-Language Error Messages ✅
- Error messages in Arabic, English, and French
- Utility functions for easy integration
- Supports different error types (network, not found, etc.)
- Integrates with existing i18n system

### 4. Error Logging ✅
- Automatic console logging of image errors
- Includes error details (message, src, timestamp, retry count)
- Can be disabled with `logErrors={false}`
- Ready for integration with error tracking services

### 5. Custom Error Messages ✅
- Display custom error messages to users
- Supports multi-line messages
- Styled consistently with platform design
- Accessible with proper ARIA labels

---

## Components Updated

### LazyImage Component

**New Props:**
```jsx
{
  fallbackImage: string,      // URL of fallback image
  showRetry: boolean,          // Show retry button (default: true)
  errorMessage: string,        // Custom error message
  logErrors: boolean,          // Log errors to console (default: true)
  onError: (event, errorDetails) => void  // Enhanced callback
}
```

**Error Details Object:**
```javascript
{
  message: string,      // Error message
  src: string,          // Failed image source
  timestamp: string,    // ISO timestamp
  retryCount: number,   // Number of retry attempts
}
```

### OptimizedImage Component

Same props and error handling as LazyImage.

---

## Utility Functions

### imageErrorMessages.js

```javascript
import { getImageErrorMessage, getRetryButtonText, detectErrorType } from './imageErrorMessages';

// Get error message in specific language
const message = getImageErrorMessage('ar', 'loadFailed');
// Returns: "فشل تحميل الصورة"

// Get retry button text
const retryText = getRetryButtonText('fr');
// Returns: "Réessayer"

// Detect error type from error object
const errorType = detectErrorType(error);
// Returns: 'networkError', 'notFound', etc.
```

**Supported Error Types:**
- `loadFailed` - Generic load failure
- `networkError` - Network connection issue
- `notFound` - Image not found (404)
- `invalidFormat` - Invalid image format
- `tooLarge` - Image size too large
- `accessDenied` - Access denied (403)

**Supported Languages:**
- `ar` - Arabic (العربية)
- `en` - English
- `fr` - French (Français)

---

## Usage Examples

### 1. Basic Error Handling with Retry

```jsx
<LazyImage
  publicId="users/profile-picture"
  alt="User profile"
  preset="PROFILE_LARGE"
  showRetry={true}
  onError={(e, errorDetails) => {
    console.log('Image failed:', errorDetails);
  }}
/>
```

### 2. Fallback Image

```jsx
<LazyImage
  publicId="users/john-doe"
  alt="John Doe"
  preset="PROFILE_LARGE"
  fallbackImage="/default-avatar.png"
  showRetry={true}
/>
```

### 3. Multi-Language Error Messages

```jsx
import { useApp } from '../context/AppContext';
import { getImageErrorMessage } from '../utils/imageErrorMessages';

function ProfilePicture({ userId }) {
  const { language } = useApp();
  
  return (
    <LazyImage
      publicId={`users/${userId}`}
      alt="Profile picture"
      preset="PROFILE_LARGE"
      errorMessage={getImageErrorMessage(language, 'loadFailed')}
      showRetry={true}
    />
  );
}
```

### 4. Custom Error Handler with Analytics

```jsx
function JobThumbnail({ jobId }) {
  const handleError = (e, errorDetails) => {
    // Log to analytics service
    analytics.track('image_load_error', {
      jobId,
      ...errorDetails,
    });
    
    // Show user notification
    toast.error('Failed to load job image');
  };
  
  return (
    <LazyImage
      publicId={`jobs/${jobId}`}
      alt="Job thumbnail"
      preset="THUMBNAIL_MEDIUM"
      fallbackImage="/default-job-thumbnail.png"
      onError={handleError}
      showRetry={true}
    />
  );
}
```

### 5. Disable Retry Button

```jsx
<LazyImage
  publicId="companies/logo"
  alt="Company logo"
  preset="LOGO_MEDIUM"
  fallbackImage="/default-company-logo.png"
  showRetry={false}
/>
```

### 6. Disable Error Logging

```jsx
<LazyImage
  publicId="image/path"
  alt="Image"
  preset="THUMBNAIL_MEDIUM"
  logErrors={false}
/>
```

---

## Error UI Design

### Error State Appearance

```
┌─────────────────────────┐
│                         │
│          ⚠️             │
│                         │
│  Failed to load image   │
│                         │
│    [🔄 Retry]          │
│                         │
└─────────────────────────┘
```

**Styling:**
- Background: `#fee2e2` (light red)
- Icon: `⚠️` (warning emoji)
- Text color: `#dc2626` (red-600)
- Button: Red with hover effect
- Accessible with ARIA labels

### Fallback Image Flow

```
Primary Image Fails
        ↓
Try Fallback Image
        ↓
    ┌───────┴───────┐
    │               │
Fallback OK    Fallback Fails
    │               │
Show Image     Show Error UI
```

---

## Integration with Existing Systems

### 1. AppContext Integration

```jsx
import { useApp } from '../context/AppContext';
import { getImageErrorMessage } from '../utils/imageErrorMessages';

function MyComponent() {
  const { language } = useApp();
  
  return (
    <LazyImage
      publicId="image/path"
      alt="Image"
      errorMessage={getImageErrorMessage(language, 'loadFailed')}
    />
  );
}
```

### 2. Error Tracking Service

```jsx
// services/errorTracking.js
export const trackImageError = (errorDetails) => {
  // Send to Sentry, LogRocket, etc.
  console.error('[Image Error]', errorDetails);
  
  // Could integrate with:
  // - Sentry.captureException()
  // - LogRocket.captureException()
  // - Custom analytics endpoint
};

// Usage
<LazyImage
  publicId="image/path"
  alt="Image"
  onError={(e, errorDetails) => {
    trackImageError(errorDetails);
  }}
/>
```

### 3. Toast Notifications

```jsx
import { toast } from 'react-toastify';
import { getImageErrorMessage } from '../utils/imageErrorMessages';

function MyComponent() {
  const { language } = useApp();
  
  const handleError = (e, errorDetails) => {
    toast.error(getImageErrorMessage(language, 'loadFailed'));
  };
  
  return (
    <LazyImage
      publicId="image/path"
      alt="Image"
      onError={handleError}
    />
  );
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Test with invalid image URL
- [ ] Test retry button functionality
- [ ] Test fallback image loading
- [ ] Test error messages in all 3 languages
- [ ] Test error logging in console
- [ ] Test with network throttling (slow 3G)
- [ ] Test with network offline
- [ ] Test accessibility with screen reader
- [ ] Test keyboard navigation (Tab to retry button, Enter to retry)

### Test Cases

```jsx
// Test 1: Error with retry
<LazyImage
  publicId="invalid/image"
  alt="Test"
  showRetry={true}
/>

// Test 2: Fallback image
<LazyImage
  publicId="invalid/image"
  alt="Test"
  fallbackImage="/default.png"
/>

// Test 3: Custom error message
<LazyImage
  publicId="invalid/image"
  alt="Test"
  errorMessage="Custom error message"
/>

// Test 4: Error callback
<LazyImage
  publicId="invalid/image"
  alt="Test"
  onError={(e, details) => console.log(details)}
/>
```

---

## Performance Considerations

### 1. Retry Mechanism
- Retry doesn't spam the server
- Uses same lazy loading mechanism
- Respects Intersection Observer settings

### 2. Fallback Images
- Fallback images should be small and optimized
- Consider using base64 for very small fallbacks
- Cache fallback images aggressively

### 3. Error Logging
- Errors are logged asynchronously
- Doesn't block UI rendering
- Can be disabled for production if needed

---

## Accessibility

### ARIA Labels
```jsx
// Error state
role="img"
aria-label="Image failed to load"

// Retry button
aria-label="Retry loading image"
```

### Keyboard Navigation
- Retry button is keyboard accessible
- Tab to focus, Enter/Space to activate
- Focus visible with outline

### Screen Reader Support
- Error state announced to screen readers
- Retry button properly labeled
- Loading states announced

---

## Browser Support

- ✅ Chrome 58+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 79+
- ✅ iOS Safari 12.2+
- ✅ Chrome Android 58+

---

## Future Enhancements

### Phase 2
- [ ] Automatic retry with exponential backoff
- [ ] Image quality degradation (try lower quality on error)
- [ ] Offline image caching with Service Worker
- [ ] Error analytics dashboard

### Phase 3
- [ ] Smart fallback selection based on context
- [ ] A/B testing for error UI
- [ ] Machine learning for error prediction
- [ ] Advanced error recovery strategies

---

## Files Modified

### Components
- `frontend/src/components/LazyImage/LazyImage.jsx`
- `frontend/src/components/OptimizedImage/OptimizedImage.jsx`

### Utilities
- `frontend/src/utils/imageErrorMessages.js` (new)

### Documentation
- `frontend/src/components/LazyImage/README.md`
- `docs/IMAGE_ERROR_HANDLING.md` (this file)

### Examples
- `frontend/src/components/LazyImage/LazyImage.error-examples.jsx` (new)
- `frontend/src/components/OptimizedImage/OptimizedImage.error-examples.jsx` (new)

---

## Summary

Successfully implemented comprehensive image error handling with:
- ✅ Retry functionality
- ✅ Fallback images
- ✅ Multi-language error messages (ar, en, fr)
- ✅ Error logging and tracking
- ✅ Custom error messages
- ✅ Accessible error UI
- ✅ Integration with existing systems

The implementation improves user experience by providing clear feedback when images fail to load and offering easy recovery options.

---

**Last Updated**: 2026-02-21  
**Author**: Kiro AI Assistant  
**Status**: ✅ Complete
