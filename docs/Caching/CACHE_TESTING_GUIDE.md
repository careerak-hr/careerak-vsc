# Cache Testing Guide - Browser DevTools

## Overview
This guide provides step-by-step instructions for testing caching behavior using browser DevTools to verify that cache headers are correctly configured and working as expected.

## Prerequisites
- Production build deployed to Vercel or local preview server
- Chrome, Firefox, or Edge browser with DevTools
- Basic understanding of HTTP caching

## Cache Configuration Summary

### Static Assets (30 days)
- **Assets folder**: `/assets/*` → `max-age=2592000` (30 days)
- **JS/CSS files**: `*.js, *.css` → `max-age=2592000` (30 days)
- **Images**: `*.jpg, *.png, *.svg, *.webp` → `max-age=2592000` (30 days)
- **Fonts**: `*.woff, *.woff2, *.ttf` → `max-age=31536000` (1 year)

### Dynamic Content (No cache)
- **HTML files**: `*.html` → `max-age=0, must-revalidate`
- **API endpoints**: `/api/*` → `no-store, no-cache, must-revalidate`

### Special Files
- **Manifest**: `/manifest.json` → `max-age=86400` (1 day)
- **Service Worker**: `/service-worker.js` → `max-age=0, must-revalidate`
- **Offline page**: `/offline.html` → `max-age=86400` (1 day)

---

## Testing Methods

## Method 1: Chrome DevTools Network Tab

### Step 1: Open DevTools
1. Open your application in Chrome
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Navigate to the **Network** tab

### Step 2: Configure Network Tab
1. Check **Disable cache** checkbox (to test fresh loads)
2. Enable **Preserve log** to keep requests across page navigations
3. Set throttling to **No throttling** for accurate timing

### Step 3: Test Initial Load (Cold Cache)
1. Clear browser cache: `Ctrl+Shift+Delete` → Clear cached images and files
2. Reload the page: `Ctrl+R` or `F5`
3. Observe the **Size** column:
   - Should show actual file sizes (e.g., `245 KB`)
   - **Status** should be `200 OK`

### Step 4: Test Cached Load (Warm Cache)
1. **Uncheck** "Disable cache" in Network tab
2. Reload the page: `Ctrl+R` or `F5`
3. Observe the **Size** column:
   - Should show `(disk cache)` or `(memory cache)`
   - **Status** should be `200 OK` (from cache)
   - **Time** should be very fast (< 10ms)

### Step 5: Verify Cache Headers
1. Click on any static asset (JS, CSS, image)
2. Go to the **Headers** tab
3. Check **Response Headers**:
   ```
   Cache-Control: public, max-age=2592000, immutable
   X-Content-Type-Options: nosniff
   ```
4. Verify **Request Headers**:
   ```
   If-None-Match: "etag-value"  (for 304 responses)
   ```

### Step 6: Test Hard Reload (Bypass Cache)
1. Hard reload: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
2. All resources should reload from server
3. **Size** column should show actual sizes (not from cache)

---

## Method 2: Chrome DevTools Application Tab

### Step 1: Open Application Tab
1. Open DevTools (`F12`)
2. Navigate to **Application** tab
3. Expand **Cache** → **Cache Storage**

### Step 2: Inspect Cache Storage
1. Look for cache entries (if service worker is active)
2. Verify cached resources:
   - Static assets (JS, CSS, images)
   - Fonts
   - Offline page

### Step 3: Clear Cache Storage
1. Right-click on cache name
2. Select **Delete**
3. Reload page and verify cache repopulates

### Step 4: Check Storage Usage
1. Go to **Application** → **Storage**
2. View **Usage** section
3. Verify cache size is reasonable (< 50MB)

---

## Method 3: Firefox DevTools

### Step 1: Open DevTools
1. Press `F12` or `Ctrl+Shift+I`
2. Navigate to **Network** tab

### Step 2: Test Caching
1. Check **Disable Cache** in settings (gear icon)
2. Reload page and observe **Transferred** column
3. Uncheck **Disable Cache** and reload
4. Look for **cached** label in **Transferred** column

### Step 3: Verify Headers
1. Click on any resource
2. Go to **Headers** tab
3. Check **Response Headers** for `Cache-Control`

---

## Method 4: Edge DevTools

### Step 1: Open DevTools
1. Press `F12`
2. Navigate to **Network** tab

### Step 2: Test Caching
1. Enable **Disable cache** checkbox
2. Reload page (cold cache test)
3. Disable **Disable cache** checkbox
4. Reload page (warm cache test)

### Step 3: Verify Cache Status
1. Check **Size** column for `(from cache)` indicator
2. Verify **Time** is minimal for cached resources

---

## Method 5: Command Line Testing (curl)

### Test Cache Headers
```bash
# Test static asset
curl -I https://your-domain.com/assets/js/main-abc123.js

# Expected output:
# Cache-Control: public, max-age=2592000, immutable
# X-Content-Type-Options: nosniff

# Test HTML file
curl -I https://your-domain.com/index.html

# Expected output:
# Cache-Control: public, max-age=0, must-revalidate

# Test API endpoint
curl -I https://your-domain.com/api/users

# Expected output:
# Cache-Control: no-store, no-cache, must-revalidate
```

---

## Verification Checklist

### ✅ Static Assets (JS, CSS, Images)
- [ ] Cache-Control header: `public, max-age=2592000, immutable`
- [ ] Second load shows `(disk cache)` or `(memory cache)`
- [ ] Load time < 10ms on cached load
- [ ] Status: `200 OK` (from cache)

### ✅ Fonts
- [ ] Cache-Control header: `public, max-age=31536000, immutable`
- [ ] Cached for 1 year
- [ ] Second load from cache

### ✅ HTML Files
- [ ] Cache-Control header: `public, max-age=0, must-revalidate`
- [ ] Always revalidated with server
- [ ] May return `304 Not Modified` if unchanged

### ✅ API Endpoints
- [ ] Cache-Control header: `no-store, no-cache, must-revalidate`
- [ ] Never cached
- [ ] Always fetched from server

### ✅ Manifest & Service Worker
- [ ] Manifest: `max-age=86400` (1 day)
- [ ] Service Worker: `max-age=0, must-revalidate`
- [ ] Service worker updates detected

---

## Common Issues & Solutions

### Issue 1: Resources Not Caching
**Symptoms**: All resources show actual size, never from cache

**Solutions**:
1. Verify "Disable cache" is unchecked in DevTools
2. Check cache headers in Response Headers
3. Verify Vercel deployment has correct headers
4. Clear browser cache and test again

### Issue 2: Stale Content After Update
**Symptoms**: Old version loads after deployment

**Solutions**:
1. Verify hash-based filenames are used (e.g., `main-abc123.js`)
2. Check `index.html` has `max-age=0, must-revalidate`
3. Hard reload: `Ctrl+Shift+R`
4. Clear cache and reload

### Issue 3: Service Worker Not Updating
**Symptoms**: Old service worker version active

**Solutions**:
1. Check service worker cache headers: `max-age=0`
2. Unregister service worker in Application tab
3. Close all tabs and reopen
4. Verify update detection logic

### Issue 4: Large Cache Size
**Symptoms**: Cache storage > 50MB

**Solutions**:
1. Review cached resources in Application tab
2. Implement cache size limits in service worker
3. Remove unnecessary cached resources
4. Use cache expiration strategies

---

## Performance Metrics

### Expected Results (After Caching)

**First Load (Cold Cache)**:
- Total size: ~2-3 MB
- Load time: 2-4 seconds (3G)
- Requests: 30-50

**Second Load (Warm Cache)**:
- Total size: ~50-100 KB (HTML + API)
- Load time: < 1 second
- Cached requests: 25-45
- Network requests: 5-10

**Cache Hit Rate**:
- Target: > 80%
- Formula: (Cached Requests / Total Requests) × 100

---

## Testing Scenarios

### Scenario 1: First-Time User
1. Clear all cache
2. Load application
3. Verify all resources download
4. Check total size and time

### Scenario 2: Returning User
1. Load application (cache should be warm)
2. Verify most resources from cache
3. Only HTML and API should hit network
4. Load time should be < 1 second

### Scenario 3: After Deployment
1. Deploy new version
2. Load application
3. Verify new assets download (different hashes)
4. Old assets should be ignored
5. New assets should cache

### Scenario 4: Offline Mode
1. Load application (warm cache)
2. Go offline (disable network in DevTools)
3. Reload page
4. Verify service worker serves cached content
5. Offline page should display for uncached routes

---

## Automated Testing Script

### Chrome DevTools Protocol (CDP)
```javascript
// test-cache.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  const cachedRequests = [];
  const networkRequests = [];
  
  page.on('request', request => {
    request.continue();
  });
  
  page.on('response', response => {
    const url = response.url();
    const fromCache = response.fromCache();
    const headers = response.headers();
    
    if (fromCache) {
      cachedRequests.push(url);
    } else {
      networkRequests.push({
        url,
        cacheControl: headers['cache-control'],
      });
    }
  });
  
  // First load (cold cache)
  await page.goto('https://your-domain.com');
  console.log('First load - Network requests:', networkRequests.length);
  
  // Second load (warm cache)
  cachedRequests.length = 0;
  networkRequests.length = 0;
  await page.reload();
  
  console.log('Second load - Cached:', cachedRequests.length);
  console.log('Second load - Network:', networkRequests.length);
  console.log('Cache hit rate:', 
    (cachedRequests.length / (cachedRequests.length + networkRequests.length) * 100).toFixed(2) + '%'
  );
  
  // Verify cache headers
  networkRequests.forEach(req => {
    if (req.url.includes('/assets/')) {
      console.assert(
        req.cacheControl.includes('max-age=2592000'),
        `Asset ${req.url} has incorrect cache header`
      );
    }
  });
  
  await browser.close();
})();
```

---

## Lighthouse Audit

### Run Lighthouse
1. Open DevTools
2. Go to **Lighthouse** tab
3. Select **Performance** category
4. Click **Generate report**

### Check Cache Metrics
- **Serve static assets with efficient cache policy**
  - Target: All static assets cached for 30+ days
  - Score: Should be 100%

- **Uses long cache TTL**
  - Verify assets have appropriate cache duration
  - No warnings for short cache times

---

## Documentation

### Cache Strategy Summary
```
┌─────────────────────┬──────────────────┬─────────────────┐
│ Resource Type       │ Cache Duration   │ Strategy        │
├─────────────────────┼──────────────────┼─────────────────┤
│ JS/CSS/Images       │ 30 days          │ Immutable       │
│ Fonts               │ 1 year           │ Immutable       │
│ HTML                │ 0 (revalidate)   │ Always fresh    │
│ API                 │ No cache         │ Always fetch    │
│ Manifest            │ 1 day            │ Daily update    │
│ Service Worker      │ 0 (revalidate)   │ Always fresh    │
└─────────────────────┴──────────────────┴─────────────────┘
```

### Cache Busting
- All assets use hash-based filenames: `main-[hash].js`
- Hash changes when content changes
- Old versions automatically invalidated
- No manual cache clearing needed

---

## Next Steps

After verifying caching:
1. ✅ Document cache hit rates
2. ✅ Monitor cache performance in production
3. ✅ Set up cache monitoring alerts
4. ✅ Review cache strategy quarterly
5. ✅ Optimize based on usage patterns

---

## References

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Chrome DevTools Network Reference](https://developer.chrome.com/docs/devtools/network/)
- [Vercel Cache Headers](https://vercel.com/docs/concepts/edge-network/caching)
- [Web.dev: HTTP Caching](https://web.dev/http-cache/)

---

**Last Updated**: 2026-02-19  
**Status**: ✅ Complete
