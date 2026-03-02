# Lighthouse CI Configuration

This project uses Lighthouse CI to automatically monitor performance, accessibility, SEO, and best practices.

## Quick Start

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Locally
```bash
# Build and run Lighthouse CI
npm run lighthouse:local

# Or run on existing build
npm run lighthouse:ci
```

### View Results
Results are saved in `.lighthouseci/` directory. Open the HTML reports in your browser.

## Configuration

### Main Config: `lighthouserc.json`
Located in project root. Defines:
- URLs to test
- Performance budgets
- Assertion rules
- Upload settings

### GitHub Workflow: `.github/workflows/lighthouse-ci.yml`
Runs automatically on:
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Mondays 9 AM UTC)
- Manual trigger

## Targets

| Category | Target | Current |
|----------|--------|---------|
| Performance | 90+ | - |
| Accessibility | 95+ | - |
| SEO | 95+ | - |
| Best Practices | 90+ | - |

## Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| FCP | < 1.8s | First Contentful Paint |
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| TBT | < 300ms | Total Blocking Time |
| SI | < 3.4s | Speed Index |
| TTI | < 3.8s | Time to Interactive |

## Pages Tested

1. Homepage (`/`)
2. Job Postings (`/job-postings`)
3. Courses (`/courses`)
4. Profile (`/profile`)
5. Login (`/login`)

## Troubleshooting

### Build Fails
```bash
cd frontend
npm run build
# Fix any errors
```

### Low Scores
- **Performance**: Check bundle size, optimize images, enable lazy loading
- **Accessibility**: Add ARIA labels, fix contrast, add alt text
- **SEO**: Add meta tags, structured data, canonical URLs
- **Best Practices**: Fix console errors, use HTTPS, update dependencies

## Documentation

- 📄 `docs/LIGHTHOUSE_CI_SETUP.md` - Comprehensive guide
- 📄 `docs/LIGHTHOUSE_CI_QUICK_START.md` - Quick reference
- 📄 `docs/PERFORMANCE_OPTIMIZATION.md` - Performance tips
- 📄 `docs/ACCESSIBILITY_FEATURES.md` - Accessibility guide
- 📄 `docs/SEO_IMPLEMENTATION.md` - SEO guide

## Resources

- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review configuration files
3. Test locally with `npm run lighthouse:local`
4. Consult documentation in `docs/`

---

**Status**: ✅ Active  
**Last Updated**: 2026-02-22  
**Maintained By**: Development Team
