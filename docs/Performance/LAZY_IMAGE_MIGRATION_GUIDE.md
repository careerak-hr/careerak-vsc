# LazyImage Migration Guide

## Overview
This guide documents the migration of image usages to the LazyImage component for the General Platform Enhancements spec (Task 2.3.5).

## LazyImage Component
Location: `frontend/src/components/LazyImage/LazyImage.jsx`

### Features
- Lazy loading with Intersection Observer
- WebP format with JPEG/PNG fallback
- Blur-up placeholder
- Loading spinner
- Error handling
- Responsive images support
- Accessibility support

### Basic Usage
```jsx
import LazyImage from '../components/LazyImage';

<LazyImage
  publicId="profile/user123"
  alt="User profile"
  width={400}
  height={400}
  preset="PROFILE_LARGE"
/>
```

## Image Categories Analysis

### 1. Static Logo Images (DO NOT MIGRATE)
**Reason**: Critical for initial page render, should load immediately

**Files**:
- `frontend/src/pages/00_LanguagePage.jsx` - `/logo.jpg`
- `frontend/src/pages/01_EntryPage.jsx` - `/logo.jpg`
- `frontend/src/pages/02_LoginPage.jsx` - `/logo.jpg`
- `frontend/src/pages/03_AuthPage.jsx` - `/logo.jpg`
- `frontend/src/pages/18_AdminDashboard.jsx` - `/logo.jpg`
- `frontend/src/components/Navbar.jsx` - `/logo.png`
- `frontend/src/components/SplashScreen.jsx` - `./logo.jpg`

**Decision**: Keep as regular `<img>` tags for optimal initial load performance.

### 2. Profile Upload Previews (DO NOT MIGRATE)
**Reason**: These are base64 data URLs from file uploads, not Cloudinary URLs

**Files**:
- `frontend/src/pages/03_AuthPage.jsx` - Profile image preview
- `frontend/src/components/auth/steps/Step4Details.jsx` - Profile image preview

**Current Implementation**:
```jsx
{profileImage ? (
  <img src={profileImage} alt="Profile" className="auth-photo-upload-img" />
) : (
  <span className="auth-photo-upload-placeholder">📷</span>
)}
```

**Decision**: Keep as-is. These are temporary previews before upload, not served from Cloudinary.

### 3. AI Analysis Modal Preview (DO NOT MIGRATE)
**Reason**: Temporary preview image, not from Cloudinary

**File**: `frontend/src/components/modals/AIAnalysisModal.jsx`

**Decision**: Keep as-is for immediate preview feedback.

### 4. Future Content Images (READY FOR MIGRATION)
**When to use LazyImage**: When implementing the following features:

#### Job Postings (Not Yet Implemented)
```jsx
// Future implementation in JobPostingsPage
<LazyImage
  publicId={job.companyLogo}
  alt={job.companyName}
  preset="LOGO_MEDIUM"
  placeholder={true}
  responsive={true}
/>
```

#### Course Thumbnails (Not Yet Implemented)
```jsx
// Future implementation in CoursesPage
<LazyImage
  publicId={course.thumbnail}
  alt={course.title}
  preset="THUMBNAIL_MEDIUM"
  placeholder={true}
  responsive={true}
/>
```

#### User Profile Images (When Loaded from Server)
```jsx
// Future implementation in ProfilePage
<LazyImage
  publicId={user.profileImage}
  alt={`${user.name}'s profile`}
  preset="PROFILE_LARGE"
  placeholder={true}
/>
```

#### Gallery Images
```jsx
// Future implementation for image galleries
<LazyImage
  publicId={image.publicId}
  alt={image.alt}
  preset="THUMBNAIL_LARGE"
  placeholder={true}
  responsive={true}
  responsiveWidths={[320, 640, 768, 1024, 1280, 1920]}
/>
```

## Migration Checklist

### Completed ✅
- [x] LazyImage component created
- [x] Image optimization utilities created
- [x] Intersection Observer hook created
- [x] CSS styles for LazyImage created
- [x] Tests for LazyImage created
- [x] Examples and documentation created

### Not Applicable ❌
- [x] Static logos - Should NOT use LazyImage (critical for initial render)
- [x] Profile upload previews - Base64 data URLs, not Cloudinary
- [x] AI analysis previews - Temporary previews, not Cloudinary

### Future Implementation 🔮
- [ ] Job posting company logos (when JobPostingsPage is implemented)
- [ ] Course thumbnails (when CoursesPage is implemented)
- [ ] User profile images (when ProfilePage loads from server)
- [ ] Gallery images (when gallery feature is implemented)
- [ ] Chat message images (when chat images are implemented)

## Best Practices

### When to Use LazyImage
✅ **DO use LazyImage for**:
- Images loaded from Cloudinary
- Images below the fold
- Gallery/list images
- User-generated content
- Course/job thumbnails
- Profile pictures loaded from server

❌ **DO NOT use LazyImage for**:
- Critical above-the-fold images (logos, hero images)
- Base64 data URLs (upload previews)
- SVG icons
- Small UI icons
- Images needed for initial page render

### Performance Considerations
1. **Critical Images**: Load immediately without lazy loading
2. **Above the Fold**: First 2-3 images should load eagerly
3. **Below the Fold**: Use LazyImage with appropriate rootMargin
4. **Responsive Images**: Use responsive prop for different screen sizes

### Example: Mixed Loading Strategy
```jsx
// First 3 items load eagerly, rest lazily
{items.map((item, index) => (
  index < 3 ? (
    <img src={item.image} alt={item.title} loading="eager" />
  ) : (
    <LazyImage
      publicId={item.image}
      alt={item.title}
      preset="THUMBNAIL_MEDIUM"
      placeholder={true}
    />
  )
))}
```

## Testing

### Manual Testing
1. Open DevTools Network tab
2. Throttle to "Slow 3G"
3. Scroll through page
4. Verify images load only when entering viewport
5. Check for blur-up placeholder effect
6. Verify WebP format is used (in modern browsers)

### Automated Testing
Tests are located in:
- `frontend/src/components/LazyImage/__tests__/`

Run tests:
```bash
npm test LazyImage
```

## Performance Metrics

### Expected Improvements
- **Initial Bundle Size**: No change (LazyImage is small)
- **Initial Page Load**: Faster (fewer images loaded initially)
- **Time to Interactive**: Improved (less network congestion)
- **Bandwidth Usage**: Reduced (images load on-demand)
- **User Experience**: Better (blur-up placeholders, smooth loading)

### Monitoring
Track these metrics:
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Image load times
- WebP adoption rate

## Conclusion

**Current Status**: Task 2.3.5 is effectively complete for the current codebase.

**Reasoning**:
1. LazyImage component is fully implemented and tested
2. Current image usages are appropriate (static logos, upload previews)
3. Future content pages (jobs, courses) are not yet implemented
4. When those pages are implemented, developers should use LazyImage

**Next Steps**:
1. Use this guide when implementing job postings page
2. Use this guide when implementing courses page
3. Use this guide when implementing profile page with server-loaded images
4. Update this guide as new image use cases are discovered

## References
- LazyImage Component: `frontend/src/components/LazyImage/LazyImage.jsx`
- Image Optimization Utils: `frontend/src/utils/imageOptimization.js`
- Intersection Observer Hook: `frontend/src/hooks/useIntersectionObserver.js`
- Design Document: `.kiro/specs/general-platform-enhancements/design.md` (Section 3.3)
- Requirements: `.kiro/specs/general-platform-enhancements/requirements.md` (FR-PERF-4)
