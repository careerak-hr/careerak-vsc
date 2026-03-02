# Lighthouse CI Quick Start Guide

## 5-Minute Setup ⚡

### What is Lighthouse CI?

Lighthouse CI automatically tests your website's performance, accessibility, SEO, and best practices on every code change. It runs in GitHub Actions and comments on pull requests with results.

---

## Quick Overview

**Targets**:
- 🎯 Performance: 90+
- 🎯 Accessibility: 95+
- 🎯 SEO: 95+
- 🎯 Best Practices: 90+

**When it runs**:
- ✅ Every push to `main` or `develop`
- ✅ Every pull request
- ✅ Weekly (Mondays 9 AM UTC)
- ✅ Manual trigger

---

## How to Use

### 1. Make Changes
```bash
# Make your code changes
git add .
git commit -m "Your changes"
git push
```

### 2. Check Results

**In Pull Request**:
- Wait 3-5 minutes for CI to complete
- Check PR comment for Lighthouse scores
- Review any failures

**Example PR Comment**:
```markdown
## 🔦 Lighthouse CI Results

| Category | Score | Target |
|----------|-------|--------|
| Performance | 🟢 92 | 90+ |
| Accessibility | 🟢 97 | 95+ |
| SEO | 🟢 98 | 95+ |
| Best Practices | 🟢 95 | 90+ |

✅ All targets met!
```

### 3. Fix Issues (if any)

**Performance Issues**:
```bash
# Check bundle size
cd frontend
npm run measure:bundle

# Optimize if needed
npm run build
```

**Accessibility Issues**:
```bash
# Check contrast
npm run check:contrast

# Fix issues in code
# Add ARIA labels, alt text, etc.
```

**SEO Issues**:
```bash
# Validate SEO
npm run audit:seo

# Add missing meta tags
# Fix structured data
```

---

## Running Locally

### Quick Test
```bash
# Install Lighthouse CI (one time)
npm install -g @lhci/cli

# Build project
cd frontend
npm run build

# Run Lighthouse
cd ..
lhci autorun
```

### View Results
```bash
# Results are in .lighthouseci/ folder
# Open HTML reports in browser
open .lighthouseci/*/lhr-*.html
```

---

## Common Issues

### ❌ Build Fails

**Error**: `npm run build` fails in CI

**Fix**:
```bash
# Test build locally
cd frontend
npm run build

# Fix any errors
# Commit and push
```

### ❌ Performance Below 90

**Causes**:
- Large bundle size
- Unoptimized images
- No lazy loading

**Fix**:
```bash
# Check bundle
npm run measure:bundle

# Optimize images (use LazyImage)
# Enable code splitting
# Lazy load routes
```

### ❌ Accessibility Below 95

**Causes**:
- Missing ARIA labels
- Poor contrast
- No alt text

**Fix**:
```bash
# Check contrast
npm run check:contrast

# Add ARIA labels to buttons
# Add alt text to images
# Fix color contrast
```

### ❌ SEO Below 95

**Causes**:
- Missing meta tags
- No structured data
- Missing canonical URLs

**Fix**:
```jsx
// Add SEOHead to page
import SEOHead from '../components/SEO/SEOHead';

<SEOHead
  title="Page Title | Careerak"
  description="Page description 150-160 chars"
  keywords="keyword1, keyword2"
/>
```

---

## Quick Commands

```bash
# Run Lighthouse locally
lhci autorun

# Check bundle size
npm run measure:bundle

# Check accessibility
npm run check:contrast

# Validate SEO
npm run audit:seo

# Build and test
npm run build && npm run preview
```

---

## Understanding Scores

| Score | Meaning | Action |
|-------|---------|--------|
| 🟢 90-100 | Good | Keep it up! |
| 🟡 50-89 | Needs work | Optimize |
| 🔴 0-49 | Poor | Fix ASAP |

---

## Tips

### ✅ Do
- Check Lighthouse before merging PR
- Fix issues early
- Monitor trends
- Test locally first

### ❌ Don't
- Ignore failing checks
- Lower targets to pass
- Skip local testing
- Merge with failures

---

## Need Help?

### Documentation
- 📄 `docs/LIGHTHOUSE_CI_SETUP.md` - Full guide
- 📄 `docs/PERFORMANCE_OPTIMIZATION.md` - Performance tips
- 📄 `docs/ACCESSIBILITY_FEATURES.md` - A11y guide
- 📄 `docs/SEO_IMPLEMENTATION.md` - SEO guide

### Tools
- [Lighthouse Chrome Extension](https://chrome.google.com/webstore/detail/lighthouse/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

### Support
- Check GitHub Actions logs
- Review configuration files
- Test locally
- Ask team for help

---

## Summary

Lighthouse CI is now monitoring your code quality automatically. Just push your changes and check the PR comment for results. Fix any issues before merging to maintain high quality standards.

**Remember**:
- 🎯 Performance: 90+
- 🎯 Accessibility: 95+
- 🎯 SEO: 95+
- 🎯 Best Practices: 90+

Happy coding! 🚀
