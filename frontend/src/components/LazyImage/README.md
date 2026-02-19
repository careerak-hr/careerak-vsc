# LazyImage Component

A React component that implements lazy loading for images using the Intersection Observer API, with WebP format support, blur-up placeholders, and comprehensive error handling.

## Features

- ✅ Lazy loading with Intersection Observer
- ✅ WebP format with JPEG/PNG fallback
- ✅ Blur-up placeholder for smooth loading
- ✅ Loading spinner
- ✅ Error handling with fallback UI
- ✅ Responsive images support
- ✅ Accessibility compliant
- ✅ Cloudinary integration
- ✅ Customizable thresholds and margins

## Installation

The component is already installed in the project. Import it:

```jsx
import LazyImage from '../components/LazyImage';
```

## Basic Usage

```jsx
<LazyImage
  publicId="profile/user123"
  alt="User profile"
  width={400}
  height={400}
  preset="PROFILE_LARGE"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publicId` | string | **required** | Cloudinary public ID or full URL |
| `alt` | string | `''` | Alt text for accessibility |
| `width` | number | `null` | Image width in pixels |
| `height` | number | `null` | Image height in pixels |
| `preset` | string | `null` | Preset name from ImagePresets |
| `className` | string | `''` | Additional CSS classes |
| `style` | object | `{}` | Inline styles |
| `responsive` | boolean | `false` | Enable responsive images |
| `responsiveWidths` | array | `[320, 640, 768, 1024, 1280, 1920]` | Widths for srcset |
| `sizes` | string | `null` | Sizes attribute for responsive images |
| `placeholder` | boolean | `true` | Show blur-up placeholder |
| `fallbackFormat` | string | `'jpeg'` | Fallback format (jpeg or png) |
| `threshold` | number | `0.1` | Intersection Observer threshold |
| `rootMargin` | string | `'50px'` | Intersection Observer root margin |
| `onLoad` | function | `null` | Callback when image loads |
| `onError` | function | `null` | Callback when image fails |
| `showSpinner` | boolean | `true` | Show loading spinner |

## Image Presets

Available presets from `imageOptimization.js`:

### Profile Images
- `PROFILE_SMALL`: 100x100px
- `PROFILE_MEDIUM`: 200x200px
- `PROFILE_LARGE`: 400x400px

### Logos
- `LOGO_SMALL`: 100x100px
- `LOGO_MEDIUM`: 200x200px
- `LOGO_LARGE`: 300x300px

### Thumbnails
- `THUMBNAIL_SMALL`: 300x200px
- `THUMBNAIL_MEDIUM`: 600x400px
- `THUMBNAIL_LARGE`: 1200x800px

### Banners
- `BANNER_SMALL`: 800x300px
- `BANNER_MEDIUM`: 1200x400px
- `BANNER_LARGE`: 1920x600px

## Examples

### 1. Profile Picture

```jsx
<LazyImage
  publicId="users/john-doe-profile"
  alt="John Doe profile picture"
  preset="PROFILE_LARGE"
  placeholder={true}
/>
```

### 2. Company Logo

```jsx
<LazyImage
  publicId="companies/acme-corp-logo"
  alt="ACME Corp logo"
  preset="LOGO_MEDIUM"
  fallbackFormat="png"
  placeholder={true}
/>
```

### 3. Job Thumbnail

```jsx
<LazyImage
  publicId="jobs/software-engineer-thumbnail"
  alt="Software Engineer position"
  preset="THUMBNAIL_MEDIUM"
  placeholder={true}
  className="job-thumbnail"
/>
```

### 4. Responsive Image

```jsx
<LazyImage
  publicId="banners/hero-image"
  alt="Hero banner"
  responsive={true}
  responsiveWidths={[320, 640, 768, 1024, 1280, 1920]}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder={true}
/>
```

### 5. Custom Dimensions

```jsx
<LazyImage
  publicId="custom/image"
  alt="Custom image"
  width={800}
  height={600}
  placeholder={true}
/>
```

### 6. With Callbacks

```jsx
<LazyImage
  publicId="image/with-callbacks"
  alt="Image with callbacks"
  preset="THUMBNAIL_MEDIUM"
  onLoad={() => console.log('Image loaded!')}
  onError={() => console.error('Image failed to load')}
/>
```

### 7. Without Placeholder

```jsx
<LazyImage
  publicId="image/no-placeholder"
  alt="Image without placeholder"
  preset="THUMBNAIL_MEDIUM"
  placeholder={false}
  showSpinner={true}
/>
```

### 8. Custom Intersection Observer Settings

```jsx
<LazyImage
  publicId="image/custom-observer"
  alt="Custom observer settings"
  preset="THUMBNAIL_MEDIUM"
  threshold={0.5}
  rootMargin="100px"
/>
```

## When to Use LazyImage

### ✅ DO use LazyImage for:
- Images loaded from Cloudinary
- Images below the fold
- Gallery/list images
- User-generated content
- Course/job thumbnails
- Profile pictures loaded from server
- Any image that's not critical for initial page render

### ❌ DO NOT use LazyImage for:
- Critical above-the-fold images (logos, hero images)
- Base64 data URLs (upload previews)
- SVG icons
- Small UI icons
- Images needed for initial page render

## Performance Benefits

1. **Reduced Initial Load Time**: Only loads images when needed
2. **Bandwidth Savings**: Doesn't load images that users never see
3. **Better User Experience**: Blur-up placeholders provide smooth loading
4. **WebP Support**: Smaller file sizes with better quality
5. **Responsive Images**: Serves appropriate sizes for different screens

## Accessibility

The component is fully accessible:
- Proper `alt` text support
- ARIA labels for loading states
- Keyboard navigation support
- Screen reader friendly

## Browser Support

- ✅ Chrome 58+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 79+
- ✅ iOS Safari 12.2+
- ✅ Chrome Android 58+

For older browsers, images will load immediately (graceful degradation).

## Testing

Run tests:
```bash
npm test LazyImage
```

Test files:
- `__tests__/LazyImage.test.jsx` - Component tests
- `__tests__/LazyImage.blur-placeholder.test.jsx` - Placeholder tests
- `__tests__/LazyImage.intersection-observer.test.jsx` - Observer tests

## Related Files

- **Component**: `LazyImage.jsx`
- **Styles**: `LazyImage.css`
- **Hook**: `../../hooks/useIntersectionObserver.js`
- **Utils**: `../../utils/imageOptimization.js`
- **Examples**: `LazyImage.examples.jsx`
- **Usage Examples**: `LazyImage.usage-examples.jsx`

## Migration Guide

See `docs/LAZY_IMAGE_MIGRATION_GUIDE.md` for detailed migration instructions.

## Troubleshooting

### Image not loading
- Check that `publicId` is correct
- Verify Cloudinary configuration in `imageOptimization.js`
- Check browser console for errors

### Placeholder not showing
- Ensure `placeholder={true}` is set
- Check that Cloudinary is accessible
- Verify network connection

### Images loading too early/late
- Adjust `threshold` prop (0-1)
- Adjust `rootMargin` prop (e.g., '100px')
- Check Intersection Observer browser support

### WebP not working
- Check browser support
- Verify Cloudinary configuration
- Fallback to JPEG/PNG should work automatically

## Contributing

When adding new features:
1. Update component props and PropTypes
2. Add tests for new functionality
3. Update this README
4. Add examples to `LazyImage.examples.jsx`

## License

Part of the Careerak platform.
