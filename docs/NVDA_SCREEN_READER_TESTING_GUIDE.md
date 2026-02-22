# NVDA Screen Reader Testing Guide

## Overview
This document provides a comprehensive guide for testing the Careerak platform with NVDA (NonVisual Desktop Access) screen reader to ensure WCAG 2.1 Level AA compliance and verify all accessibility features.

**Status**: ✅ Complete  
**Date**: 2026-02-22  
**Requirements**: NFR-A11Y-5, FR-A11Y-1 through FR-A11Y-12  
**Target**: WCAG 2.1 Level AA compliance

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [NVDA Installation and Setup](#nvda-installation-and-setup)
3. [Testing Methodology](#testing-methodology)
4. [Test Scenarios](#test-scenarios)
5. [Accessibility Features to Verify](#accessibility-features-to-verify)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Test Results Template](#test-results-template)
8. [Acceptance Criteria](#acceptance-criteria)

---

## Prerequisites

### Required Software
- **NVDA**: Version 2023.1 or later (free, open-source)
- **Browser**: Chrome, Firefox, or Edge (latest version)
- **Operating System**: Windows 10 or later

### Required Knowledge
- Basic understanding of screen reader navigation
- Familiarity with NVDA keyboard shortcuts
- Understanding of ARIA landmarks and roles

### Test Environment
- Local development server running on `http://localhost:5173`
- Test user accounts (employee and company)
- Sample data (jobs, courses, applications)

---

## NVDA Installation and Setup

### 1. Download and Install NVDA
```
1. Visit: https://www.nvaccess.org/download/
2. Download the latest stable version
3. Run the installer
4. Choose "Install NVDA on this computer"
5. Complete the installation wizard
```

### 2. Configure NVDA Settings
```
1. Press NVDA+N to open NVDA menu
2. Navigate to Preferences > Settings
3. Configure the following:
   - Speech: Set rate to comfortable speed (50-60)
   - Keyboard: Enable "Speak typed characters" and "Speak typed words"
   - Browse Mode: Enable "Automatic focus mode for focus changes"
   - Document Formatting: Enable all options
```

### 3. Essential NVDA Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `NVDA+Q` | Quit NVDA |
| `NVDA+N` | Open NVDA menu |
| `NVDA+F1` | Help |
| `NVDA+Space` | Toggle browse/focus mode |
| `H` | Next heading |
| `Shift+H` | Previous heading |
| `K` | Next link |
| `Shift+K` | Previous link |
| `B` | Next button |
| `Shift+B` | Previous button |
| `F` | Next form field |
| `Shift+F` | Previous form field |
| `D` | Next landmark |
| `Shift+D` | Previous landmark |
| `T` | Next table |
| `L` | Next list |
| `I` | Next list item |
| `G` | Next graphic |
| `NVDA+F7` | Elements list |
| `Insert+F7` | Links list |
| `NVDA+T` | Read title |
| `NVDA+Down` | Say all (read from cursor) |

---

## Testing Methodology

### Testing Approach
1. **Systematic Navigation**: Test each page from top to bottom
2. **Landmark Navigation**: Verify all ARIA landmarks are announced
3. **Interactive Elements**: Test all buttons, links, and form controls
4. **Dynamic Content**: Verify aria-live announcements
5. **Multi-language**: Test in Arabic (RTL), English, and French

### Testing Phases
1. **Phase 1**: Page structure and landmarks
2. **Phase 2**: Navigation and interactive elements
3. **Phase 3**: Forms and error handling
4. **Phase 4**: Dynamic content and notifications
5. **Phase 5**: Multi-language support

---

## Test Scenarios

### Scenario 1: Homepage Navigation (EntryPage)

**Objective**: Verify screen reader can navigate the homepage effectively

**Steps**:
1. Start NVDA
2. Navigate to `http://localhost:5173`
3. Press `NVDA+Down` to read all content
4. Press `D` to navigate through landmarks
5. Press `H` to navigate through headings
6. Press `K` to navigate through links
7. Press `B` to navigate through buttons

**Expected Results**:
- ✅ Page title is announced: "Careerak - Your Career Platform"
- ✅ Language selection is announced with proper labels
- ✅ Main navigation landmarks are announced
- ✅ All buttons have descriptive labels
- ✅ Skip link to main content is available
- ✅ Footer landmarks are announced

**Pass Criteria**:
- All interactive elements are reachable
- All elements have descriptive labels
- Logical reading order is maintained
- No unlabeled buttons or links

---

### Scenario 2: Login Form (LoginPage)

**Objective**: Verify form accessibility and error announcements

**Steps**:
1. Navigate to login page
2. Press `F` to navigate through form fields
3. Enter invalid credentials
4. Submit form
5. Listen for error announcements
6. Correct errors and resubmit

**Expected Results**:
- ✅ Form fields are properly labeled
- ✅ Email field announced as "Email, edit, required"
- ✅ Password field announced as "Password, edit, required, protected"
- ✅ Errors announced via aria-live="assertive"
- ✅ Error messages are descriptive
- ✅ Focus moves to first error field
- ✅ Success message announced on successful login

**Pass Criteria**:
- All form fields have associated labels
- Required fields are announced
- Errors are announced immediately
- Error messages are clear and actionable

---

### Scenario 3: Registration Form (AuthPage)

**Objective**: Verify complex form with multiple steps

**Steps**:
1. Navigate to registration page
2. Navigate through all form fields
3. Test password strength indicator
4. Test file upload (profile picture)
5. Submit form with errors
6. Correct and resubmit

**Expected Results**:
- ✅ All form fields properly labeled
- ✅ Password strength announced dynamically
- ✅ File upload button accessible
- ✅ Selected file name announced
- ✅ Validation errors announced
- ✅ Success confirmation announced
- ✅ Multi-step progress announced

**Pass Criteria**:
- Complex form is navigable
- Dynamic updates are announced
- File upload is accessible
- Progress is communicated clearly

---

### Scenario 4: Job Listings (JobPostingsPage)

**Objective**: Verify list navigation and filtering

**Steps**:
1. Navigate to job postings page
2. Press `L` to find job list
3. Press `I` to navigate list items
4. Test search and filter controls
5. Test job card interactions
6. Test pagination

**Expected Results**:
- ✅ Job list announced as "list with X items"
- ✅ Each job card has descriptive heading
- ✅ Job details are announced in logical order
- ✅ Filter controls are labeled
- ✅ Search results count announced
- ✅ Pagination controls accessible
- ✅ "Apply" buttons clearly labeled

**Pass Criteria**:
- List structure is clear
- Job cards are distinguishable
- Filters are accessible
- Search results are announced

---

### Scenario 5: Modal Dialogs

**Objective**: Verify modal accessibility and focus management

**Steps**:
1. Open a modal (e.g., job details)
2. Verify focus moves to modal
3. Navigate modal content
4. Press Escape to close
5. Verify focus returns to trigger

**Expected Results**:
- ✅ Modal announced as "dialog"
- ✅ Modal title announced
- ✅ Focus trapped within modal
- ✅ Close button accessible
- ✅ Escape key closes modal
- ✅ Focus returns to trigger element
- ✅ Background content not accessible

**Pass Criteria**:
- Focus trap works correctly
- Modal content is accessible
- Close mechanisms work
- Focus restoration works

---

### Scenario 6: Notifications

**Objective**: Verify dynamic notification announcements

**Steps**:
1. Trigger various notifications
2. Listen for announcements
3. Navigate to notification center
4. Test notification actions

**Expected Results**:
- ✅ New notifications announced via aria-live="polite"
- ✅ Notification type announced (success, error, info)
- ✅ Notification message clear
- ✅ Notification actions accessible
- ✅ Dismiss button accessible
- ✅ Notification count announced

**Pass Criteria**:
- Notifications are announced
- Content is understandable
- Actions are accessible
- No announcement spam

---

### Scenario 7: Dark Mode Toggle

**Objective**: Verify theme toggle accessibility

**Steps**:
1. Locate dark mode toggle
2. Activate toggle
3. Verify announcement
4. Check contrast in dark mode

**Expected Results**:
- ✅ Toggle announced as "Dark mode, toggle button, not pressed"
- ✅ State change announced: "Dark mode enabled"
- ✅ All content remains accessible in dark mode
- ✅ Contrast ratios maintained

**Pass Criteria**:
- Toggle state is clear
- State changes announced
- Dark mode is accessible

---

### Scenario 8: Navigation Menu (Navbar)

**Objective**: Verify main navigation accessibility

**Steps**:
1. Navigate to main navigation
2. Press `K` to navigate links
3. Test dropdown menus
4. Test mobile menu (if applicable)

**Expected Results**:
- ✅ Navigation announced as "navigation landmark"
- ✅ All links properly labeled
- ✅ Current page indicated
- ✅ Dropdown menus accessible
- ✅ Submenu items accessible
- ✅ Mobile menu toggle accessible

**Pass Criteria**:
- Navigation structure is clear
- All links are accessible
- Current location is indicated
- Dropdowns work correctly

---

### Scenario 9: Data Tables (Admin Dashboard)

**Objective**: Verify table accessibility

**Steps**:
1. Navigate to admin dashboard
2. Press `T` to find tables
3. Navigate table cells
4. Test table headers
5. Test sorting controls

**Expected Results**:
- ✅ Table announced with row/column count
- ✅ Headers properly associated
- ✅ Cell content announced with context
- ✅ Sorting controls accessible
- ✅ Row selection announced
- ✅ Actions accessible

**Pass Criteria**:
- Table structure is clear
- Headers are associated
- Navigation is logical
- Actions are accessible

---

### Scenario 10: Error Boundaries

**Objective**: Verify error handling accessibility

**Steps**:
1. Trigger a component error
2. Verify error message announced
3. Test retry button
4. Test navigation options

**Expected Results**:
- ✅ Error announced immediately
- ✅ Error message is descriptive
- ✅ Retry button accessible
- ✅ Alternative navigation provided
- ✅ Error doesn't break navigation

**Pass Criteria**:
- Errors are announced
- Recovery options are clear
- Navigation remains functional

---

## Accessibility Features to Verify

### 1. ARIA Landmarks (FR-A11Y-11)
- [ ] `<header>` with role="banner"
- [ ] `<nav>` with role="navigation"
- [ ] `<main>` with role="main"
- [ ] `<aside>` with role="complementary"
- [ ] `<footer>` with role="contentinfo"
- [ ] Landmarks have descriptive labels

### 2. ARIA Labels (FR-A11Y-1)
- [ ] All icon buttons have aria-label
- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] All interactive elements labeled
- [ ] Labels are descriptive and unique

### 3. ARIA Live Regions (FR-A11Y-10, FR-A11Y-12)
- [ ] Notifications use aria-live="polite"
- [ ] Errors use aria-live="assertive"
- [ ] Loading states announced
- [ ] Dynamic content changes announced
- [ ] No announcement spam

### 4. ARIA States (FR-A11Y-1)
- [ ] aria-expanded for dropdowns
- [ ] aria-selected for tabs
- [ ] aria-checked for checkboxes
- [ ] aria-pressed for toggle buttons
- [ ] aria-current for current page

### 5. Keyboard Navigation (FR-A11Y-2, FR-A11Y-3)
- [ ] All interactive elements reachable
- [ ] Logical tab order
- [ ] Visible focus indicators
- [ ] No keyboard traps
- [ ] Skip links work

### 6. Focus Management (FR-A11Y-4)
- [ ] Focus trap in modals
- [ ] Focus restoration after modal close
- [ ] Focus moves to errors
- [ ] Focus visible at all times
- [ ] Focus order is logical

### 7. Semantic HTML (FR-A11Y-6)
- [ ] Proper heading hierarchy (h1-h6)
- [ ] Semantic elements used (header, nav, main, article, footer)
- [ ] Lists use ul/ol/li
- [ ] Tables use proper structure
- [ ] Forms use fieldset/legend

### 8. Form Accessibility
- [ ] Labels associated with inputs
- [ ] Required fields indicated
- [ ] Error messages descriptive
- [ ] Help text available
- [ ] Autocomplete attributes

### 9. Image Accessibility (FR-A11Y-9)
- [ ] All images have alt text
- [ ] Decorative images have alt=""
- [ ] Alt text is descriptive
- [ ] Complex images have long descriptions
- [ ] SVGs have titles

### 10. Color Contrast (FR-A11Y-8)
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Interactive elements: 3:1 minimum
- [ ] Focus indicators: 3:1 minimum
- [ ] Dark mode maintains contrast

---

## Common Issues and Solutions

### Issue 1: Unlabeled Buttons
**Problem**: Icon buttons without aria-label  
**Solution**: Add aria-label to all icon buttons
```jsx
<button aria-label="Close modal">
  <XIcon />
</button>
```

### Issue 2: Missing Form Labels
**Problem**: Form fields without associated labels  
**Solution**: Use label element or aria-labelledby
```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue 3: No Error Announcements
**Problem**: Errors not announced to screen readers  
**Solution**: Use aria-live regions
```jsx
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Issue 4: Focus Not Trapped in Modal
**Problem**: Tab key escapes modal  
**Solution**: Implement focus trap
```jsx
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <div role="dialog">
    {/* Modal content */}
  </div>
</FocusTrap>
```

### Issue 5: Dynamic Content Not Announced
**Problem**: Loading states not announced  
**Solution**: Use aria-live="polite"
```jsx
<div aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Issue 6: Poor Heading Hierarchy
**Problem**: Skipped heading levels  
**Solution**: Maintain proper hierarchy
```jsx
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Issue 7: No Skip Links
**Problem**: No way to skip navigation  
**Solution**: Add skip link
```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Issue 8: Insufficient Contrast
**Problem**: Text doesn't meet contrast requirements  
**Solution**: Adjust colors to meet 4.5:1 ratio
```css
/* Before: 3:1 ratio */
color: #999;
background: #fff;

/* After: 4.5:1 ratio */
color: #767676;
background: #fff;
```

---

## Test Results Template

### Test Session Information
- **Date**: [Date]
- **Tester**: [Name]
- **NVDA Version**: [Version]
- **Browser**: [Browser and version]
- **Test Duration**: [Duration]

### Test Results Summary
| Scenario | Status | Issues Found | Severity |
|----------|--------|--------------|----------|
| Homepage Navigation | ✅ Pass | 0 | - |
| Login Form | ⚠️ Warning | 1 | Low |
| Registration Form | ✅ Pass | 0 | - |
| Job Listings | ❌ Fail | 2 | High |
| Modal Dialogs | ✅ Pass | 0 | - |
| Notifications | ✅ Pass | 0 | - |
| Dark Mode Toggle | ✅ Pass | 0 | - |
| Navigation Menu | ✅ Pass | 0 | - |
| Data Tables | ⚠️ Warning | 1 | Medium |
| Error Boundaries | ✅ Pass | 0 | - |

### Issues Found
1. **Issue**: [Description]
   - **Severity**: High/Medium/Low
   - **Location**: [Page/Component]
   - **Impact**: [User impact]
   - **Recommendation**: [Fix suggestion]

2. **Issue**: [Description]
   - **Severity**: High/Medium/Low
   - **Location**: [Page/Component]
   - **Impact**: [User impact]
   - **Recommendation**: [Fix suggestion]

### Overall Assessment
- **Accessibility Score**: [X/10]
- **WCAG Compliance**: [Level A/AA/AAA]
- **Recommendation**: [Pass/Conditional Pass/Fail]

### Notes
[Additional observations and recommendations]

---

## Acceptance Criteria

### Must Pass (Critical)
- ✅ All interactive elements are keyboard accessible
- ✅ All form fields have associated labels
- ✅ All images have appropriate alt text
- ✅ Errors are announced to screen readers
- ✅ Focus management works correctly in modals
- ✅ Heading hierarchy is logical
- ✅ ARIA landmarks are present and labeled
- ✅ Color contrast meets WCAG AA standards

### Should Pass (Important)
- ✅ Dynamic content changes are announced
- ✅ Loading states are communicated
- ✅ Skip links are available
- ✅ Tables have proper structure
- ✅ Lists are properly marked up
- ✅ Current page is indicated in navigation
- ✅ Button states are announced

### Nice to Have (Enhancement)
- ✅ Keyboard shortcuts are documented
- ✅ Help text is available for complex forms
- ✅ Long descriptions for complex images
- ✅ Breadcrumb navigation
- ✅ Search suggestions announced

---

## Testing Checklist

### Pre-Test Setup
- [ ] NVDA installed and configured
- [ ] Test environment running
- [ ] Test accounts created
- [ ] Sample data loaded
- [ ] Browser configured

### During Testing
- [ ] Record all issues found
- [ ] Note severity levels
- [ ] Take screenshots if needed
- [ ] Document reproduction steps
- [ ] Test in multiple languages

### Post-Test
- [ ] Compile test results
- [ ] Prioritize issues
- [ ] Create bug reports
- [ ] Share findings with team
- [ ] Schedule retesting

---

## Additional Resources

### NVDA Resources
- Official Documentation: https://www.nvaccess.org/documentation/
- User Guide: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- Keyboard Commands: https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts

### WCAG Resources
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Understanding WCAG: https://www.w3.org/WAI/WCAG21/Understanding/
- Techniques: https://www.w3.org/WAI/WCAG21/Techniques/

### ARIA Resources
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- ARIA Specification: https://www.w3.org/TR/wai-aria-1.2/
- ARIA Examples: https://www.w3.org/WAI/ARIA/apg/patterns/

### Testing Tools
- axe DevTools: Browser extension for automated testing
- WAVE: Web accessibility evaluation tool
- Lighthouse: Built-in Chrome auditing tool
- Color Contrast Analyzer: Desktop tool for contrast checking

---

## Conclusion

This guide provides a comprehensive framework for testing the Careerak platform with NVDA screen reader. Regular testing ensures the platform remains accessible to all users, including those who rely on assistive technologies.

**Next Steps**:
1. Complete all test scenarios
2. Document all findings
3. Prioritize and fix issues
4. Retest after fixes
5. Maintain accessibility in future development

**Remember**: Accessibility is not a one-time task but an ongoing commitment to inclusive design.
