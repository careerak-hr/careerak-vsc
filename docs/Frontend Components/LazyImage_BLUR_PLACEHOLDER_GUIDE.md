# Blur-up Placeholder Guide

## Overview

The blur-up placeholder technique provides a better user experience by showing a blurred preview of an image while the full-resolution version loads. This prevents the jarring effect of blank spaces and gives users immediate visual feedback.

## How It Works

1. **Tiny Placeholder**: A very small (20px wide), heavily blurred version of the image loads instantly
2. **Blur Effect**: The placeholder is scaled up and blurred (20px blur) to fill the container
3. **Smooth Transition**: When the full image loads, it fades in smoothly over 300ms
4. **Performance**: The placeholder is typically <1KB, loading in milliseconds

## Implementation

### Basic Usage

```jsx
import LazyImage from './components/LazyImage/LazyImage';

// Blur-up placeholder is enabled by default
<LazyImage
  publicId="profile/user123"
  alt="User profile"
  width={400}
  height={400}
/>
```

### Disable Placeholder

```jsx
// Disable blur-up placeholder if not needed
<LazyImage
  publicId="profile/user123"
  alt="User profile"
  width={400}
  height={400}
  placeholder={false}
/>
```

### Custom Placeholder Size

```jsx
import { getPlaceholderUrl } from './utils/imageOptimization';

// Generate custom placeholder (default is 20px)
const placeholderUrl = getPlaceholderUrl('profile/user123', 30);
```

## Technical Details

### Placeholder Generation

The `getPlaceholderUrl` function generates optimized placeholder URLs:

```javascript
getPlaceholderUrl(publicId, width = 20)
```

**Parameters:**
- `publicId` (string): Cloudinary public ID
- `width` (number): Placeholder width in pixels (default: 20)

**Transformations Applied:**
- `w_20`: Very small width for instant loading
- `q_1`: Lowest quality for minimal file size
- `e_blur:1000`: Heavy blur to hide pixelation
- `f_auto`: Automatic format selection

**Example URL:**
```
https://res.cloudinary.com/careerak/image/upload/w_20,f_auto,q_1,e_blur:1000/profile/user123
```

### CSS Implementation

The placeholder uses these key styles:

```css
.lazy-image-placeholder-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);           /* Blur effect */
  transform: scale(1.1);         /* Prevent blur cutoff */
  transition: opacity 0.3s ease-in-out;
  will-change: opacity;          /* Performance optimization */
}
```

### Loading States

The component manages three states:

1. **Not Visible**: Shows placeholder or icon
2. **Loading**: Shows blurred placeholder + spinner
3. **Loaded**: Shows full image, fades out placeholder

## Performance Benefits

### File Size Comparison

| Image Type | Dimensions | Quality | File Size | Load Time (3G) |
|-----------|-----------|---------|-----------|----------------|
| Full Image | 1200x800 | 80 | ~150KB | ~2-3s |
| Placeholder | 20x13 | 1 | <1KB | <100ms |

### User Experience Impact

- **Perceived Performance**: Users see content immediately
- **Layout Stability**: No layout shifts (CLS = 0)
- **Visual Continuity**: Smooth transition from blur to sharp
- **Bandwidth Savings**: Only loads full image when needed

## Best Practices

### When to Use

✅ **Use blur-up placeholders for:**
- Hero images and banners
- Profile photos and avatars
- Product images
- Gallery images
- Any image above the fold

❌ **Skip placeholders for:**
- Icons and logos (use SVG instead)
- Very small images (<100px)
- Images that load instantly from cache
- Decorative images that aren't critical

### Optimization Tips

1. **Keep Placeholder Small**: Default 20px is optimal
2. **Use with Lazy Loading**: Combine with Intersection Observer
3. **Preload Critical Images**: For above-the-fold images
4. **Test on Slow Networks**: Verify smooth transitions

## Accessibility

The blur-up placeholder is implemented with accessibility in mind:

```jsx
<img
  src={placeholderUrl}
  alt=""                    // Empty alt (decorative)
  aria-hidden="true"        // Hidden from screen readers
  className="lazy-image-placeholder-blur"
/>
```

- Placeholder is marked as decorative (`aria-hidden="true"`)
- Main image has proper alt text
- No impact on screen reader navigation

## Browser Support

The blur-up placeholder works in all modern browsers:

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ iOS Safari 11+
- ✅ Chrome Mobile 60+

**Fallback**: If CSS filters aren't supported, shows regular placeholder.

## Examples

### Profile Photo with Blur-up

```jsx
<LazyImage
  publicId="profiles/user123"
  alt="John Doe profile photo"
  preset="PROFILE_LARGE"
  placeholder={true}
/>
```

### Hero Banner with Blur-up

```jsx
<LazyImage
  publicId="banners/hero"
  alt="Welcome banner"
  responsive={true}
  responsiveWidths={[640, 1024, 1920]}
  placeholder={true}
/>
```

### Gallery with Blur-up

```jsx
<div className="gallery">
  {images.map(img => (
    <LazyImage
      key={img.id}
      publicId={img.publicId}
      alt={img.alt}
      width={300}
      height={300}
      placeholder={true}
    />
  ))}
</div>
```

## Testing

Run the blur-up placeholder tests:

```bash
npm test -- LazyImage.blur-placeholder.test.jsx --run
```

**Test Coverage:**
- ✅ Placeholder URL generation
- ✅ Correct transformation parameters
- ✅ Performance optimization
- ✅ Edge cases handling
- ✅ Integration with image optimization

## Troubleshooting

### Placeholder Not Showing

**Problem**: Blur placeholder doesn't appear

**Solutions**:
1. Check `placeholder` prop is `true` (default)
2. Verify `publicId` is valid
3. Check Cloudinary configuration
4. Inspect network tab for placeholder request

### Placeholder Too Pixelated

**Problem**: Placeholder looks too pixelated even with blur

**Solutions**:
1. Increase placeholder width: `getPlaceholderUrl(id, 30)`
2. Increase blur amount in CSS: `filter: blur(30px)`
3. Adjust scale: `transform: scale(1.2)`

### Slow Transition

**Problem**: Transition from placeholder to full image is slow

**Solutions**:
1. Check transition duration in CSS (should be 300ms)
2. Verify `will-change: opacity` is applied
3. Test on different devices/browsers
4. Check for CSS conflicts

### Placeholder Doesn't Fade Out

**Problem**: Placeholder stays visible after image loads

**Solutions**:
1. Check `isLoaded` state is updating
2. Verify `onLoad` handler is firing
3. Inspect opacity transition in DevTools
4. Check for JavaScript errors

## Related Documentation

- [LazyImage Component](./LazyImage.jsx)
- [Image Optimization Utility](../../utils/imageOptimization.js)
- [LazyImage Examples](./LazyImage.examples.jsx)
- [Performance Optimization Design](../../../.kiro/specs/general-platform-enhancements/design.md)

## References

- [Cloudinary Blur Effect](https://cloudinary.com/documentation/image_transformations#blur_effect)
- [Progressive Image Loading](https://web.dev/fast/#optimize-your-images)
- [Blur-up Technique](https://css-tricks.com/the-blur-up-technique-for-loading-background-images/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## Task Information

- **Task**: 2.3.4 Add blur-up placeholder for images
- **Requirements**: FR-PERF-4, FR-LOAD-6
- **Status**: ✅ Complete
- **Date**: 2026-02-19
