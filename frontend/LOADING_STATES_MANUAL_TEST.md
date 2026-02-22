# Loading States Manual Testing Guide

## Overview
This document provides a comprehensive manual testing checklist for all loading states in the Careerak platform.

## Test Environment Setup

### 1. Network Throttling
To properly test loading states, simulate slow network conditions:

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Select throttling: "Slow 3G" or "Fast 3G"
4. Disable cache (check "Disable cache")

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click throttling dropdown
4. Select "GPRS" or "Regular 3G"

### 2. Test User Accounts
- **Job Seeker**: Use test account with profile data
- **Company**: Use test account with posted jobs
- **Admin**: Use admin01 / admin123

---

## Loading State Components to Test

### 1. Skeleton Loaders

#### 1.1 Job Card Skeleton
**Location**: Job Postings Page, Home Page  
**Component**: `JobCardSkeleton.jsx`

**Test Steps:**
1. Navigate to `/jobs` page
2. Clear browser cache
3. Refresh page with Slow 3G throttling
4. ✅ Verify skeleton cards appear immediately
5. ✅ Verify skeleton has pulse animation
6. ✅ Verify skeleton matches job card layout (image, title, company, location)
7. ✅ Verify smooth transition when real data loads (200ms fade)
8. ✅ Verify no layout shift (CLS < 0.1)

**Expected Behavior:**
- Skeleton appears within 100ms
- Pulse animation is smooth
- Layout matches actual job cards
- Transition is smooth without jumps

#### 1.2 Course Card Skeleton
**Location**: Courses Page  
**Component**: `CourseCardSkeleton.jsx`

**Test Steps:**
1. Navigate to `/courses` page
2. Clear browser cache
3. Refresh with Slow 3G throttling
4. ✅ Verify skeleton cards appear immediately
5. ✅ Verify skeleton matches course card layout
6. ✅ Verify pulse animation
7. ✅ Verify smooth transition to real content

#### 1.3 Profile Skeleton
**Location**: Profile Page  
**Component**: `ProfileSkeleton.jsx`

**Test Steps:**
1. Navigate to `/profile` page
2. Clear browser cache
3. Refresh with Slow 3G throttling
4. ✅ Verify profile skeleton appears (avatar, name, bio sections)
5. ✅ Verify skeleton matches profile layout
6. ✅ Verify pulse animation
7. ✅ Verify smooth transition

#### 1.4 Table Skeleton
**Location**: Admin Dashboard, Applications Page  
**Component**: `TableSkeleton.jsx`

**Test Steps:**
1. Navigate to admin dashboard or applications page
2. Clear browser cache
3. Refresh with Slow 3G throttling
4. ✅ Verify table skeleton with rows and columns
5. ✅ Verify pulse animation
6. ✅ Verify matches table layout

---

### 2. Progress Indicators

#### 2.1 Progress Bar (Top of Page)
**Location**: All pages during navigation  
**Component**: `ProgressBar.jsx`, `RouteProgressBar.jsx`

**Test Steps:**
1. Navigate between pages with Slow 3G
2. ✅ Verify progress bar appears at top of page
3. ✅ Verify bar color matches theme (Primary #304B60)
4. ✅ Verify smooth animation from 0% to 100%
5. ✅ Verify bar disappears after page loads
6. ✅ Verify ARIA attributes (role="progressbar", aria-valuenow)

**Expected Behavior:**
- Bar appears within 100ms of navigation
- Smooth progress animation
- Disappears smoothly after completion

#### 2.2 Button Spinner
**Location**: All forms, action buttons  
**Component**: `ButtonSpinner.jsx`

**Test Steps:**
1. **Login Form:**
   - Enter credentials
   - Click "Login" button
   - ✅ Verify spinner appears inside button
   - ✅ Verify button is disabled during loading
   - ✅ Verify button text changes or spinner replaces text
   - ✅ Verify ARIA label announces loading state

2. **Job Application:**
   - Click "Apply" button
   - ✅ Verify spinner in button
   - ✅ Verify button disabled
   - ✅ Verify smooth transition

3. **Profile Update:**
   - Edit profile
   - Click "Save" button
   - ✅ Verify spinner appears
   - ✅ Verify button disabled

**Expected Behavior:**
- Spinner appears immediately on click
- Button is disabled (no double-submit)
- Spinner is visible and animated
- Screen reader announces loading state

#### 2.3 Overlay Spinner
**Location**: File uploads, heavy operations  
**Component**: `OverlaySpinner.jsx`

**Test Steps:**
1. **Profile Picture Upload:**
   - Click upload button
   - Select large image (>2MB)
   - ✅ Verify overlay appears with backdrop
   - ✅ Verify centered spinner
   - ✅ Verify loading message displayed
   - ✅ Verify backdrop prevents interaction
   - ✅ Verify ARIA live region announces message

2. **Document Upload:**
   - Upload CV/resume
   - ✅ Verify overlay spinner
   - ✅ Verify progress message

**Expected Behavior:**
- Overlay appears immediately
- Backdrop prevents clicks
- Spinner is centered and visible
- Message is clear and helpful

---

### 3. Image Loading States

#### 3.1 LazyImage Component
**Location**: All pages with images  
**Component**: `LazyImage.jsx`

**Test Steps:**
1. Navigate to page with many images (Jobs, Courses)
2. Scroll slowly with Slow 3G
3. ✅ Verify placeholder appears before image loads
4. ✅ Verify blur-up effect (blurred placeholder → sharp image)
5. ✅ Verify images load only when entering viewport
6. ✅ Verify smooth fade-in transition
7. ✅ Verify no layout shift

**Expected Behavior:**
- Placeholder appears immediately
- Images load only when visible
- Smooth blur-up transition
- No jumping or layout shifts

#### 3.2 Image Placeholder
**Location**: Profile pictures, company logos  
**Component**: `ImagePlaceholder.jsx`

**Test Steps:**
1. View profiles with images
2. ✅ Verify placeholder with loading animation
3. ✅ Verify fallback for failed images
4. ✅ Verify alt text is present

---

### 4. Suspense Fallbacks

#### 4.1 Route-Level Suspense
**Location**: All lazy-loaded routes  
**Component**: `RouteSuspenseFallback.jsx`

**Test Steps:**
1. Clear browser cache
2. Navigate to different routes with Slow 3G
3. ✅ Verify full-page skeleton appears
4. ✅ Verify skeleton matches page layout
5. ✅ Verify smooth transition to actual page
6. ✅ Verify no flash of unstyled content

**Routes to Test:**
- `/jobs`
- `/courses`
- `/profile`
- `/settings`
- `/admin`

#### 4.2 Component-Level Suspense
**Location**: Lazy-loaded components  
**Component**: `ComponentSuspenseFallback.jsx`

**Test Steps:**
1. Navigate to pages with lazy components
2. ✅ Verify component-specific skeleton
3. ✅ Verify rest of page remains functional
4. ✅ Verify smooth component load

---

### 5. Coordinated Loading States

#### 5.1 Multiple Sections Loading
**Location**: Dashboard, Profile Page  
**Component**: `LoadingCoordinator.jsx`

**Test Steps:**
1. Navigate to dashboard with Slow 3G
2. ✅ Verify multiple sections show skeletons
3. ✅ Verify sections load independently
4. ✅ Verify no layout shifts between sections
5. ✅ Verify smooth transitions

**Expected Behavior:**
- All sections show appropriate skeletons
- Sections can load at different times
- No cumulative layout shift
- Smooth, coordinated transitions

---

## Accessibility Testing

### Screen Reader Testing

**Test with NVDA (Windows) or VoiceOver (Mac):**

1. **Loading Announcements:**
   - ✅ Verify loading states are announced
   - ✅ Verify aria-live regions work
   - ✅ Verify progress updates are announced

2. **Button States:**
   - ✅ Verify disabled state is announced
   - ✅ Verify loading state is announced
   - ✅ Verify completion is announced

3. **Progress Indicators:**
   - ✅ Verify progress percentage is announced
   - ✅ Verify completion is announced

### Keyboard Navigation

1. **During Loading:**
   - ✅ Verify focus is managed correctly
   - ✅ Verify buttons are not focusable when disabled
   - ✅ Verify no keyboard traps

---

## Performance Testing

### 1. Timing Verification

**Test with DevTools Performance tab:**

1. Record page load
2. ✅ Verify skeleton appears within 100ms
3. ✅ Verify transitions are 200ms
4. ✅ Verify no long tasks during loading

### 2. Layout Stability (CLS)

**Test with Lighthouse:**

1. Run Lighthouse audit
2. ✅ Verify CLS < 0.1
3. ✅ Verify no layout shifts during loading
4. ✅ Verify skeleton dimensions match content

---

## Dark Mode Testing

### Test All Loading States in Dark Mode

1. Enable dark mode in settings
2. Repeat all tests above
3. ✅ Verify skeleton colors are appropriate for dark mode
4. ✅ Verify spinner colors are visible
5. ✅ Verify progress bar is visible
6. ✅ Verify overlay backdrop is appropriate

**Expected Colors (Dark Mode):**
- Skeleton: bg-gray-700 with pulse
- Spinner: text-gray-300
- Progress bar: Primary color
- Overlay backdrop: rgba(0, 0, 0, 0.7)

---

## Mobile Testing

### Test on Mobile Devices

**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

**Test Steps:**
1. Enable mobile network throttling (3G)
2. Test all loading states
3. ✅ Verify touch interactions work during loading
4. ✅ Verify loading states are visible on small screens
5. ✅ Verify no horizontal scroll during loading
6. ✅ Verify skeleton layouts are responsive

---

## Edge Cases and Error Scenarios

### 1. Very Slow Network
**Test with "Slow 3G" or offline:**
- ✅ Verify loading states persist appropriately
- ✅ Verify timeout handling
- ✅ Verify error states after timeout

### 2. Failed Loads
**Test with network errors:**
- ✅ Verify error message replaces loading state
- ✅ Verify retry button is available
- ✅ Verify error is announced to screen readers

### 3. Rapid Navigation
**Test quick page changes:**
- ✅ Verify loading states cancel properly
- ✅ Verify no orphaned loading indicators
- ✅ Verify no memory leaks

### 4. Multiple Simultaneous Loads
**Test concurrent operations:**
- ✅ Verify multiple loading states coexist
- ✅ Verify no conflicts
- ✅ Verify proper cleanup

---

## Browser Compatibility

### Test in Multiple Browsers

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Chrome Mobile
- ✅ Safari iOS

**For Each Browser:**
1. Test skeleton loaders
2. Test progress indicators
3. Test image loading
4. Test animations
5. Verify no console errors

---

## Checklist Summary

### Critical Tests (Must Pass)
- [ ] Skeleton loaders appear within 100ms
- [ ] Skeletons match content layout
- [ ] Smooth transitions (200ms fade)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Button spinners disable buttons
- [ ] Progress bar shows during navigation
- [ ] Overlay spinner blocks interaction
- [ ] Images lazy load correctly
- [ ] Screen reader announcements work
- [ ] Dark mode loading states work
- [ ] Mobile loading states work

### Performance Targets
- [ ] First skeleton render: < 100ms
- [ ] Transition duration: 200ms
- [ ] CLS: < 0.1
- [ ] No long tasks during loading
- [ ] Smooth 60fps animations

### Accessibility Targets
- [ ] All loading states announced
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Color contrast sufficient

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

## Skeleton Loaders
- Job Cards: [ ] Pass [ ] Fail - Notes: ___________
- Course Cards: [ ] Pass [ ] Fail - Notes: ___________
- Profile: [ ] Pass [ ] Fail - Notes: ___________
- Tables: [ ] Pass [ ] Fail - Notes: ___________

## Progress Indicators
- Progress Bar: [ ] Pass [ ] Fail - Notes: ___________
- Button Spinner: [ ] Pass [ ] Fail - Notes: ___________
- Overlay Spinner: [ ] Pass [ ] Fail - Notes: ___________

## Image Loading
- LazyImage: [ ] Pass [ ] Fail - Notes: ___________
- Placeholders: [ ] Pass [ ] Fail - Notes: ___________

## Suspense Fallbacks
- Route-Level: [ ] Pass [ ] Fail - Notes: ___________
- Component-Level: [ ] Pass [ ] Fail - Notes: ___________

## Accessibility
- Screen Reader: [ ] Pass [ ] Fail - Notes: ___________
- Keyboard Nav: [ ] Pass [ ] Fail - Notes: ___________

## Performance
- CLS: _____ (target: < 0.1)
- Skeleton Render: _____ ms (target: < 100ms)
- Transition: _____ ms (target: 200ms)

## Issues Found
1. ___________
2. ___________
3. ___________

## Overall Result: [ ] Pass [ ] Fail
```

---

## Notes

- This is a **manual testing guide** - automated tests exist separately
- Focus on user experience and visual verification
- Test on real devices when possible
- Document any issues with screenshots
- Retest after fixes

---

## References

- Requirements: FR-LOAD-1 through FR-LOAD-8
- Design: Section 9 (Loading States Design)
- Components: `frontend/src/components/Loading/`
- Skeletons: `frontend/src/components/SkeletonLoaders/`
