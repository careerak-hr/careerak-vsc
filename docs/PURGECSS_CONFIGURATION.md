# PurgeCSS Configuration Guide

## Overview

PurgeCSS has been integrated into the build process to remove unused CSS and reduce bundle size. This document explains the configuration and how to maintain it.

## Implementation Date
**Added**: 2026-02-19  
**Status**: ✅ Active in production builds

## How It Works

### 1. Tailwind CSS Built-in Purging
Tailwind CSS v3+ has built-in content-based purging. It automatically removes unused utility classes based on the `content` configuration in `tailwind.config.js`.

### 2. PostCSS PurgeCSS Plugin
For custom CSS files (in `src/styles/`), we use `@fullhuman/postcss-purgecss` to remove unused styles.

## Configuration Files

### tailwind.config.js
```javascript
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./public/index.html",
  "./index.html"
]
```

This tells Tailwind to scan these files for class names and only include the CSS for classes that are actually used.

### postcss.config.js
PurgeCSS is configured to run only in production builds:

```javascript
'@fullhuman/postcss-purgecss': {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    './index.html',
  ],
  safelist: { /* ... */ },
  defaultExtractor: content => { /* ... */ }
}
```

## Safelist Configuration

The safelist prevents important classes from being removed, even if they're not detected in the content scan.

### Standard Safelist (Exact Matches)
- Dark mode classes: `/^dark:/`
- RTL/LTR classes: `/^rtl:/`, `/^ltr:/`
- Animation classes: `/^animate-/`
- Responsive classes: `/^sm:/`, `/^md:/`, `/^lg:/`, `/^xl:/`, `/^2xl:/`
- State classes: `/^hover:/`, `/^focus:/`, `/^active:/`, `/^disabled:/`

### Deep Safelist (Third-party Libraries)
- `react-easy-crop`
- `react-image-crop`
- `react-confetti`
- `i18next`

### Greedy Safelist (Dynamic Classes)
- Color utilities: `/^bg-/`, `/^text-/`, `/^border-/`
- Spacing utilities: `/^p-/`, `/^m-/`, `/^gap-/`, `/^space-/`
- Layout utilities: `/^w-/`, `/^h-/`, `/^flex-/`, `/^grid-/`
- Transform utilities: `/^scale-/`, `/^rotate-/`, `/^translate-/`

## Expected Results

### Before PurgeCSS
- Typical CSS bundle size: 200-400KB (uncompressed)
- Includes all Tailwind utilities and custom CSS

### After PurgeCSS
- Reduced CSS bundle size: 20-60KB (uncompressed)
- 70-90% reduction in CSS size
- Only includes classes actually used in the application

### With Compression (gzip/brotli)
- Final CSS size: 5-15KB (compressed)
- Significant improvement in load times

## Testing PurgeCSS

### 1. Build for Production
```bash
cd frontend
npm run build
```

### 2. Check Bundle Size
Look at the generated CSS files in `build/assets/css/`:
```bash
ls -lh build/assets/css/
```

### 3. Analyze with Bundle Visualizer
After building, open `build/stats.html` to see the bundle composition.

### 4. Test the Application
```bash
npm run preview
```

Verify that:
- ✅ All pages render correctly
- ✅ Dark mode works
- ✅ RTL/LTR switching works
- ✅ Animations work
- ✅ Responsive design works
- ✅ Third-party components work (image crop, confetti, etc.)

## Troubleshooting

### Issue: Missing Styles in Production

**Symptom**: Some elements look unstyled or broken in production build.

**Solution**:
1. Identify the missing class names
2. Add them to the safelist in `postcss.config.js`
3. Rebuild and test

**Example**:
```javascript
safelist: {
  standard: [
    'my-custom-class',
    /^custom-prefix-/,
  ]
}
```

### Issue: Dynamic Classes Not Working

**Symptom**: Classes added via JavaScript don't have styles.

**Solution**:
Use complete class names in your code, not string concatenation:

❌ **Bad** (PurgeCSS can't detect):
```javascript
const color = 'red';
className={`bg-${color}-500`}
```

✅ **Good** (PurgeCSS can detect):
```javascript
const colorClass = color === 'red' ? 'bg-red-500' : 'bg-blue-500';
className={colorClass}
```

Or add to safelist:
```javascript
safelist: {
  greedy: [/^bg-red-/, /^bg-blue-/]
}
```

### Issue: Third-party Library Styles Missing

**Symptom**: A third-party component looks broken.

**Solution**:
Add the library to the deep safelist:
```javascript
safelist: {
  deep: [/library-name/]
}
```

## Debugging PurgeCSS

### Enable Debug Mode

In `postcss.config.js`, set:
```javascript
rejected: true,
printRejected: true,
printAll: false,
```

This will show which selectors are being removed during the build.

### Disable PurgeCSS Temporarily

To test if PurgeCSS is causing an issue:
```bash
NODE_ENV=development npm run build
```

This builds without PurgeCSS enabled.

## Best Practices

### 1. Use Complete Class Names
Always use complete class names in your JSX/HTML:
```jsx
// ✅ Good
<div className="bg-primary text-white p-4 rounded-lg">

// ❌ Bad
<div className={`bg-${theme} text-${textColor}`}>
```

### 2. Safelist Dynamic Classes
If you must use dynamic classes, add them to the safelist:
```javascript
safelist: {
  pattern: /^bg-(primary|secondary|accent)/,
  variants: ['hover', 'focus'],
}
```

### 3. Test Production Builds
Always test production builds before deploying:
```bash
npm run build
npm run preview
```

### 4. Monitor Bundle Size
Check the bundle size after each build:
```bash
npm run build
# Check build/stats.html
```

### 5. Update Safelist as Needed
When adding new features, update the safelist if needed.

## Performance Impact

### Build Time
- **Development**: No impact (PurgeCSS disabled)
- **Production**: +5-10 seconds (worth it for the size reduction)

### Bundle Size Reduction
- **CSS**: 70-90% reduction
- **Total Bundle**: 10-20% reduction
- **Load Time**: 20-30% improvement

### Lighthouse Scores
- **Performance**: +5-10 points
- **Best Practices**: No change
- **SEO**: No change

## Integration with Other Tools

### Works With
- ✅ Tailwind CSS v3+
- ✅ PostCSS
- ✅ Vite
- ✅ cssnano (runs after PurgeCSS)
- ✅ Autoprefixer

### Execution Order
1. Tailwind CSS (generates utilities)
2. Autoprefixer (adds vendor prefixes)
3. **PurgeCSS** (removes unused CSS)
4. cssnano (minifies remaining CSS)

## Maintenance

### When to Update Safelist

Update the safelist when:
- Adding new third-party libraries with custom CSS
- Using new dynamic class patterns
- Adding new animation classes
- Implementing new design patterns

### Regular Checks

Monthly:
- ✅ Review bundle size trends
- ✅ Check for missing styles in production
- ✅ Update safelist if needed
- ✅ Test all pages and features

## References

- [PurgeCSS Documentation](https://purgecss.com/)
- [Tailwind CSS Content Configuration](https://tailwindcss.com/docs/content-configuration)
- [PostCSS PurgeCSS Plugin](https://github.com/FullHuman/purgecss/tree/main/packages/postcss-purgecss)

## Related Files

- `frontend/postcss.config.js` - PurgeCSS configuration
- `frontend/tailwind.config.js` - Tailwind content configuration
- `frontend/vite.config.js` - Build configuration
- `.kiro/specs/general-platform-enhancements/tasks.md` - Task 2.5.3

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Check the PurgeCSS documentation
4. Test with debug mode enabled

---

**Last Updated**: 2026-02-19  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
