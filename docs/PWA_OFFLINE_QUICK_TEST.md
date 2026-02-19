# PWA Offline Functionality - Quick Test Checklist

## 🚀 Quick Start (5 Minutes)

This is a condensed version of the full testing guide for rapid verification of offline functionality.

**Task:** 3.4.5 - Test offline functionality for key features  
**Requirements:** FR-PWA-2, FR-PWA-3, FR-PWA-9

---

## Prerequisites

```bash
# Build and run
cd frontend
npm run build
npm run preview
```

Open browser: http://localhost:4173  
Open DevTools: F12

---

## ✅ Essential Tests (Must Pass)

### 1. Service Worker Active
- [ ] DevTools → Application → Service Workers shows "activated"

### 2. Offline Indicator Works
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Red banner appears: "You are offline"
- [ ] Go online
- [ ] Green banner appears: "Connection restored"

### 3. Cached Pages Load Offline
- [ ] Visit homepage while online
- [ ] Go offline
- [ ] Refresh page → Page loads from cache ✅
- [ ] Visit profile page while online
- [ ] Go offline
- [ ] Navigate to profile → Page loads ✅

### 4. Uncached Pages Show Fallback
- [ ] Clear cache (DevTools → Application → Clear storage)
- [ ] Visit homepage while online
- [ ] Go offline
- [ ] Try to visit /admin → Offline fallback page shows ✅

### 5. Request Queuing Works
- [ ] Go offline
- [ ] Try to submit a form (e.g., update profile)
- [ ] Console shows: "Queueing request" ✅
- [ ] localStorage has `careerak_offline_queue` key ✅

### 6. Request Retry Works
- [ ] With queued request from step 5
- [ ] Go online
- [ ] Wait 2-3 seconds
- [ ] Console shows: "Processing queued requests" ✅
- [ ] Request succeeds ✅
- [ ] Queue is empty ✅

### 7. Static Assets Cached
- [ ] Visit site while online
- [ ] Go offline
- [ ] Refresh page
- [ ] Network tab shows "(from ServiceWorker)" for JS/CSS ✅
- [ ] Images load from cache ✅

### 8. Dark Mode Works Offline
- [ ] Go offline
- [ ] Toggle dark mode in settings
- [ ] Dark mode applies ✅
- [ ] Navigate between pages → Dark mode persists ✅

---

## 🔍 Quick Verification Commands

### Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg.active ? 'Active ✅' : 'Not Active ❌');
});
```

### Check Cache
```javascript
// In browser console
caches.keys().then(keys => {
  console.log('Caches:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key}: ${requests.length} items`);
      });
    });
  });
});
```

### Check Queue
```javascript
// In browser console
const queue = localStorage.getItem('careerak_offline_queue');
console.log('Queue:', queue ? JSON.parse(queue) : 'Empty');
```

### Check Offline Status
```javascript
// In browser console
console.log('Online:', navigator.onLine);
```

---

## 📊 Quick Test Results

**Date:** _____________  
**Tester:** _____________  
**Browser:** _____________

| Test | Status | Notes |
|------|--------|-------|
| 1. Service Worker Active | ☐ Pass ☐ Fail | |
| 2. Offline Indicator | ☐ Pass ☐ Fail | |
| 3. Cached Pages Load | ☐ Pass ☐ Fail | |
| 4. Offline Fallback | ☐ Pass ☐ Fail | |
| 5. Request Queuing | ☐ Pass ☐ Fail | |
| 6. Request Retry | ☐ Pass ☐ Fail | |
| 7. Static Assets Cached | ☐ Pass ☐ Fail | |
| 8. Dark Mode Offline | ☐ Pass ☐ Fail | |

**Overall:** ☐ All Pass ☐ Some Fail

---

## 🐛 Common Issues

### Service Worker Not Active
```bash
# Clear and rebuild
rm -rf frontend/build
cd frontend
npm run build
npm run preview
```

### Offline Indicator Not Showing
- Check OfflineContext is in App.jsx
- Check OfflineIndicator is rendered
- Try actual offline (not just DevTools)

### Requests Not Queuing
- Only POST/PUT/PATCH/DELETE queue
- Check console for errors
- Verify offlineRequestQueue is imported

### Cache Not Working
- Must visit pages while online first
- Check HTTPS (required for service workers)
- Clear cache and try again

---

## 🔗 Full Testing Guide

For comprehensive testing, see: `docs/PWA_OFFLINE_TESTING_GUIDE.md`

---

## ✅ Sign-Off

**Quick Test Complete:** ☐ Yes ☐ No  
**Ready for Full Testing:** ☐ Yes ☐ No  
**Issues Found:** _____________________________________________

**Tester:** _____________  
**Date:** _____________
