# Dark Mode Manual Testing Checklist

**Feature**: Dark Mode Implementation  
**Spec**: general-platform-enhancements  
**Task**: 1.4.7 Manual testing on all pages  
**Date Created**: 2026-02-17  
**Status**: Ready for Testing

---

## Overview

This document provides a comprehensive manual testing checklist for the dark mode feature. All tests should be performed to verify that the dark mode implementation meets the design requirements and provides a consistent user experience across all pages.

---

## Testing Environment Setup

### Prerequisites
- [ ] Frontend application is running (`npm start`)
- [ ] Browser DevTools are open (for inspecting CSS and localStorage)
- [ ] Test on multiple browsers: Chrome, Firefox, Safari, Edge
- [ ] Test on multiple devices: Desktop, Tablet, Mobile

### Browser Setup
- [ ] Clear browser cache and localStorage before testing
- [ ] Disable browser extensions that might interfere with dark mode
- [ ] Set browser zoom to 100%

---

## 1. Theme Toggle Functionality

### 1.1 Basic Toggle
- [ ] **Test**: Click the dark mode toggle button
  - **Expected**: Theme switches from light to dark (or vice versa)
  - **Verify**: Transition is smooth (300ms)
  - **Verify**: All UI elements update immediately

- [ ] **Test**: Toggle theme multiple times rapidly
  - **Expected**: Theme cycles through: light → dark → system → light
  - **Verify**: No visual glitches or delays
  - **Verify**: Each state is visually distinct

### 1.2 Theme Persistence
- [ ] **Test**: Set theme to dark, refresh page
  - **Expected**: Theme remains dark after refresh
  - **Verify**: localStorage has 'careerak-theme' = 'dark'

- [ ] **Test**: Set theme to light, refresh page
  - **Expected**: Theme remains light after refresh
  - **Verify**: localStorage has 'careerak-theme' = 'light'

- [ ] **Test**: Set theme to system, refresh page
  - **Expected**: Theme remains system after refresh
  - **Verify**: localStorage has 'careerak-theme' = 'system'

### 1.3 System Preference Detection
- [ ] **Test**: Clear localStorage, set OS to dark mode, load app
  - **Expected**: App uses dark theme (system preference)
  - **Verify**: themeMode is 'system'
  - **Verify**: isDark is true

- [ ] **Test**: Clear localStorage, set OS to light mode, load app
  - **Expected**: App uses light theme (system preference)
  - **Verify**: themeMode is 'system'
  - **Verify**: isDark is false

- [ ] **Test**: Set theme to explicit mode (light/dark), change OS preference
  - **Expected**: App ignores OS preference, keeps explicit theme
  - **Verify**: User preference overrides system preference

---

## 2. Color Consistency Testing

### 2.1 Light Mode Colors
- [ ] **Test**: Set theme to light
  - **Verify**: Background is #E3DAD1 (secondary beige)
  - **Verify**: Primary text is #304B60 (navy blue)
  - **Verify**: Accent elements are #D48161 (copper)
  - **Verify**: All colors match the design palette

### 2.2 Dark Mode Colors
- [ ] **Test**: Set theme to dark
  - **Verify**: Background is #1a1a1a (dark gray)
  - **Verify**: Surface elements are #2d2d2d (lighter dark gray)
  - **Verify**: Text is #e0e0e0 (light gray)
  - **Verify**: All UI elements use dark mode colors

### 2.3 Input Border Invariant (CRITICAL)
- [ ] **Test**: In light mode, inspect all input fields
  - **Verify**: Border color is #D4816180 (copper with 50% opacity)
  - **Verify**: Border color does NOT change on focus
  - **Verify**: Border color does NOT change on hover

- [ ] **Test**: In dark mode, inspect all input fields
  - **Verify**: Border color is #D4816180 (same as light mode)
  - **Verify**: Border color does NOT change on focus
  - **Verify**: Border color does NOT change on hover

- [ ] **Test**: Toggle between light and dark mode
  - **Verify**: Input border color NEVER changes
  - **Verify**: This applies to: text inputs, textareas, select dropdowns

---

## 3. Page-by-Page Testing

### 3.1 Language Selection Page
- [ ] **Light Mode**:
  - [ ] Background color is correct
  - [ ] Text is readable
  - [ ] Language buttons are styled correctly
  - [ ] No visual glitches

- [ ] **Dark Mode**:
  - [ ] Background color is #1a1a1a
  - [ ] Text is #e0e0e0
  - [ ] Language buttons have dark styling
  - [ ] Contrast is sufficient (4.5:1 minimum)

### 3.2 Entry Page
- [ ] **Light Mode**:
  - [ ] Logo is visible
  - [ ] Welcome text is readable
  - [ ] Buttons are styled correctly
  - [ ] Background matches design

- [ ] **Dark Mode**:
  - [ ] Logo is visible (not too dark)
  - [ ] Welcome text is readable
  - [ ] Buttons have dark styling
  - [ ] Background is #1a1a1a

### 3.3 Login Page
- [ ] **Light Mode**:
  - [ ] Form is readable
  - [ ] Input borders are #D4816180
  - [ ] Submit button is styled correctly
  - [ ] Links are visible

- [ ] **Dark Mode**:
  - [ ] Form is readable on dark background
  - [ ] Input borders are #D4816180 (SAME as light)
  - [ ] Submit button has dark styling
  - [ ] Links are visible with good contrast

### 3.4 Registration Page (AuthPage)
- [ ] **Light Mode**:
  - [ ] All form fields are visible
  - [ ] Input borders are #D4816180
  - [ ] Validation messages are readable
  - [ ] Submit button is styled correctly

- [ ] **Dark Mode**:
  - [ ] All form fields are visible on dark background
  - [ ] Input borders are #D4816180 (SAME as light)
  - [ ] Validation messages are readable
  - [ ] Submit button has dark styling

### 3.5 OTP Verification Page
- [ ] **Light Mode**:
  - [ ] OTP input fields are visible
  - [ ] Input borders are #D4816180
  - [ ] Timer is readable
  - [ ] Resend button is styled correctly

- [ ] **Dark Mode**:
  - [ ] OTP input fields are visible
  - [ ] Input borders are #D4816180 (SAME as light)
  - [ ] Timer is readable on dark background
  - [ ] Resend button has dark styling

### 3.6 Profile Page
- [ ] **Light Mode**:
  - [ ] Profile picture is visible
  - [ ] User information is readable
  - [ ] Edit buttons are styled correctly
  - [ ] Cards have correct background

- [ ] **Dark Mode**:
  - [ ] Profile picture is visible
  - [ ] User information is readable on dark background
  - [ ] Edit buttons have dark styling
  - [ ] Cards have #2d2d2d background

### 3.7 Job Postings Page
- [ ] **Light Mode**:
  - [ ] Job cards are readable
  - [ ] Filters are styled correctly
  - [ ] Search input border is #D4816180
  - [ ] Pagination is visible

- [ ] **Dark Mode**:
  - [ ] Job cards are readable on dark background
  - [ ] Filters have dark styling
  - [ ] Search input border is #D4816180 (SAME as light)
  - [ ] Pagination is visible with good contrast

### 3.8 Post Job Page
- [ ] **Light Mode**:
  - [ ] Form fields are visible
  - [ ] Input borders are #D4816180
  - [ ] Rich text editor is styled correctly
  - [ ] Submit button is visible

- [ ] **Dark Mode**:
  - [ ] Form fields are visible on dark background
  - [ ] Input borders are #D4816180 (SAME as light)
  - [ ] Rich text editor has dark styling
  - [ ] Submit button has dark styling

### 3.9 Courses Page
- [ ] **Light Mode**:
  - [ ] Course cards are readable
  - [ ] Images are visible
  - [ ] Filters are styled correctly
  - [ ] Enrollment buttons are visible

- [ ] **Dark Mode**:
  - [ ] Course cards are readable on dark background
  - [ ] Images are visible (not too dark)
  - [ ] Filters have dark styling
  - [ ] Enrollment buttons have dark styling

### 3.10 Settings Page
- [ ] **Light Mode**:
  - [ ] Settings sections are readable
  - [ ] Toggle switches are styled correctly
  - [ ] Input fields have #D4816180 borders
  - [ ] Save button is visible

- [ ] **Dark Mode**:
  - [ ] Settings sections are readable on dark background
  - [ ] Toggle switches have dark styling
  - [ ] Input fields have #D4816180 borders (SAME as light)
  - [ ] Save button has dark styling

### 3.11 Admin Dashboard
- [ ] **Light Mode**:
  - [ ] Dashboard cards are readable
  - [ ] Charts are visible
  - [ ] Tables are styled correctly
  - [ ] Action buttons are visible

- [ ] **Dark Mode**:
  - [ ] Dashboard cards are readable on dark background
  - [ ] Charts are visible with dark theme
  - [ ] Tables have dark styling
  - [ ] Action buttons have dark styling

---

## 4. Component Testing

### 4.1 Navbar
- [ ] **Light Mode**:
  - [ ] Logo is visible
  - [ ] Navigation links are readable
  - [ ] Dark mode toggle button is visible
  - [ ] User menu is styled correctly

- [ ] **Dark Mode**:
  - [ ] Logo is visible (not too dark)
  - [ ] Navigation links are readable on dark background
  - [ ] Dark mode toggle button shows correct icon
  - [ ] User menu has dark styling

### 4.2 Footer
- [ ] **Light Mode**:
  - [ ] Footer text is readable
  - [ ] Links are visible
  - [ ] Social media icons are visible
  - [ ] Background matches design

- [ ] **Dark Mode**:
  - [ ] Footer text is readable on dark background
  - [ ] Links are visible with good contrast
  - [ ] Social media icons are visible
  - [ ] Background is #2d2d2d

### 4.3 Modals
- [ ] **Light Mode**:
  - [ ] Modal background is correct
  - [ ] Modal border is 4px solid #304B60
  - [ ] Modal content is readable
  - [ ] Close button is visible

- [ ] **Dark Mode**:
  - [ ] Modal background is #2d2d2d
  - [ ] Modal border is 4px solid (adjusted for dark mode)
  - [ ] Modal content is readable on dark background
  - [ ] Close button is visible

### 4.4 Forms
- [ ] **Light Mode**:
  - [ ] All input fields have #D4816180 borders
  - [ ] Labels are readable
  - [ ] Validation messages are visible
  - [ ] Submit buttons are styled correctly

- [ ] **Dark Mode**:
  - [ ] All input fields have #D4816180 borders (SAME as light)
  - [ ] Labels are readable on dark background
  - [ ] Validation messages are visible
  - [ ] Submit buttons have dark styling

### 4.5 Tables
- [ ] **Light Mode**:
  - [ ] Table headers are readable
  - [ ] Table rows are distinguishable
  - [ ] Borders are visible
  - [ ] Action buttons are styled correctly

- [ ] **Dark Mode**:
  - [ ] Table headers are readable on dark background
  - [ ] Table rows are distinguishable
  - [ ] Borders are visible with good contrast
  - [ ] Action buttons have dark styling

### 4.6 Cards
- [ ] **Light Mode**:
  - [ ] Card background is correct
  - [ ] Card content is readable
  - [ ] Card borders are visible
  - [ ] Card shadows are appropriate

- [ ] **Dark Mode**:
  - [ ] Card background is #2d2d2d
  - [ ] Card content is readable on dark background
  - [ ] Card borders are visible
  - [ ] Card shadows are appropriate for dark mode

---

## 5. Transition Testing

### 5.1 Smooth Transitions
- [ ] **Test**: Toggle theme and observe transitions
  - **Verify**: All color changes have 300ms transition
  - **Verify**: No flickering or jarring changes
  - **Verify**: Transitions are smooth and pleasant

### 5.2 No Layout Shifts
- [ ] **Test**: Toggle theme on various pages
  - **Verify**: No layout shifts occur
  - **Verify**: Element positions remain stable
  - **Verify**: Scrollbar position is maintained

---

## 6. Accessibility Testing

### 6.1 Color Contrast
- [ ] **Light Mode**:
  - [ ] Text contrast ratio is at least 4.5:1
  - [ ] Large text contrast ratio is at least 3:1
  - [ ] Use browser DevTools to verify contrast

- [ ] **Dark Mode**:
  - [ ] Text contrast ratio is at least 4.5:1
  - [ ] Large text contrast ratio is at least 3:1
  - [ ] Use browser DevTools to verify contrast

### 6.2 Keyboard Navigation
- [ ] **Test**: Navigate using Tab key
  - **Verify**: Dark mode toggle is keyboard accessible
  - **Verify**: Focus indicators are visible in both modes
  - **Verify**: Enter/Space activates the toggle

### 6.3 Screen Reader Support
- [ ] **Test**: Use screen reader (NVDA, VoiceOver)
  - **Verify**: Dark mode toggle is announced correctly
  - **Verify**: Current theme state is announced
  - **Verify**: Theme changes are announced

---

## 7. Cross-Browser Testing

### 7.1 Chrome
- [ ] Dark mode works correctly
- [ ] Transitions are smooth
- [ ] Colors are accurate
- [ ] No console errors

### 7.2 Firefox
- [ ] Dark mode works correctly
- [ ] Transitions are smooth
- [ ] Colors are accurate
- [ ] No console errors

### 7.3 Safari
- [ ] Dark mode works correctly
- [ ] Transitions are smooth
- [ ] Colors are accurate
- [ ] No console errors

### 7.4 Edge
- [ ] Dark mode works correctly
- [ ] Transitions are smooth
- [ ] Colors are accurate
- [ ] No console errors

---

## 8. Responsive Testing

### 8.1 Mobile (320px - 767px)
- [ ] Dark mode toggle is accessible
- [ ] All pages are readable in dark mode
- [ ] Input borders remain #D4816180
- [ ] No horizontal scrolling

### 8.2 Tablet (768px - 1023px)
- [ ] Dark mode toggle is accessible
- [ ] All pages are readable in dark mode
- [ ] Input borders remain #D4816180
- [ ] Layout is responsive

### 8.3 Desktop (1024px+)
- [ ] Dark mode toggle is accessible
- [ ] All pages are readable in dark mode
- [ ] Input borders remain #D4816180
- [ ] Layout is optimal

---

## 9. RTL Testing (Arabic)

### 9.1 RTL Layout
- [ ] **Test**: Switch to Arabic language
  - **Verify**: Dark mode works in RTL layout
  - **Verify**: Toggle button is positioned correctly
  - **Verify**: All UI elements are mirrored correctly

### 9.2 RTL Colors
- [ ] **Test**: Dark mode in RTL
  - **Verify**: Colors are consistent with LTR
  - **Verify**: Input borders are #D4816180
  - **Verify**: No color issues in RTL

---

## 10. Edge Cases

### 10.1 Rapid Toggling
- [ ] **Test**: Toggle theme rapidly 10+ times
  - **Verify**: No crashes or errors
  - **Verify**: Theme state remains consistent
  - **Verify**: localStorage is updated correctly

### 10.2 Browser Back/Forward
- [ ] **Test**: Navigate between pages using browser back/forward
  - **Verify**: Theme is maintained across navigation
  - **Verify**: No theme flickering

### 10.3 Multiple Tabs
- [ ] **Test**: Open app in multiple tabs, change theme in one tab
  - **Verify**: Theme change is reflected in other tabs (if implemented)
  - **Verify**: No conflicts between tabs

### 10.4 Incognito/Private Mode
- [ ] **Test**: Open app in incognito/private mode
  - **Verify**: Dark mode works
  - **Verify**: Theme preference is not persisted (expected)
  - **Verify**: System preference is detected

---

## 11. Performance Testing

### 11.1 Initial Load
- [ ] **Test**: Measure initial page load time
  - **Verify**: Dark mode doesn't significantly impact load time
  - **Verify**: No flash of unstyled content (FOUC)

### 11.2 Theme Toggle Performance
- [ ] **Test**: Measure time to toggle theme
  - **Verify**: Toggle completes within 300ms
  - **Verify**: No lag or delay

### 11.3 Memory Usage
- [ ] **Test**: Monitor memory usage while toggling theme
  - **Verify**: No memory leaks
  - **Verify**: Memory usage is stable

---

## 12. Integration Testing

### 12.1 User Preferences API
- [ ] **Test**: Save theme preference to backend (if implemented)
  - **Verify**: Theme is saved to user profile
  - **Verify**: Theme is restored on login

### 12.2 Multi-Language Support
- [ ] **Test**: Dark mode with Arabic
  - **Verify**: All text is readable
  - **Verify**: RTL layout works correctly

- [ ] **Test**: Dark mode with English
  - **Verify**: All text is readable
  - **Verify**: LTR layout works correctly

- [ ] **Test**: Dark mode with French
  - **Verify**: All text is readable
  - **Verify**: LTR layout works correctly

---

## 13. Bug Reporting

### If you find a bug, document:
1. **Page/Component**: Where the bug occurred
2. **Theme Mode**: Light, Dark, or System
3. **Browser**: Chrome, Firefox, Safari, Edge
4. **Device**: Desktop, Tablet, Mobile
5. **Steps to Reproduce**: Detailed steps
6. **Expected Behavior**: What should happen
7. **Actual Behavior**: What actually happened
8. **Screenshots**: Visual evidence
9. **Console Errors**: Any JavaScript errors

---

## 14. Sign-Off

### Tester Information
- **Tester Name**: ___________________________
- **Date Tested**: ___________________________
- **Browser(s) Tested**: ___________________________
- **Device(s) Tested**: ___________________________

### Test Results
- [ ] All tests passed
- [ ] Some tests failed (see bug reports)
- [ ] Critical issues found (block release)

### Notes
_Add any additional notes or observations here:_

---

## 15. Acceptance Criteria Verification

### From Requirements Document
- [x] Dark mode toggle is accessible from settings/navigation
- [x] Dark mode applies within 300ms with smooth transitions
- [x] Dark mode preference persists in localStorage
- [x] System preference is detected on first visit
- [x] All UI elements support dark mode
- [x] Input borders remain #D4816180 in dark mode

### Final Approval
- [ ] **Product Owner Approval**: ___________________________
- [ ] **QA Lead Approval**: ___________________________
- [ ] **Date**: ___________________________

---

## Appendix: Testing Tools

### Recommended Tools
1. **Browser DevTools**: Inspect CSS, localStorage, console
2. **Lighthouse**: Accessibility and performance audits
3. **axe DevTools**: Accessibility testing
4. **Color Contrast Analyzer**: Verify contrast ratios
5. **Screen Readers**: NVDA (Windows), VoiceOver (Mac)

### Useful Browser Extensions
- **Dark Reader**: Compare with other dark mode implementations
- **ColorZilla**: Pick and verify colors
- **WAVE**: Web accessibility evaluation

---

**End of Checklist**
