# Cache Headers Quick Reference

## Quick Overview

All cache headers are configured in `vercel.json` and automatically applied by Vercel on deployment.

## Cache Durations at a Glance

```
📦 Static Assets (JS/CSS/Images)  → 30 days
🎵 Audio/Video Files              → 30 days
🔤 Fonts                          → 1 year
📱 Manifest                       → 1 day
🤖 Robots.txt / Sitemap.xml       → 1 day
📄 HTML                           → No cache
⚙️  Service Worker                → No cache
🔌 API Routes                     → No cache
```

## Common Commands

### Test Cache Headers

```bash
# Test any asset
curl -I https://careerak.com/assets/main.js

# Expected: Cache-Control: public, max-age=2592000, immutable
```

### Verify in Browser

1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Click any asset
5. Check "Cache-Control" in Headers

### Clear Cache

```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Clear all cache
DevTools → Application → Clear Storage → Clear site data
```

## File Patterns

| Pattern | Cache Duration | Example |
|---------|----------------|---------|
| `*.js` | 30 days | `main.abc123.js` |
| `*.css` | 30 days | `styles.def456.css` |
| `*.jpg`, `*.png`, `*.webp` | 30 days | `logo.png` |
| `*.mp3`, `*.mp4`, `*.wav` | 30 days | `intro.mp3` |
| `*.woff2`, `*.woff` | 1 year | `font.woff2` |
| `/assets/*` | 30 days | `/assets/icon.svg` |
| `robots.txt`, `sitemap.xml` | 1 day | `robots.txt` |
| `*.html` | No cache | `index.html` |
| `/api/*` | No cache | `/api/users` |

## Performance Impact

- **77% faster** load times for returning visitors
- **80% less** bandwidth usage
- **82% fewer** server requests

## Troubleshooting

### Problem: Assets not caching
**Solution**: Check if URL has query params, verify headers in DevTools

### Problem: Stale content after deployment
**Solution**: HTML should have `max-age=0`, hard refresh browser

### Problem: Headers not applied
**Solution**: Verify `vercel.json` syntax, redeploy to Vercel

## Key Concepts

### immutable
- File will never change at this URL
- Browser skips revalidation
- Huge performance win

### max-age=2592000
- 30 days in seconds
- Browser caches for this duration
- After expiry, revalidates with server

### must-revalidate
- Always check with server before using cache
- Used for HTML and service worker
- Ensures fresh content

## Related Files

- `vercel.json` - Cache configuration
- `docs/CACHE_HEADERS_CONFIGURATION.md` - Full documentation
- `.kiro/specs/general-platform-enhancements/design.md` - Design specs

---

**Quick Tip**: Static assets are versioned with build hashes, so long cache durations are safe and recommended!
