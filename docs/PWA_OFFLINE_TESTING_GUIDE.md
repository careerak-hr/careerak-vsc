# PWA Offline Functionality Testing Guide

## Overview
This document provides comprehensive manual testing procedures for verifying offline functionality in the Careerak PWA. It covers all key features that should work offline as specified in task 3.4.5.

**Related Requirements:**
- FR-PWA-2: Serve cached pages for previously visited routes when offline
- FR-PWA-3: Display custom offline fallback page for uncached pages
- FR-PWA-9: Queue failed API requests and retry when online
- NFR-REL-2: Maintain offline functionality for previously visited pages
- NFR-REL-3: Queue failed API requests when offline and retry when online

**Test Date:** _____________  
**Tester:** _____________  
**Browser:** _____________  
**Device:** _____________

---

## Prerequisites

### 1. Build and Deploy
```bash
cd frontend
npm run build
npm run preview  # Or deploy to staging/production
```

### 2. Service Worker Registration
1. Open browser DevTools (F12)
2. Go to Application tab → Service Workers
3. Verify service worker is registered and activated
4. Status should show "activated and is running"

### 3. Enable Offline Mode
**Chrome/Edge:**
- DevTools → Network tab → Throttling dropdown → Offline

**Firefox:**
- DevTools → Network tab → Throttling dropdown → Offline

**Safari:**
- Develop → Network Conditions → Offline

---

## Test Suite 1: Cached Page Access (FR-PWA-2)

### Test 1.1: Homepage Offline Access
**Objective:** Verify homepage loads from cache when offline

**Steps:**
1. Visit homepage while online
2. Wait for page to fully load
3. Enable offline mode in DevTools
4. Refresh the page (F5)

**Expected Results:**
- ✅ Page loads successfully from cache
- ✅ No network errors in console
- ✅ Offline indicator appears at top of page
- ✅ All static assets (CSS, JS, images) load correctly
- ✅ Page is fully functional

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 1.2: Profile Page Offline Access
**Objective:** Verify previously visited profile page loads offline

**Steps:**
1. While online, navigate to Profile page (/profile)
2. Wait for page to fully load
3. Enable offline mode
4. Navigate away (e.g., to homepage)
5. Navigate back to Profile page

**Expected Results:**
- ✅ Profile page loads from cache
- ✅ Offline indicator is visible
- ✅ Previously loaded user data is displayed
- ✅ Page layout and styling are intact

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 1.3: Job Postings Page Offline Access
**Objective:** Verify job postings page works offline after initial visit

**Steps:**
1. While online, visit Job Postings page (/jobs)
2. Scroll through several job listings
3. Enable offline mode
4. Refresh the page

**Expected Results:**
- ✅ Page loads from cache
- ✅ Previously viewed job listings are visible
- ✅ Images load from cache
- ✅ Offline indicator shows

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 1.4: Courses Page Offline Access
**Objective:** Verify courses page is accessible offline

**Steps:**
1. While online, visit Courses page (/courses)
2. Browse several courses
3. Enable offline mode
4. Navigate to another page and back to courses

**Expected Results:**
- ✅ Courses page loads from cache
- ✅ Previously viewed courses are displayed
- ✅ Course images load from cache
- ✅ Page is navigable

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 1.5: Settings Page Offline Access
**Objective:** Verify settings page works offline

**Steps:**
1. While online, visit Settings page (/settings)
2. View all settings sections
3. Enable offline mode
4. Refresh the page

**Expected Results:**
- ✅ Settings page loads from cache
- ✅ All settings options are visible
- ✅ Dark mode toggle works offline
- ✅ Language selection is accessible

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 2: Offline Fallback Page (FR-PWA-3)

### Test 2.1: Uncached Page Access
**Objective:** Verify offline fallback page displays for uncached routes

**Steps:**
1. Clear browser cache and service worker
2. Visit homepage while online
3. Enable offline mode
4. Try to navigate to a page you haven't visited (e.g., /admin)

**Expected Results:**
- ✅ Custom offline fallback page displays
- ✅ Page shows "You are offline" message
- ✅ Page provides helpful information
- ✅ Navigation options are available
- ✅ Page styling matches app theme

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 2.2: Offline Fallback Content
**Objective:** Verify offline page has proper content and functionality

**Steps:**
1. Trigger offline fallback page (as in Test 2.1)
2. Review page content
3. Test any interactive elements

**Expected Results:**
- ✅ Clear offline message in multiple languages
- ✅ Explanation of what happened
- ✅ Suggestion to check connection
- ✅ Link to return to homepage
- ✅ Careerak branding is visible

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 3: Offline Indicator (Task 3.4.2)

### Test 3.1: Offline Indicator Appearance
**Objective:** Verify offline indicator shows when connection is lost

**Steps:**
1. Start with online connection
2. Enable offline mode
3. Observe the UI

**Expected Results:**
- ✅ Offline indicator appears at top of page
- ✅ Indicator shows "You are offline" message
- ✅ Indicator is clearly visible (contrasting colors)
- ✅ Indicator includes offline icon
- ✅ Message is in current language (ar/en/fr)

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 3.2: Reconnection Indicator
**Objective:** Verify reconnection message appears when back online

**Steps:**
1. Start offline
2. Disable offline mode (go back online)
3. Observe the UI

**Expected Results:**
- ✅ "Connection restored" message appears
- ✅ Message shows success icon (checkmark)
- ✅ Message auto-dismisses after 5 seconds
- ✅ User can manually dismiss message
- ✅ Message is in current language

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 3.3: Offline Indicator Persistence
**Objective:** Verify indicator remains visible while offline

**Steps:**
1. Go offline
2. Navigate between multiple pages
3. Observe offline indicator

**Expected Results:**
- ✅ Indicator remains visible on all pages
- ✅ Indicator doesn't disappear during navigation
- ✅ Indicator position is consistent

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 4: Request Queuing (FR-PWA-9, Task 3.4.3)

### Test 4.1: Queue POST Request
**Objective:** Verify POST requests are queued when offline

**Steps:**
1. Go offline
2. Try to submit a form (e.g., job application)
3. Check browser console for queue messages
4. Check localStorage for queued requests

**Expected Results:**
- ✅ Form submission doesn't fail immediately
- ✅ Console shows "Queueing request" message
- ✅ localStorage contains queued request
- ✅ User sees feedback that request will retry
- ✅ Queue size indicator updates (if visible)

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 4.2: Queue Multiple Requests
**Objective:** Verify multiple requests can be queued

**Steps:**
1. Go offline
2. Perform multiple actions that trigger API calls:
   - Update profile
   - Apply to job
   - Post comment
3. Check queue size

**Expected Results:**
- ✅ All requests are queued
- ✅ Queue size increases with each request
- ✅ Requests are stored in localStorage
- ✅ No duplicate requests in queue

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 4.3: Request Priority
**Objective:** Verify high-priority requests are queued first

**Steps:**
1. Go offline
2. Queue requests with different priorities:
   - Low priority: Update settings
   - High priority: Job application
   - Urgent: Emergency contact update
3. Check queue order in localStorage

**Expected Results:**
- ✅ Urgent requests appear first in queue
- ✅ High priority requests come next
- ✅ Low priority requests are last
- ✅ Queue is sorted by priority

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 5: Request Retry (Task 3.4.4)

### Test 5.1: Automatic Retry on Reconnection
**Objective:** Verify queued requests retry automatically when online

**Steps:**
1. Go offline
2. Queue 2-3 requests (e.g., form submissions)
3. Verify requests are in queue
4. Go back online
5. Wait 2-3 seconds
6. Check console and network tab

**Expected Results:**
- ✅ Requests automatically retry when online
- ✅ Console shows "Processing queued requests" message
- ✅ Network tab shows retry attempts
- ✅ Successful requests are removed from queue
- ✅ Queue size decreases to 0
- ✅ User sees success notifications

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 5.2: Retry Success Handling
**Objective:** Verify successful retries update UI correctly

**Steps:**
1. Go offline
2. Submit a job application
3. Go back online
4. Wait for automatic retry
5. Check application status

**Expected Results:**
- ✅ Request retries successfully
- ✅ Application appears in "My Applications"
- ✅ Success notification is shown
- ✅ Request is removed from queue
- ✅ UI updates with new data

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 5.3: Retry Failure Handling
**Objective:** Verify failed retries are handled gracefully

**Steps:**
1. Go offline
2. Queue a request
3. Go online but simulate server error (use DevTools to block specific API)
4. Observe retry behavior

**Expected Results:**
- ✅ Request retries up to 3 times
- ✅ Exponential backoff between retries
- ✅ After max retries, request is removed from queue
- ✅ User sees error notification
- ✅ Error is logged to console

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 5.4: Mixed Success/Failure Retry
**Objective:** Verify queue handles mixed results correctly

**Steps:**
1. Go offline
2. Queue 3 requests
3. Go online
4. Allow first request to succeed
5. Block second request (simulate error)
6. Allow third request to succeed

**Expected Results:**
- ✅ First request succeeds and is removed
- ✅ Second request retries (stays in queue)
- ✅ Third request succeeds and is removed
- ✅ Queue size = 1 (only failed request remains)
- ✅ User sees appropriate notifications

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 6: Static Asset Caching (FR-PWA-8)

### Test 6.1: JavaScript Caching
**Objective:** Verify JS files are cached and served offline

**Steps:**
1. Visit site while online
2. Open DevTools → Network tab
3. Enable offline mode
4. Refresh page
5. Check Network tab for JS files

**Expected Results:**
- ✅ All JS files load from cache
- ✅ Network tab shows "(from ServiceWorker)"
- ✅ No 404 errors for JS files
- ✅ App functionality works correctly

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 6.2: CSS Caching
**Objective:** Verify CSS files are cached and served offline

**Steps:**
1. Visit site while online
2. Enable offline mode
3. Refresh page
4. Check styling and Network tab

**Expected Results:**
- ✅ All CSS files load from cache
- ✅ Page styling is intact
- ✅ Dark mode CSS works offline
- ✅ Responsive styles work offline

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 6.3: Font Caching
**Objective:** Verify custom fonts are cached

**Steps:**
1. Visit site while online (fonts load)
2. Enable offline mode
3. Refresh page
4. Check font rendering

**Expected Results:**
- ✅ Custom fonts load from cache
- ✅ Arabic fonts (Amiri/Cairo) display correctly
- ✅ English fonts (Cormorant Garamond) display correctly
- ✅ French fonts (EB Garamond) display correctly
- ✅ No fallback to system fonts

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 6.4: Image Caching
**Objective:** Verify images are cached with 50MB limit

**Steps:**
1. Browse site while online, viewing many images
2. Enable offline mode
3. Navigate to pages with images
4. Check image loading

**Expected Results:**
- ✅ Previously viewed images load from cache
- ✅ Images display correctly
- ✅ Cloudinary optimized images work offline
- ✅ Profile pictures load from cache
- ✅ Logo and icons load from cache

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 7: API Response Caching

### Test 7.1: API Cache Strategy
**Objective:** Verify API responses use NetworkFirst strategy

**Steps:**
1. Visit page with API data while online
2. Check Network tab for API calls
3. Enable offline mode
4. Refresh page
5. Check if cached API data is used

**Expected Results:**
- ✅ API tries network first when online
- ✅ Falls back to cache when offline
- ✅ Cached data is displayed
- ✅ Data is reasonably fresh (< 5 minutes old)

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 7.2: Stale Data Indication
**Objective:** Verify users know when viewing cached data

**Steps:**
1. Load page with API data while online
2. Go offline
3. Refresh page
4. Observe UI

**Expected Results:**
- ✅ Offline indicator shows
- ✅ Data displays from cache
- ✅ User understands data may be stale
- ✅ No misleading "live" indicators

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 8: Dark Mode Offline

### Test 8.1: Dark Mode Toggle Offline
**Objective:** Verify dark mode works offline

**Steps:**
1. Go offline
2. Navigate to Settings
3. Toggle dark mode on/off
4. Navigate between pages

**Expected Results:**
- ✅ Dark mode toggle works offline
- ✅ Preference saves to localStorage
- ✅ Dark mode applies across all pages
- ✅ Transitions are smooth (300ms)
- ✅ Input borders remain #D4816180

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 9: Multi-Language Offline

### Test 9.1: Language Switching Offline
**Objective:** Verify language switching works offline

**Steps:**
1. Go offline
2. Navigate to Settings
3. Switch between Arabic, English, French
4. Navigate between pages

**Expected Results:**
- ✅ Language switching works offline
- ✅ All UI text updates correctly
- ✅ RTL/LTR layout switches properly
- ✅ Fonts change appropriately
- ✅ Preference saves to localStorage

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 10: Navigation Offline

### Test 10.1: Client-Side Navigation
**Objective:** Verify navigation works offline for cached pages

**Steps:**
1. Visit multiple pages while online
2. Go offline
3. Use navigation menu to switch between pages
4. Use browser back/forward buttons

**Expected Results:**
- ✅ Navigation menu works offline
- ✅ All cached pages are accessible
- ✅ Back/forward buttons work
- ✅ URL updates correctly
- ✅ Page transitions work smoothly

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 11: Form Interactions Offline

### Test 11.1: Form Validation Offline
**Objective:** Verify client-side form validation works offline

**Steps:**
1. Go offline
2. Navigate to a form (e.g., job application)
3. Try to submit with invalid data
4. Correct errors and submit

**Expected Results:**
- ✅ Client-side validation works offline
- ✅ Error messages display correctly
- ✅ Form prevents invalid submission
- ✅ Valid form queues for submission
- ✅ User sees "will retry when online" message

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 11.2: Form Data Persistence
**Objective:** Verify form data persists offline

**Steps:**
1. Go offline
2. Start filling out a form
3. Navigate away
4. Return to form

**Expected Results:**
- ✅ Form data is preserved (if implemented)
- ✅ User doesn't lose work
- ✅ Draft is saved to localStorage

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 12: Service Worker Updates

### Test 12.1: Update Notification
**Objective:** Verify update notification appears for new service worker

**Steps:**
1. Deploy new version of app
2. Visit site with old version
3. Wait for update check (or manually trigger)
4. Observe UI

**Expected Results:**
- ✅ Update notification appears
- ✅ Message says "New update available"
- ✅ "Reload" button is present
- ✅ "Later" button is present
- ✅ Notification is dismissible

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 12.2: Update Installation
**Objective:** Verify clicking reload installs update

**Steps:**
1. Trigger update notification (as in Test 12.1)
2. Click "Reload" button
3. Observe behavior

**Expected Results:**
- ✅ Page reloads automatically
- ✅ New version is activated
- ✅ Service worker updates in DevTools
- ✅ New features/fixes are available

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 13: Performance Offline

### Test 13.1: Offline Load Time
**Objective:** Verify offline pages load quickly from cache

**Steps:**
1. Visit pages while online
2. Go offline
3. Use DevTools Performance tab
4. Measure page load time

**Expected Results:**
- ✅ Cached pages load < 1 second
- ✅ No network delays
- ✅ Smooth user experience
- ✅ No visible lag

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Load Time:** _________ ms

**Notes:** _____________________________________________

---

## Test Suite 14: Edge Cases

### Test 14.1: Intermittent Connection
**Objective:** Verify app handles flaky connection

**Steps:**
1. Toggle offline/online rapidly
2. Try to perform actions during toggles
3. Observe behavior

**Expected Results:**
- ✅ App doesn't crash
- ✅ Requests queue/retry appropriately
- ✅ UI updates correctly
- ✅ No duplicate requests

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 14.2: Long Offline Period
**Objective:** Verify app works after extended offline time

**Steps:**
1. Go offline
2. Wait 30+ minutes
3. Try to use app
4. Go back online

**Expected Results:**
- ✅ App still works offline
- ✅ Cached data is still available
- ✅ Queued requests are still in queue
- ✅ Requests retry when online
- ✅ No data loss

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

### Test 14.3: Cache Quota Exceeded
**Objective:** Verify app handles cache quota limits

**Steps:**
1. Browse site extensively (load many images)
2. Check cache size in DevTools
3. Continue browsing to exceed limits
4. Observe behavior

**Expected Results:**
- ✅ Old cache entries are purged
- ✅ App continues to function
- ✅ No errors in console
- ✅ Most recent content is cached

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:** _____________________________________________

---

## Test Suite 15: Cross-Browser Testing

### Test 15.1: Chrome/Edge
**Browser:** Chrome/Edge  
**Version:** _____________

Run all test suites above and record results.

**Overall Result:**
- [ ] Pass
- [ ] Fail

**Issues Found:** _____________________________________________

---

### Test 15.2: Firefox
**Browser:** Firefox  
**Version:** _____________

Run all test suites above and record results.

**Overall Result:**
- [ ] Pass
- [ ] Fail

**Issues Found:** _____________________________________________

---

### Test 15.3: Safari (Desktop)
**Browser:** Safari  
**Version:** _____________

Run all test suites above and record results.

**Overall Result:**
- [ ] Pass
- [ ] Fail

**Issues Found:** _____________________________________________

---

### Test 15.4: Safari (iOS)
**Device:** _____________  
**iOS Version:** _____________

Run all test suites above and record results.

**Overall Result:**
- [ ] Pass
- [ ] Fail

**Issues Found:** _____________________________________________

---

### Test 15.5: Chrome Mobile (Android)
**Device:** _____________  
**Android Version:** _____________

Run all test suites above and record results.

**Overall Result:**
- [ ] Pass
- [ ] Fail

**Issues Found:** _____________________________________________

---

## Summary

### Test Results Overview

| Test Suite | Total Tests | Passed | Failed | Pass Rate |
|------------|-------------|--------|--------|-----------|
| 1. Cached Page Access | 5 | ___ | ___ | ___% |
| 2. Offline Fallback | 2 | ___ | ___ | ___% |
| 3. Offline Indicator | 3 | ___ | ___ | ___% |
| 4. Request Queuing | 3 | ___ | ___ | ___% |
| 5. Request Retry | 4 | ___ | ___ | ___% |
| 6. Static Asset Caching | 4 | ___ | ___ | ___% |
| 7. API Response Caching | 2 | ___ | ___ | ___% |
| 8. Dark Mode Offline | 1 | ___ | ___ | ___% |
| 9. Multi-Language Offline | 1 | ___ | ___ | ___% |
| 10. Navigation Offline | 1 | ___ | ___ | ___% |
| 11. Form Interactions | 2 | ___ | ___ | ___% |
| 12. Service Worker Updates | 2 | ___ | ___ | ___% |
| 13. Performance Offline | 1 | ___ | ___ | ___% |
| 14. Edge Cases | 3 | ___ | ___ | ___% |
| 15. Cross-Browser | 5 | ___ | ___ | ___% |
| **TOTAL** | **39** | **___** | **___** | **___%** |

### Critical Issues Found
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Non-Critical Issues Found
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Recommendations
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Sign-Off

**Tester:** _____________  
**Date:** _____________  
**Signature:** _____________

**Reviewer:** _____________  
**Date:** _____________  
**Signature:** _____________

---

## Appendix A: DevTools Tips

### Checking Service Worker Status
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers" in left sidebar
4. View registration status and version

### Viewing Cache Contents
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Cache Storage" in left sidebar
4. Expand to see cached files

### Checking localStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage" in left sidebar
4. Look for `careerak_offline_queue` key

### Simulating Slow Network
1. Open DevTools (F12)
2. Go to Network tab
3. Throttling dropdown → Slow 3G
4. Test offline functionality with delays

### Clearing Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Click "Unregister"
5. Refresh page

### Forcing Service Worker Update
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Check "Update on reload"
5. Refresh page

---

## Appendix B: Common Issues and Solutions

### Issue: Service Worker Not Registering
**Solution:**
- Check HTTPS (required for service workers)
- Check console for registration errors
- Verify service-worker.js path is correct
- Clear browser cache and try again

### Issue: Offline Indicator Not Showing
**Solution:**
- Check OfflineContext is wrapped around App
- Verify OfflineIndicator component is rendered
- Check browser console for errors
- Test with actual offline (not just DevTools)

### Issue: Requests Not Queuing
**Solution:**
- Check request method (only POST/PUT/PATCH/DELETE queue)
- Verify offlineRequestQueue is imported correctly
- Check localStorage for queue data
- Review console logs for queue messages

### Issue: Cached Pages Not Loading
**Solution:**
- Verify pages were visited while online first
- Check cache storage in DevTools
- Ensure service worker is activated
- Try clearing cache and revisiting pages

### Issue: Images Not Caching
**Solution:**
- Check image URLs are from same origin
- Verify cache size hasn't exceeded 50MB limit
- Check Network tab for cache hits
- Review service worker image caching strategy

---

## Appendix C: Automated Test Commands

```bash
# Run offline retry tests
cd frontend
npm test -- offline-retry.test.js --run

# Run service worker precache tests
npm test -- service-worker-precache.test.js --run

# Run all PWA tests
npm test -- --grep "PWA|offline|cache" --run

# Run with coverage
npm test -- --coverage --run
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-19  
**Related Tasks:** 3.4.5, 3.4.2, 3.4.3, 3.4.4  
**Related Requirements:** FR-PWA-2, FR-PWA-3, FR-PWA-9, NFR-REL-2, NFR-REL-3
