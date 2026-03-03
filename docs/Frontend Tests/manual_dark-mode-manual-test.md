# Dark Mode Manual Testing Guide

**Task**: 9.6.1 Test dark mode toggle and persistence  
**Date**: 2026-02-22  
**Tester**: _____________  

## Overview
This document provides step-by-step instructions for manually testing the dark mode toggle and persistence functionality.

## Prerequisites
- [ ] Frontend application is running (`npm run dev`)
- [ ] Browser DevTools are open (F12)
- [ ] Clear browser cache and localStorage before starting

## Test Environment Setup

### Clear Previous State
1. Open Browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage: `localStorage.clear()`
4. Refresh the page (F5)

---

## Test Suite 1: Basic Toggle Functionality

### Test 1.1: Initial State Detection
**Objective**: Verify system preference is detected on first visit

**Steps**:
1. Clear localStorage
2. Set system to dark mode (OS settings)
3. Refresh the page
4. Observe the theme

**Expected Result**:
- [ ] Page loads in dark mode
- [ ] `localStorage.getItem('careerak-theme')` returns `'system'`
- [ ] Console shows no errors

**Actual Result**: _____________

---

### Test 1.2: Toggle from Light to Dark
**Objective**: Verify toggle changes theme from light to dark

**Steps**:
1. Set theme to light mode (if not already)
2. Locate the dark mode toggle button (usually in Navbar or Settings)
3. Click the toggle button
4. Observe the theme change

**Expected Result**:
- [ ] Theme changes to dark mode within 300ms
- [ ] Smooth transition animation is visible
- [ ] Background color changes to #1a1a1a
- [ ] Text color changes to #e0e0e0
- [ ] `localStorage.getItem('careerak-theme')` returns `'dark'`
- [ ] `document.documentElement.classList.contains('dark')` returns `true`

**Actual Result**: _____________

---

### Test 1.3: Toggle from Dark to System
**Objective**: Verify toggle changes theme from dark to system

**Steps**:
1. Set theme to dark mode
2. Click the toggle button
3. Observe the theme change

**Expected Result**:
- [ ] Theme changes to system preference
- [ ] `localStorage.getItem('careerak-theme')` returns `'system'`
- [ ] Theme matches OS dark mode setting

**Actual Result**: _____________

---

### Test 1.4: Toggle from System to Light
**Objective**: Verify toggle changes theme from system to light

**Steps**:
1. Set theme to system mode
2. Click the toggle button
3. Observe the theme change

**Expected Result**:
- [ ] Theme changes to light mode
- [ ] Background color changes to #E3DAD1
- [ ] Text color changes to #304B60
- [ ] `localStorage.getItem('careerak-theme')` returns `'light'`
- [ ] `document.documentElement.classList.contains('dark')` returns `false`

**Actual Result**: _____________

---

### Test 1.5: Complete Toggle Cycle
**Objective**: Verify full toggle cycle works correctly

**Steps**:
1. Set theme to light mode
2. Click toggle 3 times
3. Observe each transition

**Expected Result**:
- [ ] Click 1: Light → Dark
- [ ] Click 2: Dark → System
- [ ] Click 3: System → Light
- [ ] Returns to original light mode
- [ ] Each transition is smooth (300ms)

**Actual Result**: _____________

---

## Test Suite 2: Persistence

### Test 2.1: Persistence After Page Reload
**Objective**: Verify theme persists after page reload

**Steps**:
1. Set theme to dark mode
2. Verify `localStorage.getItem('careerak-theme')` returns `'dark'`
3. Reload the page (F5)
4. Observe the theme

**Expected Result**:
- [ ] Page loads in dark mode
- [ ] No flash of light theme (FOUC)
- [ ] `localStorage.getItem('careerak-theme')` still returns `'dark'`

**Actual Result**: _____________

---

### Test 2.2: Persistence After Browser Close
**Objective**: Verify theme persists after closing and reopening browser

**Steps**:
1. Set theme to dark mode
2. Close the browser completely
3. Reopen the browser
4. Navigate to the application
5. Observe the theme

**Expected Result**:
- [ ] Page loads in dark mode
- [ ] `localStorage.getItem('careerak-theme')` returns `'dark'`

**Actual Result**: _____________

---

### Test 2.3: Persistence Across Multiple Tabs
**Objective**: Verify theme is consistent across multiple tabs

**Steps**:
1. Open the application in Tab 1
2. Set theme to dark mode in Tab 1
3. Open the application in Tab 2
4. Observe the theme in Tab 2

**Expected Result**:
- [ ] Tab 2 loads in dark mode
- [ ] Both tabs show the same theme

**Actual Result**: _____________

---

### Test 2.4: Persistence After Multiple Changes
**Objective**: Verify persistence works after rapid theme changes

**Steps**:
1. Toggle theme 5 times rapidly
2. Wait 1 second
3. Reload the page
4. Observe the theme

**Expected Result**:
- [ ] Page loads with the last selected theme
- [ ] No errors in console
- [ ] localStorage has correct value

**Actual Result**: _____________

---

## Test Suite 3: System Preference Detection

### Test 3.1: System Preference Override
**Objective**: Verify user preference overrides system preference

**Steps**:
1. Set OS to dark mode
2. Clear localStorage
3. Refresh page (should load in dark mode)
4. Toggle to light mode
5. Observe the theme

**Expected Result**:
- [ ] Theme changes to light mode despite OS being dark
- [ ] `localStorage.getItem('careerak-theme')` returns `'light'`
- [ ] User preference takes precedence

**Actual Result**: _____________

---

### Test 3.2: System Preference Change Detection
**Objective**: Verify app detects OS theme changes when in system mode

**Steps**:
1. Set theme to system mode
2. Change OS theme from light to dark (or vice versa)
3. Observe the application theme

**Expected Result**:
- [ ] Application theme updates automatically
- [ ] No page reload required
- [ ] Transition is smooth

**Actual Result**: _____________

---

### Test 3.3: System Mode with Dark OS
**Objective**: Verify system mode applies dark theme when OS is dark

**Steps**:
1. Set OS to dark mode
2. Set application theme to system
3. Observe the theme

**Expected Result**:
- [ ] Application displays in dark mode
- [ ] `localStorage.getItem('careerak-theme')` returns `'system'`
- [ ] Theme matches OS setting

**Actual Result**: _____________

---

## Test Suite 4: Visual Consistency

### Test 4.1: All Pages Support Dark Mode
**Objective**: Verify all pages render correctly in dark mode

**Pages to Test**:
- [ ] Home/Landing Page
- [ ] Login Page
- [ ] Registration Page
- [ ] Profile Page
- [ ] Job Postings Page
- [ ] Courses Page
- [ ] Settings Page
- [ ] Admin Dashboard

**For Each Page**:
1. Navigate to the page
2. Toggle to dark mode
3. Check for visual issues

**Expected Result**:
- [ ] All text is readable (good contrast)
- [ ] All images are visible
- [ ] No white flashes or artifacts
- [ ] Buttons and inputs are styled correctly
- [ ] Modals and dropdowns work in dark mode

**Actual Result**: _____________

---

### Test 4.2: Input Border Color Invariant
**Objective**: Verify input borders remain #D4816180 in both modes

**Steps**:
1. Navigate to a page with input fields (Login, Registration, Settings)
2. Toggle between light and dark mode
3. Inspect input border color using DevTools

**Expected Result**:
- [ ] Input border color is #D4816180 in light mode
- [ ] Input border color is #D4816180 in dark mode
- [ ] Border color NEVER changes
- [ ] Border color is consistent on focus, hover, and active states

**Actual Result**: _____________

---

### Test 4.3: Transition Smoothness
**Objective**: Verify theme transitions are smooth (300ms)

**Steps**:
1. Toggle theme multiple times
2. Observe the transition animation
3. Use DevTools Performance tab to measure

**Expected Result**:
- [ ] Transition duration is approximately 300ms
- [ ] No jarring color changes
- [ ] Smooth fade effect
- [ ] No layout shifts during transition

**Actual Result**: _____________

---

## Test Suite 5: Edge Cases

### Test 5.1: Rapid Toggle Clicks
**Objective**: Verify app handles rapid toggle clicks gracefully

**Steps**:
1. Click toggle button 10 times rapidly
2. Observe the behavior
3. Check console for errors

**Expected Result**:
- [ ] App handles rapid clicks without crashing
- [ ] Final theme is consistent
- [ ] No console errors
- [ ] localStorage has valid value

**Actual Result**: _____________

---

### Test 5.2: Invalid localStorage Value
**Objective**: Verify app handles corrupted localStorage gracefully

**Steps**:
1. Open DevTools Console
2. Run: `localStorage.setItem('careerak-theme', 'invalid')`
3. Refresh the page
4. Observe the behavior

**Expected Result**:
- [ ] App defaults to 'system' mode
- [ ] No errors in console
- [ ] Theme is functional

**Actual Result**: _____________

---

### Test 5.3: Missing localStorage
**Objective**: Verify app works when localStorage is unavailable

**Steps**:
1. Open DevTools
2. Disable localStorage (Application > Storage > Block)
3. Refresh the page
4. Try toggling theme

**Expected Result**:
- [ ] App loads without crashing
- [ ] Theme toggle still works (in memory)
- [ ] No console errors
- [ ] Graceful degradation

**Actual Result**: _____________

---

### Test 5.4: Missing matchMedia Support
**Objective**: Verify app works in browsers without matchMedia

**Steps**:
1. Open DevTools Console
2. Run: `delete window.matchMedia`
3. Refresh the page
4. Observe the behavior

**Expected Result**:
- [ ] App loads without crashing
- [ ] Defaults to light mode
- [ ] Toggle still works
- [ ] No console errors

**Actual Result**: _____________

---

## Test Suite 6: Performance

### Test 6.1: Initial Load Performance
**Objective**: Verify dark mode doesn't impact initial load time

**Steps**:
1. Open DevTools Performance tab
2. Clear cache
3. Reload page with dark mode
4. Measure load time

**Expected Result**:
- [ ] No significant performance impact
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] Theme applies before first paint

**Actual Result**: _____________

---

### Test 6.2: Toggle Performance
**Objective**: Verify toggle is responsive and fast

**Steps**:
1. Open DevTools Performance tab
2. Start recording
3. Toggle theme
4. Stop recording
5. Analyze the timeline

**Expected Result**:
- [ ] Toggle completes within 300ms
- [ ] No layout thrashing
- [ ] Smooth 60fps animation
- [ ] No memory leaks

**Actual Result**: _____________

---

## Test Suite 7: Accessibility

### Test 7.1: Keyboard Navigation
**Objective**: Verify toggle is accessible via keyboard

**Steps**:
1. Use Tab key to navigate to toggle button
2. Press Enter or Space to toggle
3. Observe the behavior

**Expected Result**:
- [ ] Toggle button is focusable
- [ ] Visible focus indicator
- [ ] Enter/Space activates toggle
- [ ] Theme changes correctly

**Actual Result**: _____________

---

### Test 7.2: Screen Reader Compatibility
**Objective**: Verify toggle is announced correctly to screen readers

**Steps**:
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate to toggle button
3. Listen to the announcement
4. Activate the toggle
5. Listen to the state change announcement

**Expected Result**:
- [ ] Button is announced with clear label
- [ ] Current theme state is announced
- [ ] State change is announced after toggle
- [ ] ARIA attributes are correct

**Actual Result**: _____________

---

### Test 7.3: Color Contrast in Dark Mode
**Objective**: Verify text contrast meets WCAG AA standards

**Steps**:
1. Enable dark mode
2. Use browser extension or DevTools to check contrast
3. Test on multiple pages

**Expected Result**:
- [ ] Normal text: contrast ratio ≥ 4.5:1
- [ ] Large text: contrast ratio ≥ 3:1
- [ ] All text is readable
- [ ] No accessibility warnings

**Actual Result**: _____________

---

## Test Suite 8: Cross-Browser Testing

### Test 8.1: Chrome
**Browser Version**: _____________

- [ ] Toggle works
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No console errors

**Notes**: _____________

---

### Test 8.2: Firefox
**Browser Version**: _____________

- [ ] Toggle works
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No console errors

**Notes**: _____________

---

### Test 8.3: Safari
**Browser Version**: _____________

- [ ] Toggle works
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No console errors

**Notes**: _____________

---

### Test 8.4: Edge
**Browser Version**: _____________

- [ ] Toggle works
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No console errors

**Notes**: _____________

---

## Test Suite 9: Mobile Testing

### Test 9.1: Mobile Chrome (Android)
**Device**: _____________

- [ ] Toggle works on touch
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No layout issues

**Notes**: _____________

---

### Test 9.2: Mobile Safari (iOS)
**Device**: _____________

- [ ] Toggle works on touch
- [ ] Persistence works
- [ ] Transitions are smooth
- [ ] No layout issues

**Notes**: _____________

---

## Summary

### Test Results
- **Total Tests**: 30+
- **Passed**: _____
- **Failed**: _____
- **Skipped**: _____

### Critical Issues Found
1. _____________
2. _____________
3. _____________

### Minor Issues Found
1. _____________
2. _____________
3. _____________

### Recommendations
1. _____________
2. _____________
3. _____________

### Sign-off
- [ ] All critical tests passed
- [ ] All issues documented
- [ ] Ready for production

**Tester Name**: _____________  
**Date**: _____________  
**Signature**: _____________

---

## Automated Test Verification

Before manual testing, verify automated tests pass:

```bash
cd frontend
npm test -- ThemeContext.unit.test.js --run
npm test -- ThemeContext.property.test.js --run
```

**Automated Test Results**:
- [ ] Unit tests: PASSED
- [ ] Property-based tests: PASSED

---

## Quick Verification Checklist

For quick verification, use this abbreviated checklist:

- [ ] Toggle changes theme (light → dark → system → light)
- [ ] Theme persists after page reload
- [ ] System preference is detected
- [ ] All pages support dark mode
- [ ] Input borders remain #D4816180
- [ ] Transitions are smooth (300ms)
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Keyboard accessible
- [ ] Screen reader compatible

---

## Notes

Use this space for additional observations:

_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
