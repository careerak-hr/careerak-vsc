# Testing Loading States - Complete Guide

**Task**: 8.6.6 Test loading states on slow network  
**Date**: 2026-02-21  
**Status**: ✅ Complete

## Overview

This document provides a complete guide for testing all loading states on slow network conditions, combining both automated and manual testing approaches.

## Quick Start

### Automated Testing

```bash
# Start the development server
npm run dev

# In another terminal, run the automated test
npm run test:slow-network

# Test with different network profiles
npm run test:slow-network -- --throttling=slow3G
npm run test:slow-network -- --throttling=fast3G
npm run test:slow-network -- --throttling=mobile3G

# Test a specific URL
npm run test:slow-network -- --url=http://localhost:5173
```

### Manual Testing

See the comprehensive manual testing guide:
📖 [Slow Network Testing Guide](./SLOW_NETWORK_TESTING_GUIDE.md)

## What Gets Tested

### 1. Skeleton Loaders (FR-LOAD-1)
- Job cards skeleton
- Course cards skeleton
- Profile page skeleton
- Tables skeleton

**Verification:**
- ✅ Skeleton matches final content layout
- ✅ Pulse animation is smooth
- ✅ No layout shifts (CLS < 0.1)
- ✅ Smooth transition to content (200ms fade)

### 2. Progress Bar (FR-LOAD-2)
- Top-of-page progress bar during route changes

**Verification:**
- ✅ Appears at top of page
- ✅ Smooth width animation
- ✅ Correct color (accent #D48161)
- ✅ Disappears when page loads

### 3. Button Spinners (FR-LOAD-3)
- Submit buttons in forms
- Action buttons

**Verification:**
- ✅ Spinner appears inside button
- ✅ Button is disabled during loading
- ✅ Smooth rotation animation
- ✅ Returns to normal after completion

### 4. Overlay Spinner (FR-LOAD-4)
- File upload operations
- Image processing
- Bulk operations

**Verification:**
- ✅ Covers entire screen
- ✅ Semi-transparent backdrop
- ✅ Spinner is centered
- ✅ Smooth fade in/out

### 5. Image Placeholders (FR-LOAD-6)
- Profile pictures
- Company logos
- Course thumbnails

**Verification:**
- ✅ Placeholder appears immediately
- ✅ Smooth transition to loaded image
- ✅ No layout shift
- ✅ Error state if image fails

### 6. Lazy Loading
- Images below the fold
- Route components

**Verification:**
- ✅ Images load only when entering viewport
- ✅ Routes load only when navigated to
- ✅ Suspense fallbacks display

## Performance Targets

### Core Web Vitals on 3G Network

| Metric | Target | Requirement |
|--------|--------|-------------|
| **FCP** (First Contentful Paint) | < 1.8s | NFR-PERF-3 |
| **TTI** (Time to Interactive) | < 3.8s | NFR-PERF-4 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | NFR-PERF-5 |

### Additional Metrics

| Metric | Description |
|--------|-------------|
| **LCP** | Largest Contentful Paint |
| **TBT** | Total Blocking Time |
| **Speed Index** | How quickly content is visually displayed |

## Testing Approach

### 1. Automated Testing (Lighthouse)

The automated script (`scripts/test-slow-network.js`) uses Lighthouse to:
- Test multiple pages automatically
- Measure Core Web Vitals
- Generate performance reports
- Verify targets are met

**Advantages:**
- Fast and repeatable
- Objective metrics
- Easy to integrate into CI/CD

**Limitations:**
- Cannot verify visual appearance
- Cannot test user interactions
- May miss subtle issues

### 2. Manual Testing (Browser DevTools)

Manual testing with browser DevTools allows you to:
- Verify visual appearance of loading states
- Test user interactions
- Check animations and transitions
- Identify UX issues

**Advantages:**
- Comprehensive visual verification
- Can test all user interactions
- Catches subtle UX issues

**Limitations:**
- Time-consuming
- Subjective
- Harder to automate

### 3. Combined Approach (Recommended)

Use both approaches for comprehensive testing:

1. **Run automated tests first** to verify performance metrics
2. **Follow up with manual testing** to verify visual appearance and UX
3. **Document findings** using the provided templates

## Network Throttling Profiles

### Slow 3G
- **Download**: 400 Kbps
- **Upload**: 400 Kbps
- **Latency**: 400ms
- **Use case**: Worst-case scenario testing

### Fast 3G
- **Download**: 1.6 Mbps
- **Upload**: 750 Kbps
- **Latency**: 150ms
- **Use case**: Typical mobile network

### Mobile 3G (Default)
- **Download**: 700 Kbps
- **Upload**: 700 Kbps
- **Latency**: 300ms
- **Use case**: Balanced mobile testing

## Test Results Interpretation

### Performance Score

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | ✅ Excellent | No action needed |
| 50-89 | ⚠️ Needs Improvement | Investigate opportunities |
| 0-49 | ❌ Poor | Immediate action required |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP | < 1.8s | 1.8s - 3.0s | > 3.0s |
| TTI | < 3.8s | 3.8s - 7.3s | > 7.3s |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

## Common Issues and Solutions

### Issue: High FCP (> 1.8s)

**Possible causes:**
- Large JavaScript bundles
- Render-blocking resources
- Slow server response

**Solutions:**
- Implement code splitting
- Preload critical resources
- Optimize server response time
- Use CDN for static assets

### Issue: High TTI (> 3.8s)

**Possible causes:**
- Heavy JavaScript execution
- Long tasks blocking main thread
- Too many third-party scripts

**Solutions:**
- Defer non-critical JavaScript
- Break up long tasks
- Lazy load third-party scripts
- Use web workers for heavy computation

### Issue: High CLS (> 0.1)

**Possible causes:**
- Images without dimensions
- Ads or embeds without reserved space
- Fonts causing layout shift

**Solutions:**
- Set width/height on images
- Reserve space for dynamic content
- Use font-display: swap
- Ensure skeleton loaders match content dimensions

### Issue: Loading States Not Visible

**Possible causes:**
- Loading states not implemented
- Suspense fallbacks missing
- Network too fast to see loading states

**Solutions:**
- Implement all loading states
- Add Suspense fallbacks
- Test with slower network throttling
- Add minimum display time for loading states

## Reporting Template

After testing, document your findings:

```markdown
## Slow Network Testing Results

**Date**: 2026-02-21
**Tester**: [Your Name]
**Browser**: Chrome 120
**Network Profile**: Mobile 3G

### Automated Test Results

| Page | Performance Score | FCP | TTI | CLS | Status |
|------|-------------------|-----|-----|-----|--------|
| Home | 92/100 | 1.5s ✅ | 3.2s ✅ | 0.08 ✅ | PASSED |
| Jobs | 88/100 | 1.7s ✅ | 3.5s ✅ | 0.09 ✅ | PASSED |
| Courses | 90/100 | 1.6s ✅ | 3.4s ✅ | 0.07 ✅ | PASSED |
| Login | 95/100 | 1.2s ✅ | 2.8s ✅ | 0.05 ✅ | PASSED |

### Manual Test Results

#### Skeleton Loaders
- ✅ Job cards skeleton displays correctly
- ✅ Course cards skeleton displays correctly
- ✅ Profile page skeleton displays correctly
- ✅ Pulse animation is smooth
- ✅ No layout shifts observed

#### Progress Bar
- ✅ Appears at top during navigation
- ✅ Smooth animation
- ✅ Correct color
- ✅ No layout shift

#### Button Spinners
- ✅ Appears immediately on click
- ✅ Button disabled during loading
- ✅ Smooth rotation
- ✅ Returns to normal after completion

#### Overlay Spinner
- ✅ Full-screen overlay
- ✅ Centered spinner
- ✅ Smooth fade animations
- ✅ Blocks interaction correctly

#### Image Placeholders
- ✅ Placeholders appear immediately
- ✅ Smooth transition to loaded image
- ✅ No layout shifts
- ✅ Error states work

### Issues Found

None - all loading states work correctly on slow network.

### Recommendations

1. Consider adding a minimum display time for loading states to ensure they're visible even on fast connections
2. Add more detailed loading messages for long operations
3. Consider implementing progressive loading for large lists

### Overall Status

✅ **PASSED** - All loading states work correctly on slow network conditions.
```

## Next Steps

After completing the testing:

1. ✅ Mark task 8.6.6 as complete
2. ✅ Document any issues found
3. ✅ Create tickets for improvements
4. ✅ Share results with the team
5. ✅ Update documentation if needed

## References

- [Slow Network Testing Guide](./SLOW_NETWORK_TESTING_GUIDE.md) - Detailed manual testing guide
- [Chrome DevTools Network Throttling](https://developer.chrome.com/docs/devtools/network/reference/#throttling)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/vitals/#core-web-vitals)

## Conclusion

Testing loading states on slow network is crucial for ensuring a good user experience for all users, regardless of their connection speed. By combining automated and manual testing, we can verify that all loading states work correctly and meet performance targets.
