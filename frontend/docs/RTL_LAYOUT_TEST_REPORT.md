# RTL Layout Testing Report for Arabic Language

**Date**: 2026-02-21  
**Spec**: General Platform Enhancements  
**Task**: 9.3.5 Test RTL layout for Arabic  
**Requirements**: NFR-COMPAT-4, DS-LAYOUT-2, IR-8

---

## Executive Summary

This document provides a comprehensive manual testing checklist for verifying RTL (Right-to-Left) layout support for Arabic language across the Careerak platform. The testing covers all major pages, components, and interactions to ensure proper RTL rendering and user experience.

---

## Testing Environment

### Prerequisites
- Browser: Chrome/Firefox/Safari (latest version)
- Screen sizes: Mobile (375px), Tablet (768px), Desktop (1920px)
- Language: Arabic (ar)
- Test user accounts: Both employee and employer roles

### Setup Instructions
1. Open the application in a browser
2. Navigate to Language Selection page
3. Select Arabic (العربية)
4. Verify `document.documentElement.dir === "rtl"`
5. Verify `document.documentElement.lang === "ar"`

---

## Test Categories

### 1. Global Layout Tests

#### 1.1 HTML Direction Attribute
- [ ] **Test**: Check HTML dir attribute
  - **Action**: Open browser DevTools → Inspect `<html>` element
  - **Expected**: `<html lang="ar" dir="rtl">`
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 1.2 Text Alignment
- [ ] **Test**: Verify text alignment in Arabic
  - **Action**: Check all text elements on homepage
  - **Expected**: Text aligned to the right
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 1.3 Font Family
- [ ] **Test**: Verify Arabic font is applied
  - **Action**: Inspect any text element
  - **Expected**: `font-family: 'Amiri', 'Cairo', serif`
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 2. Navigation Components

#### 2.1 Navbar
- [ ] **Test**: Navbar layout direction
  - **Action**: Inspect navbar on any page
  - **Expected**: 
    - Logo on the right side
    - Menu items flow from right to left
    - Actions container uses `space-x-reverse`
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 2.2 Sidebar/Drawer Menus
- [ ] **Test**: Sidebar opens from right
  - **Action**: Open mobile menu
  - **Expected**: Menu slides in from right side
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 2.3 Breadcrumbs
- [ ] **Test**: Breadcrumb direction
  - **Action**: Navigate to a nested page
  - **Expected**: Breadcrumbs flow right to left with proper separators
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 3. Form Elements

#### 3.1 Input Fields
- [ ] **Test**: Input text alignment
  - **Action**: Type in any input field
  - **Expected**: 
    - Text aligns to the right
    - Cursor starts from right
    - Placeholder text aligned right
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 3.2 Labels
- [ ] **Test**: Label positioning
  - **Action**: Check form labels
  - **Expected**: Labels positioned to the right of inputs
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 3.3 Select Dropdowns
- [ ] **Test**: Dropdown arrow position
  - **Action**: Click on select element
  - **Expected**: Arrow icon on the left side
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 3.4 Checkboxes and Radio Buttons
- [ ] **Test**: Checkbox/radio positioning
  - **Action**: View forms with checkboxes
  - **Expected**: Checkbox/radio on the right, label on the left
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 4. Page-Specific Tests

#### 4.1 Login Page (02_LoginPage)
- [ ] **Test**: Login form RTL layout
  - **Action**: Navigate to `/login`
  - **Expected**:
    - Form centered
    - Labels aligned right
    - Input text aligned right
    - Border color: #D4816180
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.2 Registration Page (03_AuthPage)
- [ ] **Test**: Registration form RTL layout
  - **Action**: Navigate to `/auth`
  - **Expected**:
    - Multi-step form flows right to left
    - Labels aligned right
    - Progress indicators flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.3 Profile Page
- [ ] **Test**: Profile layout RTL
  - **Action**: Navigate to `/profile`
  - **Expected**:
    - Profile picture on the right
    - Information sections aligned right
    - Edit buttons positioned correctly
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.4 Job Postings Page
- [ ] **Test**: Job cards RTL layout
  - **Action**: Navigate to `/jobs`
  - **Expected**:
    - Company logo on the right
    - Job details aligned right
    - Action buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.5 Courses Page
- [ ] **Test**: Course cards RTL layout
  - **Action**: Navigate to `/courses`
  - **Expected**:
    - Course thumbnails positioned correctly
    - Text aligned right
    - Enrollment buttons positioned correctly
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.6 Settings Page
- [ ] **Test**: Settings layout RTL
  - **Action**: Navigate to `/settings`
  - **Expected**:
    - Settings sections aligned right
    - Toggle switches positioned correctly
    - Language selector shows Arabic first
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 4.7 Notifications Page
- [ ] **Test**: Notifications RTL layout
  - **Action**: Navigate to `/notifications`
  - **Expected**:
    - Notification cards aligned right
    - Unread indicator on the left
    - Timestamps aligned correctly
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 5. Modal Components

#### 5.1 Confirmation Modal
- [ ] **Test**: Modal content RTL
  - **Action**: Trigger any confirmation modal
  - **Expected**:
    - Title aligned right
    - Message text aligned right
    - Buttons flow right to left (Confirm on right, Cancel on left)
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 5.2 Image Crop Modal
- [ ] **Test**: Crop modal RTL
  - **Action**: Upload and crop an image
  - **Expected**:
    - Instructions aligned right
    - Controls positioned correctly
    - Action buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 5.3 Generic Modals
- [ ] **Test**: All modal types RTL
  - **Action**: Open various modals
  - **Expected**:
    - Close button on the left
    - Content aligned right
    - Footer buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 6. List and Table Components

#### 6.1 Data Tables
- [ ] **Test**: Table RTL layout
  - **Action**: View any data table
  - **Expected**:
    - Headers aligned right
    - Data cells aligned right
    - Action columns on the left
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 6.2 List Items
- [ ] **Test**: List item RTL
  - **Action**: View any list (jobs, courses, notifications)
  - **Expected**:
    - Icons on the right
    - Text aligned right
    - Action buttons on the left
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 7. Interactive Elements

#### 7.1 Buttons
- [ ] **Test**: Button icon positioning
  - **Action**: Check buttons with icons
  - **Expected**:
    - Icons positioned correctly relative to text
    - Icon + text buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 7.2 Tooltips
- [ ] **Test**: Tooltip positioning
  - **Action**: Hover over elements with tooltips
  - **Expected**: Tooltips appear in correct position for RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 7.3 Dropdowns
- [ ] **Test**: Dropdown menu alignment
  - **Action**: Open dropdown menus
  - **Expected**: Menus align to the right edge
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 8. Notification Components

#### 8.1 Offline Indicator
- [ ] **Test**: Offline indicator position
  - **Action**: Simulate offline mode
  - **Expected**: Indicator positioned correctly for RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 8.2 Offline Queue Status
- [ ] **Test**: Queue status RTL
  - **Action**: Trigger offline queue
  - **Expected**:
    - Component positioned on left (not right)
    - Content direction RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 8.3 Push Notification Manager
- [ ] **Test**: Push notification UI RTL
  - **Action**: View push notification settings
  - **Expected**:
    - Lists aligned right
    - Close button positioned correctly
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 9. Error Pages

#### 9.1 404 Not Found Page
- [ ] **Test**: 404 page RTL
  - **Action**: Navigate to non-existent route
  - **Expected**:
    - Error message aligned right
    - Number uses Arabic font
    - Action buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 9.2 500 Server Error Page
- [ ] **Test**: 500 page RTL
  - **Action**: Trigger server error (if possible)
  - **Expected**:
    - Error message aligned right
    - Technical details aligned right
    - Action buttons flow RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 10. Dark Mode + RTL

#### 10.1 Dark Mode RTL Compatibility
- [ ] **Test**: RTL in dark mode
  - **Action**: Enable dark mode while in Arabic
  - **Expected**:
    - RTL layout maintained
    - All dark mode colors applied correctly
    - Input borders remain #D4816180
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 11. Responsive Design + RTL

#### 11.1 Mobile (375px)
- [ ] **Test**: RTL on mobile
  - **Action**: Resize to 375px width
  - **Expected**:
    - All elements maintain RTL
    - Touch targets accessible
    - No horizontal scroll
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 11.2 Tablet (768px)
- [ ] **Test**: RTL on tablet
  - **Action**: Resize to 768px width
  - **Expected**:
    - Layout adapts correctly
    - RTL maintained
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 11.3 Desktop (1920px)
- [ ] **Test**: RTL on desktop
  - **Action**: View on large screen
  - **Expected**:
    - Wide layout maintains RTL
    - Content properly aligned
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 12. Animation + RTL

#### 12.1 Page Transitions
- [ ] **Test**: Page transitions in RTL
  - **Action**: Navigate between pages
  - **Expected**: Transitions work correctly in RTL context
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 12.2 Modal Animations
- [ ] **Test**: Modal animations in RTL
  - **Action**: Open/close modals
  - **Expected**: Animations don't break RTL layout
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 13. Accessibility + RTL

#### 13.1 Screen Reader Support
- [ ] **Test**: Screen reader with RTL
  - **Action**: Use NVDA/VoiceOver in Arabic
  - **Expected**:
    - Content read in correct order (RTL)
    - ARIA labels in Arabic
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 13.2 Keyboard Navigation
- [ ] **Test**: Tab order in RTL
  - **Action**: Navigate using Tab key
  - **Expected**: Focus moves in logical RTL order
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

### 14. Edge Cases

#### 14.1 Mixed Content (Arabic + English)
- [ ] **Test**: Mixed language content
  - **Action**: View pages with English words in Arabic text
  - **Expected**: 
    - Overall direction RTL
    - English words display correctly inline
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 14.2 Numbers and Dates
- [ ] **Test**: Number formatting in RTL
  - **Action**: View dates, prices, statistics
  - **Expected**: Numbers display correctly in RTL context
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

#### 14.3 Icons and Symbols
- [ ] **Test**: Icon mirroring
  - **Action**: Check directional icons (arrows, chevrons)
  - **Expected**: Directional icons mirrored for RTL
  - **Status**: ✅ PASS / ❌ FAIL
  - **Notes**: _____________________

---

## Known RTL Issues

### Current Implementation Status

✅ **Implemented**:
- HTML dir attribute set dynamically based on language
- CSS RTL rules for major components
- Font family switching for Arabic
- Form input alignment
- Modal RTL support
- Notification components RTL
- Error pages RTL
- Dark mode + RTL compatibility

⚠️ **Potential Issues to Watch**:
- Third-party components may not support RTL
- Custom animations might need RTL adjustments
- Some icons might need manual mirroring

---

## Testing Checklist Summary

### Critical Tests (Must Pass)
- [ ] HTML dir="rtl" attribute set
- [ ] Text aligned to the right
- [ ] Arabic font applied
- [ ] Forms work correctly in RTL
- [ ] Navigation flows right to left
- [ ] Modals display correctly in RTL

### Important Tests (Should Pass)
- [ ] All pages maintain RTL layout
- [ ] Dark mode + RTL works
- [ ] Responsive design + RTL works
- [ ] Animations don't break RTL

### Nice to Have (May Have Minor Issues)
- [ ] Perfect icon mirroring
- [ ] Third-party component RTL
- [ ] Complex table layouts

---

## Test Execution Instructions

### Manual Testing Steps

1. **Preparation**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open Browser**:
   - Navigate to `http://localhost:5173`
   - Open DevTools (F12)

3. **Set Language to Arabic**:
   - Go to Language Selection page
   - Click "العربية"
   - Verify dir="rtl" in DevTools

4. **Execute Tests**:
   - Go through each test category
   - Mark ✅ PASS or ❌ FAIL
   - Add notes for any issues

5. **Document Issues**:
   - Screenshot any RTL layout problems
   - Note the page/component affected
   - Describe expected vs actual behavior

### Automated Verification (Optional)

```javascript
// Run in browser console to verify RTL setup
console.log('HTML dir:', document.documentElement.dir);
console.log('HTML lang:', document.documentElement.lang);
console.log('Body font:', window.getComputedStyle(document.body).fontFamily);

// Check for RTL-specific CSS
const rtlElements = document.querySelectorAll('[dir="rtl"]');
console.log('RTL elements count:', rtlElements.length);
```

---

## Issue Reporting Template

```markdown
### Issue: [Brief Description]

**Page/Component**: _____________________
**Test Category**: _____________________
**Severity**: Critical / High / Medium / Low

**Expected Behavior**:
_____________________

**Actual Behavior**:
_____________________

**Screenshot**:
[Attach screenshot]

**Steps to Reproduce**:
1. _____________________
2. _____________________
3. _____________________

**Browser**: _____________________
**Screen Size**: _____________________
**Additional Notes**: _____________________
```

---

## Sign-Off

### Tester Information
- **Name**: _____________________
- **Date**: _____________________
- **Test Duration**: _____________________

### Test Results Summary
- **Total Tests**: _____________________
- **Passed**: _____________________
- **Failed**: _____________________
- **Pass Rate**: _____________________

### Overall Assessment
- [ ] RTL layout is fully functional
- [ ] RTL layout has minor issues (documented above)
- [ ] RTL layout has major issues (requires fixes)

### Recommendations
_____________________
_____________________
_____________________

### Approval
- [ ] Approved for production
- [ ] Requires fixes before approval

**Signature**: _____________________  
**Date**: _____________________

---

## References

- **Requirements**: NFR-COMPAT-4 (RTL support for Arabic)
- **Design Standards**: DS-LAYOUT-2 (RTL layout support)
- **Integration**: IR-8 (RTL/LTR support system)
- **Project Standards**: `project-standards.md` - RTL/LTR support

---

## Appendix: RTL CSS Implementation

### Key CSS Patterns Used

```css
/* HTML direction attribute */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Text alignment */
[dir="rtl"] .text-element {
  text-align: right;
}

/* Flexbox reversal */
[dir="rtl"] .flex-container {
  flex-direction: row-reverse;
}

/* Spacing reversal */
[dir="rtl"] .spaced-elements {
  @apply space-x-reverse;
}

/* Position swapping */
[dir="rtl"] .positioned-element {
  right: auto;
  left: 20px;
}

/* Border swapping */
[dir="rtl"] .bordered-element {
  border-left-width: 1px;
  border-right-width: 4px;
}
```

### Files with RTL Support

- `frontend/src/context/AuthContext.jsx` - Sets dir attribute
- `frontend/src/styles/formsDarkMode.css` - Form RTL rules
- `frontend/src/styles/darkModePages.css` - Page RTL rules
- `frontend/src/pages/*.css` - Page-specific RTL rules
- `frontend/src/components/*.css` - Component RTL rules

---

**End of RTL Layout Testing Report**
