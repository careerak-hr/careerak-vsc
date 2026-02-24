# Workbox Quick Start Guide

## Overview
Quick reference for working with Workbox in the Careerak PWA.

**Status**: ✅ Configured and Ready  
**Task**: 10.2.2 Configure Workbox for service worker

## Quick Commands

### Verify Configuration
```bash
npm run verify:workbox
```

### Build with Service Worker
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## What's Configured

### ✅ Workbox Dependencies
- `workbox-build@^7.4.0` - Build-time service worker generation
- `workbox-window@^7.4.0` - Runtime service worker registration

### ✅ Cache Strategies

| Resource Type | Strategy | Expiration | Max Entries |
|--------------|----------|------------|-------------|
| Static Assets (JS, CSS, fonts) | CacheFirst | 30 days | 60 |
| Images | CacheFirst | 30 days | 100 (~50MB) |
| API Calls | NetworkFirst | 5 minutes | 50 |
| Navigation | NetworkFirst | 24 hours | 50 |

### ✅ Precaching
Critical assets are precached during service worker installation:
- `/` (index.html)
- `/manifest.json`
- `/logo.png`
- `/offline.html`
- All build assets (JS, CSS, fonts, images)

### ✅ Offline Support
- Custom offline fallback page (`/offline.html`)
- Multi-language support (ar, en, fr)
- Automatic retry when back online

### ✅ Push Notifications
- Integration with Pusher system
- 8 notification types with custom actions
- Notification click handling

### ✅ Background Sync
- Queue failed requests when offline
- Automatic retry when back online

## Testing

### 1. Verify Configuration
```bash
npm run verify:workbox
```

**Expected output:**
```
✓ Workbox is properly configured!
Checks passed: 11/11
```

### 2. Build and Test
```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

### 3. Test Offline Mode
1. Open http://localhost:3000 in browser
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page
5. Should see offline.html fallback

### 4. Inspect Caches
Open DevTools → Application → Cache Storage

**Expected caches:**
- `workbox-precache-v2-...` - Precached assets
- `static-assets` - JS, CSS, fonts
- `images` - Images
- `api-cache` - API responses
- `pages` - Navigation
- `critical-assets-v1` - Critical files
- `offline-fallback` - Offline page

### 5. Test Service Worker Update
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  reg.update(); // Force update check
});
```

## Common Tasks

### Clear All Caches
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('All caches cleared');
});
```

### Unregister Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Service worker unregistered');
});
```

### Check Precached Files
```javascript
// In browser console
caches.keys().then(names => {
  const precacheName = names.find(n => n.includes('workbox-precache'));
  if (precacheName) {
    caches.open(precacheName).then(cache => {
      cache.keys().then(keys => {
        console.log(`Precached files: ${keys.length}`);
        keys.forEach(key => console.log(key.url));
      });
    });
  }
});
```

### Monitor Cache Size
```javascript
// In browser console
navigator.storage.estimate().then(estimate => {
  const used = (estimate.usage / 1024 / 1024).toFixed(2);
  const quota = (estimate.quota / 1024 / 1024).toFixed(2);
  console.log(`Storage: ${used} MB / ${quota} MB`);
  console.log(`Usage: ${(estimate.usage / estimate.quota * 100).toFixed(2)}%`);
});
```

## Troubleshooting

### Issue: Service worker not registering
**Check:**
1. HTTPS or localhost (required for service workers)
2. Browser console for errors
3. DevTools → Application → Service Workers

**Solution:**
```javascript
// Check registration status
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('Registered:', reg);
  } else {
    console.log('Not registered');
  }
});
```

### Issue: Changes not appearing
**Cause:** Service worker is caching old version

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear cache and unregister service worker (see above)
3. Or check "Update on reload" in DevTools → Application → Service Workers

### Issue: Build fails with Workbox error
**Check:**
1. `public/service-worker.js` exists
2. No syntax errors in service worker
3. Build output directory is `build/`

**Solution:**
```bash
# Verify configuration
npm run verify:workbox

# Check for errors
npm run build 2>&1 | grep -i workbox
```

### Issue: Offline page not showing
**Check:**
1. `/offline.html` is precached
2. Service worker is active
3. Actually offline (not just slow network)

**Solution:**
```javascript
// Check if offline page is cached
caches.open('offline-fallback').then(cache => {
  cache.match('/offline.html').then(response => {
    if (response) {
      console.log('Offline page cached');
    } else {
      console.log('Offline page NOT cached');
    }
  });
});
```

### Issue: Cache not updating
**Cause:** CacheFirst strategy serves stale content

**Solution:**
1. Service worker updates automatically every 24 hours
2. Or force update: `reg.update()`
3. Or implement "Update available" notification

## Build Output

### Successful Build
```
✓ 738 modules transformed.
✓ Generated service worker with 45 files (1.23 MB)
✓ Generated version.json: v1.3.0
```

### Build Warnings
```
⚠ Workbox warnings: [
  "File exceeds 2MB limit: assets/large-file.js"
]
```

**Action:** Exclude large files or increase `maximumFileSizeToCacheInBytes`

## Performance Impact

### First Visit
- Download service worker (~50KB)
- Download and cache critical assets (~1-2MB)
- Normal page load time

### Subsequent Visits
- ✅ Instant loading (cached assets)
- ✅ No network requests for static assets
- ✅ Improved TTI by ~40-60%

### Offline
- ✅ Previously visited pages load instantly
- ✅ Offline fallback for new pages
- ✅ Queued requests retry when online

## Next Steps

### After Configuration
1. ✅ Run `npm run verify:workbox` to confirm setup
2. ✅ Run `npm run build` to generate service worker
3. ✅ Test offline functionality
4. ✅ Test push notifications
5. ✅ Monitor cache usage

### Production Deployment
1. Deploy to HTTPS domain (required for service workers)
2. Test service worker registration
3. Test offline functionality
4. Monitor error rates
5. Set up update notifications

## Resources

- [Full Documentation](./WORKBOX_CONFIGURATION.md)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

## Support

### Questions?
1. Check [WORKBOX_CONFIGURATION.md](./WORKBOX_CONFIGURATION.md) for detailed docs
2. Check browser console for errors
3. Check DevTools → Application → Service Workers
4. Run `npm run verify:workbox` to diagnose issues

---

**Last Updated**: 2026-02-22  
**Status**: ✅ Ready for Production
