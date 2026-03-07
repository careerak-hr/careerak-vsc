# Accessibility Implementation Checklist

Use this checklist during development to ensure accessibility compliance.

---

## General Requirements

### Page Structure
- [ ] Page has descriptive `<title>`
- [ ] Language is specified (`lang="ar"` or `lang="en"`)
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Landmarks are used (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Skip links provided (optional but recommended)

### Images and Media
- [ ] All images have `alt` text
- [ ] Decorative images have empty `alt` (`alt=""`)
- [ ] Complex images have detailed descriptions
- [ ] Icons have `aria-label` if conveying information

---

## Keyboard Navigation

### Tab Order
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order follows visual layout (top to bottom, left to right)
- [ ] Disabled elements are skipped in tab order
- [ ] Hidden elements are removed from tab order (`tabindex="-1"`)
- [ ] No keyboard traps (except intentional modal traps)

### Focus Indicators
- [ ] Focus indicators are visible on all interactive elements
- [ ] Focus outline is at least 2px
- [ ] Focus contrast ratio ≥ 3:1 against background
- [ ] Focus indicators work in light and dark modes
- [ ] Custom focus styles are consistent

```css
/* Required CSS */
*:focus-visible {
  outline: 2px solid #D48161;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Keyboard Shortcuts
- [ ] Enter activates buttons and links
- [ ] Space activates buttons and toggles checkboxes
- [ ] Arrow keys navigate grouped controls (radio buttons, dropdowns)
- [ ] Escape closes modals and dismisses popups
- [ ] Home/End jump to first/last items (where applicable)

---

## Screen Reader Support

### ARIA Labels
- [ ] All form inputs have labels (`<label>` or `aria-label`)
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Links have descriptive text or `aria-label`
- [ ] Icons have `aria-label` if conveying information
- [ ] Custom controls have appropriate ARIA attributes

```jsx
// Example: Form input with label
<label htmlFor="email">Email Address</label>
<input
  type="email"
  id="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : "email-hint"}
/>
```

### ARIA Roles
- [ ] Custom controls have appropriate roles
- [ ] Progress indicators use `role="progressbar"`
- [ ] Status updates use `role="status"`
- [ ] Error messages use `role="alert"`
- [ ] Modals use `role="dialog"` and `aria-modal="true"`
- [ ] Lists use `role="list"` and `role="listitem"`

### ARIA States and Properties
- [ ] Required fields marked with `aria-required="true"`
- [ ] Invalid fields marked with `aria-invalid="true"`
- [ ] Expanded/collapsed states use `aria-expanded`
- [ ] Selected items use `aria-selected`
- [ ] Current page/step uses `aria-current`
- [ ] Hidden content uses `aria-hidden="true"`

### ARIA Live Regions
- [ ] Dynamic content updates use live regions
- [ ] Non-urgent updates use `aria-live="polite"`
- [ ] Urgent updates use `aria-live="assertive"`
- [ ] Status updates use `role="status"`
- [ ] Error messages use `role="alert"`

```jsx
// Example: Auto-save indicator
<div role="status" aria-live="polite" aria-atomic="true">
  {isSaving ? 'Saving draft...' : `Draft saved at ${lastSaved}`}
</div>

// Example: Error message
<div role="alert" aria-live="assertive">
  {error}
</div>
```

---

## Form Accessibility

### Labels and Instructions
- [ ] All inputs have associated labels
- [ ] Labels are descriptive and clear
- [ ] Required fields are marked visually and with `aria-required`
- [ ] Instructions are provided via `aria-describedby`
- [ ] Placeholder text is not used as labels

```jsx
// Example: Complete form field
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
    We'll use this to contact you
  </div>
  {hasError && (
    <div id="email-error" role="alert" className="error">
      Please enter a valid email address
    </div>
  )}
</div>
```

### Error Handling
- [ ] Errors are clearly identified
- [ ] Errors are associated with fields via `aria-describedby`
- [ ] Invalid fields marked with `aria-invalid="true"`
- [ ] Error messages use `role="alert"`
- [ ] Focus moves to first error on validation failure
- [ ] Error summary provided at top of form (optional)

### Autocomplete
- [ ] Autocomplete attributes on appropriate fields
- [ ] Name field: `autocomplete="name"`
- [ ] Email field: `autocomplete="email"`
- [ ] Phone field: `autocomplete="tel"`
- [ ] Address fields: `autocomplete="address-line1"`, etc.

---

## Focus Management

### Modal Focus Trapping
- [ ] Focus trapped within modal when open
- [ ] Tab wraps from last to first element
- [ ] Shift+Tab wraps from first to last element
- [ ] Escape closes modal
- [ ] Focus returns to trigger element on close

```jsx
// Example: Focus trap implementation
import { useEffect, useRef } from 'react';
import { createFocusTrap } from 'focus-trap';

const Modal = ({ isOpen, onClose }) => {
  const trapRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      const trap = createFocusTrap(trapRef.current, {
        onDeactivate: onClose
      });
      trap.activate();
      return () => trap.deactivate();
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
};
```

### Focus on Error
- [ ] Focus moves to first invalid field on validation failure
- [ ] Error message is announced by screen reader
- [ ] Field label is announced by screen reader

---

## Color and Contrast

### Text Contrast
- [ ] Normal text (< 18pt): 4.5:1 contrast ratio
- [ ] Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio
- [ ] Text on images: sufficient contrast or background overlay

### UI Component Contrast
- [ ] Form field borders: 3:1 contrast ratio
- [ ] Button outlines: 3:1 contrast ratio
- [ ] Focus indicators: 3:1 contrast ratio
- [ ] Icons: 3:1 contrast ratio (if conveying information)

### Color Usage
- [ ] Information not conveyed by color alone
- [ ] Error states have icons or text in addition to red color
- [ ] Success states have icons or text in addition to green color
- [ ] Links are distinguishable from surrounding text (underline or bold)

---

## Responsive Accessibility

### Touch Targets
- [ ] Minimum 44x44 CSS pixels
- [ ] Adequate spacing between targets (8px minimum)
- [ ] No overlapping touch targets
- [ ] Touch targets work on all devices

### Zoom and Reflow
- [ ] Content reflows at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] All functionality remains accessible at 200% zoom
- [ ] Text remains readable at 200% zoom
- [ ] Font size ≥ 16px for inputs (prevents iOS zoom)

### Orientation
- [ ] Content works in portrait and landscape
- [ ] No orientation restrictions (unless essential)
- [ ] Layout adapts to orientation changes

---

## Semantic HTML

### Structure
- [ ] Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Use `<button>` for buttons, not `<div>` with `onClick`
- [ ] Use `<a>` for links, not `<div>` with `onClick`
- [ ] Use `<form>` for forms
- [ ] Use `<table>` for tabular data

### Headings
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Page has one `<h1>`
- [ ] Headings describe content accurately
- [ ] Headings are not used for styling only

### Lists
- [ ] Use `<ul>` or `<ol>` for lists
- [ ] Use `<li>` for list items
- [ ] Don't use lists for non-list content

---

## Testing Requirements

### Automated Testing
- [ ] Run axe DevTools scan (0 critical violations)
- [ ] Run Lighthouse accessibility audit (score ≥ 95)
- [ ] Run jest-axe tests (all pass)
- [ ] Run Pa11y scan (0 errors)

### Manual Testing
- [ ] Test with keyboard only (no mouse)
- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver screen reader (Mac/iOS)
- [ ] Test with JAWS screen reader (Windows) - optional
- [ ] Test with high contrast mode
- [ ] Test with 200% zoom
- [ ] Test on mobile devices

### Browser Testing
- [ ] Chrome (desktop and mobile)
- [ ] Firefox (desktop and mobile)
- [ ] Safari (desktop and iOS)
- [ ] Edge (desktop)

---

## Component-Specific Checklists

### MultiStepForm
- [ ] Progress indicator uses `role="progressbar"`
- [ ] Step changes announced with live region
- [ ] Current step marked with `aria-current="step"`
- [ ] Navigation buttons have descriptive labels
- [ ] Disabled buttons skipped in tab order

### FileUploadManager
- [ ] File input has descriptive label
- [ ] Drag-and-drop area has keyboard alternative
- [ ] Upload progress announced with live region
- [ ] File list uses semantic list markup
- [ ] Remove buttons have descriptive labels

### StatusTimeline
- [ ] Timeline uses semantic list markup (`<ol>`)
- [ ] Current status marked with `aria-current="step"`
- [ ] Status changes announced with live region
- [ ] Timestamps are accessible
- [ ] Visual indicators have text alternatives

### AutoSaveIndicator
- [ ] Save status announced with `role="status"`
- [ ] Uses `aria-live="polite"` for non-urgent updates
- [ ] Last saved time is accessible
- [ ] Error states use `role="alert"`

---

## Common Mistakes to Avoid

### ❌ Don't Do This
```jsx
// Missing label
<input type="text" placeholder="Enter your name" />

// Div as button
<div onClick={handleClick}>Submit</div>

// Color only for errors
<input style={{ borderColor: 'red' }} />

// Missing alt text
<img src="logo.png" />

// Keyboard trap
<div onKeyDown={(e) => e.preventDefault()}>...</div>
```

### ✅ Do This Instead
```jsx
// Proper label
<label htmlFor="name">Full Name</label>
<input type="text" id="name" />

// Proper button
<button onClick={handleClick}>Submit</button>

// Error with text
<input aria-invalid="true" aria-describedby="name-error" />
<div id="name-error" role="alert">Please enter your name</div>

// Proper alt text
<img src="logo.png" alt="Careerak logo" />

// No keyboard trap
<div>...</div>
```

---

## Sign-Off

Before marking accessibility as complete:

- [ ] All automated tests pass
- [ ] Manual keyboard testing completed
- [ ] Screen reader testing completed
- [ ] Color contrast verified
- [ ] Focus management verified
- [ ] All critical issues fixed
- [ ] Documentation updated
- [ ] Team trained on accessibility

---

## Resources

### Tools
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Lighthouse**: Built into Chrome DevTools
- **NVDA**: https://www.nvaccess.org/
- **Color Contrast Analyzer**: https://www.tpgi.com/color-contrast-checker/

### Guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/

### Documentation
- `ACCESSIBILITY_TESTING_GUIDE.md` - Comprehensive testing guide
- `ACCESSIBILITY_TESTING_QUICK_START.md` - Quick start guide
- `accessibility.test.js` - Test implementation

---

**Last Updated**: 2026-03-04  
**Status**: Ready for Use  
**Compliance Target**: WCAG 2.1 Level AA
