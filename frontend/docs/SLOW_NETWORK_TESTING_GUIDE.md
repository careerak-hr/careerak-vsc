# Slow Network Testing Guide for Loading States

**Task**: 8.6.6 Test loading states on slow network  
**Date**: 2026-02-21  
**Status**: ✅ Complete

## Overview

This guide provides step-by-step instructions for manually testing all loading states on slow network conditions to ensure they display correctly and provide good user experience even on poor connections.

## Requirements

- FR-LOAD-1: Display skeleton loaders matching content layout
- FR-LOAD-2: Display progress bar for page loads
- FR-LOAD-3: Display spinner inside buttons during processing
- FR-LOAD-4: Display centered spinner with backdrop for overlay actions
- FR-LOAD-6: Display placeholder with loading animation for images
- FR-LOAD-7: Apply smooth transitions (200ms fade)
- NFR-PERF-3: FCP under 1.8 seconds on 3G networks
- NFR-PERF-4: TTI under 3.8 seconds on 3G networks

## Testing Environment Setup

### 1. Browser DevTools Network Throttling

#### Chrome/Edge DevTools:
1. Open DevTools (F12 or Ctrl+Shift+I)
2. Go to **Network** tab
3. Click the **Throttling** dropdown (default: "No throttling")
4. Select one of the preset profiles:
   - **Slow 3G**: 400 Kbps, 400ms RTT
   - **Fast 3G**: 1.6 Mbps, 150ms RTT
   - **Slow 4G**: 4 Mbps, 20ms RTT
5. Or create a **Custom** profile:
   - Download: 400 Kbps
   - Upload: 400 Kbps
   - Latency: 400ms

#### Firefox DevTools:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **Throttling** icon
4. Select **GPRS**, **Regular 2G**, **Good 2G**, **Regular 3G**, or **Good 3G**

### 2. Lighthouse Performance Testing

```bash
# Run Lighthouse with 3G throttling
npm run audit:seo -- --throttling=mobile3G

# Or use Chrome DevTools Lighthouse:
# 1. Open DevTools > Lighthouse tab
# 2. Select "Mobile" device
# 3. Check "Performance" category
# 4. Click "Analyze page load"
```

## Loading States to Test

### 1. Skeleton Loaders

**Components to test:**
- Job cards skeleton
- Course cards skeleton
- Profile page skeleton
- Tables skeleton

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Navigate to each page:
   - `/jobs` - Job listings
   - `/courses` - Course listings
   - `/profile` - Profile page
   - `/admin/dashboard` - Admin tables
3. Observe skeleton loaders while content loads
4. Verify:
   - ✅ Skeleton matches final content layout
   - ✅ Pulse animation is smooth
   - ✅ No layout shifts when content loads (CLS < 0.1)
   - ✅ Skeleton displays within 100ms
   - ✅ Transition to content is smooth (200ms fade)

**Expected behavior:**
- Skeleton loaders appear immediately
- Pulse animation runs smoothly
- Content fades in smoothly when loaded
- No jumping or shifting of elements

### 2. Progress Bar

**Components to test:**
- Top-of-page progress bar during route changes

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Navigate between pages:
   - Home → Jobs
   - Jobs → Courses
   - Courses → Profile
3. Observe progress bar at top of page
4. Verify:
   - ✅ Progress bar appears at top
   - ✅ Width animates smoothly from 0% to 100%
   - ✅ Color is accent (#D48161)
   - ✅ Disappears when page loads
   - ✅ No layout shift (fixed positioning)

**Expected behavior:**
- Progress bar appears immediately on navigation
- Smooth animation across the top
- Disappears cleanly when page loads

### 3. Button Spinners

**Components to test:**
- Submit buttons in forms
- Action buttons (Apply, Save, etc.)

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Test forms:
   - Login form
   - Registration form
   - Job application form
   - Profile update form
3. Click submit button
4. Verify:
   - ✅ Button shows spinner immediately
   - ✅ Button is disabled during loading
   - ✅ Spinner rotates smoothly
   - ✅ Button text is replaced by spinner
   - ✅ Button returns to normal after completion

**Expected behavior:**
- Button becomes disabled immediately
- Spinner appears inside button
- Smooth rotation animation
- Button re-enables after action completes

### 4. Overlay Spinner

**Components to test:**
- File upload operations
- Image processing
- Bulk operations

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Test operations:
   - Upload profile picture
   - Upload resume/CV
   - Crop and save image
3. Verify:
   - ✅ Overlay covers entire screen
   - ✅ Backdrop is semi-transparent
   - ✅ Spinner is centered
   - ✅ Optional message displays
   - ✅ Smooth fade in/out animations
   - ✅ Blocks user interaction during loading

**Expected behavior:**
- Full-screen overlay appears
- Spinner centered with message
- User cannot interact with page
- Smooth fade animations

### 5. Image Placeholders

**Components to test:**
- Profile pictures
- Company logos
- Course thumbnails
- Job posting images

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Navigate to pages with images:
   - Profile page
   - Job listings
   - Course listings
3. Observe image loading
4. Verify:
   - ✅ Placeholder appears immediately
   - ✅ Blur-up effect (if implemented)
   - ✅ Loading spinner or animation
   - ✅ Smooth transition to actual image
   - ✅ No layout shift (dimensions preserved)
   - ✅ Error state if image fails to load

**Expected behavior:**
- Placeholder appears immediately
- Smooth transition to loaded image
- No jumping or shifting

### 6. Lazy Loading

**Components to test:**
- Images below the fold
- Route components
- Heavy components

**Test procedure:**
1. Enable **Slow 3G** throttling
2. Test lazy loading:
   - Scroll down job listings (images should load as they enter viewport)
   - Navigate to different routes (components should load on demand)
3. Verify:
   - ✅ Images load only when entering viewport
   - ✅ Routes load only when navigated to
   - ✅ Suspense fallbacks display during loading
   - ✅ Smooth transitions

**Expected behavior:**
- Content loads on demand
- Fallbacks display during loading
- Smooth user experience

## Performance Metrics to Verify

### 1. First Contentful Paint (FCP)

**Target**: < 1.8 seconds on 3G

**How to measure:**
1. Open DevTools > Performance tab
2. Enable **Slow 3G** throttling
3. Click **Record** and reload page
4. Stop recording after page loads
5. Check **FCP** metric in timeline

**What to look for:**
- FCP should be under 1.8 seconds
- Loading states should appear quickly
- User should see something meaningful early

### 2. Time to Interactive (TTI)

**Target**: < 3.8 seconds on 3G

**How to measure:**
1. Use Lighthouse with 3G throttling
2. Check **Time to Interactive** metric

**What to look for:**
- TTI should be under 3.8 seconds
- Page should be fully interactive quickly
- Loading states should not block interaction

### 3. Cumulative Layout Shift (CLS)

**Target**: < 0.1

**How to measure:**
1. Open DevTools > Performance tab
2. Enable **Slow 3G** throttling
3. Record page load
4. Check **Layout Shifts** in timeline

**What to look for:**
- CLS should be under 0.1
- No jumping or shifting during loading
- Skeleton loaders should match content dimensions

## Test Scenarios

### Scenario 1: First Visit (Cold Cache)

1. Clear browser cache (Ctrl+Shift+Delete)
2. Enable **Slow 3G** throttling
3. Navigate to homepage
4. Verify all loading states appear correctly
5. Check performance metrics

**Expected results:**
- All loading states display
- FCP < 1.8s
- TTI < 3.8s
- CLS < 0.1

### Scenario 2: Subsequent Visit (Warm Cache)

1. Keep **Slow 3G** throttling enabled
2. Navigate away and back to homepage
3. Verify cached resources load faster
4. Check that loading states still work correctly

**Expected results:**
- Faster load times due to cache
- Loading states still display briefly
- Smooth transitions

### Scenario 3: Navigation Between Pages

1. Enable **Slow 3G** throttling
2. Navigate between multiple pages:
   - Home → Jobs → Courses → Profile → Settings
3. Verify loading states on each navigation
4. Check for smooth transitions

**Expected results:**
- Progress bar on each navigation
- Skeleton loaders on each page
- No layout shifts
- Smooth transitions

### Scenario 4: Form Submissions

1. Enable **Slow 3G** throttling
2. Fill out and submit forms:
   - Login form
   - Registration form
   - Job application form
3. Verify button spinners
4. Check for proper feedback

**Expected results:**
- Button spinners appear immediately
- Buttons are disabled during submission
- Success/error feedback after completion

### Scenario 5: Image-Heavy Pages

1. Enable **Slow 3G** throttling
2. Navigate to image-heavy pages:
   - Job listings with company logos
   - Course listings with thumbnails
3. Verify image placeholders
4. Check lazy loading

**Expected results:**
- Placeholders appear immediately
- Images load as they enter viewport
- Smooth transitions
- No layout shifts

## Common Issues and Solutions

### Issue 1: Loading States Not Appearing

**Symptoms:**
- Blank screen during loading
- No visual feedback

**Solutions:**
- Check that loading states are implemented
- Verify Suspense fallbacks are configured
- Check network requests in DevTools

### Issue 2: Layout Shifts During Loading

**Symptoms:**
- Content jumps when loading completes
- CLS > 0.1

**Solutions:**
- Ensure skeleton loaders match content dimensions
- Use min-height on containers
- Reserve space for images with width/height attributes

### Issue 3: Slow Transitions

**Symptoms:**
- Jerky or slow animations
- Poor performance

**Solutions:**
- Use GPU-accelerated properties (transform, opacity)
- Avoid animating width, height, top, left
- Check for heavy JavaScript during transitions

### Issue 4: Images Not Lazy Loading

**Symptoms:**
- All images load immediately
- Slow initial page load

**Solutions:**
- Verify Intersection Observer is working
- Check LazyImage component implementation
- Ensure images have loading="lazy" attribute

## Checklist

Use this checklist to track your testing progress:

### Skeleton Loaders
- [ ] Job cards skeleton displays correctly
- [ ] Course cards skeleton displays correctly
- [ ] Profile page skeleton displays correctly
- [ ] Tables skeleton displays correctly
- [ ] Pulse animation is smooth
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth transition to content (200ms fade)

### Progress Bar
- [ ] Appears at top of page during navigation
- [ ] Smooth width animation
- [ ] Correct color (accent #D48161)
- [ ] Disappears when page loads
- [ ] No layout shift

### Button Spinners
- [ ] Appears inside button immediately
- [ ] Button is disabled during loading
- [ ] Smooth rotation animation
- [ ] Returns to normal after completion

### Overlay Spinner
- [ ] Covers entire screen
- [ ] Semi-transparent backdrop
- [ ] Spinner is centered
- [ ] Optional message displays
- [ ] Smooth fade in/out
- [ ] Blocks user interaction

### Image Placeholders
- [ ] Appears immediately
- [ ] Smooth transition to loaded image
- [ ] No layout shift
- [ ] Error state if image fails

### Lazy Loading
- [ ] Images load only when entering viewport
- [ ] Routes load only when navigated to
- [ ] Suspense fallbacks display
- [ ] Smooth transitions

### Performance Metrics
- [ ] FCP < 1.8 seconds on 3G
- [ ] TTI < 3.8 seconds on 3G
- [ ] CLS < 0.1
- [ ] Smooth animations (no jank)

### Test Scenarios
- [ ] First visit (cold cache)
- [ ] Subsequent visit (warm cache)
- [ ] Navigation between pages
- [ ] Form submissions
- [ ] Image-heavy pages

## Reporting Results

After completing the tests, document your findings:

### Template:

```markdown
## Slow Network Testing Results

**Date**: [Date]
**Tester**: [Name]
**Browser**: [Chrome/Firefox/Safari] [Version]
**Network Profile**: [Slow 3G / Fast 3G / Custom]

### Performance Metrics
- FCP: [X.X]s (Target: < 1.8s) ✅/❌
- TTI: [X.X]s (Target: < 3.8s) ✅/❌
- CLS: [X.XX] (Target: < 0.1) ✅/❌

### Loading States
- Skeleton Loaders: ✅/❌ [Notes]
- Progress Bar: ✅/❌ [Notes]
- Button Spinners: ✅/❌ [Notes]
- Overlay Spinner: ✅/❌ [Notes]
- Image Placeholders: ✅/❌ [Notes]
- Lazy Loading: ✅/❌ [Notes]

### Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual behavior

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

## Conclusion

This manual testing ensures that all loading states work correctly on slow network conditions, providing a good user experience even on poor connections. Complete all test scenarios and document your findings using the template above.

## References

- [Chrome DevTools Network Throttling](https://developer.chrome.com/docs/devtools/network/reference/#throttling)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [Web Vitals](https://web.dev/vitals/)
- [Cumulative Layout Shift](https://web.dev/cls/)
