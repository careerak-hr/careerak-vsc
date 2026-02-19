# PurgeCSS Quick Reference

## Quick Start

### Check if PurgeCSS is Working
```bash
cd frontend
npm run build
# Check the CSS file sizes in build/assets/css/
```

### Expected Results
- Main CSS: ~445 KB uncompressed, ~55 KB gzipped
- Page CSS: 0.03-40 KB uncompressed
- Total: ~70 KB gzipped

## Common Tasks

### Add a Class to Safelist

**Edit**: `frontend/postcss.config.js`

```javascript
safelist: {
  standard: [
    'my-custom-class',  // Exact match
    /^custom-prefix-/,  // Pattern match
  ]
}
```

### Add a Third-Party Library

**Edit**: `frontend/postcss.config.js`

```javascript
safelist: {
  deep: [
    /library-name/,
  ]
}
```

### Debug Missing Styles

1. **Enable debug mode** in `postcss.config.js`:
```javascript
rejected: true,
printRejected: true,
```

2. **Rebuild**:
```bash
npm run build
```

3. **Check output** for removed selectors

4. **Add to safelist** if needed

5. **Disable debug mode** after fixing

## Best Practices

### ✅ Do This
```jsx
// Use complete class names
<div className="bg-primary text-white p-4">

// Use conditional classes
<div className={isActive ? 'bg-primary' : 'bg-secondary'}>
```

### ❌ Don't Do This
```jsx
// Don't use string concatenation
<div className={`bg-${color}-500`}>

// Don't use dynamic class generation
<div className={`text-${size}`}>
```

## Troubleshooting

### Missing Styles in Production

**Symptom**: Element looks unstyled

**Fix**: Add class to safelist

### Dynamic Classes Not Working

**Symptom**: Conditional classes don't apply

**Fix**: Use complete class names or add pattern to safelist

### Third-Party Component Broken

**Symptom**: Library component looks wrong

**Fix**: Add library to deep safelist

## Files to Know

- `frontend/postcss.config.js` - PurgeCSS config
- `frontend/tailwind.config.js` - Tailwind config
- `docs/PURGECSS_CONFIGURATION.md` - Full guide
- `docs/PURGECSS_IMPLEMENTATION_SUMMARY.md` - Summary

## Commands

```bash
# Development (no PurgeCSS)
npm run dev

# Production build (with PurgeCSS)
npm run build

# Preview production build
npm run preview

# Check bundle size
ls -lh build/assets/css/
```

## Support

1. Check `docs/PURGECSS_CONFIGURATION.md`
2. Enable debug mode
3. Check safelist configuration
4. Test with `NODE_ENV=development npm run build`

---

**Quick Tip**: When in doubt, add the class to the safelist. It's better to include a few extra bytes than to have broken styles in production.
