# Cache Testing Checklist

Quick reference for testing cache configuration with browser DevTools.

## 🚀 Quick Start (5 minutes)

### 1. Open DevTools
- Press `F12` in Chrome/Edge/Firefox
- Go to **Network** tab

### 2. Test Cold Cache
- ✅ Check "Disable cache"
- ✅ Reload page (`Ctrl+R`)
- ✅ Verify all resources download (200 OK)
- ✅ Note total size and time

### 3. Test Warm Cache
- ✅ Uncheck "Disable cache"
- ✅ Reload page (`Ctrl+R`)
- ✅ Verify resources show "(disk cache)" or "(memory cache)"
- ✅ Load time should be < 1 second

### 4. Verify Headers
- ✅ Click any JS/CSS/image file
- ✅ Check Response Headers:
  - `Cache-Control: public, max-age=2592000, immutable`
- ✅ Click index.html
- ✅ Check Response Headers:
  - `Cache-Control: public, max-age=0, must-revalidate`

---

## 📋 Detailed Checklist

### Static Assets (JS, CSS, Images)
- [ ] Cache-Control: `public, max-age=2592000, immutable`
- [ ] Second load shows "(disk cache)" or "(memory cache)"
- [ ] Load time < 10ms on cached load
- [ ] Status: 200 OK (from cache)
- [ ] X-Content-Type-Options: nosniff

### Fonts
- [ ] Cache-Control: `public, max-age=31536000, immutable`
- [ ] Cached for 1 year (max-age=31536000)
- [ ] Second load from cache
- [ ] X-Content-Type-Options: nosniff

### HTML Files
- [ ] Cache-Control: `public, max-age=0, must-revalidate`
- [ ] Always revalidated with server
- [ ] May return 304 Not Modified if unchanged
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

### API Endpoints
- [ ] Cache-Control: `no-store, no-cache, must-revalidate`
- [ ] Never cached
- [ ] Always fetched from server
- [ ] X-Content-Type-Options: nosniff

### Special Files
- [ ] Manifest.json: `max-age=86400` (1 day)
- [ ] Service Worker: `max-age=0, must-revalidate`
- [ ] Offline.html: `max-age=86400` (1 day)

---

## 🎯 Performance Targets

### First Load (Cold Cache)
- [ ] Total size: 2-3 MB
- [ ] Load time: 2-4 seconds (3G)
- [ ] Requests: 30-50
- [ ] All resources: 200 OK

### Second Load (Warm Cache)
- [ ] Total size: 50-100 KB (HTML + API only)
- [ ] Load time: < 1 second
- [ ] Cached requests: 25-45 (80%+)
- [ ] Network requests: 5-10 (20%-)

### Cache Hit Rate
- [ ] Target: > 80%
- [ ] Formula: (Cached / Total) × 100
- [ ] Measure after 2nd load

---

## 🔍 Testing Scenarios

### Scenario 1: First-Time User
1. [ ] Clear browser cache (`Ctrl+Shift+Delete`)
2. [ ] Load application
3. [ ] All resources download from network
4. [ ] Record total size and time
5. [ ] Verify cache headers on all resources

### Scenario 2: Returning User
1. [ ] Load application (cache warm)
2. [ ] Most resources from cache
3. [ ] Only HTML and API hit network
4. [ ] Load time < 1 second
5. [ ] Cache hit rate > 80%

### Scenario 3: After Deployment
1. [ ] Deploy new version
2. [ ] Load application
3. [ ] New assets download (different hashes)
4. [ ] Old assets ignored
5. [ ] New assets cache properly

### Scenario 4: Hard Reload
1. [ ] Press `Ctrl+Shift+R`
2. [ ] All resources reload from server
3. [ ] No resources from cache
4. [ ] Verify new cache after reload

---

## 🛠️ Tools & Commands

### Chrome DevTools
```
F12                  - Open DevTools
Ctrl+R               - Normal reload
Ctrl+Shift+R         - Hard reload (bypass cache)
Ctrl+Shift+Delete    - Clear cache
```

### Network Tab Settings
- [ ] Enable "Preserve log"
- [ ] Disable "Disable cache" (for warm cache test)
- [ ] Set throttling to "No throttling"

### Application Tab
- [ ] Check Cache Storage
- [ ] Verify cached resources
- [ ] Check storage usage (< 50MB)

### Command Line (curl)
```bash
# Test static asset
curl -I https://your-domain.com/assets/js/main-abc123.js

# Test HTML
curl -I https://your-domain.com/index.html

# Test API
curl -I https://your-domain.com/api/users
```

---

## ⚠️ Common Issues

### Issue: Resources Not Caching
- [ ] Verify "Disable cache" is unchecked
- [ ] Check Response Headers for Cache-Control
- [ ] Verify Vercel deployment
- [ ] Clear cache and test again

### Issue: Stale Content After Update
- [ ] Verify hash-based filenames
- [ ] Check index.html has max-age=0
- [ ] Hard reload (`Ctrl+Shift+R`)
- [ ] Clear cache

### Issue: Service Worker Not Updating
- [ ] Check SW cache headers (max-age=0)
- [ ] Unregister SW in Application tab
- [ ] Close all tabs and reopen
- [ ] Verify update detection

---

## 📊 Expected Results

### Cache Headers by Resource Type
```
Resource              Cache-Control
─────────────────────────────────────────────────────
/assets/*             public, max-age=2592000, immutable
*.js, *.css           public, max-age=2592000, immutable
*.jpg, *.png, *.svg   public, max-age=2592000, immutable
*.woff, *.woff2       public, max-age=31536000, immutable
*.html                public, max-age=0, must-revalidate
/api/*                no-store, no-cache, must-revalidate
/manifest.json        public, max-age=86400
/service-worker.js    public, max-age=0, must-revalidate
```

### Cache Duration
```
30 days    = 2,592,000 seconds
1 year     = 31,536,000 seconds
1 day      = 86,400 seconds
0 seconds  = Always revalidate
```

---

## ✅ Sign-Off

### Tester Information
- **Name**: _______________
- **Date**: _______________
- **Browser**: _______________
- **Environment**: _______________

### Test Results
- [ ] All static assets cached correctly (30 days)
- [ ] Fonts cached correctly (1 year)
- [ ] HTML revalidates on every load
- [ ] API never cached
- [ ] Cache hit rate > 80%
- [ ] Load time < 1 second (warm cache)
- [ ] No console errors
- [ ] All headers present and correct

### Notes
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 📚 References

- Full Guide: `docs/CACHE_TESTING_GUIDE.md`
- Vercel Config: `vercel.json`
- Vite Config: `frontend/vite.config.js`

---

**Status**: ✅ Ready for Testing  
**Last Updated**: 2026-02-19
