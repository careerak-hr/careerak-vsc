# Layout Shift Verification Guide (Task 8.6.7)

## Overview
This guide provides a comprehensive checklist for manually verifying that no layout shifts occur during loading states across the Careerak platform.

**Requirements:**
- **NFR-PERF-5**: CLS (Cumulative Layout Shift) must be under 0.1
- **FR-LOAD-8**: Multiple sections must coordinate loading states to prevent layout shifts
- **Property LOAD-5**: CLS(loadingState) < 0.1

**Target:** CLS < 0.1 (Good rating)

---

## 🎯 Verification Objectives

1. ✅ Verify all loading states maintain CLS < 0.1
2. ✅ Ensure skeleton loaders match content dimensions
3. ✅ Confirm reserved space prevents shifts
4. ✅ Validate smooth transitions without layout changes
5. ✅ Test coordinated loading across multiple sections
6. ✅ Verify image loading doesn't cause shifts
7. ✅ Confirm no shifts during data fetching

---

## 🛠️ Tools Available

### 1. CLS Measurement Utility
```javascript
// In browser console
window.clsLoadingMeasurement.init();
window.printCLSReport();
```

### 2. Chrome DevTools
- Performance tab → Record → Check "Layout Shift" events
- Lighthouse → Performance audit → CLS metric
- Performance Insights → Layout Shifts section

### 3. Web Vitals Extension
- Install: [Web Vitals Chrome Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
- Shows real-time CLS values

### 4. React DevTools Profiler
- Record component renders
- Check for unexpected re-renders during loading

---

## 📋 Verification Checklist

### Phase 1: Page-Level Verification

#### 1.1 Job Postings Page (09_JobPostingsPage)
- [ ] Initial page load CLS < 0.1
- [ ] Job cards skeleton matches actual card dimensions
- [ ] Filter panel loading doesn't shift content
- [ ] Pagination loading maintains layout
- [ ] Search results loading prevents shifts
- [ ] Empty state doesn't cause shift

**Test Steps:**
1. Open DevTools Performance tab
2. Navigate to Job Postings page
3. Record page load
4. Check Layout Shift events
5. Verify CLS < 0.1 in Lighthouse

**Expected Result:** CLS < 0.1, no visible content jumps

---

#### 1.2 Courses Page (11_CoursesPage)
- [ ] Course cards skeleton matches content
- [ ] Category filter loading stable
- [ ] Course details modal loading smooth
- [ ] Enrollment button loading doesn't shift
- [ ] Image loading uses placeholders

**Test Steps:**
1. Clear cache and reload
2. Observe skeleton → content transition
3. Measure CLS with Web Vitals extension
4. Click through different categories
5. Verify no shifts during transitions

**Expected Result:** CLS < 0.1, smooth transitions

---

#### 1.3 Profile Page (07_ProfilePage)
- [ ] Profile header skeleton matches layout
- [ ] Avatar loading uses placeholder
- [ ] Stats section loading coordinated
- [ ] Activity feed loading stable
- [ ] Edit mode transition smooth

**Test Steps:**
1. Navigate to profile page
2. Record CLS during initial load
3. Test avatar upload flow
4. Verify stats update without shift
5. Check edit mode transitions

**Expected Result:** CLS < 0.1, no jumps during updates

---

#### 1.4 Admin Dashboard (18_AdminDashboard)
- [ ] Dashboard widgets load without shifts
- [ ] Charts/graphs reserve space
- [ ] Tables use skeleton loaders
- [ ] Stats cards maintain dimensions
- [ ] Real-time updates don't shift layout

**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Measure CLS during widget loading
4. Test real-time data updates
5. Verify chart rendering stability

**Expected Result:** CLS < 0.1, stable dashboard layout

---

#### 1.5 Settings Page (14_SettingsPage)
- [ ] Settings sections load smoothly
- [ ] Form fields appear without shift
- [ ] Toggle switches stable
- [ ] Save button loading inline
- [ ] Success messages don't shift content

**Test Steps:**
1. Navigate to settings
2. Test each settings section
3. Verify form loading stability
4. Test save operations
5. Check notification positioning

**Expected Result:** CLS < 0.1, stable form layout

---

### Phase 2: Component-Level Verification

#### 2.1 Loading Components

##### SkeletonLoader Components
- [ ] SkeletonCard matches actual card dimensions
- [ ] SkeletonTable matches table layout
- [ ] SkeletonText matches text height
- [ ] SkeletonBox uses correct aspect ratio

**Test:**
```javascript
// Test skeleton dimensions
const skeleton = document.querySelector('.skeleton-card');
const content = document.querySelector('.actual-card');
console.log('Skeleton height:', skeleton.offsetHeight);
console.log('Content height:', content.offsetHeight);
// Should be within 5px
```

---

##### Progress Indicators
- [ ] ProgressBar doesn't shift page content
- [ ] ButtonSpinner maintains button dimensions
- [ ] OverlaySpinner uses fixed positioning
- [ ] DotsLoader inline with content

**Test:**
```javascript
// Measure button dimensions before/after loading
const button = document.querySelector('.loading-button');
const beforeHeight = button.offsetHeight;
button.classList.add('loading');
const afterHeight = button.offsetHeight;
console.log('Height change:', afterHeight - beforeHeight);
// Should be 0
```

---

##### Image Loading
- [ ] ImagePlaceholder reserves correct space
- [ ] LazyImage uses aspect ratio containers
- [ ] Blur-up effect doesn't shift
- [ ] Error state maintains dimensions

**Test:**
```javascript
// Test image container stability
const container = document.querySelector('.image-container');
const beforeHeight = container.offsetHeight;
// Wait for image load
setTimeout(() => {
  const afterHeight = container.offsetHeight;
  console.log('Height change:', afterHeight - beforeHeight);
  // Should be 0
}, 2000);
```

---

#### 2.2 Modal Components
- [ ] Modal opening doesn't shift background
- [ ] Modal content loading stable
- [ ] Modal closing restores layout
- [ ] Backdrop doesn't cause shifts

**Test Steps:**
1. Open various modals
2. Check background content stability
3. Verify modal content loading
4. Test close transitions
5. Measure CLS during modal lifecycle

**Expected Result:** CLS < 0.1, no background shifts

---

#### 2.3 List Components
- [ ] List items load with stagger animation
- [ ] Empty list state reserves space
- [ ] Infinite scroll doesn't shift
- [ ] List updates maintain positions

**Test:**
```javascript
// Test list stability
const list = document.querySelector('.job-list');
const items = list.querySelectorAll('.job-card');
const positions = Array.from(items).map(item => item.getBoundingClientRect().top);
// After update
setTimeout(() => {
  const newPositions = Array.from(items).map(item => item.getBoundingClientRect().top);
  const shifts = positions.map((pos, i) => Math.abs(pos - newPositions[i]));
  console.log('Max shift:', Math.max(...shifts));
  // Should be 0
}, 1000);
```

---

### Phase 3: Interaction-Based Verification

#### 3.1 Form Submissions
- [ ] Submit button loading inline
- [ ] Validation messages don't shift form
- [ ] Success/error messages positioned correctly
- [ ] Form reset maintains layout

**Test Steps:**
1. Fill out various forms
2. Submit and observe loading state
3. Check validation message positioning
4. Verify success/error message placement
5. Measure CLS during submission

**Expected Result:** CLS < 0.1, stable form layout

---

#### 3.2 Data Fetching
- [ ] API call loading shows skeleton
- [ ] Data update doesn't shift content
- [ ] Pagination maintains scroll position
- [ ] Filter changes smooth

**Test:**
```javascript
// Measure CLS during data fetch
const sessionId = window.startLoadingSession('DataFetch');
// Trigger data fetch
fetchData().then(() => {
  const result = window.endLoadingSession(sessionId);
  console.log('CLS during fetch:', result.clsDuringLoading);
  // Should be < 0.1
});
```

---

#### 3.3 Navigation
- [ ] Page transitions smooth
- [ ] Route changes don't shift
- [ ] Back button maintains scroll
- [ ] Tab switches stable

**Test Steps:**
1. Navigate between pages
2. Use browser back/forward
3. Test tab navigation
4. Verify scroll restoration
5. Measure CLS during navigation

**Expected Result:** CLS < 0.1, smooth navigation

---

### Phase 4: Edge Cases

#### 4.1 Slow Network (3G)
- [ ] Skeleton loaders appear immediately
- [ ] Content loads without shift
- [ ] Timeout states handled
- [ ] Retry doesn't cause shift

**Test:**
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Reload page
4. Observe loading behavior
5. Measure CLS

**Expected Result:** CLS < 0.1 even on slow network

---

#### 4.2 Large Content
- [ ] Long lists use virtual scrolling
- [ ] Large images use placeholders
- [ ] Heavy components lazy load
- [ ] Pagination prevents shifts

**Test:**
1. Load pages with 100+ items
2. Test large image galleries
3. Verify virtual scrolling
4. Check pagination behavior

**Expected Result:** CLS < 0.1 with large datasets

---

#### 4.3 Dynamic Content
- [ ] Real-time updates smooth
- [ ] Notifications don't shift page
- [ ] Live data updates stable
- [ ] WebSocket updates coordinated

**Test:**
1. Test notification system
2. Verify real-time data updates
3. Check live chat/messaging
4. Measure CLS during updates

**Expected Result:** CLS < 0.1 with dynamic updates

---

#### 4.4 Error States
- [ ] Error messages positioned correctly
- [ ] Retry button inline
- [ ] Error boundaries don't shift
- [ ] Fallback UI maintains layout

**Test:**
1. Trigger various errors
2. Check error message positioning
3. Test retry functionality
4. Verify fallback UI

**Expected Result:** CLS < 0.1 during error handling

---

## 🔍 Detailed Testing Procedures

### Procedure 1: Automated CLS Measurement

```javascript
// 1. Initialize CLS measurement
window.clsLoadingMeasurement.init();

// 2. Navigate to page and measure
const sessionId = window.startLoadingSession('PageName');

// 3. Wait for page to load
setTimeout(() => {
  const result = window.endLoadingSession(sessionId);
  console.log('CLS Result:', result);
  
  // 4. Check if passed
  if (result.passed) {
    console.log('✅ PASSED: CLS < 0.1');
  } else {
    console.log('❌ FAILED: CLS =', result.clsDuringLoading);
    console.log('Layout shifts:', result.shifts);
  }
}, 5000);

// 5. Print full report
window.printCLSReport();
```

---

### Procedure 2: Manual Visual Inspection

1. **Open page in Chrome DevTools**
   - F12 → Performance tab
   - Enable "Screenshots" and "Web Vitals"

2. **Record page load**
   - Click Record button
   - Reload page
   - Stop recording after load complete

3. **Analyze Layout Shifts**
   - Look for red "Layout Shift" markers
   - Click on each shift to see details
   - Identify elements causing shifts

4. **Verify CLS Score**
   - Check "Experience" section
   - Verify CLS < 0.1
   - Review shift sources

5. **Document Issues**
   - Screenshot problematic areas
   - Note element selectors
   - Record CLS values

---

### Procedure 3: Lighthouse Audit

1. **Run Lighthouse**
   - F12 → Lighthouse tab
   - Select "Performance" category
   - Click "Analyze page load"

2. **Check CLS Metric**
   - Scroll to "Cumulative Layout Shift"
   - Verify score is green (< 0.1)
   - Review "Avoid large layout shifts" section

3. **Review Diagnostics**
   - Check "Diagnostics" section
   - Look for layout shift warnings
   - Review element-specific issues

4. **Generate Report**
   - Save Lighthouse report
   - Document CLS score
   - Note any recommendations

---

### Procedure 4: Real User Monitoring

```javascript
// Add to production for real user CLS tracking
import { onCLS } from 'web-vitals';

onCLS((metric) => {
  // Send to analytics
  console.log('User CLS:', metric.value);
  
  // Track by page
  const page = window.location.pathname;
  
  // Log if exceeds threshold
  if (metric.value > 0.1) {
    console.warn(`High CLS on ${page}:`, metric.value);
    
    // Send to monitoring service
    // analytics.track('high_cls', { page, cls: metric.value });
  }
});
```

---

## 📊 Results Documentation

### Test Results Template

```markdown
## Layout Shift Verification Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Development/Staging/Production]

### Summary
- Total Pages Tested: X
- Pages Passed (CLS < 0.1): Y
- Pages Failed: Z
- Pass Rate: Y/X %

### Detailed Results

#### Page: [Page Name]
- **CLS Score:** 0.XXX
- **Status:** ✅ PASSED / ❌ FAILED
- **Loading Time:** XXXms
- **Layout Shifts:** X shifts detected
- **Issues:** [None / List issues]
- **Screenshots:** [Attach if issues found]

#### Component: [Component Name]
- **CLS Score:** 0.XXX
- **Status:** ✅ PASSED / ❌ FAILED
- **Skeleton Match:** ✅ YES / ❌ NO
- **Issues:** [None / List issues]

### Issues Found

1. **Issue:** [Description]
   - **Location:** [Page/Component]
   - **CLS Impact:** 0.XXX
   - **Root Cause:** [Analysis]
   - **Recommendation:** [Fix suggestion]

### Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

### Conclusion

[Overall assessment of layout shift prevention]
```

---

## 🐛 Common Issues and Fixes

### Issue 1: Skeleton Doesn't Match Content
**Symptom:** Content appears larger/smaller than skeleton
**Fix:**
```css
/* Ensure skeleton matches content dimensions */
.skeleton-card {
  min-height: 200px; /* Match actual card height */
  width: 100%;
}
```

---

### Issue 2: Images Cause Shifts
**Symptom:** Layout jumps when images load
**Fix:**
```jsx
// Use aspect ratio container
<div style={{ aspectRatio: '16/9', position: 'relative' }}>
  <img 
    src={src} 
    alt={alt}
    style={{ position: 'absolute', width: '100%', height: '100%' }}
  />
</div>
```

---

### Issue 3: Dynamic Content Shifts
**Symptom:** New content pushes existing content down
**Fix:**
```css
/* Reserve space before content loads */
.content-container {
  min-height: 500px; /* Reserve minimum space */
}
```

---

### Issue 4: Font Loading Shifts
**Symptom:** Text reflows when custom font loads
**Fix:**
```css
/* Use font-display: swap and size-adjust */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2');
  font-display: swap;
  size-adjust: 100%;
}
```

---

### Issue 5: Animations Cause Shifts
**Symptom:** Animations change layout
**Fix:**
```css
/* Use transform instead of position/size changes */
.animated-element {
  /* ❌ Bad: causes layout shift */
  /* animation: slideDown 300ms; */
  
  /* ✅ Good: GPU-accelerated, no shift */
  animation: fadeIn 300ms;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## ✅ Acceptance Criteria

### Must Pass:
1. ✅ All pages achieve CLS < 0.1
2. ✅ Skeleton loaders match content dimensions (±5px)
3. ✅ No visible content jumps during loading
4. ✅ Images use aspect ratio containers
5. ✅ Smooth transitions (200ms fade)
6. ✅ Coordinated loading prevents shifts
7. ✅ Lighthouse Performance score 90+

### Should Pass:
1. ✅ CLS < 0.05 on critical pages (home, jobs, profile)
2. ✅ Zero layout shifts on 3G network
3. ✅ Real user CLS monitoring < 0.1
4. ✅ No shifts during error states
5. ✅ Stable layout during dynamic updates

---

## 📈 Monitoring and Maintenance

### Continuous Monitoring
```javascript
// Add to production
import { onCLS } from 'web-vitals';

onCLS((metric) => {
  // Track CLS by page
  const page = window.location.pathname;
  
  // Send to analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: 'CLS',
      value: Math.round(metric.value * 1000),
      page: page,
      non_interaction: true,
    });
  }
  
  // Alert if threshold exceeded
  if (metric.value > 0.1) {
    console.warn(`High CLS detected on ${page}:`, metric.value);
  }
});
```

### Regular Audits
- Run Lighthouse weekly
- Review CLS trends monthly
- Test new features for CLS impact
- Update skeletons when layouts change

---

## 🎓 Best Practices Summary

1. **Always reserve space** with min-height before content loads
2. **Match skeleton dimensions** to actual content
3. **Use aspect ratio** for images and media
4. **Coordinate loading states** across multiple sections
5. **Use GPU-accelerated properties** (transform, opacity)
6. **Avoid animating** width, height, top, left
7. **Set explicit dimensions** on images
8. **Preload critical fonts** with font-display: swap
9. **Test on slow networks** (3G throttling)
10. **Monitor CLS** in production with real user data

---

## 📚 References

- [Web Vitals - CLS](https://web.dev/cls/)
- [Optimize CLS](https://web.dev/optimize-cls/)
- [Layout Shift Debugging](https://web.dev/debug-layout-shifts/)
- [NFR-PERF-5 Requirement](../specs/general-platform-enhancements/requirements.md#31-performance-nfr-perf)
- [Property LOAD-5](../specs/general-platform-enhancements/design.md#138-loading-state-properties)

---

## ✍️ Sign-off

**Verified by:** ___________________  
**Date:** ___________________  
**Status:** ✅ PASSED / ❌ FAILED / ⚠️ NEEDS IMPROVEMENT  
**Notes:** ___________________

---

**Last Updated:** 2026-02-21  
**Version:** 1.0  
**Task:** 8.6.7 - Verify no layout shifts occur
