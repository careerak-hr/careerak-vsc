# Vercel Caching Configuration Guide

## Overview

This document describes the caching strategy implemented in `vercel.json` for the Careerak platform. The configuration optimizes performance by caching static assets for 30 days while ensuring dynamic content remains fresh.

## Caching Strategy

### Static Assets (30 Days)

**Cache Duration**: `max-age=2592000` (30 days)  
**Directive**: `immutable` (content never changes)

#### JavaScript & CSS Files
```
Pattern: /(.*\.(js|css))
Cache-Control: public, max-age=2592000, immutable
```

- All `.js` and `.css` files cached for 30 days
- `immutable` flag tells browsers the file will never change
- Versioned filenames (e.g., `main.abc123.js`) ensure cache busting

#### Images
```
Pattern: /(.*\.(jpg|jpeg|png|gif|ico|svg|webp))
Cache-Control: public, max-age=2592000, immutable
```

- All image formats cached for 30 days
- Includes WebP for modern browsers
- Cloudinary transformations provide optimized versions

#### Assets Directory
```
Pattern: /assets/(.*)
Cache-Control: public, max-age=2592000, immutable
```

- All files in `/assets/` directory cached for 30 days
- Includes bundled resources from build process

### Fonts (1 Year)

**Cache Duration**: `max-age=31536000` (365 days)

```
Pattern: /(.*\.(woff|woff2|ttf|otf|eot))
Cache-Control: public, max-age=31536000, immutable
```

- Font files rarely change
- Longer cache duration improves performance
- Supports all major font formats

### PWA Files

#### Manifest (1 Day)
```
Pattern: /manifest.json
Cache-Control: public, max-age=86400
```

- PWA manifest cached for 24 hours
- Allows updates to app metadata without long delays

#### Service Worker (No Cache)
```
Pattern: /service-worker.js
Cache-Control: public, max-age=0, must-revalidate
```

- Service worker never cached
- Ensures users get latest offline functionality
- Critical for PWA updates

#### Offline Page (1 Day)
```
Pattern: /offline.html
Cache-Control: public, max-age=86400
```

- Offline fallback page cached for 24 hours
- Balances freshness with offline availability

### HTML Files (No Cache)

```
Pattern: /(.*\.html)
Cache-Control: public, max-age=0, must-revalidate
```

- HTML files always revalidated
- Ensures users see latest content
- SPA routing handled by index.html

#### Index.html (No Cache + Security)
```
Pattern: /index.html
Cache-Control: public, max-age=0, must-revalidate
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

- Main entry point never cached
- Additional security headers
- Prevents clickjacking attacks

### API Routes (No Cache)

```
Pattern: /api/(.*)
Cache-Control: no-store, no-cache, must-revalidate
```

- API responses never cached
- Ensures fresh data on every request
- Backend handles its own caching strategy

## Security Headers

All responses include:

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

- Prevents MIME type sniffing
- Browsers respect declared content types
- Reduces XSS attack surface

### X-Frame-Options (HTML only)
```
X-Frame-Options: DENY
```

- Prevents page from being embedded in iframes
- Protects against clickjacking attacks
- Applied to all HTML files

### X-XSS-Protection (index.html only)
```
X-XSS-Protection: 1; mode=block
```

- Enables browser XSS filter
- Blocks page if XSS detected
- Legacy protection for older browsers

## Additional Vercel Configuration

### Clean URLs
```json
"cleanUrls": true
```

- Removes `.html` extension from URLs
- `/about.html` → `/about`
- Improves SEO and user experience

### Trailing Slash
```json
"trailingSlash": false
```

- Removes trailing slashes from URLs
- `/about/` → `/about`
- Prevents duplicate content issues

### GitHub Integration
```json
"github": {
  "silent": true
}
```

- Suppresses GitHub deployment comments
- Reduces notification noise
- Deployments still tracked in Vercel dashboard

## Cache Busting Strategy

### Build-Time Hashing

Vite automatically generates hashed filenames:
```
main.js → main.abc123.js
styles.css → styles.def456.css
```

- Hash changes when file content changes
- Old cached versions automatically invalidated
- No manual cache clearing needed

### Service Worker Updates

Service worker handles its own cache versioning:
```javascript
const CACHE_VERSION = 'v1.0.0';
```

- Increment version to invalidate all caches
- Service worker detects updates automatically
- Users notified to reload for new version

## Performance Impact

### Expected Improvements

- **Bandwidth Reduction**: 40-60% for returning visitors
- **Load Time**: 50-70% faster for cached assets
- **Server Load**: Reduced by 60-80% for static files
- **CDN Efficiency**: Better edge caching performance

### Lighthouse Scores

Target metrics with caching enabled:
- Performance: 90+
- Best Practices: 95+
- SEO: 95+

## Testing Caching

### Browser DevTools

1. Open DevTools → Network tab
2. Reload page (Cmd/Ctrl + R)
3. Check "Size" column for cached resources
4. Look for "(disk cache)" or "(memory cache)"

### Cache Headers

```bash
# Check cache headers
curl -I https://careerak.com/assets/main.js

# Expected response:
Cache-Control: public, max-age=2592000, immutable
X-Content-Type-Options: nosniff
```

### Hard Refresh

Test cache invalidation:
1. Normal reload: Cmd/Ctrl + R (uses cache)
2. Hard reload: Cmd/Ctrl + Shift + R (bypasses cache)
3. Empty cache: DevTools → Clear storage

## Troubleshooting

### Assets Not Caching

**Problem**: Static assets showing `max-age=0`

**Solutions**:
1. Check file path matches pattern in `vercel.json`
2. Verify deployment includes updated config
3. Clear browser cache and test again
4. Check Vercel deployment logs

### Stale Content

**Problem**: Users seeing old version after deployment

**Solutions**:
1. Verify build generates new hashed filenames
2. Check service worker version updated
3. Force service worker update notification
4. Users can hard refresh (Cmd/Ctrl + Shift + R)

### Cache Too Aggressive

**Problem**: Need to update cached files immediately

**Solutions**:
1. Change filename or hash (automatic with Vite)
2. Update service worker version
3. Reduce `max-age` for specific file types
4. Use query parameters for cache busting

## Best Practices

### ✅ Do

- Use versioned filenames for all static assets
- Set long cache durations for immutable files
- Always revalidate HTML and API responses
- Include security headers on all responses
- Test caching behavior after deployments

### ❌ Don't

- Cache HTML files (prevents updates)
- Cache service worker (breaks PWA updates)
- Use short cache durations for static assets
- Forget to version filenames when content changes
- Cache API responses (use backend caching instead)

## Monitoring

### Vercel Analytics

Track caching effectiveness:
- Cache hit rate
- Bandwidth savings
- Edge response times
- Geographic distribution

### Lighthouse CI

Automated performance monitoring:
```bash
npm run lighthouse-ci
```

Tracks:
- Performance score
- Cache policy compliance
- Resource optimization

## Future Enhancements

### Phase 2
- Implement stale-while-revalidate for API
- Add Vary headers for content negotiation
- Configure CDN edge caching rules
- Implement cache warming strategies

### Phase 3
- A/B test different cache durations
- Implement predictive prefetching
- Add cache analytics dashboard
- Optimize cache by user behavior

## References

- [Vercel Caching Documentation](https://vercel.com/docs/concepts/edge-network/caching)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)
- [Cache-Control Header Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Careerak Performance Requirements](../.kiro/specs/general-platform-enhancements/requirements.md)

## Related Documentation

- `docs/CLOUDINARY_TRANSFORMATIONS.md` - Image optimization
- `.kiro/specs/general-platform-enhancements/design.md` - Performance design
- `vercel.json` - Configuration file

---

**Last Updated**: 2026-02-19  
**Status**: ✅ Implemented and Active  
**Requirements**: FR-PERF-6, NFR-PERF-6
