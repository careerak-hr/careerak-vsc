# 🌙 Dark Mode Usage Guide

## Overview
This guide explains how to use Tailwind's `dark:` classes in the Careerak project.

**Status**: ✅ Configured and Ready  
**Date**: 2026-02-17

---

## Configuration

### Tailwind Config
```javascript
// frontend/tailwind.config.js
module.exports = {
  darkMode: 'class', // ✅ Enabled with class strategy
  // ... rest of config
}
```

### CSS Variables
All CSS variables are defined in `frontend/src/styles/darkMode.css`:
- Light mode: Default `:root` variables
- Dark mode: `.dark` class variables

---

## How to Enable Dark Mode

### Method 1: Add 'dark' class to HTML
```javascript
// In your App.js or theme toggle component
document.documentElement.classList.add('dark');
```

### Method 2: Add 'dark' class to body
```javascript
document.body.classList.add('dark');
```

### Method 3: Toggle dark mode
```javascript
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};
```

---

## Using dark: Classes

### Basic Syntax
```jsx
<div className="bg-white dark:bg-gray-800">
  Content
</div>
```

### Common Patterns

#### 1. Background Colors
```jsx
<div className="bg-secondary dark:bg-primary-dark">
  Light background in light mode, dark in dark mode
</div>
```

#### 2. Text Colors
```jsx
<p className="text-primary dark:text-secondary">
  Text that adapts to theme
</p>
```

#### 3. Borders
```jsx
<div className="border-2 border-primary dark:border-accent">
  Border color changes with theme
</div>
```

#### 4. Hover States
```jsx
<button className="bg-accent hover:bg-accent-dark dark:bg-accent-light dark:hover:bg-accent">
  Button with theme-aware hover
</button>
```

#### 5. Shadows
```jsx
<div className="shadow-lg dark:shadow-xl">
  Shadow intensity changes with theme
</div>
```

---

## CSS Variables Reference

### Light Mode (Default)
```css
--bg-primary: #E3DAD1;      /* البيج الملكي */
--bg-secondary: #E8DFD6;    /* بيج أفتح */
--text-primary: #304B60;    /* الكحلي الوقور */
--accent-primary: #D48161;  /* النحاسي الفخم */
```

### Dark Mode (.dark)
```css
--bg-primary: #1A2332;      /* كحلي غامق جداً */
--bg-secondary: #243447;    /* كحلي غامق */
--text-primary: #E3DAD1;    /* بيج */
--accent-primary: #D48161;  /* النحاسي (same) */
```

---

## Tailwind Color Classes

### Available Colors
- `primary` - #304B60 (كحلي)
- `secondary` - #E3DAD1 (بيج)
- `accent` - #D48161 (نحاسي)
- `danger` - #D32F2F
- `success` - #388E3C
- `white` - #FFFFFF
- `black` - #000000

### Usage Examples
```jsx
// Background
<div className="bg-primary dark:bg-secondary">

// Text
<p className="text-primary dark:text-secondary">

// Border
<div className="border-accent dark:border-primary">

// Hover
<button className="hover:bg-accent dark:hover:bg-accent-light">
```

---

## Complete Component Example

```jsx
import React from 'react';

const ThemedCard = ({ title, content }) => {
  return (
    <div className="
      bg-white dark:bg-primary-dark
      border-2 border-primary dark:border-accent
      rounded-lg shadow-lg dark:shadow-xl
      p-6
      transition-colors duration-200
    ">
      <h3 className="
        text-2xl font-bold mb-4
        text-primary dark:text-secondary
      ">
        {title}
      </h3>
      <p className="
        text-primary dark:text-secondary
        opacity-80
      ">
        {content}
      </p>
      <button className="
        mt-4 px-6 py-3 rounded-lg
        bg-accent hover:bg-accent-dark
        dark:bg-accent-light dark:hover:bg-accent
        text-white dark:text-primary
        transition-colors duration-200
      ">
        Action Button
      </button>
    </div>
  );
};

export default ThemedCard;
```

---

## Dark Mode Toggle Component

```jsx
import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="
        p-3 rounded-full
        bg-secondary dark:bg-primary-dark
        text-primary dark:text-secondary
        hover:bg-accent/20 dark:hover:bg-accent/30
        transition-colors duration-200
      "
      aria-label="Toggle dark mode"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

export default DarkModeToggle;
```

---

## Persist Dark Mode Preference

```jsx
// In your App.js or main component
useEffect(() => {
  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
}, []);
```

---

## Best Practices

### 1. Always Provide Dark Mode Variants
```jsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">

// ❌ Bad (no dark mode variant)
<div className="bg-white text-black">
```

### 2. Use Transitions for Smooth Theme Changes
```jsx
<div className="transition-colors duration-200 bg-white dark:bg-gray-800">
```

### 3. Test Both Themes
- Always test your components in both light and dark modes
- Check contrast ratios for accessibility
- Ensure all text is readable in both themes

### 4. Use CSS Variables for Complex Styles
```jsx
// For styles that can't be done with Tailwind classes
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)'
}}>
```

### 5. Respect Input Border Rule
```jsx
// ✅ Correct - Border stays #D4816180 in both modes
<input className="border-2" style={{ borderColor: 'var(--input-border)' }} />

// ❌ Wrong - Don't change input border color
<input className="border-2 border-primary dark:border-accent" />
```

---

## Common Patterns

### Navigation Bar
```jsx
<nav className="
  bg-secondary dark:bg-primary-dark
  border-b-2 border-primary dark:border-accent
  shadow-md dark:shadow-lg
">
  <div className="text-primary dark:text-secondary">
    Navigation content
  </div>
</nav>
```

### Modal
```jsx
<div className="
  fixed inset-0 bg-black/50 dark:bg-black/70
  flex items-center justify-center
">
  <div className="
    bg-secondary dark:bg-primary-dark
    border-4 border-primary dark:border-accent
    rounded-3xl shadow-2xl
    p-8
  ">
    Modal content
  </div>
</div>
```

### Form Input
```jsx
<input
  type="text"
  className="
    w-full px-4 py-3 rounded-lg
    border-2
    focus:outline-none
    transition-colors duration-200
  "
  style={{
    backgroundColor: 'var(--input-bg)',
    color: 'var(--input-text)',
    borderColor: 'var(--input-border)'
  }}
/>
```

### Card
```jsx
<div className="
  bg-white dark:bg-primary-dark
  border-2 border-primary/20 dark:border-accent/20
  rounded-lg shadow-lg dark:shadow-xl
  p-6
  hover:shadow-xl dark:hover:shadow-2xl
  transition-all duration-200
">
  Card content
</div>
```

---

## Troubleshooting

### Dark mode not working?
1. Check if `darkMode: 'class'` is in `tailwind.config.js`
2. Verify 'dark' class is added to `<html>` or `<body>`
3. Make sure `darkMode.css` is imported in your app
4. Clear browser cache and rebuild

### Colors not changing?
1. Check if you're using the correct Tailwind color classes
2. Verify CSS variables are defined in `darkMode.css`
3. Use browser DevTools to inspect computed styles

### Transitions not smooth?
Add `transition-colors duration-200` to elements:
```jsx
<div className="transition-colors duration-200 bg-white dark:bg-gray-800">
```

---

## Resources

- **Tailwind Dark Mode Docs**: https://tailwindcss.com/docs/dark-mode
- **CSS Variables File**: `frontend/src/styles/darkMode.css`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Example Component**: `frontend/src/examples/DarkModeExample.jsx`
- **Project Standards**: `project-standards.md`

---

## Summary

✅ Dark mode is configured with `darkMode: 'class'`  
✅ Use `dark:` prefix for dark mode styles  
✅ CSS variables handle complex theming  
✅ All components can now use dark mode classes  
✅ Input borders remain constant (#D4816180) in both modes  

**Next Steps**:
1. Add dark mode toggle to UI
2. Update existing components with `dark:` classes
3. Test all pages in both themes
4. Persist user preference in localStorage
