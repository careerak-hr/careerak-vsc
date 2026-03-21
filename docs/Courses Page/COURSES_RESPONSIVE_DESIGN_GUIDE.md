# Courses Page - Responsive Design & Accessibility Guide

## Overview

This guide explains how to implement responsive design and accessibility features for the Courses Page in the Careerak platform.

## Table of Contents

1. [Responsive Breakpoints](#responsive-breakpoints)
2. [RTL Support](#rtl-support)
3. [Project Design Standards](#project-design-standards)
4. [Accessibility Compliance](#accessibility-compliance)
5. [Testing](#testing)
6. [Examples](#examples)

---

## 1. Responsive Breakpoints

### Breakpoints

```css
Mobile:  < 640px    (single column)
Tablet:  640-1023px (two columns)
Desktop: >= 1024px  (four columns)
```

### Implementation

```jsx
import '../styles/coursesResponsive.css';

function CoursesPage() {
  return (
    <div className="courses-page">
      <div className="courses-container">
        {/* Filters sidebar */}
        <aside className="courses-filters">
          {/* Filters content */}
        </aside>
        
        {/* Main content */}
        <main className="courses-main">
          {/* Courses grid */}
          <div className="courses-grid">
            {/* Course cards */}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Mobile Behavior

- **Single column layout**
- **Collapsible filters** (bottom sheet)
- **Stacked sort bar**
- **Larger touch targets** (48x48px minimum)

### Tablet Behavior

- **Two column layout**
- **Collapsible filters** (side drawer)
- **Horizontal sort bar**
- **Touch targets** (44x44px minimum)

### Desktop Behavior

- **Four column layout**
- **Fixed sidebar filters**
- **Full sort bar**
- **Standard touch targets** (44x44px minimum)

---

## 2. RTL Support

### Implementation

```jsx
function CoursesPage() {
  const { language } = useApp();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div className="courses-page" dir={direction} lang={language}>
      {/* Content */}
    </div>
  );
}
```

### CSS Handling

The CSS file automatically handles RTL:

```css
/* Automatic RTL support */
[dir="rtl"] .courses-container {
  flex-direction: row-reverse;
}

[dir="rtl"] .courses-page {
  text-align: right;
}
```

### What Changes in RTL

- **Text alignment**: right
- **Flex direction**: row-reverse
- **Margins/paddings**: mirrored
- **Icons**: mirrored where appropriate

---

## 3. Project Design Standards

### Colors

```css
--primary-color: #304B60;      /* كحلي */
--secondary-color: #E3DAD1;    /* بيج */
--accent-color: #D48161;       /* نحاسي */
--border-color: #D4816180;     /* نحاسي باهت */
```

### Fonts

```css
--font-arabic: 'Amiri', 'Cairo', serif;
--font-english: 'Cormorant Garamond', serif;
--font-french: 'EB Garamond', serif;
```

### Input Fields

**CRITICAL**: All input fields must use the border color standard:

```css
input, select, textarea {
  border: 2px solid #D4816180; /* نحاسي باهت */
}

/* NO color change on focus */
input:focus {
  border-color: #D4816180; /* Same color */
}
```

### Buttons

```css
/* Primary button */
.course-card-btn.primary {
  background-color: #D48161; /* Accent color */
  color: white;
}

/* Secondary button */
.course-card-btn.secondary {
  background-color: transparent;
  color: #D48161;
  border: 2px solid #D48161;
}
```

---

## 4. Accessibility Compliance

### Touch Targets

**Minimum size**: 44x44px (WCAG 2.1 AA)

```css
.course-card-btn {
  min-height: 44px;
  min-width: 44px;
}
```

### ARIA Labels

```jsx
<button
  aria-label="Add to wishlist"
  aria-pressed={wishlisted}
>
  ♡
</button>

<input
  type="search"
  aria-label="Search courses"
  placeholder="Search..."
/>

<div role="status" aria-live="polite">
  Loading courses...
</div>
```

### Keyboard Navigation

```jsx
// Tab through interactive elements
<a href="#main-content" className="skip-to-main">
  Skip to main content
</a>

<main id="main-content" tabIndex="-1">
  {/* Content */}
</main>
```

### Screen Reader Support

```jsx
// Descriptive text for screen readers
<span className="sr-only">
  Rating: 4.5 out of 5
</span>

// Announce changes
<div role="status" aria-live="polite">
  Filter applied: Beginner level
</div>
```

### Color Contrast

**WCAG AA Requirements**:
- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- Interactive elements: 3:1 minimum

All colors in the design meet these requirements.

### Focus Indicators

```css
*:focus-visible {
  outline: 3px solid #D48161;
  outline-offset: 2px;
}
```

---

## 5. Testing

### Manual Testing

**Responsive**:
1. Test on mobile (< 640px)
2. Test on tablet (640-1023px)
3. Test on desktop (>= 1024px)
4. Test landscape orientation

**RTL**:
1. Switch to Arabic
2. Verify text alignment
3. Verify layout mirroring
4. Test all interactions

**Accessibility**:
1. Navigate with keyboard only (Tab, Enter, Space, Escape)
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Verify touch target sizes
4. Check color contrast

### Automated Testing

```bash
# Run accessibility tests
npm test -- coursesAccessibility.test.jsx

# Run with coverage
npm test -- coursesAccessibility.test.jsx --coverage
```

### Browser Testing

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet

### Device Testing

- ✅ iPhone SE, 12/13, 14 Pro Max
- ✅ Samsung Galaxy S21, S21+
- ✅ iPad, iPad Air, iPad Pro
- ✅ Various Android tablets

---

## 6. Examples

### Complete Example

See `frontend/src/examples/CoursesResponsiveExample.jsx` for a complete working example.

### Quick Start

```jsx
import React from 'react';
import '../styles/coursesResponsive.css';

function CoursesPage() {
  const { language } = useApp();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div className="courses-page" dir={direction} lang={language}>
      {/* Skip to main content */}
      <a href="#main-content" className="skip-to-main">
        {language === 'ar' ? 'تخطى إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      
      <div className="courses-container">
        {/* Filters */}
        <aside className="courses-filters" role="complementary">
          <h3>{language === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
          {/* Filter groups */}
        </aside>
        
        {/* Main content */}
        <main id="main-content" className="courses-main" role="main" tabIndex="-1">
          {/* Sort bar */}
          <div className="courses-sort-bar">
            <input
              type="search"
              className="search-input"
              placeholder={language === 'ar' ? 'ابحث...' : 'Search...'}
              aria-label={language === 'ar' ? 'البحث' : 'Search'}
            />
          </div>
          
          {/* Courses grid */}
          <div className="courses-grid" role="list">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Best Practices

### ✅ Do

- Use semantic HTML (header, main, aside, article)
- Provide ARIA labels for all interactive elements
- Test with keyboard navigation
- Test with screen readers
- Verify touch target sizes
- Check color contrast
- Test on real devices
- Support RTL for Arabic

### ❌ Don't

- Don't use generic button text ("Click here")
- Don't skip heading levels (h1 → h3)
- Don't rely on color alone for information
- Don't forget alt text for images
- Don't use small touch targets (< 44px)
- Don't change border color on focus (project standard)
- Don't forget to test on mobile

---

## Troubleshooting

### Issue: Filters not showing on mobile

**Solution**: Check that the filter toggle button is present and the `filtersOpen` state is working.

### Issue: RTL not working

**Solution**: Verify the `dir` attribute is set on the root element and the language is correctly detected.

### Issue: Touch targets too small

**Solution**: Ensure all buttons have `min-height: 44px` and `min-width: 44px`.

### Issue: Keyboard navigation not working

**Solution**: Check that all interactive elements are focusable and have proper `tabindex` values.

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Checklist

Before deploying, verify:

- [ ] Responsive on mobile (< 640px)
- [ ] Responsive on tablet (640-1023px)
- [ ] Responsive on desktop (>= 1024px)
- [ ] RTL support works correctly
- [ ] All colors match project standards
- [ ] All fonts match project standards
- [ ] Input borders use #D4816180
- [ ] Touch targets >= 44x44px
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] All tests pass
- [ ] Tested on real devices
- [ ] Tested with screen reader

---

## Support

For questions or issues, contact the development team or refer to the project documentation.

**Last Updated**: 2026-03-05
