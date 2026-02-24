# Vercel Deployment Test Guide

**Status**: ✅ Complete  
**Last Updated**: 2026-02-22  
**Requirements**: Task 10.3.5

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Automated Testing](#automated-testing)
4. [Manual Testing](#manual-testing)
5. [Performance Verification](#performance-verification)
6. [Security Verification](#security-verification)
7. [Troubleshooting](#troubleshooting)
8. [Post-Deployment Monitoring](#post-deployment-monitoring)

---

## 1. Overview

This guide provides comprehensive testing procedures for Vercel deployments, ensuring all platform enhancements are working correctly in production.

### Test Categories

- ✅ **Connectivity** - Frontend and Backend accessibility
- ✅ **Caching** - Cache headers and strategies
- ✅ **Compression** - Gzip/Brotli compression
- ✅ **Security** - Security headers and HTTPS
- ✅ **Redirects** - SEO redirects
- ✅ **PWA** - Service worker and manifest
- ✅ **SEO** - Robots.txt and sitemap
- ✅ **Performance** - Load times and response times
- ✅ **Environment** - Environment variables

---

## 2. Pre-Deployment Checklist

### 2.1 Code Preparation

```bash
# ✅ 1. All code committed
git status
# Should show: "nothing to commit, working tree clean"

# ✅ 2. All tests passing
cd frontend
npm test -- --run
cd ../backend
npm test

# ✅ 3. Build succeeds locally
cd frontend
npm run build
# Should complete without errors

# ✅ 4. Environment variables validated
node scripts/validate-env-vars.js all
# Should show: "✓ All critical variables are set!"
```

### 2.2 Vercel Configuration

```bash
# ✅ 1. Verify vercel.json is correct
cat vercel.json
# Check: builds, routes, headers, redirects

# ✅ 2. Environment variables set in Vercel
# Dashboard → Project → Settings → Environment Variables
# Required: MONGODB_URI, JWT_SECRET, CLOUDINARY_*, PUSHER_*

# ✅ 3. Domain configured
# Dashboard → Project → Settings → Domains
# Verify: Production domain is set
```

### 2.3 Dependencies

```bash
# ✅ 1. All dependencies installed
cd frontend && npm install
cd ../backend && npm install

# ✅ 2. No security vulnerabilities
npm audit
# Should show: "found 0 vulnerabilities"

# ✅ 3. Package versions compatible
npm outdated
# Review any major version differences
```

---

## 3. Automated Testing

### 3.1 Run Deployment Test Script

```bash
# Test local build first
npm run build
npm run preview
node scripts/test-vercel-deployment.js http://localhost:4173

# Test production deployment
node scripts/test-vercel-deployment.js https://your-domain.com
```

### 3.2 Expected Output

```
╔════════════════════════════════════════════════════════════╗
║         Vercel Deployment Test Suite                      ║
╚════════════════════════════════════════════════════════════╝

Testing deployment at: https://careerak.com

✓ Frontend is accessible
✓ Backend API is accessible
✓ Static assets have cache headers
✓ HTML has no-cache headers
✓ Compression is enabled
✓ Security headers are present
✓ Redirects work correctly
✓ Manifest.json is accessible
✓ Service worker is accessible
✓ Robots.txt is accessible
✓ Sitemap.xml is accessible
✓ Backend has required environment variables
✓ Response time is acceptable
✓ HTML has correct content type
✓ API returns JSON
✓ 404 page works
✓ CORS headers are configured

═══════════════════════════════════════════════════════════
Test Summary
═══════════════════════════════════════════════════════════
✓ Passed:   17
✗ Failed:   0
⚠ Warnings: 0
═══════════════════════════════════════════════════════════

✅ All deployment tests passed!
```

---

## 4. Manual Testing

### 4.1 Frontend Testing

**Homepage**:
```bash
# 1. Open in browser
https://your-domain.com

# 2. Check:
✓ Page loads within 2 seconds
✓ No console errors
✓ Dark mode toggle works
✓ Language switcher works
✓ All images load
✓ Animations are smooth
```

**Key Pages**:
```bash
# Test each page:
/job-postings
/courses
/profile
/auth
/login
/policy

# For each page, verify:
✓ Page loads correctly
✓ SEO meta tags present (View Source)
✓ No console errors
✓ Responsive design works
✓ RTL/LTR works for Arabic
```

### 4.2 Backend Testing

**Health Check**:
```bash
curl https://your-domain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Authentication**:
```bash
# 1. Register new user
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# 2. Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Expected: {"token":"...","user":{...}}
```

**Database Connection**:
```bash
# Check if MongoDB is connected
curl https://your-domain.com/api/health
# Should return 200 OK (means DB is connected)
```

### 4.3 PWA Testing

**Service Worker**:
```javascript
// Open DevTools → Application → Service Workers
// Should show: "service-worker.js" - Status: Activated

// Test offline:
// 1. Visit a page
// 2. DevTools → Network → Offline
// 3. Refresh page
// Expected: Page loads from cache
```

**Install Prompt**:
```javascript
// On mobile:
// 1. Visit site in Chrome/Safari
// 2. Look for "Add to Home Screen" prompt
// 3. Install the app
// Expected: App installs and opens in standalone mode
```

**Push Notifications**:
```javascript
// 1. Login to the app
// 2. Allow notifications when prompted
// 3. Trigger a notification (e.g., new message)
// Expected: Browser notification appears
```

### 4.4 Performance Testing

**Lighthouse Audit**:
```bash
# Run Lighthouse
lighthouse https://your-domain.com --only-categories=performance,accessibility,seo

# Expected scores:
Performance: 90+
Accessibility: 95+
SEO: 95+
```

**Core Web Vitals**:
```bash
# Check in Chrome DevTools → Lighthouse
FCP (First Contentful Paint): < 1.8s
LCP (Largest Contentful Paint): < 2.5s
CLS (Cumulative Layout Shift): < 0.1
TTI (Time to Interactive): < 3.8s
```

---

## 5. Performance Verification

### 5.1 Cache Headers

```bash
# Test static assets
curl -I https://your-domain.com/assets/index.js
# Expected: Cache-Control: public, max-age=2592000, immutable

# Test HTML
curl -I https://your-domain.com
# Expected: Cache-Control: public, max-age=0, must-revalidate

# Test API
curl -I https://your-domain.com/api/health
# Expected: Cache-Control: no-store, no-cache, must-revalidate
```

### 5.2 Compression

```bash
# Test compression
curl -H "Accept-Encoding: gzip, deflate, br" -I https://your-domain.com
# Expected: content-encoding: br (or gzip)

# Test compression ratio
curl -H "Accept-Encoding: gzip" https://your-domain.com | wc -c
curl https://your-domain.com | wc -c
# Compressed should be 60-80% smaller
```

### 5.3 Bundle Size

```bash
# Check bundle sizes
cd frontend
npm run measure:bundle

# Expected:
Main bundle: < 200KB
Vendor bundle: < 300KB
Total: < 500KB
```

---

## 6. Security Verification

### 6.1 Security Headers

```bash
# Check security headers
curl -I https://your-domain.com

# Expected headers:
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
```

### 6.2 HTTPS

```bash
# Verify HTTPS redirect
curl -I http://your-domain.com
# Expected: 301 Moved Permanently → https://your-domain.com

# Verify SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
# Expected: Valid certificate, no errors
```

### 6.3 Environment Variables

```bash
# Verify secrets are not exposed
curl https://your-domain.com/api/health
# Should NOT contain: JWT_SECRET, MONGODB_URI, API keys

# Check source code
curl https://your-domain.com
# Should NOT contain: API keys, secrets, credentials
```

---

## 7. Troubleshooting

### 7.1 Common Issues

**Issue: 404 on API routes**
```bash
# Solution: Check vercel.json routes
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.js"
    }
  ]
}
```

**Issue: Environment variables not working**
```bash
# Solution: Redeploy after adding variables
vercel --prod

# Or in Dashboard:
Deployments → ... → Redeploy
```

**Issue: Build fails**
```bash
# Solution: Check build logs
vercel logs [deployment-url]

# Common fixes:
1. Missing dependencies: npm install
2. Build errors: Fix code errors
3. Memory issues: Increase memory in vercel.json
```

**Issue: Slow response times**
```bash
# Solution: Check function logs
vercel logs [deployment-url] --follow

# Common fixes:
1. Database connection: Check MONGODB_URI
2. Cold starts: Use Vercel Pro for faster cold starts
3. Large bundles: Optimize bundle size
```

### 7.2 Debug Mode

```bash
# Enable debug mode
export DEBUG=*
vercel dev

# Check function logs
vercel logs [deployment-url] --follow

# Check build logs
vercel logs [deployment-url] --build
```

---

## 8. Post-Deployment Monitoring

### 8.1 Vercel Analytics

```bash
# Enable Vercel Analytics
Dashboard → Project → Analytics

# Monitor:
- Page views
- Unique visitors
- Top pages
- Response times
- Error rates
```

### 8.2 Error Tracking

```bash
# Check error logs
vercel logs [deployment-url] --follow

# Monitor:
- 4xx errors (client errors)
- 5xx errors (server errors)
- Function timeouts
- Memory issues
```

### 8.3 Performance Monitoring

```bash
# Run Lighthouse CI
npm run audit:lighthouse

# Monitor:
- Performance score
- Accessibility score
- SEO score
- Core Web Vitals
```

### 8.4 Uptime Monitoring

```bash
# Set up uptime monitoring
# Options:
1. Vercel Monitoring (built-in)
2. UptimeRobot (free)
3. Pingdom (paid)
4. StatusCake (free tier)

# Monitor:
- Uptime percentage
- Response times
- SSL certificate expiry
- DNS resolution
```

---

## 9. Deployment Checklist

### Pre-Deployment

- [ ] All code committed and pushed
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables validated
- [ ] Dependencies up to date
- [ ] No security vulnerabilities
- [ ] Vercel configuration correct

### Deployment

- [ ] Deploy to Vercel
- [ ] Wait for deployment to complete
- [ ] Check deployment logs
- [ ] Verify deployment URL

### Post-Deployment

- [ ] Run automated tests
- [ ] Test frontend pages
- [ ] Test backend API
- [ ] Test PWA features
- [ ] Run Lighthouse audit
- [ ] Verify security headers
- [ ] Check performance metrics
- [ ] Monitor error logs

### Sign-Off

- [ ] All tests passed
- [ ] Performance meets targets
- [ ] Security verified
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] Stakeholders notified

---

## 10. Quick Reference

### Test Commands

```bash
# Automated tests
node scripts/test-vercel-deployment.js https://your-domain.com

# Lighthouse audit
lighthouse https://your-domain.com

# Bundle size
npm run measure:bundle

# Environment variables
node scripts/validate-env-vars.js all

# Deployment logs
vercel logs [deployment-url]
```

### Expected Results

| Test | Target | Status |
|------|--------|--------|
| Frontend accessible | 200 OK | ✅ |
| Backend accessible | 200 OK | ✅ |
| Cache headers | Present | ✅ |
| Compression | Enabled | ✅ |
| Security headers | Present | ✅ |
| Redirects | Working | ✅ |
| PWA files | Accessible | ✅ |
| SEO files | Accessible | ✅ |
| Performance score | 90+ | ✅ |
| Accessibility score | 95+ | ✅ |
| SEO score | 95+ | ✅ |

---

## 11. Resources

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Tools

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Pingdom](https://tools.pingdom.com/)

### Support

- Vercel Support: support@vercel.com
- Vercel Community: https://github.com/vercel/vercel/discussions
- Project Documentation: `docs/`

---

## 12. Conclusion

This guide provides comprehensive testing procedures for Vercel deployments. Follow all steps to ensure a successful deployment with optimal performance, security, and reliability.

**Next Steps**:
1. Run automated tests
2. Perform manual testing
3. Monitor deployment
4. Document any issues
5. Update this guide as needed

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: ✅ Complete
