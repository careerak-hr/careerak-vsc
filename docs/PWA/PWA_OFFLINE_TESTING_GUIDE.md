# PWA Offline Functionality - Manual Testing Guide

**Feature**: General Platform Enhancements - PWA Support  
**Task**: 3.6.7 Test offline functionality manually  
**Date**: 2026-02-19  
**Status**: ✅ Ready for Testing

---

## 📋 Overview

This guide provides comprehensive manual testing procedures for the PWA offline functionality implemented in Careerak. The testing covers all requirements from FR-PWA-1 through FR-PWA-10 and NFR-REL-2 through NFR-REL-4.

---

## 🎯 Testing Objectives

Verify that:
1. Service worker registers successfully
2. Previously visited pages work offline
3. Custom offline fallback page displays correctly
4. Failed API requests are queued and retried
5. Offline indicator shows appropriate status
6. Update notifications work correctly
7. Cache strategies are applied correctly
8. PWA is installable on mobile devices

---

## 🛠️ Prerequisites

### Required Tools
- ✅ Modern browser (Chrome, Firefox, Safari, or Edge - latest 2 versions)
- ✅ Browser DevTools (F12)
- ✅ Mobile device or browser device emulation
- ✅ Network throttling capability

### Setup Steps
1. Build the application: `npm run build`
2. Serve the production build: `npm run preview` or deploy to Vercel
3. Open browser DevTools (F12)
4. Navigate to Application/Storage tab

---

## 📝 Test Cases

### Test Case 1: Service Worker Registration
**Requirement**: FR-PWA-1  
**Priority**: Critical

**Steps**:
1. Open the application in a browser
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered and active

**Expected Results**:
- ✅ Service worker status shows "activated and is running"
- ✅ Service worker URL is `/service-worker.js`
- ✅ No errors in console

**Pass Criteria**: Service worker is active with no errors

---

### Test Case 2: Offline Page Caching
**Requirement**: FR-PWA-2, NFR-REL-2  
**Priority**: Critical

**Steps**:
1. Visit the homepage while online
2. Navigate to at least 3 different pages (e.g., Jobs, Courses, Profile)
3. Open DevTools → Application → Cache Storage
4. Verify cached resources
5. Go offline (DevTools → Network → Offline checkbox)
6. Navigate back to previously visited pages

**Expected Results**:
- ✅ Cache Storage shows multiple caches:
  - `critical-assets-v1`
  - `static-assets`
  - `pages`
  - `images`
  - `api-cache`
- ✅ Previously visited pages load successfully offline
- ✅ Page content displays correctly
- ✅ Images that were cached display correctly
- ✅ Offline indicator appears at top of page

**Pass Criteria**: All previously visited pages work offline

---

### Test Case 3: Offline Fallback Page
**Requirement**: FR-PWA-3  
**Priority**: High

**Steps**:
1. Clear browser cache (DevTools → Application → Clear storage)
2. Go offline (DevTools → Network → Offline)
3. Try to visit a page you haven't visited before
4. Observe the offline fallback page

**Expected Results**:
- ✅ Custom offline page (`/offline.html`) displays
- ✅ Page shows appropriate message in current language (ar/en/fr)
- ✅ "Retry" button is visible
- ✅ Connection status indicator shows "offline"
- ✅ Page styling matches Careerak design (colors, fonts)
- ✅ Logo displays (if cached)

**Pass Criteria**: Offline fallback page displays with correct styling and language

---

### Test Case 4: Offline Indicator
**Requirement**: Task 3.4.2  
**Priority**: High

**Steps**:
1. Start with online connection
2. Go offline (DevTools → Network → Offline)
3. Observe the offline indicator
4. Go back online
5. Observe the reconnection message

**Expected Results**:
- ✅ Offline banner appears at top when offline
- ✅ Banner shows "You are offline" message in current language
- ✅ Banner has appropriate icon (wifi-off)
- ✅ Banner styling matches design (red/warning color)
- ✅ When reconnected, "Connection restored" message appears
- ✅ Reconnection message auto-dismisses after 5 seconds
- ✅ User can manually dismiss reconnection message

**Pass Criteria**: Offline indicator shows correct status with smooth transitions

---

### Test Case 5: Request Queueing and Retry
**Requirement**: FR-PWA-9, NFR-REL-3  
**Priority**: Critical

**Steps**:
1. Log in to the application
2. Go offline (DevTools → Network → Offline)
3. Try to perform actions that require API calls:
   - Update profile information
   - Apply to a job
   - Post a comment
4. Observe console logs for queued requests
5. Go back online
6. Wait for automatic retry
7. Verify actions completed successfully

**Expected Results**:
- ✅ Actions fail gracefully when offline
- ✅ Console shows "[OfflineContext] Queueing request for retry"
- ✅ Offline queue status component shows queued requests count
- ✅ When back online, console shows "[OfflineContext] Processing X queued requests"
- ✅ Queued requests are automatically retried
- ✅ Success/failure results are displayed
- ✅ Queue count updates correctly
- ✅ Successfully completed requests are removed from queue

**Pass Criteria**: Failed requests are queued and automatically retried when online

---

### Test Case 6: Cache Strategies
**Requirement**: FR-PWA-7, FR-PWA-8, Task 3.2.1-3.2.3  
**Priority**: High

**Steps**:
1. Clear browser cache
2. Visit the application while online
3. Open DevTools → Network tab
4. Observe network requests and their sources
5. Reload the page
6. Check which resources come from cache vs network

**Expected Results**:
- ✅ Static assets (JS, CSS, fonts) use CacheFirst strategy
  - First load: from network
  - Subsequent loads: from cache (shows "from ServiceWorker")
- ✅ API calls use NetworkFirst strategy
  - Always try network first
  - Fall back to cache if offline
- ✅ Images use CacheFirst strategy
  - Cached after first load
- ✅ Navigation requests use NetworkFirst
- ✅ Cache expiration times are correct:
  - Static assets: 30 days
  - API cache: 5 minutes
  - Images: 30 days

**Pass Criteria**: Correct cache strategy applied for each resource type

---

### Test Case 7: Service Worker Updates
**Requirement**: FR-PWA-6, NFR-REL-4  
**Priority**: High

**Steps**:
1. Have the application running with service worker active
2. Make a small change to service worker code (e.g., add a comment)
3. Rebuild the application
4. Reload the page
5. Observe update notification

**Expected Results**:
- ✅ Update notification appears at bottom of screen
- ✅ Notification shows "New update available!" message
- ✅ "Reload" button is visible
- ✅ "Later" button is visible
- ✅ Clicking "Reload" refreshes the page with new service worker
- ✅ Clicking "Later" dismisses notification
- ✅ Notification has smooth slide-up animation
- ✅ Notification styling matches design

**Pass Criteria**: Update notification appears and functions correctly

---

### Test Case 8: PWA Installability
**Requirement**: FR-PWA-4, FR-PWA-5  
**Priority**: High

**Steps**:
1. Open application on mobile device or use Chrome DevTools device emulation
2. Look for install prompt or browser menu option
3. Install the PWA
4. Open the installed app
5. Test offline functionality in installed app

**Expected Results**:
- ✅ Install prompt appears on mobile (or install option in browser menu)
- ✅ Manifest.json is valid (check DevTools → Application → Manifest)
- ✅ All required manifest fields are present:
  - name: "Careerak - The Future of HR"
  - short_name: "Careerak"
  - icons: 192x192 and 512x512 (both regular and maskable)
  - start_url: "/"
  - display: "standalone"
  - theme_color: "#304B60"
  - background_color: "#E3DAD1"
- ✅ After installation, app opens in standalone mode
- ✅ Custom splash screen shows during launch
- ✅ App icon appears on home screen
- ✅ Offline functionality works in installed app

**Pass Criteria**: PWA is installable and works correctly in standalone mode

---

### Test Case 9: Critical Assets Precaching
**Requirement**: Task 3.2.4  
**Priority**: High

**Steps**:
1. Clear browser cache completely
2. Visit the application for the first time
3. Open DevTools → Application → Cache Storage
4. Check `critical-assets-v1` cache
5. Go offline immediately
6. Try to navigate the app

**Expected Results**:
- ✅ `critical-assets-v1` cache contains:
  - `/` (index.html)
  - `/index.html`
  - `/manifest.json`
  - `/logo.png`
  - `/offline.html`
- ✅ These assets are cached during service worker installation
- ✅ App works offline even on first visit (for cached pages)

**Pass Criteria**: Critical assets are precached and available immediately

---

### Test Case 10: Multi-Language Support
**Requirement**: IR-7, NFR-COMPAT-5  
**Priority**: Medium

**Steps**:
1. Test offline functionality in Arabic (ar)
2. Change language to English (en)
3. Test offline functionality in English
4. Change language to French (fr)
5. Test offline functionality in French

**Expected Results**:
- ✅ Offline indicator shows correct language
- ✅ Offline fallback page shows correct language
- ✅ Update notification shows correct language
- ✅ Queue status messages show correct language
- ✅ RTL layout works correctly for Arabic
- ✅ LTR layout works correctly for English and French

**Pass Criteria**: All offline features work correctly in all three languages

---

### Test Case 11: Network Throttling
**Requirement**: NFR-PERF-3, NFR-PERF-4  
**Priority**: Medium

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate through the application
4. Observe loading behavior and cache usage

**Expected Results**:
- ✅ Cached resources load quickly even on slow network
- ✅ Uncached resources show loading states
- ✅ API calls timeout after 5 minutes (NetworkFirst strategy)
- ✅ Cached API responses are used when network is slow
- ✅ Images load progressively with placeholders
- ✅ No layout shifts during loading (CLS < 0.1)

**Pass Criteria**: App remains usable on slow network with good cache utilization

---

### Test Case 12: Cache Size Limits
**Requirement**: Task 3.2.3  
**Priority**: Medium

**Steps**:
1. Visit many pages with images
2. Open DevTools → Application → Cache Storage
3. Check `images` cache size
4. Continue visiting pages until cache limit is approached
5. Observe cache cleanup behavior

**Expected Results**:
- ✅ Images cache has maxEntries: 100 (~50MB)
- ✅ Oldest images are automatically removed when limit reached
- ✅ `purgeOnQuotaError: true` prevents quota errors
- ✅ App continues to function normally
- ✅ No errors in console related to quota

**Pass Criteria**: Cache size is managed automatically without errors

---

## 🔍 Browser-Specific Testing

### Chrome/Edge
- ✅ Service worker registration
- ✅ Cache Storage inspection
- ✅ Network throttling
- ✅ Offline mode simulation
- ✅ PWA installation
- ✅ Lighthouse audit

### Firefox
- ✅ Service worker registration
- ✅ Storage inspection
- ✅ Network throttling
- ✅ Offline mode simulation
- ✅ PWA installation (limited)

### Safari (iOS)
- ✅ Service worker registration
- ✅ PWA installation (Add to Home Screen)
- ✅ Offline functionality
- ✅ Standalone mode
- ⚠️ Note: Safari has some PWA limitations

---

## 📱 Mobile Device Testing

### Android (Chrome)
1. Open application on Android device
2. Look for install banner or menu option
3. Install PWA
4. Test offline functionality
5. Test push notifications (if enabled)

### iOS (Safari)
1. Open application in Safari
2. Tap Share → Add to Home Screen
3. Open installed app
4. Test offline functionality
5. ⚠️ Note: Push notifications not supported on iOS PWAs

---

## 🐛 Common Issues and Troubleshooting

### Issue 1: Service Worker Not Registering
**Symptoms**: No service worker in DevTools  
**Solutions**:
- Ensure HTTPS or localhost
- Check console for registration errors
- Verify service-worker.js is accessible
- Clear browser cache and reload

### Issue 2: Offline Page Not Showing
**Symptoms**: Blank page or browser error when offline  
**Solutions**:
- Verify offline.html is in public folder
- Check service worker precache list
- Ensure offline.html is cached during install
- Clear cache and reinstall service worker

### Issue 3: Cached Content Not Updating
**Symptoms**: Old content shows after updates  
**Solutions**:
- Check service worker update mechanism
- Verify cache expiration times
- Use cache busting for critical assets
- Implement update notification

### Issue 4: Request Queue Not Working
**Symptoms**: Requests not retried when back online  
**Solutions**:
- Check OfflineContext is properly wrapped
- Verify online/offline event listeners
- Check console for queue processing logs
- Ensure API interceptor is configured

### Issue 5: PWA Not Installable
**Symptoms**: No install prompt appears  
**Solutions**:
- Verify manifest.json is valid
- Ensure HTTPS connection
- Check all required manifest fields
- Verify service worker is active
- Test on different browsers/devices

---

## ✅ Testing Checklist

### Pre-Testing
- [ ] Application built for production
- [ ] Service worker enabled
- [ ] HTTPS or localhost environment
- [ ] DevTools ready
- [ ] Test devices/browsers available

### Core Functionality
- [ ] Service worker registers successfully
- [ ] Previously visited pages work offline
- [ ] Offline fallback page displays correctly
- [ ] Offline indicator shows/hides appropriately
- [ ] Failed requests are queued
- [ ] Queued requests retry when online
- [ ] Update notifications appear
- [ ] Cache strategies work correctly

### Cross-Browser
- [ ] Chrome/Edge tested
- [ ] Firefox tested
- [ ] Safari tested (desktop)
- [ ] Safari tested (iOS)
- [ ] Chrome tested (Android)

### Languages
- [ ] Arabic (ar) tested
- [ ] English (en) tested
- [ ] French (fr) tested
- [ ] RTL layout works
- [ ] LTR layout works

### Performance
- [ ] Lighthouse Performance score 90+
- [ ] FCP under 1.8 seconds
- [ ] TTI under 3.8 seconds
- [ ] CLS under 0.1
- [ ] Cache hit rate > 80%

### Installation
- [ ] PWA installable on mobile
- [ ] Standalone mode works
- [ ] Custom splash screen shows
- [ ] App icon appears correctly
- [ ] Offline works in installed app

---

## 📊 Success Metrics

### Required Metrics
- ✅ Service worker registration: 100%
- ✅ Offline page availability: 100%
- ✅ Request queue success rate: 95%+
- ✅ Cache hit rate: 80%+
- ✅ PWA installability: 100%
- ✅ Update notification rate: 100%

### Performance Metrics
- ✅ Lighthouse Performance: 90+
- ✅ Lighthouse PWA: 100
- ✅ FCP: < 1.8s
- ✅ TTI: < 3.8s
- ✅ CLS: < 0.1

---

## 📝 Test Report Template

```markdown
# PWA Offline Functionality Test Report

**Date**: [Date]  
**Tester**: [Name]  
**Environment**: [Browser/Device]  
**Build Version**: [Version]

## Test Results Summary
- Total Tests: 12
- Passed: [X]
- Failed: [X]
- Blocked: [X]

## Detailed Results

### Test Case 1: Service Worker Registration
- Status: [Pass/Fail]
- Notes: [Any observations]
- Screenshots: [If applicable]

[Continue for all test cases...]

## Issues Found
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Sign-off
- Tester: [Name]
- Date: [Date]
- Status: [Approved/Needs Fixes]
```

---

## 🎓 Testing Best Practices

1. **Always test in production mode** - Service workers behave differently in development
2. **Clear cache between tests** - Ensures clean state for each test
3. **Test on real devices** - Emulation doesn't catch all issues
4. **Test all languages** - Verify translations and RTL/LTR layouts
5. **Test slow networks** - Use throttling to simulate real conditions
6. **Document everything** - Screenshots and detailed notes help debugging
7. **Test edge cases** - What happens when cache is full? When quota is exceeded?
8. **Test updates** - Verify service worker updates work smoothly
9. **Test across browsers** - Each browser has different PWA support
10. **Test installation** - Verify PWA installs and works in standalone mode

---

## 📚 Additional Resources

### Documentation
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)
- [Service Worker Detector](https://chrome.google.com/webstore/detail/service-worker-detector)

### Careerak Docs
- `docs/PWA_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `docs/OFFLINE_FUNCTIONALITY_GUIDE.md` - Developer guide
- `.kiro/specs/general-platform-enhancements/requirements.md` - Requirements
- `.kiro/specs/general-platform-enhancements/design.md` - Design document

---

## ✅ Completion Criteria

Task 3.6.7 is considered complete when:

1. ✅ All 12 test cases have been executed
2. ✅ Test results documented in test report
3. ✅ All critical and high priority tests pass
4. ✅ Testing performed on at least 3 browsers
5. ✅ Testing performed on at least 1 mobile device
6. ✅ All 3 languages tested (ar, en, fr)
7. ✅ Success metrics achieved
8. ✅ Issues documented and prioritized
9. ✅ Stakeholder sign-off obtained

---

**Last Updated**: 2026-02-19  
**Version**: 1.0  
**Status**: ✅ Ready for Testing
