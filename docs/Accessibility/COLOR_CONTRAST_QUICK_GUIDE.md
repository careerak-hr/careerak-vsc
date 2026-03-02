# Color Contrast Quick Guide

## TL;DR

✅ **All text colors meet WCAG 2.1 Level AA standards (4.5:1 minimum)**  
✅ **All UI elements meet WCAG 2.1 Level AA standards (3:1 minimum)**  
✅ **Dark mode has excellent contrast (5.7:1 to 11.4:1)**

## Quick Rules

### For Normal Text (< 18pt)
```css
/* ✅ USE THESE */
color: var(--text-primary);    /* 6.61:1 */
color: var(--text-secondary);  /* 5.23:1 */

/* ❌ DON'T USE FOR SMALL TEXT */
color: var(--accent-primary);  /* 4.23:1 - UI only! */
```

### For Large Text (≥ 18pt)
```css
/* ✅ ALL COLORS OK */
color: var(--text-primary);
color: var(--text-secondary);
color: var(--accent-primary);  /* OK for large text */
```

### For UI Elements (Buttons, Borders, Icons)
```css
/* ✅ ALL COLORS OK */
border-color: var(--accent-primary);  /* 4.23:1 - Perfect for UI */
background-color: var(--accent-primary);
```

### For Button Text
```css
/* ✅ ALWAYS USE WHITE ON ACCENT */
.button {
  background-color: var(--accent-primary);
  color: #FFFFFF;  /* 5.84:1 - Excellent! */
}
```

## Color Palette

### Light Mode
| Variable | Color | Ratio | Use For |
|----------|-------|-------|---------|
| `--text-primary` | #304B60 | 6.61:1 | Body text, headings |
| `--text-secondary` | #3D5A73 | 5.23:1 | Secondary text, labels |
| `--text-muted` | #3D5A73 | 5.23:1 | Muted text, placeholders |
| `--accent-primary` | #A04D2F | 4.23:1 | Buttons, borders, icons, large text |
| `--bg-primary` | #E3DAD1 | - | Main background |

### Dark Mode
| Variable | Color | Ratio | Use For |
|----------|-------|-------|---------|
| `--text-primary` | #E3DAD1 | 11.44:1 | Body text, headings |
| `--text-secondary` | #D4CCC3 | 9.94:1 | Secondary text, labels |
| `--text-muted` | #A39A91 | 5.70:1 | Muted text, placeholders |
| `--accent-primary` | #E09A7A | 6.82:1 | All uses |
| `--bg-primary` | #1A2332 | - | Main background |

## Common Mistakes

### ❌ Wrong
```jsx
// Using accent for small text
<p className="text-[var(--accent-primary)]">
  Small body text
</p>
```

### ✅ Correct
```jsx
// Using primary text color
<p className="text-[var(--text-primary)]">
  Small body text
</p>

// OR use accent for large text
<h1 className="text-4xl text-[var(--accent-primary)]">
  Large Heading (≥18pt)
</h1>

// OR use accent for UI elements
<button className="border-2 border-[var(--accent-primary)]">
  Button
</button>
```

## Testing

### Run Automated Tests
```bash
cd frontend
npm test -- contrastChecker.test.js --run
```

### Run Audit Script
```bash
cd frontend
node src/scripts/auditContrast.js
```

### Manual Check in Browser
1. Open Chrome DevTools
2. Inspect element
3. Look for contrast ratio indicator
4. Should show ✓ for passing

## WCAG Standards

| Text Type | Minimum Ratio | Our Colors |
|-----------|---------------|------------|
| Normal text (< 18pt) | 4.5:1 | ✅ 5.23:1 to 6.61:1 |
| Large text (≥ 18pt) | 3:1 | ✅ 4.23:1 to 6.61:1 |
| UI components | 3:1 | ✅ 4.23:1 to 6.61:1 |

## Need Help?

- Full documentation: `docs/COLOR_CONTRAST_COMPLIANCE.md`
- Utility functions: `frontend/src/utils/contrastChecker.js`
- Test file: `frontend/src/utils/__tests__/contrastChecker.test.js`
- Audit script: `frontend/src/scripts/auditContrast.js`

## Last Updated
2026-02-22
