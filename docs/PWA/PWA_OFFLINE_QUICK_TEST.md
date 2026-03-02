# PWA Offline Functionality - Quick Test Checklist

**Task**: 3.6.7 Test offline functionality manually  
**Time Required**: 15-20 minutes  
**Status**: ✅ Ready

---

## 🚀 Quick Start (5 Minutes)

### 1. Setup
```bash
# Build production version
npm run build

# Serve production build
npm run preview
# OR deploy to Vercel and test there
```

### 2. Open DevTools
- Press F12
- Go to Application tab
- Check Service Workers section

### 3. Basic Verification
- ✅ Service worker is "activated and is running"
- ✅ No errors in console
- ✅ Cache Storage shows multiple caches

---

## ⚡ Essential Tests (10 Minutes)

### Test 1: Offline Pages (2 min)
1. Visit homepage, jobs page, courses page
2. Toggle offline: DevTools → Network → ☑️ Offline
3. Navigate back to visited pages
4. **Expected**: Pages load successfully offline

### Test 2: Offline Fallback (1 min)
1. Clear cache: DevTools → Application → Clear storage
2. Go offline
3. Visit a new page
4. **Expected**: Custom offline page appears

### Test 3: Offline Indicator (1 min)
1. Go offline
2. **Expected**: Red banner appears at top
3. Go online
4. **Expected**: Green "Connection restored" message

### Test 4: Request Queue (3 min)
1. Log in
2. Go offline
3. Try to update profile or apply to job
4. Check console for "Queueing request"
5. Go online
6. **Expected**: Request automatically retries

### Test 5: Update Notification (2 min)
1. Keep app open
2. Make small change to service-worker.js
3. Rebuild: `npm run build`
4. Reload page
5. **Expected**: Update notification appears at bottom

### Test 6: PWA Install (1 min)
1. Open on mobile or use device emulation
2. Look for install prompt
3. **Expected**: Install option available

---

## 🎯 Pass/Fail Criteria

### ✅ PASS if:
- All 6 essential tests pass
- No console errors
- Service worker is active
- Offline indicator works
- Request queue works

### ❌ FAIL if:
- Service worker not registered
- Offline pages don't load
- No offline fallback page
- Requests not queued
- Console shows errors

---

## 🔧 Quick Troubleshooting

### Service Worker Not Working?
```bash
# Clear everything and restart
1. DevTools → Application → Clear storage → Clear site data
2. Close all tabs
3. Rebuild: npm run build
4. Open fresh tab
```

### Offline Page Not Showing?
```bash
# Check if offline.html exists
ls frontend/public/offline.html

# Verify it's in cache
DevTools → Application → Cache Storage → critical-assets-v1
```

### Request Queue Not Working?
```javascript
// Check console for these logs:
"[OfflineContext] Queueing request for retry"
"[OfflineContext] Processing X queued requests"
```

---

## 📱 Mobile Quick Test (5 Minutes)

### Android Chrome
1. Open app on phone
2. Menu → Install app
3. Open installed app
4. Turn on Airplane mode
5. Navigate app
6. **Expected**: Works offline

### iOS Safari
1. Open app in Safari
2. Share → Add to Home Screen
3. Open from home screen
4. Turn on Airplane mode
5. Navigate app
6. **Expected**: Works offline

---

## 🌍 Language Quick Test (3 Minutes)

### Arabic
1. Set language to Arabic
2. Go offline
3. **Expected**: Offline messages in Arabic, RTL layout

### English
1. Set language to English
2. Go offline
3. **Expected**: Offline messages in English, LTR layout

### French
1. Set language to French
2. Go offline
3. **Expected**: Offline messages in French, LTR layout

---

## 📊 Quick Metrics Check

### DevTools → Lighthouse
1. Run Lighthouse audit
2. Check scores:
   - ✅ Performance: 90+
   - ✅ PWA: 100
   - ✅ Accessibility: 95+

### DevTools → Network
1. Reload page
2. Check "Size" column
3. **Expected**: Most resources show "ServiceWorker"

### DevTools → Application → Cache Storage
1. Check cache sizes
2. **Expected**:
   - critical-assets-v1: ~5 items
   - static-assets: ~20-30 items
   - pages: ~5-10 items
   - images: varies
   - api-cache: varies

---

## ✅ Quick Sign-Off Checklist

- [ ] Service worker active
- [ ] Offline pages work
- [ ] Offline fallback shows
- [ ] Offline indicator works
- [ ] Request queue works
- [ ] Update notification works
- [ ] PWA installable
- [ ] All languages work
- [ ] No console errors
- [ ] Lighthouse PWA: 100

---

## 🎉 Success!

If all checkboxes are ticked, Task 3.6.7 is complete!

**Next Steps**:
1. Document any issues found
2. Create test report (use template in PWA_OFFLINE_TESTING_GUIDE.md)
3. Get stakeholder approval
4. Mark task as complete

---

## 📞 Need Help?

**Full Testing Guide**: `docs/PWA_OFFLINE_TESTING_GUIDE.md`  
**Implementation Details**: `docs/PWA_IMPLEMENTATION_SUMMARY.md`  
**Requirements**: `.kiro/specs/general-platform-enhancements/requirements.md`

---

**Last Updated**: 2026-02-19  
**Version**: 1.0  
**Estimated Time**: 15-20 minutes
