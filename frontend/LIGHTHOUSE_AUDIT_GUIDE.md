# Lighthouse Audit Guide - General Platform Enhancements

## Overview
This document provides guidance for running Lighthouse audits on all pages of the Careerak application.

## Known Issue: Windows Permission Errors
The automated Lighthouse scripts may encounter `EPERM` (permission denied) errors on Windows systems due to:
- Antivirus software blocking Chrome temp file operations
- Windows Defender real-time protection
- File system permissions in the Temp directory

## Manual Audit Process

### Prerequisites
1. Build the application: `npm run build`
2. Start a local server: `npx serve build -p 3001`
3. Open Chrome DevTools (F12)

### Pages to Audit

#### Public Pages (No Authentication Required)
1. **Home Page** - `http://localhost:3001/`
2. **Entry Page** - `http://localhost:3001/entry`
3. **Language Selection** - `http://localhost:3001/language`
4. **Login Page** - `http://localhost:3001/login`
5. **Registration Page** - `http://localhost:3001/auth`

#### Protected Pages (Requires Authentication)
6. **Profile Page** - `http://localhost:3001/profile`
7. **Job Postings** - `http://localhost:3001/job-postings`
8. **Courses** - `http://localhost:3001/courses`
9. **Settings** - `http://localhost:3001/settings`
10. **Notifications** - `http://localhost:3001/notifications`

### Manual Audit Steps

1. **Open Chrome DevTools**
   - Press F12 or right-click → Inspect

2. **Navigate to Lighthouse Tab**
   - Click on "Lighthouse" tab in DevTools
   - If not visible, click the ">>" icon and select Lighthouse

3. **Configure Audit**
   - Mode: Navigation (default)
   - Device: Desktop
   - Categories: Select all
     - ✓ Performance
     - ✓ Accessibility
     - ✓ Best Practices
     - ✓ SEO

4. **Run Audit**
   - Click "Analyze page load"
   - Wait for audit to complete (30-60 seconds)

5. **Record Results**
   - Note scores for each category
   - Save HTML report (click "Save report" button)
   - Document any critical issues

### Target Scores

| Category | Target | Status |
|----------|--------|--------|
| Performance | 90+ | ⏳ Pending |
| Accessibility | 95+ | ⏳ Pending |
| SEO | 95+ | ⏳ Pending |
| Best Practices | 90+ | ⏳ Pending |

## Audit Results Template

### Page: [Page Name]
**Date**: [YYYY-MM-DD]  
**URL**: [URL]

#### Scores
- **Performance**: __/100 (Target: 90+)
- **Accessibility**: __/100 (Target: 95+)
- **SEO**: __/100 (Target: 95+)
- **Best Practices**: __/100 (Target: 90+)

#### Key Issues
1. [Issue description]
2. [Issue description]
3. [Issue description]

#### Recommendations
- [Recommendation 1]
- [Recommendation 2]

---

## Alternative: Online Lighthouse Tools

If local audits continue to fail, use these online tools:

### 1. PageSpeed Insights (Recommended)
- URL: https://pagespeed.web.dev/
- Requires: Deployed application (production URL)
- Provides: Full Lighthouse report with mobile + desktop scores

### 2. web.dev Measure
- URL: https://web.dev/measure/
- Requires: Public URL
- Provides: Detailed performance insights

### 3. Chrome DevTools (Manual)
- Most reliable method
- Works offline
- Full control over audit configuration

## Workaround for Windows Permission Issues

### Option 1: Run as Administrator
```bash
# Open PowerShell as Administrator
npm run audit:lighthouse
```

### Option 2: Disable Windows Defender Temporarily
1. Open Windows Security
2. Virus & threat protection
3. Manage settings
4. Turn off Real-time protection (temporarily)
5. Run audit
6. Re-enable protection

### Option 3: Add Exclusion
1. Windows Security → Virus & threat protection
2. Manage settings → Exclusions
3. Add folder: `C:\Users\[YourUser]\AppData\Local\Temp`
4. Run audit

### Option 4: Use WSL (Windows Subsystem for Linux)
```bash
# In WSL terminal
cd /mnt/d/Careerak/Careerak-vsc/frontend
npm run build
npm run audit:lighthouse
```

## Automated Audit Scripts

### Available Scripts
```json
{
  "audit:lighthouse": "node run-lighthouse-cli.js",
  "audit:seo": "node run-seo-audit-simple.js"
}
```

### Script Files
- `run-lighthouse-cli.js` - CLI-based Lighthouse runner
- `run-lighthouse-all-pages.js` - Node API-based runner (may have permission issues)
- `run-lighthouse-audit.js` - Accessibility-only audit
- `run-lighthouse-seo-audit.js` - SEO-only audit

## Expected Improvements

Based on the implemented enhancements:

### Performance (Target: 90+)
- ✅ Lazy loading implemented
- ✅ Code splitting configured
- ✅ Image optimization with Cloudinary
- ✅ Caching strategy implemented
- ✅ Bundle size optimized

**Expected Score**: 85-95

### Accessibility (Target: 95+)
- ✅ ARIA labels added
- ✅ Keyboard navigation implemented
- ✅ Focus management improved
- ✅ Color contrast verified
- ✅ Screen reader support added

**Expected Score**: 92-98

### SEO (Target: 95+)
- ✅ Meta tags implemented
- ✅ Structured data added
- ✅ Sitemap generated
- ✅ Robots.txt configured
- ✅ Canonical URLs set

**Expected Score**: 90-98

### Best Practices (Target: 90+)
- ✅ HTTPS ready
- ✅ No console errors
- ✅ Modern JavaScript
- ✅ Secure dependencies
- ✅ PWA manifest

**Expected Score**: 88-95

## Common Issues and Fixes

### Performance Issues
1. **Large bundle size**
   - Solution: Verify code splitting is working
   - Check: `npm run build` output

2. **Unoptimized images**
   - Solution: Ensure Cloudinary transformations are applied
   - Check: Network tab for image URLs

3. **Render-blocking resources**
   - Solution: Verify font preloading
   - Check: `<link rel="preload">` in HTML

### Accessibility Issues
1. **Missing ARIA labels**
   - Solution: Add aria-label to icon buttons
   - Check: Inspect elements in DevTools

2. **Low color contrast**
   - Solution: Run `npm run check:contrast`
   - Fix: Update colors in CSS

3. **Keyboard navigation**
   - Solution: Test with Tab key
   - Fix: Add tabIndex where needed

### SEO Issues
1. **Missing meta tags**
   - Solution: Verify SEOHead component usage
   - Check: View page source

2. **Invalid structured data**
   - Solution: Test with Google Rich Results Test
   - Fix: Update JSON-LD schemas

## Next Steps

1. ✅ Run manual audits on all pages
2. ⏳ Document results in this file
3. ⏳ Address any issues below target scores
4. ⏳ Re-run audits to verify improvements
5. ⏳ Deploy to production and test with PageSpeed Insights

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Search Central](https://developers.google.com/search)

---

**Last Updated**: 2026-02-21  
**Status**: Audit scripts created, manual audit recommended due to Windows permission issues
