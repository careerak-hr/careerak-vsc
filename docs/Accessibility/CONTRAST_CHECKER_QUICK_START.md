# Automated Contrast Checker - Quick Start Guide

**5 minutes to get started with automated contrast checking**

## What is it?

An automated tool that checks if your colors meet WCAG 2.1 Level AA accessibility standards (4.5:1 for normal text, 3:1 for large text).

## Quick Start

### 1. Run the Checker

```bash
cd frontend
npm run check:contrast
```

### 2. Read the Results

```
✅ ALL CHECKS PASSED - You're good to go!
⚠️  WARNINGS DETECTED - Consider fixing these
❌ CRITICAL FAILURES - Must fix before deploying
```

### 3. Fix Issues (if any)

If you see failures, adjust your colors:

```css
/* Example: Text too light */
/* Before: 2.8:1 - Fails */
color: #9CA3AF;

/* After: 4.6:1 - Passes */
color: #6B7280;
```

## Common Commands

```bash
# Check contrast
npm run check:contrast

# Check in CI mode (stricter)
npm run check:contrast:ci

# View the report
cat contrast-report.json
```

## When to Run

- ✅ Before committing code
- ✅ After changing colors
- ✅ In pull requests (automatic)
- ✅ Before deployment (automatic)

## Understanding Results

### 🔴 Critical (Must Pass)
- Primary text combinations
- Dark mode text
- **Action**: Fix immediately

### 🟡 Important (Should Pass)
- Secondary text combinations
- Status colors
- **Action**: Fix when possible

### 📏 Large Text (≥18pt)
- Headings and large text
- Requires 3:1 ratio (easier)
- **Action**: Use larger font sizes

### ℹ️ Warnings (Known Issues)
- Accent colors on backgrounds
- UI components only
- **Action**: Don't use for body text

## Quick Fixes

### Fix 1: Darken the Text
```css
/* Increase contrast by darkening text */
color: #6B7280; /* Instead of #9CA3AF */
```

### Fix 2: Lighten the Background
```css
/* Increase contrast by lightening background */
background: #FFFFFF; /* Instead of #E3DAD1 */
```

### Fix 3: Use Large Text
```css
/* Lower contrast OK for large text */
font-size: 18pt; /* or 14pt bold */
```

## Integration

### Pre-Commit Hook (Optional)

```bash
# Install hook
ln -s ../../frontend/scripts/pre-commit-contrast.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Now runs automatically on every commit
```

### CI/CD (Automatic)

Already configured in `.github/workflows/contrast-check.yml`
- Runs on push to main/develop
- Runs on pull requests
- Uploads reports as artifacts

## Need Help?

1. Check the [full documentation](./AUTOMATED_CONTRAST_CHECKER.md)
2. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
3. Review [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Pro Tips

- Run the checker frequently during development
- Fix critical issues first
- Use large text for lower contrast combinations
- Test in both light and dark modes
- Don't use accent colors for body text

---

**That's it!** You're now using automated contrast checking. 🎉
