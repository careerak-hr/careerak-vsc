# Tab Order Guidelines for Careerak

**Purpose**: Ensure logical keyboard navigation across all pages  
**Standard**: WCAG 2.1 Level AA Success Criterion 2.4.3 (Focus Order)  
**Last Updated**: 2026-02-17

## Table of Contents

1. [Overview](#overview)
2. [When to Use tabIndex](#when-to-use-tabindex)
3. [Common Patterns](#common-patterns)
4. [Best Practices](#best-practices)
5. [Testing](#testing)
6. [Examples](#examples)

## Overview

Tab order determines the sequence in which interactive elements receive keyboard focus when users press the Tab key. A logical tab order is essential for:

- **Keyboard users** who navigate without a mouse
- **Screen reader users** who rely on sequential navigation
- **Motor-impaired users** who use keyboard-only navigation
- **WCAG compliance** (Success Criterion 2.4.3)

### The Golden Rule

**Let the natural DOM order work whenever possible.**

Only use `tabIndex` when you need to:
1. Make a non-interactive element interactive (e.g., `<div role="button">`)
2. Remove an element from tab order (e.g., inactive tabs)
3. Make an element programmatically focusable but not tabbable

## When to Use tabIndex

### tabIndex={0}

**Use for**: Custom interactive elements that should be in natural tab order

```jsx
// ✅ CORRECT: Div acting as button
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>

// ✅ CORRECT: Custom interactive component
<div 
  role="listbox"
  tabIndex={0}
  aria-label="Select option"
>
  {options.map(opt => <div role="option">{opt}</div>)}
</div>
```

**Don't use for**: Native interactive elements

```jsx
// ❌ WRONG: Redundant on native button
<button tabIndex={0}>Click me</button>

// ✅ CORRECT: No tabIndex needed
<button>Click me</button>
```

### tabIndex={-1}

**Use for**: Elements that should be programmatically focusable but not in tab order

```jsx
// ✅ CORRECT: Inactive tabs
<button
  role="tab"
  tabIndex={activeTab === 'tab1' ? 0 : -1}
  aria-selected={activeTab === 'tab1'}
>
  Tab 1
</button>

// ✅ CORRECT: Hidden content that may receive focus
<div 
  className={isVisible ? '' : 'hidden'}
  tabIndex={-1}
  ref={contentRef}
>
  Content
</div>

// ✅ CORRECT: Skip link target
<main id="main-content" tabIndex={-1}>
  {/* Main content */}
</main>
```

### tabIndex > 0

**Never use**: Breaks natural tab order and creates confusion

```jsx
// ❌ NEVER DO THIS
<button tabIndex={1}>First</button>
<button tabIndex={2}>Second</button>
<button tabIndex={3}>Third</button>

// ✅ CORRECT: Let DOM order work
<button>First</button>
<button>Second</button>
<button>Third</button>
```

## Common Patterns

### 1. Tab Panels (ARIA Tabs)

```jsx
const TabPanel = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const tabs = ['tab1', 'tab2', 'tab3'];

  const handleTabKeyDown = (e) => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }

    if (newIndex !== currentIndex) {
      setActiveTab(tabs[newIndex]);
      // Focus the new tab
      document.getElementById(`${tabs[newIndex]}-tab`)?.focus();
    }
  };

  return (
    <div>
      <div role="tablist">
        {tabs.map(tab => (
          <button
            key={tab}
            id={`${tab}-tab`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={handleTabKeyDown}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {tabs.map(tab => (
        <div
          key={tab}
          id={`${tab}-panel`}
          role="tabpanel"
          aria-labelledby={`${tab}-tab`}
          hidden={activeTab !== tab}
        >
          {/* Panel content */}
        </div>
      ))}
    </div>
  );
};
```

### 2. Modal Dialogs

```jsx
import { useFocusTrap } from '../components/Accessibility';

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
```

### 3. Dropdown Menus

```jsx
const Dropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useFocusTrap(isOpen, onClose);

  return (
    <div className="dropdown-container">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
      >
        Menu
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          id="dropdown-menu"
          role="menu"
        >
          <button role="menuitem">Option 1</button>
          <button role="menuitem">Option 2</button>
          <button role="menuitem">Option 3</button>
        </div>
      )}
    </div>
  );
};
```

### 4. Skip Links

```jsx
import { SkipLink } from '../components/Accessibility';

const Layout = ({ children }) => {
  return (
    <>
      <SkipLink targetId="main-content" language="ar" />
      <header>
        <nav>{/* Navigation */}</nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer>{/* Footer */}</footer>
    </>
  );
};
```

### 5. Custom Interactive Elements

```jsx
// ✅ CORRECT: Div as button with full keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Upload photo"
>
  📷 Upload
</div>

// ✅ BETTER: Use native button when possible
<button onClick={handleClick} aria-label="Upload photo">
  📷 Upload
</button>
```

## Best Practices

### 1. Follow Visual Order

Tab order should match the visual order of elements on the page.

```jsx
// ✅ CORRECT: DOM order matches visual order
<div className="form">
  <input name="firstName" />
  <input name="lastName" />
  <input name="email" />
  <button type="submit">Submit</button>
</div>

// ❌ WRONG: Using tabIndex to fix bad layout
<div className="form">
  <input name="email" tabIndex={3} />
  <input name="firstName" tabIndex={1} />
  <button type="submit" tabIndex={4} />
  <input name="lastName" tabIndex={2} />
</div>
```

**Fix**: Reorder the DOM to match visual order, don't use tabIndex > 0.

### 2. Use Semantic HTML

Native interactive elements have built-in keyboard support.

```jsx
// ✅ CORRECT: Semantic HTML
<button onClick={handleClick}>Click me</button>
<a href="/page">Link</a>
<input type="text" />
<select><option>Option</option></select>

// ❌ WRONG: Reinventing the wheel
<div onClick={handleClick} tabIndex={0} role="button">Click me</div>
<span onClick={navigate} tabIndex={0} role="link">Link</span>
```

### 3. Manage Focus in Dynamic Content

When content changes, manage focus appropriately.

```jsx
const DynamicContent = () => {
  const [showContent, setShowContent] = useState(false);
  const contentRef = useRef(null);

  const handleShow = () => {
    setShowContent(true);
    // Focus the new content
    setTimeout(() => {
      contentRef.current?.focus();
    }, 0);
  };

  return (
    <>
      <button onClick={handleShow}>Show Content</button>
      {showContent && (
        <div ref={contentRef} tabIndex={-1}>
          New content
        </div>
      )}
    </>
  );
};
```

### 4. Test with Keyboard Only

Always test your pages using only the keyboard:

1. **Tab** - Move forward through interactive elements
2. **Shift + Tab** - Move backward
3. **Enter** - Activate buttons and links
4. **Space** - Activate buttons and checkboxes
5. **Arrow keys** - Navigate within components (tabs, dropdowns)
6. **Escape** - Close modals and dropdowns
7. **Home/End** - Jump to first/last item

### 5. Provide Visual Focus Indicators

Always show a visible focus indicator.

```css
/* ✅ CORRECT: Visible focus indicator */
button:focus {
  outline: 2px solid #D48161;
  outline-offset: 2px;
}

/* ❌ WRONG: Removing focus indicator */
button:focus {
  outline: none;
}
```

### 6. Support RTL Layouts

Tab order should work correctly in both LTR and RTL layouts.

```jsx
// ✅ CORRECT: Works in both directions
<div dir={language === 'ar' ? 'rtl' : 'ltr'}>
  <button>First</button>
  <button>Second</button>
  <button>Third</button>
</div>
```

## Testing

### Manual Testing Checklist

- [ ] Tab through entire page - all interactive elements accessible
- [ ] Shift+Tab works in reverse order
- [ ] Tab order matches visual order
- [ ] No keyboard traps (can always tab out)
- [ ] Modals trap focus correctly
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work in tabs/dropdowns
- [ ] Focus indicators are visible
- [ ] Works in RTL mode (Arabic)
- [ ] Works in LTR mode (English/French)

### Automated Testing

```bash
# Run axe-core accessibility tests
npm run test:a11y

# Check for tabIndex > 0
grep -r "tabIndex={[1-9]" frontend/src/

# Check for missing tabIndex on custom interactive elements
grep -r "role=\"button\"" frontend/src/ | grep -v "tabIndex"
```

### Screen Reader Testing

Test with:
- **NVDA** (Windows) - Free
- **JAWS** (Windows) - Commercial
- **VoiceOver** (Mac/iOS) - Built-in
- **TalkBack** (Android) - Built-in

## Examples from Careerak

### Good Examples

1. **AdminDashboard.jsx** - Tab panel with arrow key navigation
2. **AdminSystemControl.jsx** - Consistent tab management
3. **AuthPage.jsx** - Custom button with proper tabIndex

### Fixed Examples

1. **LanguagePage.jsx** - Removed unnecessary tabIndex from language buttons
2. **Navbar.jsx** - Added focus trap to settings panel

## Resources

- [WCAG 2.1 Success Criterion 2.4.3](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
- [MDN: tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)
- [W3C: Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

## Questions?

Contact the accessibility team or refer to the project standards in `project-standards.md`.
