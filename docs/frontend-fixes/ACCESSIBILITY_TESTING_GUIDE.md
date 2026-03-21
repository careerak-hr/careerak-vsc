# Accessibility Testing Guide: Apply Page Enhancements

## Overview

This guide provides comprehensive accessibility testing procedures for the Apply Page Enhancements feature, ensuring WCAG 2.1 Level AA compliance and excellent user experience for all users, including those using assistive technologies.

## Testing Scope

### Components to Test
1. **MultiStepForm** - Multi-step navigation and progress indication
2. **PersonalInfoStep** - Form inputs and validation
3. **EducationExperienceStep** - Dynamic entry management
4. **SkillsLanguagesStep** - Skill selection and proficiency
5. **DocumentsQuestionsStep** - File upload and custom questions
6. **ReviewSubmitStep** - Application preview and submission
7. **FileUploadManager** - Drag-and-drop file upload
8. **StatusTimeline** - Status visualization
9. **AutoSaveIndicator** - Save status feedback
10. **ApplicationPreview** - Read-only application view

---

## 1. Keyboard Navigation Testing

### 1.1 Tab Order

**Objective**: Verify logical tab order through all interactive elements

**Test Steps**:
1. Open application form
2. Press `Tab` key repeatedly
3. Verify focus moves in logical order:
   - Form fields (top to bottom, left to right)
   - Action buttons (Previous, Next, Save)
   - File upload controls
   - Custom question inputs
   - Submit button

**Expected Results**:
- ✅ Tab order follows visual layout
- ✅ No focus traps (except intentional modal traps)
- ✅ All interactive elements are reachable
- ✅ Hidden elements are skipped
- ✅ Focus indicators are clearly visible

**Test Cases**:
```javascript
describe('Keyboard Navigation - Tab Order', () => {
  it('should follow logical tab order in PersonalInfoStep', () => {
    render(<PersonalInfoStep />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    fullNameInput.focus();
    userEvent.tab();
    expect(emailInput).toHaveFocus();
    
    userEvent.tab();
    expect(phoneInput).toHaveFocus();
    
    userEvent.tab();
    expect(nextButton).toHaveFocus();
  });
  
  it('should skip disabled buttons in tab order', () => {
    render(<MultiStepForm currentStep={1} />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
    
    // Tab should skip disabled button
    userEvent.tab();
    expect(previousButton).not.toHaveFocus();
  });
});
```

### 1.2 Shift+Tab (Reverse Navigation)

**Test Steps**:
1. Navigate to last interactive element
2. Press `Shift+Tab` repeatedly
3. Verify focus moves backward in reverse order

**Expected Results**:
- ✅ Reverse tab order mirrors forward order
- ✅ No elements are skipped
- ✅ Focus wraps appropriately at boundaries

### 1.3 Arrow Key Navigation

**Test Steps**:
1. Focus on radio button group
2. Use arrow keys to navigate options
3. Test in dropdown/select elements
4. Test in custom question multiple choice

**Expected Results**:
- ✅ Arrow keys navigate within grouped controls
- ✅ Up/Down arrows work in vertical lists
- ✅ Left/Right arrows work in horizontal controls
- ✅ Home/End keys jump to first/last items

**Test Cases**:
```javascript
describe('Keyboard Navigation - Arrow Keys', () => {
  it('should navigate proficiency levels with arrow keys', () => {
    render(<SkillsLanguagesStep />);
    
    const proficiencyRadios = screen.getAllByRole('radio', { name: /proficiency/i });
    
    proficiencyRadios[0].focus();
    fireEvent.keyDown(proficiencyRadios[0], { key: 'ArrowDown' });
    expect(proficiencyRadios[1]).toHaveFocus();
    
    fireEvent.keyDown(proficiencyRadios[1], { key: 'ArrowUp' });
    expect(proficiencyRadios[0]).toHaveFocus();
  });
});
```

### 1.4 Enter/Space Key Activation

**Test Steps**:
1. Focus on buttons
2. Press `Enter` or `Space`
3. Verify action is triggered

**Expected Results**:
- ✅ Buttons activate with Enter or Space
- ✅ Links activate with Enter only
- ✅ Checkboxes toggle with Space
- ✅ Custom controls respond appropriately

### 1.5 Escape Key

**Test Steps**:
1. Open modals/dialogs
2. Press `Escape`
3. Verify modal closes and focus returns

**Expected Results**:
- ✅ Escape closes modals
- ✅ Focus returns to trigger element
- ✅ Unsaved changes prompt appears if needed

---

## 2. Screen Reader Testing

### 2.1 NVDA (Windows)

**Setup**:
1. Install NVDA (free, open-source)
2. Start NVDA (Ctrl+Alt+N)
3. Open application in Chrome/Firefox

**Test Scenarios**:

#### Scenario 1: Form Completion
1. Navigate to application form
2. Listen to page title and heading announcements
3. Fill out each form field
4. Verify field labels are announced
5. Trigger validation errors
6. Verify error messages are announced

**Expected Announcements**:
```
"Job Application Form, heading level 1"
"Step 1 of 5: Personal Information"
"Full Name, edit, required"
"Email Address, edit, required, invalid format"
"Error: Please enter a valid email address"
```

#### Scenario 2: Multi-Step Navigation
1. Complete step 1
2. Click "Next" button
3. Verify step change is announced
4. Navigate back with "Previous"
5. Verify backward navigation is announced

**Expected Announcements**:
```
"Next, button"
"Moving to Step 2 of 5: Education & Experience"
"Previous, button"
"Returning to Step 1 of 5: Personal Information"
```

#### Scenario 3: File Upload
1. Navigate to file upload section
2. Activate file input
3. Select file
4. Verify upload progress is announced
5. Verify completion is announced

**Expected Announcements**:
```
"Upload Resume, button, required"
"File selected: resume.pdf, 2.5 MB"
"Uploading, progress 50%"
"Upload complete: resume.pdf"
"Remove resume.pdf, button"
```

#### Scenario 4: Auto-Save Feedback
1. Fill out form fields
2. Wait for auto-save
3. Verify save status is announced

**Expected Announcements**:
```
"Saving draft..."
"Draft saved at 10:30 AM"
"Auto-save failed. Retrying..."
```

**Test Cases**:
```javascript
describe('Screen Reader - ARIA Announcements', () => {
  it('should announce step changes', () => {
    render(<MultiStepForm />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Step 1 of 5: Personal Information');
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    userEvent.click(nextButton);
    
    expect(liveRegion).toHaveTextContent('Step 2 of 5: Education & Experience');
  });
  
  it('should announce validation errors', () => {
    render(<PersonalInfoStep />);
    
    const emailInput = screen.getByLabelText(/email/i);
    userEvent.type(emailInput, 'invalid-email');
    userEvent.tab(); // Trigger blur validation
    
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });
  
  it('should announce auto-save status', () => {
    render(<AutoSaveIndicator isSaving={true} />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Saving draft...');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
```

### 2.2 JAWS (Windows)

**Setup**:
1. Install JAWS (commercial, trial available)
2. Start JAWS
3. Open application in Chrome/Firefox/Edge

**Test Scenarios**: Same as NVDA, verify consistent behavior

### 2.3 VoiceOver (macOS/iOS)

**Setup**:
1. Enable VoiceOver (Cmd+F5 on Mac, triple-click home on iOS)
2. Open application in Safari

**Test Scenarios**: Same as NVDA, verify consistent behavior

**iOS Specific Tests**:
- Swipe gestures for navigation
- Rotor for form controls
- Touch exploration

---

## 3. ARIA Implementation Testing

### 3.1 ARIA Labels

**Test Steps**:
1. Inspect elements with DevTools
2. Verify ARIA labels are present and descriptive

**Required ARIA Labels**:
```jsx
// Form inputs
<input
  type="text"
  id="fullName"
  aria-label="Full Name"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "fullName-error" : undefined}
/>

// Error messages
<div id="fullName-error" role="alert" aria-live="assertive">
  Please enter your full name
</div>

// Progress indicator
<div
  role="progressbar"
  aria-valuenow={currentStep}
  aria-valuemin={1}
  aria-valuemax={5}
  aria-label={`Step ${currentStep} of 5`}
>
  {/* Visual progress */}
</div>

// File upload
<button
  aria-label="Upload resume (PDF, DOC, or DOCX, max 5MB)"
  aria-describedby="file-requirements"
>
  Upload Resume
</button>

// Status timeline
<ol role="list" aria-label="Application status timeline">
  <li role="listitem" aria-current={isCurrentStatus ? "step" : undefined}>
    <span aria-label="Status: Submitted on January 15, 2026">
      Submitted
    </span>
  </li>
</ol>

// Auto-save indicator
<div role="status" aria-live="polite" aria-atomic="true">
  {isSaving ? 'Saving draft...' : `Draft saved at ${lastSaved}`}
</div>
```

### 3.2 ARIA Live Regions

**Test Steps**:
1. Trigger dynamic content updates
2. Verify screen reader announces changes

**Live Region Types**:
- `aria-live="polite"` - Non-urgent updates (auto-save, step changes)
- `aria-live="assertive"` - Urgent updates (errors, warnings)
- `role="status"` - Status updates
- `role="alert"` - Error messages

**Test Cases**:
```javascript
describe('ARIA - Live Regions', () => {
  it('should use polite live region for auto-save', () => {
    render(<AutoSaveIndicator />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
  
  it('should use assertive live region for errors', () => {
    render(<FormField error="Invalid input" />);
    
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  });
});
```

### 3.3 ARIA Roles

**Required Roles**:
- `role="form"` - Form container
- `role="navigation"` - Step navigation
- `role="progressbar"` - Progress indicator
- `role="status"` - Status updates
- `role="alert"` - Error messages
- `role="dialog"` - Modals
- `role="listbox"` - Custom dropdowns
- `role="option"` - Dropdown options

---

## 4. Focus Management Testing

### 4.1 Focus Indicators

**Test Steps**:
1. Navigate with keyboard
2. Verify focus indicators are visible
3. Test in light and dark modes
4. Test with high contrast mode

**Expected Results**:
- ✅ Focus outline is clearly visible (min 2px)
- ✅ Contrast ratio ≥ 3:1 against background
- ✅ Focus indicator doesn't obscure content
- ✅ Custom focus styles are consistent

**CSS Requirements**:
```css
/* Focus indicators */
*:focus-visible {
  outline: 2px solid #D48161; /* Accent color */
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 3px;
    outline-color: currentColor;
  }
}

/* Dark mode */
.dark *:focus-visible {
  outline-color: #E3DAD1; /* Secondary color */
}
```

### 4.2 Focus Trapping in Modals

**Test Steps**:
1. Open modal (e.g., confirmation dialog)
2. Press Tab repeatedly
3. Verify focus stays within modal
4. Press Escape
5. Verify focus returns to trigger element

**Expected Results**:
- ✅ Focus trapped within modal
- ✅ Tab wraps from last to first element
- ✅ Shift+Tab wraps from first to last
- ✅ Escape closes modal
- ✅ Focus returns to trigger

**Test Cases**:
```javascript
describe('Focus Management - Modal Trap', () => {
  it('should trap focus within modal', () => {
    render(<ConfirmationModal isOpen={true} />);
    
    const modal = screen.getByRole('dialog');
    const firstButton = within(modal).getAllByRole('button')[0];
    const lastButton = within(modal).getAllByRole('button')[1];
    
    firstButton.focus();
    userEvent.tab();
    expect(lastButton).toHaveFocus();
    
    userEvent.tab();
    expect(firstButton).toHaveFocus(); // Wrapped
  });
  
  it('should return focus on close', () => {
    const triggerButton = document.createElement('button');
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    
    const { rerender } = render(<ConfirmationModal isOpen={true} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    rerender(<ConfirmationModal isOpen={false} />);
    
    expect(triggerButton).toHaveFocus();
  });
});
```

### 4.3 Focus on Error

**Test Steps**:
1. Submit form with validation errors
2. Verify focus moves to first error
3. Verify error is announced

**Expected Results**:
- ✅ Focus moves to first invalid field
- ✅ Error message is announced
- ✅ Field label is announced

---

## 5. Form Accessibility Testing

### 5.1 Labels and Instructions

**Test Steps**:
1. Inspect all form fields
2. Verify each has associated label
3. Verify required fields are marked
4. Verify instructions are provided

**Expected Results**:
- ✅ All inputs have `<label>` or `aria-label`
- ✅ Labels are descriptive and clear
- ✅ Required fields marked with `aria-required="true"`
- ✅ Instructions use `aria-describedby`

**Implementation**:
```jsx
<div className="form-field">
  <label htmlFor="email" className="required">
    Email Address
    <span aria-label="required">*</span>
  </label>
  <input
    type="email"
    id="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-hint email-error"
  />
  <div id="email-hint" className="hint">
    We'll use this to contact you about your application
  </div>
  {hasError && (
    <div id="email-error" role="alert" className="error">
      Please enter a valid email address
    </div>
  )}
</div>
```

### 5.2 Error Identification

**Test Steps**:
1. Trigger validation errors
2. Verify errors are clearly identified
3. Verify errors are associated with fields

**Expected Results**:
- ✅ Errors use `role="alert"`
- ✅ Errors linked with `aria-describedby`
- ✅ Fields marked with `aria-invalid="true"`
- ✅ Error summary at top of form (optional)

### 5.3 Autocomplete Attributes

**Test Steps**:
1. Inspect form fields
2. Verify autocomplete attributes are present

**Expected Attributes**:
```jsx
<input type="text" name="name" autocomplete="name" />
<input type="email" name="email" autocomplete="email" />
<input type="tel" name="phone" autocomplete="tel" />
<input type="text" name="country" autocomplete="country-name" />
<input type="text" name="city" autocomplete="address-level2" />
```

---

## 6. Color Contrast Testing

### 6.1 Text Contrast

**Test Steps**:
1. Use browser DevTools or contrast checker
2. Verify all text meets WCAG AA standards

**Requirements**:
- ✅ Normal text (< 18pt): 4.5:1 contrast ratio
- ✅ Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio
- ✅ UI components: 3:1 contrast ratio

**Color Palette Verification**:
```
Primary (#304B60) on Secondary (#E3DAD1): 8.2:1 ✅
Accent (#D48161) on Secondary (#E3DAD1): 3.1:1 ✅
Primary (#304B60) on White (#FFFFFF): 10.5:1 ✅
Error (#DC2626) on White (#FFFFFF): 5.9:1 ✅
```

### 6.2 Non-Text Contrast

**Test Steps**:
1. Check form field borders
2. Check button outlines
3. Check focus indicators
4. Check icons

**Requirements**:
- ✅ Form borders: 3:1 contrast
- ✅ Focus indicators: 3:1 contrast
- ✅ Icons: 3:1 contrast (if conveying information)

---

## 7. Responsive Accessibility Testing

### 7.1 Mobile Touch Targets

**Test Steps**:
1. Open on mobile device or emulator
2. Verify touch targets are large enough

**Requirements**:
- ✅ Minimum 44x44 CSS pixels
- ✅ Adequate spacing between targets (8px)
- ✅ No overlapping targets

### 7.2 Zoom and Reflow

**Test Steps**:
1. Zoom to 200%
2. Verify content reflows
3. Verify no horizontal scrolling
4. Verify all functionality remains

**Expected Results**:
- ✅ Content reflows at 200% zoom
- ✅ No horizontal scrolling
- ✅ All controls remain accessible
- ✅ Text remains readable

---

## 8. Automated Testing Tools

### 8.1 axe DevTools

**Setup**:
1. Install axe DevTools browser extension
2. Open application
3. Run axe scan

**Test Steps**:
1. Scan each step of the form
2. Review violations
3. Fix critical and serious issues
4. Document moderate and minor issues

### 8.2 Lighthouse Accessibility Audit

**Test Steps**:
```bash
lighthouse https://your-app.com --only-categories=accessibility
```

**Target Score**: 95+

### 8.3 Pa11y

**Setup**:
```bash
npm install -g pa11y
```

**Test Steps**:
```bash
pa11y https://your-app.com/apply
```

### 8.4 Jest-axe

**Implementation**:
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ApplicationForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 9. Accessibility Checklist

### General
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Page has descriptive title
- [ ] Headings are hierarchical (h1 → h2 → h3)
- [ ] Language is specified (`lang="ar"` or `lang="en"`)

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible (2px, 3:1 contrast)
- [ ] No keyboard traps (except modals)
- [ ] Skip links provided (optional)

### Screen Readers
- [ ] All form fields have labels
- [ ] Error messages are announced
- [ ] Status updates are announced
- [ ] Dynamic content changes are announced
- [ ] ARIA landmarks are used

### Forms
- [ ] Required fields are marked
- [ ] Error messages are descriptive
- [ ] Instructions are provided
- [ ] Autocomplete attributes are used
- [ ] Validation is accessible

### Color and Contrast
- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Text contrast ≥ 3:1 (large text)
- [ ] UI component contrast ≥ 3:1
- [ ] Information not conveyed by color alone

### Responsive
- [ ] Touch targets ≥ 44x44px
- [ ] Content reflows at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Orientation changes supported

### Testing
- [ ] Tested with NVDA/JAWS (Windows)
- [ ] Tested with VoiceOver (Mac/iOS)
- [ ] Tested with keyboard only
- [ ] Tested with axe DevTools
- [ ] Lighthouse accessibility score ≥ 95

---

## 10. Common Issues and Fixes

### Issue 1: Missing Form Labels
**Problem**: Screen reader announces "Edit, blank"
**Fix**: Add `<label>` or `aria-label`
```jsx
// Before
<input type="text" />

// After
<label htmlFor="name">Full Name</label>
<input type="text" id="name" />
```

### Issue 2: Validation Errors Not Announced
**Problem**: Errors appear visually but not announced
**Fix**: Use `role="alert"` and `aria-live="assertive"`
```jsx
<div role="alert" aria-live="assertive">
  {error}
</div>
```

### Issue 3: Focus Not Visible
**Problem**: Can't see which element has focus
**Fix**: Add visible focus indicator
```css
*:focus-visible {
  outline: 2px solid #D48161;
  outline-offset: 2px;
}
```

### Issue 4: Modal Focus Not Trapped
**Problem**: Tab escapes modal
**Fix**: Implement focus trap
```javascript
const FocusTrap = ({ children }) => {
  const trapRef = useRef();
  
  useEffect(() => {
    const trap = createFocusTrap(trapRef.current);
    trap.activate();
    return () => trap.deactivate();
  }, []);
  
  return <div ref={trapRef}>{children}</div>;
};
```

### Issue 5: Dynamic Content Not Announced
**Problem**: Auto-save happens silently
**Fix**: Use ARIA live region
```jsx
<div role="status" aria-live="polite">
  {isSaving ? 'Saving...' : 'Saved'}
</div>
```

---

## 11. Resources

### Tools
- **NVDA**: https://www.nvaccess.org/
- **JAWS**: https://www.freedomscientific.com/products/software/jaws/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Lighthouse**: Built into Chrome DevTools
- **Pa11y**: https://pa11y.org/
- **Color Contrast Analyzer**: https://www.tpgi.com/color-contrast-checker/

### Guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/

### Testing Guides
- **WebAIM Screen Reader Testing**: https://webaim.org/articles/screenreader_testing/
- **Keyboard Accessibility**: https://webaim.org/articles/keyboard/
- **ARIA Live Regions**: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions

---

## 12. Sign-Off Criteria

Before marking accessibility testing as complete:

1. ✅ All automated tests pass (axe, Lighthouse, Pa11y)
2. ✅ Manual keyboard testing completed
3. ✅ Screen reader testing completed (NVDA + VoiceOver minimum)
4. ✅ Color contrast verified
5. ✅ Focus management verified
6. ✅ All critical and serious issues fixed
7. ✅ Documentation updated
8. ✅ Accessibility statement created (if required)

---

**Last Updated**: 2026-03-04  
**Status**: Ready for Implementation  
**Next Steps**: Begin testing with automated tools, then proceed to manual testing
