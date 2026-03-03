# Image Optimization Quick Reference

## Quick Decision Tree

```
Do you have an image to display?
│
├─ Is it a user-uploaded image (profile, logo, etc.)?
│  └─ ✅ Use LazyImage with Cloudinary
│     Example: <LazyImage publicId={user.avatar} preset="PROFILE_MEDIUM" />
│
├─ Is it a small icon or logo (<4KB)?
│  └─ ✅ Import in code (will be inlined as base64)
│     Example: import icon from './assets/icon.png'
│
├─ Is it a static image that needs a specific URL?
│  └─ ✅ Put in /public folder
│     Example: /public/logo192.png
│
└─ Is it a large static image (>4KB)?
   └─ ✅ Import in code (will be emitted with hash)
      Example: import banner from './assets/banner.jpg'
```

---

## Common Use Cases

### 1. User Profile Picture

```javascript
import LazyImage from '../components/LazyImage/LazyImage';

// In a list
<LazyImage
  publicId={user.profilePicture}
  alt={user.name}
  preset="PROFILE_SMALL"
  placeholder={true}
/>

// On profile page
<LazyImage
  publicId={user.profilePicture}
  alt={user.name}
  preset="PROFILE_MEDIUM"
  placeholder={true}
/>
```

---

### 2. Company Logo

```javascript
import LazyImage from '../components/LazyImage/LazyImage';

<LazyImage
  publicId={company.logo}
  alt={company.name}
  preset="LOGO_MEDIUM"
  placeholder={true}
/>
```

---

### 3. Job/Course Thumbnail

```javascript
import LazyImage from '../components/LazyImage/LazyImage';

<LazyImage
  publicId={job.thumbnail}
  alt={job.title}
  preset="THUMBNAIL_MEDIUM"
  placeholder={true}
  responsive={true}  // Generates srcset for different screens
/>
```

---

### 4. Small Icon (Static)

```javascript
// Import the icon
import checkIcon from '../assets/icons/check.svg';

// Use in component
<img src={checkIcon} alt="Check" className="w-4 h-4" />

// If <4KB, it will be inlined as base64
// If >4KB, it will be emitted as /assets/images/check-[hash].svg
```

---

### 5. Hero Banner (Static)

```javascript
// Import the banner
import heroBanner from '../assets/images/hero-banner.jpg';

// Use in component
<img src={heroBanner} alt="Hero Banner" className="w-full" />

// Will be emitted as /assets/images/hero-banner-[hash].jpg
```

---

### 6. Favicon/Manifest Icons (Static)

```
// Put in /public folder
public/
├── favicon.ico
├── logo192.png
└── logo512.png

// Reference in index.html
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/logo192.png" />
```

---

## Available Presets

| Preset | Size | Use Case |
|--------|------|----------|
| `PROFILE_SMALL` | 100x100 | User avatars in lists |
| `PROFILE_MEDIUM` | 200x200 | Profile pages |
| `PROFILE_LARGE` | 400x400 | Full-screen profile |
| `LOGO_SMALL` | 80x80 | Company logos in lists |
| `LOGO_MEDIUM` | 150x150 | Company pages |
| `LOGO_LARGE` | 300x300 | Full-screen logo |
| `THUMBNAIL_SMALL` | 300x200 | Job/course cards |
| `THUMBNAIL_MEDIUM` | 600x400 | Job/course details |
| `THUMBNAIL_LARGE` | 1200x800 | Hero images |

---

## LazyImage Props

```javascript
<LazyImage
  publicId="profile/user123"      // Required: Cloudinary public ID
  alt="User name"                 // Required: Alt text for accessibility
  preset="PROFILE_MEDIUM"         // Optional: Preset name (default: none)
  placeholder={true}              // Optional: Show blur-up placeholder (default: false)
  responsive={true}               // Optional: Generate srcset (default: false)
  className="rounded-full"        // Optional: CSS classes
  onLoad={() => {}}               // Optional: Callback when image loads
  onError={() => {}}              // Optional: Callback on error
/>
```

---

## Performance Tips

### ✅ Do

- Use `LazyImage` for all Cloudinary images
- Use appropriate presets for different contexts
- Enable `placeholder={true}` for better UX
- Enable `responsive={true}` for large images
- Provide descriptive alt text
- Import small icons (<4KB) in code
- Put static images that need specific URLs in `/public`

### ❌ Don't

- Don't use raw Cloudinary URLs without optimization
- Don't skip lazy loading for images below the fold
- Don't use the same preset for all contexts
- Don't forget alt text (accessibility!)
- Don't put large images in `/public` (they won't be optimized)
- Don't import images that need specific URLs (use `/public`)

---

## Troubleshooting

### Images not loading?

1. Check publicId is correct
2. Check Cloudinary cloud name in `imageOptimization.js`
3. Check network tab for 404 errors

### Images loading slowly?

1. Use appropriate preset (don't use LARGE for small images)
2. Enable lazy loading with `LazyImage`
3. Enable placeholders for better perceived performance

### Images causing layout shift?

1. Enable `placeholder={true}` in LazyImage
2. Specify width/height in CSS
3. Use aspect-ratio CSS property

---

## Build Output

After running `npm run build`, images are organized as:

```
build/
├── assets/
│   ├── images/
│   │   ├── logo-a1b2c3d4.png      (imported in code, >4KB)
│   │   ├── banner-e5f6g7h8.jpg    (imported in code, >4KB)
│   │   └── icon-i9j0k1l2.svg      (imported in code, >4KB)
│   ├── fonts/
│   ├── css/
│   └── js/
└── favicon.ico                     (from /public)
```

**Note**: Images <4KB are inlined as base64 and won't appear in the output.

---

## Related Documentation

- [Full Build Configuration](./IMAGE_OPTIMIZATION_BUILD_CONFIG.md)
- [Cloudinary Transformations](./CLOUDINARY_TRANSFORMATIONS.md)
- [LazyImage Component](../src/components/LazyImage/LazyImage.jsx)
- [Image Optimization Utility](../src/utils/imageOptimization.js)

---

**Last Updated**: 2026-02-22  
**Task**: 10.2.4 Configure image optimization
