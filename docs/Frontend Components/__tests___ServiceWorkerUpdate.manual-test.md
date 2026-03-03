# Service Worker Update Detection - Manual Test Guide

## Task: 3.1.4 Implement update detection and notification

## Requirements
- FR-PWA-6: When the service worker updates, the system shall notify the user and offer to reload for the new version

## Test Setup

### Prerequisites
1. Build the application: `npm run build`
2. Serve the built application (use a local server)
3. Open the application in a browser
4. Open DevTools → Application → Service Workers

## Test Cases

### Test 1: Initial Service Worker Registration
**Steps:**
1. Open the application for the first time
2. Check DevTools → Console for: "Service Worker registered successfully"
3. Check DevTools → Application → Service Workers
4. Verify service worker is "activated and running"

**Expected Result:**
✅ Service worker registers successfully
✅ No update notification shown (first install)

---

### Test 2: Service Worker Update Detection
**Steps:**
1. With the app running, make a small change to the service worker file
2. Rebuild the application: `npm run build`
3. In DevTools → Application → Service Workers, click "Update"
4. Wait for the new service worker to install

**Expected Result:**
✅ Update notification appears at the bottom of the screen
✅ Notification shows: "تحديث جديد متاح!" (Arabic) or translated message
✅ Two buttons visible: "إعادة التحميل" (Reload) and "لاحقاً" (Later)
✅ Close button (×) visible in top-right of notification

---

### Test 3: Update Notification - Reload Action
**Steps:**
1. Trigger an update (as in Test 2)
2. When notification appears, click "إعادة التحميل" button

**Expected Result:**
✅ Page reloads immediately
✅ New service worker becomes active
✅ Application runs with updated service worker

---

### Test 4: Update Notification - Dismiss Action
**Steps:**
1. Trigger an update (as in Test 2)
2. When notification appears, click "لاحقاً" button

**Expected Result:**
✅ Notification disappears
✅ Old service worker continues running
✅ User can continue using the app
✅ Update will be applied on next page reload

---

### Test 5: Update Notification - Close Button
**Steps:**
1. Trigger an update (as in Test 2)
2. When notification appears, click the × button

**Expected Result:**
✅ Notification disappears
✅ Same behavior as "Later" button

---

### Test 6: Multi-Language Support
**Steps:**
1. Change language to English in settings
2. Trigger an update
3. Verify notification text is in English
4. Change language to French
5. Trigger another update
6. Verify notification text is in French

**Expected Result:**
✅ Arabic: "تحديث جديد متاح!"
✅ English: "New update available!"
✅ French: "Nouvelle mise à jour disponible!"

---

### Test 7: Periodic Update Check
**Steps:**
1. Keep the application open for 1+ hour
2. Make a change to the service worker
3. Rebuild and deploy
4. Wait for automatic update check (runs every hour)

**Expected Result:**
✅ Update is detected automatically
✅ Notification appears without manual refresh

---

### Test 8: Visual Design Verification
**Steps:**
1. Trigger an update notification
2. Verify visual design matches specifications

**Expected Result:**
✅ Background color: #304B60 (Primary)
✅ Text color: #E3DAD1 (Secondary)
✅ Reload button: #D48161 (Accent)
✅ Border radius: 12px
✅ Box shadow present
✅ Smooth slide-up animation
✅ Positioned at bottom center
✅ Responsive on mobile (max-width: 90%)

---

### Test 9: Accessibility
**Steps:**
1. Trigger an update notification
2. Test with keyboard navigation
3. Test with screen reader

**Expected Result:**
✅ Notification has role="alert"
✅ Notification has aria-live="polite"
✅ Buttons are keyboard accessible (Tab navigation)
✅ Screen reader announces notification
✅ Close button has aria-label

---

### Test 10: Multiple Updates
**Steps:**
1. Trigger first update → Dismiss
2. Trigger second update immediately
3. Verify only one notification shows

**Expected Result:**
✅ Only one notification visible at a time
✅ New notification replaces old one

---

## Implementation Details

### Files Modified
1. `frontend/src/index.jsx` - Enhanced service worker registration with update detection
2. `frontend/src/components/ServiceWorkerManager.jsx` - New component for update UI
3. `frontend/src/App.jsx` - Integrated ServiceWorkerManager component

### Key Features Implemented
- ✅ Update detection via `updatefound` event
- ✅ State change monitoring for new service worker
- ✅ User-friendly notification UI
- ✅ Multi-language support (ar, en, fr)
- ✅ Smooth CSS animations
- ✅ Reload and dismiss actions
- ✅ Periodic update checks (every hour)
- ✅ Accessibility features (ARIA labels, keyboard navigation)

### Service Worker Communication
```javascript
// Tell service worker to skip waiting
newWorker.postMessage({ type: 'SKIP_WAITING' });

// Service worker listens for this message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

## Troubleshooting

### Issue: Notification doesn't appear
**Solution:**
1. Check if service worker is registered: DevTools → Application → Service Workers
2. Verify there's an actual update (service worker file changed)
3. Check console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Issue: Update doesn't apply after clicking reload
**Solution:**
1. Verify SKIP_WAITING message is sent
2. Check service worker has `skipWaiting()` listener
3. Ensure `controllerchange` event triggers reload

### Issue: Notification appears on first load
**Solution:**
1. This shouldn't happen - check logic in ServiceWorkerManager
2. Verify `navigator.serviceWorker.controller` check is present
3. Clear service workers and test again

## Success Criteria
- ✅ Service worker registers successfully
- ✅ Updates are detected automatically
- ✅ User-friendly notification appears
- ✅ Reload action works correctly
- ✅ Dismiss action works correctly
- ✅ Multi-language support works
- ✅ Periodic checks work (every hour)
- ✅ Accessibility requirements met
- ✅ Visual design matches specifications

## Notes
- This is a manual test because service worker behavior requires a real browser environment
- Automated testing of service workers is complex and requires special tooling
- The implementation follows PWA best practices
- Update detection is non-intrusive and user-friendly
