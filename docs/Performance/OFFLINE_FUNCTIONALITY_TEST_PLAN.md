# Offline Functionality Test Plan
**Task**: 9.6.2 Test offline functionality  
**Date**: 2026-02-22  
**Requirements**: FR-PWA-2, FR-PWA-3, FR-PWA-9, NFR-REL-2, NFR-REL-3

## Test Overview
This document provides a comprehensive manual testing plan for PWA offline functionality, including service worker caching, offline page fallback, and request queueing.

---

## Prerequisites

### 1. Build the Application
```bash
cd frontend
npm run build
npm run preview  # Or serve the build folder
```

### 2. Required Tools
- Chrome DevTools (Application tab)
- Network throttling capability
- Multiple browser tabs

### 3. Test Environment
- **Browser**: Chrome 90+ (recommended)
- **Connection**: Start online, then go offline
- **Service Worker**: Must be registered

---

## Test Suite 1: Service Worker Registration

### Test 1.1: Verify Service Worker Registration
**Objective**: Confirm service worker registers successfully

**Steps**:
1. Open application in browser
2. Open DevTools → Application tab → Service Workers
3. Verify service worker is registered and activated

**Expected Results**:
- ✅ Service worker shows status "activated and is running"
- ✅ Scope is "/" 
- ✅ Source is "/service-worker.js"

**Pass/Fail**: ⬜

---

### Test 1.2: Verify Critical Assets Precached
**Objective**: Confirm critical assets are cached during install

**Steps**:
1. Open DevTools → Application tab → Cache Storage
2. Look for "critical-assets-v1" cache
3. Expand and verify contents

**Expected Results**:
- ✅ Cache "critical-assets-v1" exists
- ✅ Contains: /, /index.html, /manifest.json, /logo.png, /offline.html
- ✅ All assets load successfully

**Pass/Fail**: ⬜

---

### Test 1.3: Verify Workbox Precache
**Objective**: Confirm build assets are precached

**Steps**:
1. Open DevTools → Application tab → Cache Storage
2. Look for "workbox-precache-v2-..." cache
3. Verify main.js, main.css, and other build assets

**Expected Results**:
- ✅ Workbox precache exists
- ✅ Contains main JavaScript bundle
- ✅ Contains main CSS bundle
- ✅ Contains other build outputs

**Pass/Fail**: ⬜

---

## Test Suite 2: Offline Page Serving

### Test 2.1: Serve Cached Pages When Offline
**Objective**: Verify previously visited pages load offline (FR-PWA-2)

**Steps**:
1. Visit homepage (/) while online
2. Visit /jobs page while online
3. Visit /courses page while online
4. Open DevTools → Network tab
5. Check "Offline" checkbox
6. Navigate to / (homepage)
7. Navigate to /jobs
8. Navigate to /courses

**Expected Results**:
- ✅ Homepage loads from cache
- ✅ Jobs page loads from cache
- ✅ Courses page loads from cache
- ✅ No network errors in console
- ✅ Pages are fully functional

**Pass/Fail**: ⬜

---

### Test 2.2: Show Offline Fallback for Uncached Pages
**Objective**: Display offline.html for unvisited pages (FR-PWA-3)

**Steps**:
1. Clear all caches (DevTools → Application → Clear storage)
2. Reload to register service worker
3. Visit homepage only (don't visit other pages)
4. Go offline (Network tab → Offline)
5. Try to navigate to /settings (unvisited page)

**Expected Results**:
- ✅ offline.html page is displayed
- ✅ Shows "غير متصل بالإنترنت" (or language equivalent)
- ✅ Shows retry button
- ✅ Shows connection status
- ✅ Page is styled correctly

**Pass/Fail**: ⬜

---

### Test 2.3: Offline Page Multi-Language Support
**Objective**: Verify offline page respects language preference

**Steps**:
1. Set language to Arabic in app
2. Go offline
3. Navigate to uncached page
4. Note the language
5. Go online, change language to English
6. Go offline again
7. Navigate to uncached page

**Expected Results**:
- ✅ Arabic: Shows "غير متصل بالإنترنت"
- ✅ English: Shows "You are offline"
- ✅ French: Shows "Vous êtes hors ligne"
- ✅ Correct RTL/LTR direction
- ✅ Retry button text matches language

**Pass/Fail**: ⬜

---

## Test Suite 3: Cache Strategies

### Test 3.1: Static Assets - CacheFirst Strategy
**Objective**: Verify static assets use CacheFirst (FR-PWA-8)

**Steps**:
1. Visit homepage while online
2. Open DevTools → Network tab
3. Note the JS/CSS files loaded
4. Refresh page
5. Check if files come from service worker

**Expected Results**:
- ✅ First load: Files from network
- ✅ Second load: Files from service worker (cache)
- ✅ Network tab shows "(from ServiceWorker)"
- ✅ No network requests for cached assets

**Pass/Fail**: ⬜

---

### Test 3.2: Images - CacheFirst Strategy
**Objective**: Verify images are cached with 50MB limit

**Steps**:
1. Visit pages with images (profile, jobs, courses)
2. Open DevTools → Application → Cache Storage
3. Check "images" cache
4. Go offline
5. Revisit pages with images

**Expected Results**:
- ✅ Images cache exists
- ✅ Images load from cache when offline
- ✅ Cache respects size limits
- ✅ Old images purged when quota exceeded

**Pass/Fail**: ⬜

---

### Test 3.3: API Calls - NetworkFirst Strategy
**Objective**: Verify API uses NetworkFirst with 5-min timeout

**Steps**:
1. Visit /jobs page (triggers API call)
2. Open DevTools → Network tab
3. Check API requests
4. Go offline
5. Revisit /jobs page

**Expected Results**:
- ✅ Online: API calls go to network first
- ✅ Offline: API calls served from cache
- ✅ Cache timeout is 5 minutes
- ✅ Stale data shown when offline

**Pass/Fail**: ⬜

---

## Test Suite 4: Offline Detection

### Test 4.1: Offline Indicator in UI
**Objective**: Verify app shows offline status (FR-PWA-4)

**Steps**:
1. Open application while online
2. Go offline (Network tab → Offline)
3. Check for offline indicator in UI

**Expected Results**:
- ✅ Offline indicator appears
- ✅ Indicator is visible and clear
- ✅ Indicator disappears when back online
- ✅ User is notified of offline state

**Pass/Fail**: ⬜

---

### Test 4.2: Automatic Online Detection
**Objective**: Verify app detects when back online

**Steps**:
1. Go offline
2. Wait for offline indicator
3. Go back online
4. Observe behavior

**Expected Results**:
- ✅ App detects online status automatically
- ✅ Offline indicator disappears
- ✅ Queued requests are retried
- ✅ Fresh data is fetched

**Pass/Fail**: ⬜

---

## Test Suite 5: Request Queueing

### Test 5.1: Queue Failed Requests When Offline
**Objective**: Verify failed requests are queued (FR-PWA-9)

**Steps**:
1. Go offline
2. Try to submit a form (e.g., job application)
3. Check DevTools → Application → Cache Storage
4. Look for "failed-requests" cache

**Expected Results**:
- ✅ Request is queued
- ✅ User is notified request will be sent later
- ✅ Request stored in cache
- ✅ No error thrown to user

**Pass/Fail**: ⬜

---

### Test 5.2: Retry Queued Requests When Online
**Objective**: Verify queued requests retry when online (FR-PWA-9)

**Steps**:
1. Queue a request while offline (from Test 5.1)
2. Go back online
3. Wait for background sync
4. Check if request was sent

**Expected Results**:
- ✅ Request is automatically retried
- ✅ Request succeeds
- ✅ Request removed from queue
- ✅ User is notified of success

**Pass/Fail**: ⬜

---

## Test Suite 6: Service Worker Updates

### Test 6.1: Update Notification
**Objective**: Verify update notification shown (FR-PWA-6)

**Steps**:
1. Register service worker
2. Modify service-worker.js
3. Rebuild application
4. Reload page
5. Check for update notification

**Expected Results**:
- ✅ Update notification appears
- ✅ Offers to reload for new version
- ✅ Clicking reload updates app
- ✅ New service worker activates

**Pass/Fail**: ⬜

---

### Test 6.2: Skip Waiting on Update
**Objective**: Verify new service worker can skip waiting

**Steps**:
1. Have old service worker active
2. Deploy new service worker
3. Trigger skip waiting
4. Verify new worker activates

**Expected Results**:
- ✅ New worker activates immediately
- ✅ Old worker is replaced
- ✅ No page reload required
- ✅ Caches are updated

**Pass/Fail**: ⬜

---

## Test Suite 7: Offline Functionality Edge Cases

### Test 7.1: Slow Network (3G)
**Objective**: Verify app works on slow connections

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate through app
4. Check load times

**Expected Results**:
- ✅ Cached assets load quickly
- ✅ Skeleton loaders shown
- ✅ No timeout errors
- ✅ Acceptable user experience

**Pass/Fail**: ⬜

---

### Test 7.2: Intermittent Connection
**Objective**: Verify app handles connection drops

**Steps**:
1. Start online
2. Toggle offline/online repeatedly
3. Try to use app features
4. Check for errors

**Expected Results**:
- ✅ App handles connection changes gracefully
- ✅ No crashes or errors
- ✅ Requests retry automatically
- ✅ User is kept informed

**Pass/Fail**: ⬜

---

### Test 7.3: Cache Expiration
**Objective**: Verify expired cache is refreshed

**Steps**:
1. Visit page and cache it
2. Wait for cache expiration (or manually expire)
3. Go online
4. Revisit page

**Expected Results**:
- ✅ Expired cache is refreshed
- ✅ Fresh data is fetched
- ✅ Old cache is replaced
- ✅ No stale data shown

**Pass/Fail**: ⬜

---

### Test 7.4: Cache Storage Quota
**Objective**: Verify app handles quota exceeded

**Steps**:
1. Fill cache with many images
2. Exceed 50MB limit
3. Check if old images are purged
4. Verify app still works

**Expected Results**:
- ✅ Old images are automatically purged
- ✅ New images are cached
- ✅ No errors thrown
- ✅ App remains functional

**Pass/Fail**: ⬜

---

## Test Suite 8: Cross-Browser Testing

### Test 8.1: Chrome
**Browser**: Chrome 90+

**Steps**: Run all tests above

**Expected Results**: All tests pass

**Pass/Fail**: ⬜

---

### Test 8.2: Firefox
**Browser**: Firefox 88+

**Steps**: Run all tests above

**Expected Results**: All tests pass

**Pass/Fail**: ⬜

---

### Test 8.3: Safari
**Browser**: Safari 14+ (iOS)

**Steps**: Run all tests above

**Expected Results**: All tests pass (with iOS limitations)

**Pass/Fail**: ⬜

---

### Test 8.4: Edge
**Browser**: Edge 90+

**Steps**: Run all tests above

**Expected Results**: All tests pass

**Pass/Fail**: ⬜

---

## Test Suite 9: Mobile Testing

### Test 9.1: Mobile Chrome (Android)
**Device**: Android phone

**Steps**:
1. Install PWA
2. Go offline (airplane mode)
3. Open PWA
4. Test offline functionality

**Expected Results**:
- ✅ PWA opens offline
- ✅ Cached pages load
- ✅ Offline page shown for uncached
- ✅ Requests queued

**Pass/Fail**: ⬜

---

### Test 9.2: Mobile Safari (iOS)
**Device**: iPhone

**Steps**:
1. Add to Home Screen
2. Go offline (airplane mode)
3. Open PWA
4. Test offline functionality

**Expected Results**:
- ✅ PWA opens offline
- ✅ Cached pages load
- ✅ Offline page shown for uncached
- ✅ Works in standalone mode

**Pass/Fail**: ⬜

---

## Test Suite 10: Performance Testing

### Test 10.1: Cache Hit Rate
**Objective**: Measure cache effectiveness

**Steps**:
1. Visit 10 pages while online
2. Go offline
3. Revisit same 10 pages
4. Count cache hits

**Expected Results**:
- ✅ Cache hit rate > 90%
- ✅ Most assets from cache
- ✅ Fast load times
- ✅ Minimal network requests

**Pass/Fail**: ⬜

---

### Test 10.2: Offline Load Time
**Objective**: Measure offline performance

**Steps**:
1. Cache homepage
2. Go offline
3. Measure load time
4. Compare to online load time

**Expected Results**:
- ✅ Offline load time < 1 second
- ✅ Faster than online (no network)
- ✅ No layout shifts
- ✅ Smooth experience

**Pass/Fail**: ⬜

---

## Summary

### Test Results Overview
- **Total Tests**: 30
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___

### Critical Issues Found
1. _____________________
2. _____________________
3. _____________________

### Non-Critical Issues Found
1. _____________________
2. _____________________
3. _____________________

### Recommendations
1. _____________________
2. _____________________
3. _____________________

---

## Acceptance Criteria Verification

### FR-PWA-2: Serve cached pages offline
- ⬜ Previously visited pages load offline
- ⬜ Pages are fully functional
- ⬜ No network errors

### FR-PWA-3: Show offline fallback
- ⬜ Offline page displayed for uncached routes
- ⬜ Multi-language support
- ⬜ Retry functionality works

### FR-PWA-9: Queue failed requests
- ⬜ Requests queued when offline
- ⬜ Requests retry when online
- ⬜ User is notified

### NFR-REL-2: Maintain offline functionality
- ⬜ Previously visited pages work offline
- ⬜ Critical features available
- ⬜ Graceful degradation

### NFR-REL-3: Queue and retry requests
- ⬜ Failed requests queued
- ⬜ Automatic retry when online
- ⬜ No data loss

---

## Test Execution Log

### Tester Information
- **Name**: _____________________
- **Date**: _____________________
- **Environment**: _____________________
- **Browser**: _____________________
- **Version**: _____________________

### Notes
_____________________
_____________________
_____________________

---

## Appendix: Quick Test Commands

### Clear All Caches
```javascript
// Run in DevTools Console
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('All caches cleared');
});
```

### Check Service Worker Status
```javascript
// Run in DevTools Console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Active:', reg.active);
  console.log('Waiting:', reg.waiting);
  console.log('Installing:', reg.installing);
});
```

### List All Caches
```javascript
// Run in DevTools Console
caches.keys().then(keys => {
  console.log('Caches:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key}:`, requests.length, 'items');
      });
    });
  });
});
```

### Simulate Offline
```javascript
// Run in DevTools Console
// Note: This doesn't actually go offline, use Network tab instead
console.log('Online:', navigator.onLine);
```

### Force Service Worker Update
```javascript
// Run in DevTools Console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update().then(() => console.log('Update triggered'));
});
```

---

**End of Test Plan**
