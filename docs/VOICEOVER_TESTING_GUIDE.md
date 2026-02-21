# VoiceOver Testing Guide - Careerak Platform

## Overview
This guide provides comprehensive instructions for testing the Careerak platform with Apple's VoiceOver screen reader to ensure WCAG 2.1 Level AA compliance.

**Task**: 5.4.6 Test with VoiceOver screen reader  
**Status**: Manual Testing Required  
**Platform**: macOS or iOS  
**Estimated Time**: 2-3 hours

---

## Prerequisites

### macOS Setup
1. **Enable VoiceOver**: System Preferences → Accessibility → VoiceOver → Enable
2. **Keyboard Shortcut**: Cmd + F5 (or Cmd + Touch ID 3 times)
3. **VoiceOver Training**: Complete the built-in VoiceOver tutorial (recommended)

### iOS Setup
1. **Enable VoiceOver**: Settings → Accessibility → VoiceOver → On
2. **Triple-Click Shortcut**: Settings → Accessibility → Accessibility Shortcut → VoiceOver
3. **Practice Gestures**: Use the VoiceOver Practice mode

---

## VoiceOver Keyboard Commands (macOS)

### Essential Commands
- **VO** = Control + Option (VoiceOver modifier keys)
- **VO + A**: Start reading
- **VO + Right/Left Arrow**: Navigate to next/previous item
- **VO + Space**: Activate item (click)
- **VO + Shift + Down**: Interact with element
- **VO + Shift + Up**: Stop interacting
- **VO + U**: Open rotor (navigation menu)
- **VO + H**: Next heading
- **VO + Shift + H**: Previous heading
- **VO + J**: Next form control
- **VO + L**: Next link
- **Control**: Stop reading

### Navigation
- **Tab**: Next focusable element
- **Shift + Tab**: Previous focusable element
- **VO + Home**: Jump to top of page
- **VO + End**: Jump to bottom of page

---

## VoiceOver Gestures (iOS)

### Essential Gestures
- **Swipe Right**: Next item
- **Swipe Left**: Previous item
- **Double Tap**: Activate item
- **Two-finger Swipe Up**: Read from top
- **Two-finger Swipe Down**: Read from current position
- **Rotor**: Rotate two fingers to change navigation mode
- **Three-finger Swipe**: Scroll page

---

## Testing Checklist

### 1. Page Structure & Landmarks

#### Test Areas
- [ ] **Navigation Landmark**: VoiceOver announces "navigation" for navbar
- [ ] **Main Landmark**: VoiceOver announces "main" for main content
- [ ] **Complementary Landmark**: VoiceOver announces "complementary" for sidebars
- [ ] **Footer Landmark**: VoiceOver announces "contentinfo" for footer

#### How to Test
1. Enable VoiceOver
2. Press VO + U to open rotor
3. Select "Landmarks" from the menu
4. Navigate through all landmarks
5. Verify each landmark is properly labeled

**Expected Results**:
- All major page sections have appropriate landmarks
- Landmarks are announced clearly
- Navigation between landmarks is smooth

---

### 2. Heading Hierarchy

#### Test Areas
- [ ] **H1**: One per page, describes main content
- [ ] **H2-H6**: Logical hierarchy without skipping levels
- [ ] **Heading Navigation**: VO + H works correctly

#### How to Test
1. Press VO + U → Select "Headings"
2. Navigate through all headings
3. Verify hierarchy (H1 → H2 → H3, no skips)
4. Check heading text is descriptive

**Expected Results**:
- Headings follow logical order
- No heading levels are skipped
- Each heading accurately describes its section

---

### 3. Form Controls & Labels

#### Test Areas
- [ ] **Input Labels**: All inputs have associated labels
- [ ] **Placeholder Text**: Not used as sole label
- [ ] **Error Messages**: Announced via aria-live
- [ ] **Required Fields**: Clearly indicated
- [ ] **Field Instructions**: Announced before input

#### Pages to Test
- Login Page (LoginPage)
- Registration Page (AuthPage)
- Profile Edit Page
- Job Posting Form (PostJobPage)
- Settings Page

#### How to Test
1. Navigate to form with VO + J (next form control)
2. Listen for label announcement
3. Enter invalid data and check error announcements
4. Verify required field indicators

**Expected Results**:
- Every input announces its label
- Error messages are announced immediately
- Required fields are clearly indicated
- Instructions are read before the input

---

### 4. Buttons & Interactive Elements

#### Test Areas
- [ ] **Button Labels**: All buttons have descriptive labels
- [ ] **Icon Buttons**: Have aria-label attributes
- [ ] **Button State**: Disabled state is announced
- [ ] **Loading State**: Announced when processing

#### How to Test
1. Navigate to buttons with VO + Right Arrow
2. Verify button purpose is clear from label
3. Test icon-only buttons (e.g., menu, close)
4. Activate buttons with VO + Space

**Expected Results**:
- All buttons have clear, descriptive labels
- Icon buttons announce their purpose
- Button states (disabled, loading) are announced
- Activation works correctly

---

### 5. Links & Navigation

#### Test Areas
- [ ] **Link Text**: Descriptive (not "click here")
- [ ] **Link Purpose**: Clear from context
- [ ] **External Links**: Indicated as opening in new window
- [ ] **Skip Links**: "Skip to main content" works

#### How to Test
1. Press VO + L to navigate links
2. Listen to link text announcements
3. Test skip link at page top
4. Verify external link indicators

**Expected Results**:
- Link text describes destination
- Skip link is first focusable element
- External links announce new window behavior
- All links are keyboard accessible

---

### 6. Images & Alt Text

#### Test Areas
- [ ] **Meaningful Images**: Have descriptive alt text
- [ ] **Decorative Images**: Have empty alt="" or aria-hidden
- [ ] **Complex Images**: Have extended descriptions
- [ ] **Logo Images**: Alt text includes company name

#### How to Test
1. Navigate through images with VO + Right Arrow
2. Listen for alt text announcements
3. Verify decorative images are skipped
4. Check profile pictures, job images, course images

**Expected Results**:
- All meaningful images have descriptive alt text
- Decorative images are hidden from screen reader
- Alt text is concise but informative
- No "image" or "picture" in alt text (redundant)

---

### 7. Modals & Dialogs

#### Test Areas
- [ ] **Focus Trap**: Focus stays within modal
- [ ] **Initial Focus**: Set to first interactive element
- [ ] **Close Button**: Clearly labeled
- [ ] **Escape Key**: Closes modal
- [ ] **Focus Return**: Returns to trigger element on close

#### Modals to Test
- Login Modal
- Job Application Modal
- Image Crop Modal
- Confirmation Dialogs
- Settings Modals

#### How to Test
1. Open modal with keyboard
2. Verify focus moves to modal
3. Try to Tab outside modal (should trap focus)
4. Press Escape to close
5. Verify focus returns to trigger button

**Expected Results**:
- Focus is trapped within modal
- Modal role is announced
- Close button is accessible
- Escape key works
- Focus returns correctly

---

### 8. Tables & Data Grids

#### Test Areas
- [ ] **Table Headers**: Properly associated with cells
- [ ] **Row/Column Headers**: Announced with each cell
- [ ] **Table Caption**: Describes table purpose
- [ ] **Complex Tables**: Use scope attributes

#### Tables to Test
- Job Listings Table
- Application Status Table
- Admin Dashboard Tables

#### How to Test
1. Navigate to table with VO + Right Arrow
2. Enter table with VO + Shift + Down
3. Navigate cells with arrow keys
4. Listen for header announcements

**Expected Results**:
- Table structure is announced
- Headers are read with each cell
- Navigation is logical
- Table purpose is clear

---

### 9. Live Regions & Dynamic Content

#### Test Areas
- [ ] **Notifications**: Announced via aria-live="polite"
- [ ] **Error Messages**: Announced via aria-live="assertive"
- [ ] **Loading States**: Announced when content loads
- [ ] **Chat Messages**: New messages announced

#### How to Test
1. Trigger notification (e.g., save settings)
2. Listen for announcement without moving focus
3. Trigger error (e.g., invalid form)
4. Verify immediate announcement

**Expected Results**:
- Notifications are announced automatically
- Errors interrupt current reading (assertive)
- Loading states are announced
- Dynamic updates don't require focus

---

### 10. Dark Mode

#### Test Areas
- [ ] **Theme Toggle**: Clearly labeled
- [ ] **Theme State**: Current theme announced
- [ ] **Color Contrast**: Maintained in dark mode
- [ ] **Focus Indicators**: Visible in both modes

#### How to Test
1. Navigate to theme toggle button
2. Activate with VO + Space
3. Verify theme change announcement
4. Check focus indicators remain visible

**Expected Results**:
- Toggle button announces current state
- Theme change is announced
- All content remains accessible
- Focus indicators are visible

---

### 11. Multi-Language Support

#### Test Areas
- [ ] **Language Selector**: Accessible
- [ ] **Language Change**: Announced
- [ ] **RTL Support**: Works with VoiceOver (Arabic)
- [ ] **Content Language**: Properly marked (lang attribute)

#### How to Test
1. Navigate to language selector
2. Change language (Arabic, English, French)
3. Verify content is read in correct language
4. Test RTL navigation (Arabic)

**Expected Results**:
- Language selector is accessible
- Language changes are announced
- VoiceOver reads content in correct language
- RTL navigation works correctly

---

## Page-by-Page Testing

### Priority Pages

#### 1. Login Page (LoginPage)
- [ ] Email input has label
- [ ] Password input has label
- [ ] "Show password" toggle is accessible
- [ ] Login button is clearly labeled
- [ ] Error messages are announced
- [ ] "Forgot password" link is accessible

#### 2. Registration Page (AuthPage)
- [ ] All form fields have labels
- [ ] Multi-step form progress is announced
- [ ] Validation errors are announced
- [ ] Profile picture upload is accessible
- [ ] Submit button state is announced

#### 3. Job Postings Page
- [ ] Job cards are navigable
- [ ] Job titles are headings
- [ ] "Apply" buttons are labeled with job title
- [ ] Filters are accessible
- [ ] Search input has label

#### 4. Profile Page
- [ ] Profile sections have headings
- [ ] Edit buttons are clearly labeled
- [ ] Profile picture has alt text
- [ ] Skills list is accessible
- [ ] Experience timeline is navigable

#### 5. Settings Page
- [ ] All settings have labels
- [ ] Toggle switches announce state
- [ ] Save button is accessible
- [ ] Success messages are announced
- [ ] Navigation between sections works

---

## Common Issues to Check

### ❌ Accessibility Violations

1. **Missing Labels**
   - Inputs without associated labels
   - Icon buttons without aria-label
   - Images without alt text

2. **Poor Focus Management**
   - Focus not visible
   - Focus not trapped in modals
   - Focus not returned after modal close

3. **Incorrect ARIA**
   - aria-expanded not updated
   - aria-live not used for dynamic content
   - Incorrect roles

4. **Heading Issues**
   - Multiple H1 elements
   - Skipped heading levels
   - Non-descriptive headings

5. **Keyboard Traps**
   - Cannot escape element with keyboard
   - Tab order is illogical
   - Custom controls not keyboard accessible

---

## Testing Report Template

### VoiceOver Testing Report

**Date**: [Date]  
**Tester**: [Name]  
**Platform**: macOS [version] / iOS [version]  
**Browser**: Safari [version]  
**VoiceOver Version**: [version]

#### Summary
- **Total Issues Found**: [number]
- **Critical Issues**: [number]
- **Major Issues**: [number]
- **Minor Issues**: [number]

#### Issues Found

##### Issue #1
- **Severity**: Critical / Major / Minor
- **Page**: [Page name]
- **Element**: [Element description]
- **Issue**: [Description of problem]
- **Expected**: [What should happen]
- **Actual**: [What actually happens]
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
  3. Step 3
- **Screenshot**: [If applicable]

##### Issue #2
[Repeat format]

#### Positive Findings
- [List things that work well]

#### Recommendations
- [Suggestions for improvement]

---

## Success Criteria

### ✅ Pass Criteria

The platform passes VoiceOver testing if:

1. **All interactive elements are accessible**
   - Can navigate to all buttons, links, inputs
   - Can activate all controls with keyboard
   - All elements have clear labels

2. **Content structure is logical**
   - Headings follow proper hierarchy
   - Landmarks are properly defined
   - Reading order makes sense

3. **Dynamic content is announced**
   - Notifications are announced
   - Errors are announced immediately
   - Loading states are communicated

4. **Forms are fully accessible**
   - All inputs have labels
   - Errors are associated with fields
   - Required fields are indicated

5. **Navigation is efficient**
   - Skip links work
   - Landmarks enable quick navigation
   - Rotor navigation is effective

6. **No keyboard traps**
   - Can navigate entire site with keyboard
   - Can escape all modals
   - Tab order is logical

---

## Additional Resources

### Apple Documentation
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [VoiceOver Keyboard Commands](https://support.apple.com/guide/voiceover/keyboard-shortcuts-vo27973/mac)
- [iOS VoiceOver Gestures](https://support.apple.com/guide/iphone/learn-voiceover-gestures-iph3e2e2281/ios)

### WCAG Guidelines
- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

### Testing Tools
- [WebAIM Screen Reader Survey](https://webaim.org/projects/screenreadersurvey9/)
- [Accessibility Testing Checklist](https://www.a11yproject.com/checklist/)

---

## Notes

### Why VoiceOver?
- **Market Share**: 11.7% of screen reader users (WebAIM Survey)
- **Platform**: Default on macOS and iOS
- **Integration**: Best integration with Safari
- **Mobile**: Essential for iOS accessibility

### Limitations
- VoiceOver testing requires Apple hardware
- Cannot be automated
- Requires manual verification
- Time-intensive process

### Complementary Testing
- Also test with NVDA (Windows) - Task 5.4.5 ✅ Completed
- Use automated tools (axe-core, Lighthouse)
- Test with keyboard only (no screen reader)
- Test with other screen readers (JAWS, NVDA)

---

## Completion Checklist

- [ ] All 11 test areas completed
- [ ] All priority pages tested
- [ ] Issues documented in report
- [ ] Screenshots captured for issues
- [ ] Recommendations provided
- [ ] Report shared with team
- [ ] Critical issues flagged for immediate fix

---

**Status**: Ready for Manual Testing  
**Next Steps**: Perform testing on macOS/iOS device with VoiceOver enabled

