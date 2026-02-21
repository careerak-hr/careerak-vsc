# Dark Mode Contrast Quick Guide

## Quick Reference

### ✅ Safe Color Combinations (Dark Mode)

Use these combinations for guaranteed WCAG AA compliance:

#### Text on Backgrounds

| Text Type | Use This Color | On This Background | Ratio |
|-----------|---------------|-------------------|-------|
| **Primary text** | `var(--text-primary)` #E3DAD1 | `var(--bg-primary)` #1A2332 | 11.44:1 ✅ |
| **Secondary text** | `var(--text-secondary)` #D4CCC3 | `var(--bg-primary)` #1A2332 | 9.94:1 ✅ |
| **Tertiary text** | `var(--text-tertiary)` #C5BDB4 | `var(--bg-primary)` #1A2332 | 8.50:1 ✅ |
| **Accent text** | `var(--accent-primary)` #E09A7A | `var(--bg-primary)` #1A2332 | 6.82:1 ✅ |
| **Input text** | `var(--input-text)` #E3DAD1 | `var(--input-bg)` #243447 | 9.18:1 ✅ |

#### Status Colors

| Status | Color | On Primary BG | Ratio |
|--------|-------|--------------|-------|
| **Success** | #66BB6A | #1A2332 | 6.68:1 ✅ |
| **Warning** | #FFA726 | #1A2332 | 8.12:1 ✅ |
| **Error** | #EF5350 | #1A2332 | 4.53:1 ✅ |
| **Info** | #42A5F5 | #1A2332 | 5.96:1 ✅ |

### ⚠️ Use with Caution

These combinations pass but are close to the threshold:

- **Muted text on secondary background**: 4.58:1 (use sparingly)
- **Error on primary background**: 4.53:1 (acceptable for brief messages)

### ❌ Avoid These Combinations

- Small text on tertiary or hover backgrounds (use large text instead)
- Muted text on anything other than primary background
- Custom colors without verification

## CSS Variable Usage

```css
/* ✅ Good - Using CSS variables */
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* ❌ Bad - Hardcoded colors */
.my-component {
  background-color: #1A2332;
  color: #E3DAD1;
}
```

## React/JSX Usage

```jsx
// ✅ Good - Using Tailwind classes with CSS variables
<div className="bg-primary text-primary">
  Content
</div>

// ✅ Good - Inline styles with CSS variables
<div style={{ 
  backgroundColor: 'var(--bg-primary)', 
  color: 'var(--text-primary)' 
}}>
  Content
</div>
```

## Testing Your Changes

### 1. Quick Visual Check
```bash
# Enable dark mode in your browser
# Check if text is easily readable
# No squinting required!
```

### 2. Automated Check
```bash
node frontend/verify-dark-mode-contrast.mjs
```

### 3. Browser Console Check
```javascript
// In DevTools console (dark mode enabled)
import('./utils/browserContrastCheck.js').then(m => m.checkPageContrast())
```

## Common Scenarios

### Scenario 1: Adding a New Text Element

```jsx
// ✅ Use CSS variables
<p className="text-primary">Your text here</p>

// ✅ Or inline
<p style={{ color: 'var(--text-primary)' }}>Your text here</p>
```

### Scenario 2: Custom Button

```jsx
// ✅ Good contrast
<button className="bg-accent text-inverse">
  Click Me
</button>

// Ratio: 6.82:1 ✅
```

### Scenario 3: Status Badge

```jsx
// ✅ Success badge
<span className="bg-success text-inverse px-2 py-1 rounded">
  Success
</span>

// ✅ Error badge
<span className="bg-error text-inverse px-2 py-1 rounded">
  Error
</span>
```

### Scenario 4: Form Input

```jsx
// ✅ Inputs automatically use correct colors
<input 
  type="text" 
  className="border-primary"
  // background: var(--input-bg)
  // color: var(--input-text)
  // border: var(--input-border) - NEVER CHANGES!
/>
```

## Troubleshooting

### Problem: Text is hard to read

**Solution**: Check if you're using the right text color for the background:
- Primary background → Use primary, secondary, or tertiary text
- Secondary background → Use primary or secondary text only
- Tertiary/hover backgrounds → Use primary text only

### Problem: Custom color not working

**Solution**: Verify contrast ratio:
```javascript
// In browser console
import('./utils/contrastChecker.js').then(m => {
  const ratio = m.getContrastRatio('#YourTextColor', '#YourBgColor');
  console.log('Contrast ratio:', ratio);
  console.log('Passes WCAG AA:', ratio >= 4.5);
});
```

### Problem: Accent color looks wrong

**Solution**: Make sure you're using the updated accent colors:
- Primary accent: #E09A7A (not #D48161)
- Secondary accent: #EAA88A
- Hover: #D48161

## Rules to Remember

1. ✅ **Always use CSS variables** (`var(--text-primary)`)
2. ✅ **Test in dark mode** before committing
3. ✅ **Use primary background** for most content
4. ✅ **Run automated checks** for new components
5. ❌ **Never hardcode colors**
6. ❌ **Never change input border color** (#D4816180 is constant!)
7. ❌ **Don't use muted text on secondary backgrounds**

## Quick Checklist

Before committing changes with text/colors:

- [ ] Using CSS variables (not hardcoded colors)
- [ ] Tested in dark mode
- [ ] Text is easily readable
- [ ] Ran `node frontend/verify-dark-mode-contrast.mjs`
- [ ] No console errors about contrast
- [ ] Input borders remain #D4816180

## Need Help?

1. Check `frontend/src/styles/darkMode.css` for all available variables
2. Run `node frontend/verify-dark-mode-contrast.mjs` for automated verification
3. Use browser DevTools to inspect computed colors
4. Refer to `docs/DARK_MODE_CONTRAST_VERIFICATION.md` for detailed report

---

**Remember**: Good contrast = Better accessibility = Happier users! 🎉
