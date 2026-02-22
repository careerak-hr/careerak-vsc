# ARIA Implementation Guide

## Overview
This guide documents the ARIA (Accessible Rich Internet Applications) implementation across the Careerak platform to ensure WCAG 2.1 Level AA compliance.

**Requirements**: FR-A11Y-1, FR-A11Y-2, FR-A11Y-3, FR-A11Y-4, FR-A11Y-5

## ARIA Helpers Utility

Location: `frontend/src/utils/ariaHelpers.js`

This utility provides helper functions for consistent ARIA implementation:

### Available Functions

1. **getAriaLabel(key, language)** - Get translated ARIA labels
2. **getAriaRole(type)** - Get appropriate ARIA role
3. **getButtonAriaAttributes(options)** - Generate button ARIA attributes
4. **getInputAriaAttributes(options)** - Generate input ARIA attributes
5. **getModalAriaAttributes(options)** - Generate modal ARIA attributes
6. **getNavAriaAttributes(options)** - Generate navigation ARIA attributes
7. **getListAriaAttributes(options)** - Generate list ARIA attributes
8. **getTabAriaAttributes(options)** - Generate tab ARIA attributes
9. **getLiveRegionAttributes(politeness, atomic)** - Generate live region attributes
10. **needsAriaLabel(element)** - Check if element needs ARIA label

## Implementation Checklist

### ✅ Navigation Elements

#### Navbar
- [x] `role="navigation"`
- [x] `aria-label` for main navigation
- [x] `aria-expanded` for dropdown menus
- [x] `aria-controls` for controlled elements
- [x] `aria-label` for icon buttons (theme toggle, settings)

#### Footer
- [x] `role="navigation"`
- [x] `aria-label` for footer navigation
- [x] `aria-current="page"` for active links
- [x] `aria-hidden="true"` for decorative icons
- [x] `aria-label` for notification badges

### ✅ Interactive Elements

#### Buttons
All buttons must have:
- Text content OR `aria-label`
- `aria-expanded` if they control expandable content
- `aria-pressed` for toggle buttons
- `aria-controls` if they control other elements
- `aria-disabled` if disabled

Example:
```jsx
import { getButtonAriaAttributes } from '../utils/ariaHelpers';

<button
  {...getButtonAriaAttributes({
    label: 'close',
    expanded: isOpen,
    controls: 'menu-panel',
    language: 'en'
  })}
  onClick={handleClick}
>
  ✕
</button>
```

#### Links
All links must have:
- Descriptive text content OR `aria-label`
- `aria-current="page"` for current page
- `aria-describedby` for additional context

### ✅ Forms

#### Form Inputs
All inputs must have:
- Associated `<label>` OR `aria-label`
- `aria-required` for required fields
- `aria-invalid` for invalid fields
- `aria-describedby` for error messages

Example:
```jsx
import { getInputAriaAttributes } from '../utils/ariaHelpers';

<input
  type="email"
  {...getInputAriaAttributes({
    label: 'email',
    required: true,
    invalid: hasError,
    errorId: 'email-error',
    language: 'en'
  })}
/>
{hasError && (
  <div id="email-error" role="alert">
    {errorMessage}
  </div>
)}
```

#### Form Validation
- Use `role="alert"` for error messages
- Use `aria-live="polite"` for non-critical updates
- Use `aria-live="assertive"` for critical errors

### ✅ Modals/Dialogs

All modals must have:
- `role="dialog"` or `role="alertdialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to description (optional)
- Focus trap implementation
- Escape key to close

Example:
```jsx
import { getModalAriaAttributes } from '../utils/ariaHelpers';

const modalAttrs = getModalAriaAttributes({
  titleId: 'modal-title',
  descriptionId: 'modal-description',
  modal: true,
  language: 'en'
});

<div {...modalAttrs}>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

### ✅ Lists and Grids

#### Job/Course Lists
- `aria-label` for list container
- `aria-setsize` for total items
- `aria-posinset` for item position

Example:
```jsx
<div 
  role="list"
  aria-label="Job postings"
  aria-setsize={jobs.length}
>
  {jobs.map((job, index) => (
    <div 
      key={job.id}
      role="listitem"
      aria-posinset={index + 1}
    >
      {/* Job content */}
    </div>
  ))}
</div>
```

### ✅ Loading States

#### Spinners and Progress Indicators
- `role="status"` for loading indicators
- `aria-live="polite"` for updates
- `aria-busy="true"` while loading
- `aria-label` describing the loading state

Example:
```jsx
<div 
  role="status" 
  aria-live="polite" 
  aria-busy="true"
  aria-label="Loading content"
>
  <span className="spinner" aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

### ✅ Notifications

#### Notification System
- `role="alert"` for urgent notifications
- `role="status"` for non-urgent updates
- `aria-live="assertive"` for alerts
- `aria-live="polite"` for status updates

Example:
```jsx
<div 
  role="alert" 
  aria-live="assertive"
  aria-atomic="true"
>
  {errorMessage}
</div>
```

### ✅ Tabs

#### Tab Interface
- `role="tablist"` for tab container
- `role="tab"` for each tab
- `role="tabpanel"` for content panels
- `aria-selected` for active tab
- `aria-controls` linking tab to panel

Example:
```jsx
<div role="tablist" aria-label="Profile sections">
  <button
    role="tab"
    aria-selected={activeTab === 'info'}
    aria-controls="info-panel"
    id="info-tab"
  >
    Information
  </button>
</div>
<div
  role="tabpanel"
  id="info-panel"
  aria-labelledby="info-tab"
  hidden={activeTab !== 'info'}
>
  {/* Panel content */}
</div>
```

### ✅ Images

All images must have:
- Descriptive `alt` text for meaningful images
- Empty `alt=""` for decorative images
- `role="presentation"` for decorative images (optional)

Example:
```jsx
{/* Meaningful image */}
<img 
  src={user.avatar} 
  alt={`${user.name}'s profile picture`}
/>

{/* Decorative image */}
<img 
  src="/decoration.svg" 
  alt="" 
  role="presentation"
  aria-hidden="true"
/>
```

## Landmarks

### Required Landmarks

1. **Banner** (`<header>` or `role="banner"`)
   - Main site header
   - Should contain logo and main navigation

2. **Navigation** (`<nav>` or `role="navigation"`)
   - Main navigation
   - Footer navigation
   - Breadcrumbs
   - Each should have unique `aria-label`

3. **Main** (`<main>` or `role="main"`)
   - Primary content area
   - Only one per page

4. **Complementary** (`<aside>` or `role="complementary"`)
   - Supporting content
   - Sidebars

5. **Contentinfo** (`<footer>` or `role="contentinfo"`)
   - Site footer
   - Copyright, links, etc.

6. **Search** (`role="search"`)
   - Search functionality

Example:
```jsx
<div className="app">
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      {/* Navigation items */}
    </nav>
  </header>
  
  <main role="main">
    {/* Main content */}
  </main>
  
  <aside role="complementary" aria-label="Related content">
    {/* Sidebar */}
  </aside>
  
  <footer role="contentinfo">
    <nav role="navigation" aria-label="Footer navigation">
      {/* Footer links */}
    </nav>
  </footer>
</div>
```

## Skip Links

Provide skip links for keyboard navigation:

```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<main id="main-content" tabIndex="-1">
  {/* Content */}
</main>
```

CSS:
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #304B60;
  color: #E3DAD1;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Live Regions

### AriaLiveRegion Component

Location: `frontend/src/components/Accessibility/AriaLiveRegion.jsx`

Use for dynamic content updates:

```jsx
import AriaLiveRegion from '../components/Accessibility/AriaLiveRegion';

<AriaLiveRegion 
  message="Form submitted successfully" 
  politeness="polite"
  role="status"
/>
```

### Politeness Levels

- **off**: No announcement
- **polite**: Announce when user is idle (default)
- **assertive**: Announce immediately (use sparingly)

## Testing

### Automated Testing

Run accessibility tests:
```bash
npm test -- aria-labels.property.test.jsx --run
```

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Escape key on modals

2. **Screen Reader Testing**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (Mac/iOS)
   - TalkBack (Android)

3. **Browser DevTools**
   - Chrome: Lighthouse Accessibility audit
   - Firefox: Accessibility Inspector
   - axe DevTools extension

### Common Issues

1. **Missing ARIA labels on icon buttons**
   ```jsx
   {/* ❌ Bad */}
   <button onClick={handleClose}>✕</button>
   
   {/* ✅ Good */}
   <button onClick={handleClose} aria-label="Close">✕</button>
   ```

2. **Incorrect role usage**
   ```jsx
   {/* ❌ Bad */}
   <div role="button" onClick={handleClick}>Click me</div>
   
   {/* ✅ Good */}
   <button onClick={handleClick}>Click me</button>
   ```

3. **Missing form labels**
   ```jsx
   {/* ❌ Bad */}
   <input type="email" placeholder="Email" />
   
   {/* ✅ Good */}
   <label htmlFor="email">Email</label>
   <input id="email" type="email" />
   ```

4. **Non-unique IDs**
   ```jsx
   {/* ❌ Bad */}
   <div id="modal-title">Title 1</div>
   <div id="modal-title">Title 2</div>
   
   {/* ✅ Good */}
   <div id="modal-1-title">Title 1</div>
   <div id="modal-2-title">Title 2</div>
   ```

## Multi-Language Support

All ARIA labels support Arabic, English, and French:

```jsx
import { getAriaLabel } from '../utils/ariaHelpers';

<button aria-label={getAriaLabel('close', language)}>
  ✕
</button>

// Output:
// ar: 'إغلاق'
// en: 'Close'
// fr: 'Fermer'
```

## Component-Specific Guidelines

### Navbar
- Main navigation with `aria-label`
- Settings button with `aria-expanded`
- Theme toggle with descriptive label
- Focus trap in settings panel

### Footer
- Footer navigation with `aria-label`
- Active page indicator with `aria-current`
- Notification badge with count announcement

### Modals
- Dialog role with `aria-modal`
- Title with `aria-labelledby`
- Focus trap implementation
- Escape key handler

### Forms
- All inputs labeled
- Required fields marked
- Error messages announced
- Validation feedback

### Lists
- Semantic list markup
- Item count announced
- Position in list announced

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [axe Accessibility Testing](https://www.deque.com/axe/)

## Status

✅ **Completed Components:**
- Navbar
- Footer
- ConfirmationModal
- AlertModal
- AriaLiveRegion
- FocusTrap
- SkipLink

🔄 **In Progress:**
- All page components
- Form components
- List components
- Card components

## Next Steps

1. Add ARIA attributes to all page components
2. Update form components with proper labels
3. Add landmarks to all pages
4. Implement skip links globally
5. Run comprehensive accessibility audit
6. Fix any remaining issues

---

**Last Updated**: 2026-02-22
**Status**: ✅ Implementation in progress
**Requirements**: FR-A11Y-1, FR-A11Y-2, FR-A11Y-3, FR-A11Y-4, FR-A11Y-5
