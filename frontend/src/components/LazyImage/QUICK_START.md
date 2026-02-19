# LazyImage Quick Start Guide

## 🚀 Quick Start

### 1. Import the Component
```jsx
import LazyImage from '../components/LazyImage';
```

### 2. Basic Usage
```jsx
<LazyImage
  publicId="your-image-id"
  alt="Description"
  preset="THUMBNAIL_MEDIUM"
/>
```

## 📋 Common Use Cases

### Profile Picture
```jsx
<LazyImage
  publicId={user.profileImage}
  alt={`${user.firstName} ${user.lastName}`}
  preset="PROFILE_LARGE"
  placeholder={true}
/>
```

### Company Logo
```jsx
<LazyImage
  publicId={company.logo}
  alt={company.name}
  preset="LOGO_MEDIUM"
  fallbackFormat="png"
/>
```

### Job/Course Thumbnail
```jsx
<LazyImage
  publicId={item.thumbnail}
  alt={item.title}
  preset="THUMBNAIL_MEDIUM"
  placeholder={true}
  responsive={true}
/>
```

### Gallery Image
```jsx
<LazyImage
  publicId={image.publicId}
  alt={image.alt}
  preset="THUMBNAIL_LARGE"
  placeholder={true}
  responsive={true}
  responsiveWidths={[320, 640, 1024, 1920]}
/>
```

## 🎨 Available Presets

| Preset | Size | Use Case |
|--------|------|----------|
| `PROFILE_SMALL` | 100x100 | Small avatars |
| `PROFILE_MEDIUM` | 200x200 | Medium avatars |
| `PROFILE_LARGE` | 400x400 | Large profile pics |
| `LOGO_SMALL` | 100x100 | Small logos |
| `LOGO_MEDIUM` | 200x200 | Medium logos |
| `LOGO_LARGE` | 300x300 | Large logos |
| `THUMBNAIL_SMALL` | 300x200 | Small thumbnails |
| `THUMBNAIL_MEDIUM` | 600x400 | Medium thumbnails |
| `THUMBNAIL_LARGE` | 1200x800 | Large thumbnails |
| `BANNER_SMALL` | 800x300 | Small banners |
| `BANNER_MEDIUM` | 1200x400 | Medium banners |
| `BANNER_LARGE` | 1920x600 | Large banners |

## ✅ When to Use

**DO use LazyImage for:**
- ✅ Images from Cloudinary
- ✅ Images below the fold
- ✅ Gallery/list images
- ✅ User-generated content
- ✅ Thumbnails

**DON'T use LazyImage for:**
- ❌ Static logos (critical for initial render)
- ❌ Upload previews (base64 data URLs)
- ❌ Above-the-fold hero images
- ❌ SVG icons

## 🔧 Common Props

```jsx
<LazyImage
  publicId="image-id"           // Required: Cloudinary ID
  alt="Description"             // Recommended: Accessibility
  preset="THUMBNAIL_MEDIUM"     // Recommended: Size preset
  placeholder={true}            // Optional: Blur-up effect
  responsive={true}             // Optional: Responsive images
  className="custom-class"      // Optional: CSS classes
  onLoad={() => {}}             // Optional: Load callback
  onError={() => {}}            // Optional: Error callback
/>
```

## 📖 More Information

- **Full Documentation**: `README.md`
- **Usage Examples**: `LazyImage.usage-examples.jsx`
- **Migration Guide**: `docs/LAZY_IMAGE_MIGRATION_GUIDE.md`

## 🐛 Troubleshooting

**Image not loading?**
- Check `publicId` is correct
- Verify Cloudinary configuration
- Check browser console for errors

**Placeholder not showing?**
- Ensure `placeholder={true}`
- Check Cloudinary is accessible

**Images loading too early/late?**
- Adjust `threshold` prop (0-1)
- Adjust `rootMargin` prop (e.g., '100px')

## 💡 Pro Tips

1. **First 3 images**: Load eagerly for better UX
   ```jsx
   threshold={index < 3 ? 0 : 0.1}
   ```

2. **Responsive images**: Always use for large images
   ```jsx
   responsive={true}
   responsiveWidths={[320, 640, 1024, 1920]}
   ```

3. **PNG logos**: Use PNG fallback for transparency
   ```jsx
   fallbackFormat="png"
   ```

4. **Error handling**: Always provide alt text
   ```jsx
   alt="Descriptive text"
   ```
