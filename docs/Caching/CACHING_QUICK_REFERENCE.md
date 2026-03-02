# Caching Quick Reference

## Cache Durations

| Asset Type | Duration | Max-Age (seconds) | Immutable |
|------------|----------|-------------------|-----------|
| JavaScript | 30 days  | 2,592,000        | ✅ Yes    |
| CSS        | 30 days  | 2,592,000        | ✅ Yes    |
| Images     | 30 days  | 2,592,000        | ✅ Yes    |
| Fonts      | 1 year   | 31,536,000       | ✅ Yes    |
| HTML       | 0 days   | 0                | ❌ No     |
| Service Worker | 0 days | 0              | ❌ No     |
| API        | Never    | -                | ❌ No     |

## Cache Strategies

### CacheFirst (Static Assets)
```
Request → Check Cache → Return if found
                     → Fetch from network if not found
                     → Store in cache
                     → Return
```

**Use for:** JS, CSS, fonts, images

### NetworkFirst (API)
```
Request → Try network (5min timeout)
       → Return if successful
       → Fallback to cache if offline
       → Return
```

**Use for:** API calls, dynamic content

### No Cache (HTML)
```
Request → Always fetch from network
       → Never cache
```

**Use for:** HTML files, service worker

## Quick Commands

### Test Caching
```bash
# Run automated tests
cd frontend
npm test -- cache-validation.test.js --run

# Check HTTP headers
curl -I https://careerak.com/assets/js/main-abc123.js
```

### Clear Cache
```bash
# Browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Service Worker: DevTools → Application → Cache Storage → Delete
```

### Verify Configuration
```bash
# Check vercel.json
cat vercel.json | grep -A 5 "Cache-Control"

# Check service worker
cat frontend/public/service-worker.js | grep "maxAgeSeconds"
```

## Cache Control Headers

### Static Assets
```
Cache-Control: public, max-age=2592000, immutable
X-Content-Type-Options: nosniff
Content-Encoding: gzip
```

### HTML
```
Cache-Control: public, max-age=0, must-revalidate
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### API
```
Cache-Control: no-store, no-cache, must-revalidate
X-Content-Type-Options: nosniff
```

## File Naming

All assets include content hash:
```
main-a1b2c3d4.js
vendor-e5f6g7h8.css
logo-i9j0k1l2.png
```

**Why?** New content = new hash = automatic cache invalidation

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bandwidth | 2-3 MB | 200-300 KB | 85-90% ↓ |
| Page Load | 3-4s | 1-2s | 50% ↓ |
| Lighthouse | 75 | 90+ | +15 points |

## Troubleshooting

### Assets not caching?
1. Check HTTP headers in DevTools
2. Verify service worker registered
3. Hard refresh (Ctrl+Shift+R)

### Old assets loading?
1. Check if new build has different hash
2. Verify HTML not cached
3. Update service worker

### Cache too large?
- Auto-purge enabled
- Max 60 assets, 100 images
- No action needed

## Related Files

- `vercel.json` - HTTP cache headers
- `frontend/public/service-worker.js` - Service worker cache
- `frontend/vite.config.js` - Build configuration
- `docs/STATIC_ASSET_CACHING.md` - Full documentation
