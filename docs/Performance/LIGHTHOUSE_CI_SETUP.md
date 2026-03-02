# Lighthouse CI Setup Guide

## Overview

Lighthouse CI is now integrated into the Careerak project pipeline to automatically monitor and enforce performance, accessibility, SEO, and best practices standards on every push and pull request.

**Date Added**: 2026-02-22  
**Status**: ✅ Active  
**Requirements**: Task 10.4.1, NFR-PERF-1, NFR-A11Y-1, NFR-SEO-1

---

## Features

### Automated Testing
- ✅ Runs on every push to `main` and `develop` branches
- ✅ Runs on every pull request
- ✅ Weekly scheduled runs (Mondays at 9:00 AM UTC)
- ✅ Manual trigger via GitHub Actions UI

### Performance Metrics
- 🎯 **Performance**: 90+ (Target)
- 🎯 **Accessibility**: 95+ (Target)
- 🎯 **SEO**: 95+ (Target)
- 🎯 **Best Practices**: 90+ (Target)

### Core Web Vitals
- ⚡ **FCP** (First Contentful Paint): < 1.8s
- ⚡ **LCP** (Largest Contentful Paint): < 2.5s
- ⚡ **CLS** (Cumulative Layout Shift): < 0.1
- ⚡ **TBT** (Total Blocking Time): < 300ms
- ⚡ **SI** (Speed Index): < 3.4s
- ⚡ **TTI** (Time to Interactive): < 3.8s

### Pages Tested
1. Homepage (`/`)
2. Job Postings (`/job-postings`)
3. Courses (`/courses`)
4. Profile (`/profile`)
5. Login (`/login`)

---

## Configuration Files

### 1. `lighthouserc.json`
Main configuration file for Lighthouse CI.

**Location**: Project root

**Key Settings**:
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:4173/", ...],
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "accessibility", "seo", "best-practices"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:seo": ["error", {"minScore": 0.95}]
      }
    }
  }
}
```

### 2. `.github/workflows/lighthouse-ci.yml`
GitHub Actions workflow for CI/CD integration.

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual dispatch
- Weekly schedule (Mondays 9:00 AM UTC)

---

## How It Works

### Workflow Steps

1. **Checkout Code**
   - Clones the repository

2. **Setup Node.js**
   - Installs Node.js 18
   - Caches npm dependencies

3. **Install Dependencies**
   - Runs `npm ci` in frontend directory

4. **Build Frontend**
   - Runs `npm run build`
   - Creates production build

5. **Install Lighthouse CI**
   - Installs `@lhci/cli` globally

6. **Run Lighthouse CI**
   - Starts preview server
   - Runs Lighthouse on all configured URLs
   - Collects metrics (3 runs per URL)
   - Calculates median scores

7. **Upload Reports**
   - Uploads reports as GitHub artifacts
   - Retention: 30 days

8. **Parse Results**
   - Extracts scores from manifest
   - Outputs to GitHub Actions

9. **Comment on PR**
   - Posts formatted results to PR
   - Updates existing comment if present
   - Shows pass/fail status

10. **Fail if Targets Not Met**
    - Exits with error if any target missed
    - Blocks PR merge if configured

---

## Usage

### Running Locally

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Build the project
cd frontend
npm run build

# Run Lighthouse CI
cd ..
lhci autorun
```

### Viewing Results

**In GitHub Actions**:
1. Go to Actions tab
2. Select "Lighthouse CI" workflow
3. Click on latest run
4. View summary in PR comment
5. Download artifacts for detailed reports

**In Pull Requests**:
- Automatic comment with scores
- Color-coded results (🟢 🟡 🔴)
- Link to full reports

---

## Interpreting Results

### Score Ranges

| Score | Status | Emoji |
|-------|--------|-------|
| 90-100 | Good | 🟢 |
| 50-89 | Needs Improvement | 🟡 |
| 0-49 | Poor | 🔴 |

### Example PR Comment

```markdown
## 🔦 Lighthouse CI Results

| Category | Score | Target |
|----------|-------|--------|
| Performance | 🟢 92 | 90+ |
| Accessibility | 🟢 97 | 95+ |
| SEO | 🟢 98 | 95+ |
| Best Practices | 🟢 95 | 90+ |

✅ **All targets met!**

[View full report in artifacts](...)
```

---

## Troubleshooting

### Build Fails

**Problem**: Frontend build fails in CI

**Solution**:
```bash
# Check build locally
cd frontend
npm run build

# Fix any errors
# Commit and push
```

### Low Performance Score

**Problem**: Performance score below 90

**Common Causes**:
- Large bundle size
- Unoptimized images
- Render-blocking resources
- No code splitting

**Solutions**:
- Run `npm run measure:bundle` to check size
- Optimize images with Cloudinary
- Lazy load components
- Enable code splitting

### Low Accessibility Score

**Problem**: Accessibility score below 95

**Common Causes**:
- Missing ARIA labels
- Poor color contrast
- Missing alt text
- Keyboard navigation issues

**Solutions**:
- Run `npm run check:contrast`
- Add ARIA labels to buttons
- Add alt text to images
- Test keyboard navigation

### Low SEO Score

**Problem**: SEO score below 95

**Common Causes**:
- Missing meta tags
- No structured data
- Missing canonical URLs
- Poor heading hierarchy

**Solutions**:
- Add SEOHead to all pages
- Add structured data for jobs/courses
- Set canonical URLs
- Fix heading hierarchy

---

## Customization

### Adding New Pages

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/new-page"
      ]
    }
  }
}
```

### Adjusting Targets

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}]
      }
    }
  }
}
```

### Changing Schedule

Edit `.github/workflows/lighthouse-ci.yml`:

```yaml
schedule:
  # Run daily at 2:00 AM UTC
  - cron: '0 2 * * *'
```

---

## Best Practices

### ✅ Do

- Monitor trends over time
- Fix issues before merging PRs
- Review detailed reports regularly
- Keep targets realistic but challenging
- Document performance improvements

### ❌ Don't

- Ignore failing checks
- Lower targets to pass
- Skip local testing
- Merge PRs with failing Lighthouse
- Disable checks without reason

---

## Integration with Other Tools

### Vercel Analytics
- Lighthouse CI complements Vercel Analytics
- Use both for comprehensive monitoring
- Lighthouse: Pre-deployment checks
- Vercel: Real-world user metrics

### Google Search Console
- Lighthouse SEO aligns with GSC
- Use Lighthouse to catch issues early
- GSC shows real search performance

### Sentry
- Lighthouse catches performance issues
- Sentry tracks runtime errors
- Use together for full coverage

---

## Metrics Glossary

### Performance Metrics

**FCP (First Contentful Paint)**:
- Time until first content renders
- Target: < 1.8s
- Impact: User perception of speed

**LCP (Largest Contentful Paint)**:
- Time until largest content renders
- Target: < 2.5s
- Impact: Perceived load time

**CLS (Cumulative Layout Shift)**:
- Visual stability during load
- Target: < 0.1
- Impact: User experience

**TBT (Total Blocking Time)**:
- Time main thread is blocked
- Target: < 300ms
- Impact: Interactivity

**SI (Speed Index)**:
- How quickly content is visually displayed
- Target: < 3.4s
- Impact: Perceived performance

**TTI (Time to Interactive)**:
- Time until page is fully interactive
- Target: < 3.8s
- Impact: User engagement

---

## Maintenance

### Weekly Tasks
- ✅ Review Lighthouse reports
- ✅ Check for new warnings
- ✅ Monitor score trends

### Monthly Tasks
- ✅ Update targets if consistently met
- ✅ Review and optimize slow pages
- ✅ Update documentation

### Quarterly Tasks
- ✅ Audit all pages
- ✅ Update Lighthouse CI version
- ✅ Review and update assertions

---

## Resources

### Official Documentation
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)

### Internal Documentation
- `docs/PERFORMANCE_OPTIMIZATION.md`
- `docs/ACCESSIBILITY_FEATURES.md`
- `docs/SEO_IMPLEMENTATION.md`

### Tools
- [Lighthouse Chrome Extension](https://chrome.google.com/webstore/detail/lighthouse/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

---

## Support

### Getting Help

**Issues with CI**:
- Check GitHub Actions logs
- Review `lighthouserc.json` configuration
- Test locally with `lhci autorun`

**Performance Questions**:
- Review performance documentation
- Run local audits
- Check bundle size

**Accessibility Questions**:
- Run contrast checker
- Test with screen readers
- Review ARIA implementation

---

## Changelog

### 2026-02-22
- ✅ Initial Lighthouse CI setup
- ✅ GitHub Actions workflow created
- ✅ Configuration file added
- ✅ Documentation completed
- ✅ Targets set (Performance 90+, A11y 95+, SEO 95+)
- ✅ PR commenting enabled
- ✅ Weekly schedule configured

---

## Summary

Lighthouse CI is now fully integrated into the Careerak pipeline, providing automated performance, accessibility, and SEO monitoring on every code change. The system enforces quality standards and provides actionable feedback to maintain high scores across all metrics.

**Key Benefits**:
- 🚀 Automated quality checks
- 📊 Consistent monitoring
- 🎯 Enforced standards
- 📈 Trend tracking
- 🔍 Early issue detection

**Next Steps**:
1. Monitor first few runs
2. Adjust targets if needed
3. Fix any failing checks
4. Document improvements
5. Train team on usage
