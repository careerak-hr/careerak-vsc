# Image Placeholders Implementation

## Overview

This document describes the implementation of image placeholders for the Careerak platform, fulfilling requirement **FR-LOAD-6**: "When images are loading, the system shall display a placeholder with loading animation."

**Status**: ✅ Complete and Implemented  
**Date**: 2026-02-22  
**Component**: LazyImage  
**Location**: `frontend/src/components/LazyImage/`

---

## Requirements

### Functional Requirement FR-LOAD-6
**When images are loading, the system shall display a placeholder with loading animation.**

This requirement ensures that users see visual feedback while images are loading, improving perceived performance and user experience.

---

## Implementation

### 1. LazyImage Component

The `LazyImage` component provides comprehensive placeholder support with multiple states:

#### Placeholder States

1. **Before Viewport Entry** - Gray placeholder with icon
2. **During Loading** - Blur-up placeholder + spinner
3. **After Load** - Actual image with fade-in
4. **On Error** - Error placeholder with retry button

### 2. Placeholder Types

#### 2.1 Initial Placeholder (Not in Viewport)
```jsx
<div className="lazy-image-not-loaded">
  {placeholder && placeholderUrl ? (
    <img src={placeholderUrl} alt="" aria-hidden="true" />
  ) : (
    <span>🖼️</span>
  )}
</div>
```

**Features**:
- Shown before image enters viewport
- Gray background (#f3f4f6)
- Icon or low-res blur image
- Maintains aspect ratio

#### 2.2 Blur-Up Placeholder (Loading)
```jsx
<img
  src={placeholderUrl}
  className="lazy-image-placeholder-blur"
  style={{
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    transition: 'opacity 0.3s ease-in-out',
  }}
/>
```

**Features**:
- Low-resolution version of image
- 20px blur effect
- Smooth fade-out transition
- Hidden from screen readers (aria-hidden="true")

#### 2.3 Loading Spinner
```jsx
<div className="lazy-image-spinner">
  <div className="spinner" aria-label="Loading image"></div>
</div>
```

**Features**:
- Centered spinner overlay
- 40px diameter (30px on mobile)
- Smooth rotation animation
- Accessible with aria-label

#### 2.4 Error Placeholder
```jsx
<div className="lazy-image-error">
  <span>⚠️</span>
  {errorMessage && <span>{errorMessage}</span>}
  {showRetry && <button onClick={handleRetry}>🔄 Retry</button>}
</div>
```

**Features**:
- Red background (#fee2e2)
- Warning icon
- Optional error message
- Retry button with hover effect

#### 2.5 Empty Placeholder (No publicId)
```jsx
<div className="lazy-image-placeholder">
  <span>📷</span>
</div>
```

**Features**:
- Gray background
- Camera icon
- Proper ARIA role and label

---

## Usage Examples

### Basic Usage with Placeholder
```jsx
import LazyImage from '../components/LazyImage/LazyImage';

<LazyImage
  publicId="profile/user123"
  alt="User profile picture"
  width={400}
  height={400}
  placeholder={true}  // Enable blur-up placeholder
  showSpinner={true}  // Show loading spinner
/>
```

### With Preset
```jsx
<LazyImage
  publicId="company/logo456"
  alt="Company logo"
  preset="LOGO_MEDIUM"
  placeholder={true}
/>
```

### Without Placeholder
```jsx
<LazyImage
  publicId="job/thumbnail789"
  alt="Job thumbnail"
  placeholder={false}  // Disable placeholder
  showSpinner={false}  // Disable spinner
/>
```

### With Error Handling
```jsx
<LazyImage
  publicId="course/image"
  alt="Course image"
  placeholder={true}
  showRetry={true}
  errorMessage="Failed to load image"
  onError={(e, error) => console.error('Image error:', error)}
/>
```

---

## CSS Animations

### Container Pulse Animation
```css
.lazy-image-container.loading {
  animation: containerPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes containerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}
```

### Spinner Rotation
```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Image Fade-In
```css
.lazy-image-loaded {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Accessibility Features

### 1. ARIA Labels
- Placeholders have `role="img"` and descriptive `aria-label`
- Spinners have `aria-label="Loading image"`
- Blur placeholders are hidden with `aria-hidden="true"`

### 2. Screen Reader Support
```jsx
// Placeholder
<div role="img" aria-label={alt || 'Image placeholder'}>

// Spinner
<div className="spinner" aria-label="Loading image"></div>

// Blur image (hidden from screen readers)
<img aria-hidden="true" alt="" />
```

### 3. Keyboard Navigation
- Retry buttons are keyboard accessible
- Proper focus management
- Tab order maintained

---

## Performance Optimizations

### 1. Lazy Loading
- Images only load when entering viewport
- Uses Intersection Observer API
- Configurable threshold and rootMargin

### 2. GPU Acceleration
- Uses `transform` and `opacity` for animations
- Avoids layout-triggering properties
- `will-change: opacity` for blur placeholder

### 3. Smooth Transitions
- 300ms fade transitions
- Prevents layout shifts (CLS < 0.1)
- Coordinated loading states

---

## Browser Support

### Modern Browsers
- ✅ Chrome 58+ (full support)
- ✅ Firefox 55+ (full support)
- ✅ Safari 12.1+ (full support)
- ✅ Edge 79+ (full support)

### Fallback Behavior
- If IntersectionObserver not supported, images load immediately
- Graceful degradation for older browsers
- Progressive enhancement approach

---

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  .lazy-image-container {
    background-color: #1f2937;
  }

  .lazy-image-placeholder,
  .lazy-image-not-loaded {
    background-color: #374151;
  }

  .lazy-image-spinner .spinner {
    border-color: rgba(229, 231, 235, 0.1);
    border-top-color: #e5e7eb;
  }
}
```

---

## Testing

### Visual Tests
Location: `frontend/src/components/LazyImage/__tests__/LazyImage.visual.test.jsx`

**Test Coverage**:
- ✅ Placeholder shown before viewport entry
- ✅ Blur-up placeholder during loading
- ✅ Loading spinner display
- ✅ Error placeholder with retry
- ✅ Empty placeholder for missing images
- ✅ Smooth transitions
- ✅ ARIA labels and accessibility
- ✅ Aspect ratio maintenance

### Property-Based Tests
Location: `frontend/src/components/LazyImage/__tests__/LazyImage.property.test.jsx`

**Properties Tested**:
- Image lazy loading behavior (100 iterations)
- Placeholder consistency across configurations
- Observer cleanup on unmount
- Fallback when IntersectionObserver unavailable

---

## Integration with Existing Systems

### 1. Cloudinary Integration
```javascript
import { getPlaceholderUrl } from '../../utils/imageOptimization';

const placeholderUrl = getPlaceholderUrl(publicId);
// Returns: https://res.cloudinary.com/.../w_50,q_auto,f_auto/image.jpg
```

### 2. Image Optimization
- Automatic WebP format with fallback
- Responsive images with srcset
- Cloudinary transformations (f_auto, q_auto)

### 3. Responsive Design
- Works on all screen sizes (320px - 2560px)
- Mobile-optimized spinner size
- Touch-friendly retry button

---

## Configuration Options

### LazyImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | boolean | `true` | Enable blur-up placeholder |
| `showSpinner` | boolean | `true` | Show loading spinner |
| `showRetry` | boolean | `true` | Show retry button on error |
| `errorMessage` | string | `null` | Custom error message |
| `fallbackImage` | string | `null` | Fallback image URL |
| `threshold` | number | `0.1` | Intersection threshold |
| `rootMargin` | string | `'50px'` | Intersection root margin |

---

## Best Practices

### ✅ Do
- Always provide descriptive `alt` text
- Use `placeholder={true}` for better UX
- Enable `showSpinner` for slow connections
- Provide `errorMessage` for debugging
- Use appropriate `preset` for consistent sizing

### ❌ Don't
- Don't disable placeholders without good reason
- Don't use LazyImage for small static assets (<50KB)
- Don't forget to handle error states
- Don't use without alt text (accessibility)

---

## Future Enhancements

### Phase 2
- [ ] Progressive image loading (multiple quality levels)
- [ ] Skeleton loader matching image content
- [ ] Animated placeholder transitions
- [ ] Custom placeholder components

### Phase 3
- [ ] AI-generated placeholder colors (dominant color)
- [ ] Blur hash placeholders
- [ ] LQIP (Low Quality Image Placeholder)
- [ ] Placeholder caching

---

## Troubleshooting

### Placeholder Not Showing
1. Check `placeholder={true}` prop
2. Verify `publicId` is valid
3. Check Cloudinary configuration
4. Inspect browser console for errors

### Spinner Not Visible
1. Verify `showSpinner={true}`
2. Check CSS is loaded
3. Inspect element for `.lazy-image-spinner`
4. Check z-index conflicts

### Images Not Loading
1. Check IntersectionObserver support
2. Verify `threshold` and `rootMargin` settings
3. Check network tab for failed requests
4. Verify Cloudinary credentials

---

## Related Documentation

- 📄 `docs/IMAGE_OPTIMIZATION_INTEGRATION.md` - Image optimization guide
- 📄 `docs/CLOUDINARY_TRANSFORMATIONS.md` - Cloudinary setup
- 📄 `frontend/src/components/LazyImage/LazyImage.jsx` - Component source
- 📄 `frontend/src/components/LazyImage/LazyImage.css` - Component styles

---

## Conclusion

The image placeholder implementation successfully fulfills requirement FR-LOAD-6 by providing:

1. ✅ Multiple placeholder states (initial, loading, error, empty)
2. ✅ Smooth loading animations (blur-up, spinner, fade-in)
3. ✅ Excellent accessibility (ARIA labels, screen reader support)
4. ✅ Performance optimizations (lazy loading, GPU acceleration)
5. ✅ Comprehensive error handling (retry, fallback, messages)
6. ✅ Dark mode support
7. ✅ Responsive design
8. ✅ Extensive test coverage

The implementation enhances user experience by providing visual feedback during image loading, reducing perceived load times, and maintaining layout stability.

---

**Last Updated**: 2026-02-22  
**Status**: ✅ Complete and Production-Ready
