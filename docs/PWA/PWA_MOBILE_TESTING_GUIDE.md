# PWA Mobile Installation Testing Guide

## 📱 Overview

This guide provides comprehensive instructions for testing PWA (Progressive Web App) installation on mobile devices for the Careerak platform.

**Task**: 3.6.6 Test PWA installation on mobile devices  
**Status**: ✅ Ready for Testing  
**Date**: 2026-02-19

---

## 🎯 Testing Objectives

1. ✅ Verify PWA installability on iOS and Android
2. ✅ Test install prompt display and functionality
3. ✅ Verify standalone app experience
4. ✅ Test custom splash screen
5. ✅ Verify app icons and branding
6. ✅ Test offline functionality after installation
7. ✅ Verify app shortcuts work correctly
8. ✅ Test update notifications

---

## 📋 Pre-Testing Checklist

### Backend Requirements
- [ ] Backend server is running and accessible
- [ ] HTTPS is enabled (required for PWA)
- [ ] Service worker is being served correctly
- [ ] Manifest.json is accessible at `/manifest.json`

### Frontend Requirements
- [ ] App is built and deployed
- [ ] Service worker registration is active
- [ ] All PWA icons are present in `/public/`
- [ ] Manifest is linked in `index.html`

### Verification Commands
```bash
# Check if service worker is registered
curl https://your-domain.com/service-worker.js

# Check if manifest is accessible
curl https://your-domain.com/manifest.json

# Verify icons exist
ls frontend/public/icon-*.png
```

---

## 🤖 Android Testing

### Devices to Test
- Samsung Galaxy S21/S22/S23 (Android 11+)
- Google Pixel 5/6/7 (Android 11+)
- OnePlus 9/10 (Android 11+)
- Any Android device with Chrome 90+

### Testing Steps

#### 1. Initial Access
1. Open **Chrome** browser on Android
2. Navigate to: `https://your-careerak-domain.com`
3. Wait for the page to fully load
4. Look for the install prompt

#### 2. Install Prompt Verification
**Expected Behavior:**
- Install banner appears at the bottom of the screen
- Banner shows: "Add Careerak to Home screen"
- Banner includes app icon and name

**Manual Trigger (if auto-prompt doesn't appear):**
1. Tap the **three-dot menu** (⋮) in Chrome
2. Look for **"Add to Home screen"** or **"Install app"**
3. Tap the option

**Screenshot Checklist:**
- [ ] Install prompt appears
- [ ] App icon is visible
- [ ] App name "Careerak" is displayed
- [ ] "Add" button is present

#### 3. Installation Process
1. Tap **"Add"** or **"Install"** button
2. Confirm installation in the dialog
3. Wait for installation to complete (1-3 seconds)

**Expected Results:**
- [ ] Success message appears
- [ ] App icon added to home screen
- [ ] App appears in app drawer
- [ ] Installation completes without errors

#### 4. Launch Installed App
1. Find **Careerak** icon on home screen
2. Tap to launch the app

**Expected Behavior:**
- [ ] Custom splash screen appears (beige background #E3DAD1)
- [ ] App logo displays during splash
- [ ] App opens in standalone mode (no browser UI)
- [ ] Status bar color matches theme (#304B60)
- [ ] Navigation bar is hidden or themed

#### 5. Standalone Mode Verification
**Check for:**
- [ ] No browser address bar
- [ ] No browser navigation buttons
- [ ] Full-screen experience
- [ ] App feels like a native app
- [ ] Back button works correctly
- [ ] System back gesture works

#### 6. App Shortcuts Testing
1. Long-press the **Careerak** icon on home screen
2. Verify shortcuts appear:
   - [ ] "Jobs" shortcut
   - [ ] "Courses" shortcut
   - [ ] "Profile" shortcut
3. Tap each shortcut
4. Verify it opens the correct page

#### 7. Offline Functionality
1. Open the installed app
2. Navigate to a few pages (Jobs, Courses, Profile)
3. Enable **Airplane Mode**
4. Try to navigate to previously visited pages

**Expected Results:**
- [ ] Previously visited pages load from cache
- [ ] Images display correctly
- [ ] Navigation works smoothly
- [ ] Offline fallback page shows for uncached pages
- [ ] Offline indicator appears (if implemented)

#### 8. Update Notification
1. Deploy a new version of the app
2. Open the installed app
3. Wait for update detection (may take up to 1 hour)

**Expected Behavior:**
- [ ] Update notification appears at bottom
- [ ] Message: "تحديث جديد متاح! قم بإعادة التحميل للحصول على أحدث إصدار."
- [ ] "إعادة التحميل" button is present
- [ ] Dismiss (×) button works
- [ ] Tapping reload updates the app

#### 9. Uninstallation Test
1. Long-press the **Careerak** icon
2. Drag to **"Uninstall"** or tap **"App info"**
3. Tap **"Uninstall"**
4. Confirm uninstallation

**Expected Results:**
- [ ] App uninstalls successfully
- [ ] Icon removed from home screen
- [ ] App removed from app drawer
- [ ] No residual data (optional: check in Settings > Apps)

---

## 🍎 iOS Testing

### Devices to Test
- iPhone 12/13/14/15 (iOS 14+)
- iPad (iOS 14+)
- Any iOS device with Safari 14+

### Testing Steps

#### 1. Initial Access
1. Open **Safari** browser on iOS
2. Navigate to: `https://your-careerak-domain.com`
3. Wait for the page to fully load

**Note:** iOS does not show automatic install prompts. Users must manually add to home screen.

#### 2. Manual Installation
1. Tap the **Share** button (square with arrow pointing up)
2. Scroll down in the share sheet
3. Tap **"Add to Home Screen"**

**Screenshot Checklist:**
- [ ] Share sheet opens
- [ ] "Add to Home Screen" option is visible
- [ ] App icon preview is shown
- [ ] App name "Careerak" is displayed

#### 3. Customize Installation
1. Review the app name (can be edited)
2. Review the app icon preview
3. Tap **"Add"** in the top-right corner

**Expected Results:**
- [ ] App icon added to home screen
- [ ] Icon uses the correct image (192x192 or 512x512)
- [ ] Icon has proper rounded corners (iOS style)
- [ ] Installation completes without errors

#### 4. Launch Installed App
1. Find **Careerak** icon on home screen
2. Tap to launch the app

**Expected Behavior:**
- [ ] Custom splash screen appears (beige background #E3DAD1)
- [ ] App logo displays during splash
- [ ] App opens in standalone mode (no Safari UI)
- [ ] Status bar color matches theme (#304B60)
- [ ] App feels like a native iOS app

#### 5. Standalone Mode Verification
**Check for:**
- [ ] No Safari address bar
- [ ] No Safari navigation buttons
- [ ] Full-screen experience
- [ ] Swipe gestures work correctly
- [ ] iOS system gestures work (swipe up, swipe between apps)
- [ ] App appears in app switcher

#### 6. Offline Functionality
1. Open the installed app
2. Navigate to a few pages (Jobs, Courses, Profile)
3. Enable **Airplane Mode**
4. Try to navigate to previously visited pages

**Expected Results:**
- [ ] Previously visited pages load from cache
- [ ] Images display correctly
- [ ] Navigation works smoothly
- [ ] Offline fallback page shows for uncached pages

**Note:** iOS Safari has stricter caching policies than Android Chrome. Some features may behave differently.

#### 7. Update Notification
1. Deploy a new version of the app
2. Open the installed app
3. Wait for update detection

**Expected Behavior:**
- [ ] Update notification appears
- [ ] User can reload to get new version
- [ ] App updates successfully

**Note:** iOS may cache more aggressively. Users may need to force-quit and reopen the app to see updates.

#### 8. Uninstallation Test
1. Long-press the **Careerak** icon
2. Tap **"Remove App"**
3. Tap **"Delete App"**
4. Confirm deletion

**Expected Results:**
- [ ] App deletes successfully
- [ ] Icon removed from home screen
- [ ] No residual data

---

## 🔍 Advanced Testing Scenarios

### 1. Network Conditions Testing
Test PWA under various network conditions:

**Slow 3G:**
1. Enable Chrome DevTools (Android) or throttle network
2. Install the PWA
3. Verify installation completes
4. Check splash screen loads
5. Verify app is usable

**Offline Installation:**
1. Visit the site online
2. Enable Airplane Mode
3. Try to open the app
4. Verify cached content loads

**Intermittent Connection:**
1. Toggle Airplane Mode on/off during use
2. Verify app handles connection changes gracefully
3. Check for offline indicators
4. Verify queued requests retry when online

### 2. Storage and Cache Testing
**Test Cache Limits:**
1. Install the app
2. Browse extensively (100+ pages)
3. Check if old cache entries are purged
4. Verify app remains functional

**Test Image Cache (50MB limit):**
1. Browse many image-heavy pages
2. Monitor cache size (Chrome DevTools > Application > Cache Storage)
3. Verify cache doesn't exceed 50MB
4. Check if old images are purged

### 3. Multi-Language Testing
Test PWA in all supported languages:

**Arabic (RTL):**
1. Set device language to Arabic
2. Install PWA
3. Verify RTL layout works
4. Check splash screen text direction
5. Verify app shortcuts are in Arabic

**English (LTR):**
1. Set device language to English
2. Install PWA
3. Verify LTR layout works
4. Check all text is in English

**French (LTR):**
1. Set device language to French
2. Install PWA
3. Verify French translations
4. Check all UI elements

### 4. Notification Testing
**Push Notifications:**
1. Install the PWA
2. Grant notification permission
3. Trigger a test notification from backend
4. Verify notification appears
5. Tap notification
6. Verify app opens to correct page

**Notification Actions:**
1. Receive a notification with actions
2. Tap an action button (e.g., "View Job")
3. Verify correct action is performed
4. Check app navigates to correct page

### 5. App Shortcuts Testing
**Deep Link Testing:**
1. Long-press app icon
2. Tap "Jobs" shortcut
3. Verify app opens directly to Jobs page
4. Repeat for "Courses" and "Profile"

### 6. Orientation Testing
**Portrait Mode:**
1. Open app in portrait
2. Verify layout is correct
3. Check all features work

**Landscape Mode:**
1. Rotate device to landscape
2. Verify layout adapts
3. Check responsive design
4. Verify no UI breaks

### 7. Multi-Tab Testing
**Android Chrome:**
1. Open PWA in standalone mode
2. Open same URL in Chrome browser
3. Verify both instances work
4. Check data synchronization

**iOS Safari:**
1. Open PWA from home screen
2. Open same URL in Safari
3. Verify both work independently

---

## 📊 Testing Checklist Summary

### Android Chrome
- [ ] Install prompt appears automatically
- [ ] Manual install from menu works
- [ ] App installs successfully
- [ ] Splash screen displays correctly
- [ ] Standalone mode works (no browser UI)
- [ ] App shortcuts work
- [ ] Offline functionality works
- [ ] Update notifications appear
- [ ] Uninstall works cleanly

### iOS Safari
- [ ] "Add to Home Screen" option available
- [ ] App installs successfully
- [ ] Splash screen displays correctly
- [ ] Standalone mode works (no Safari UI)
- [ ] Offline functionality works
- [ ] Update notifications appear
- [ ] Uninstall works cleanly

### Cross-Platform
- [ ] App works on slow 3G
- [ ] App works offline
- [ ] Cache limits are respected (50MB for images)
- [ ] All languages work (Arabic, English, French)
- [ ] RTL layout works for Arabic
- [ ] Push notifications work
- [ ] Notification actions work
- [ ] App shortcuts work
- [ ] Portrait and landscape modes work
- [ ] Multi-tab scenarios work

---

## 🐛 Common Issues and Solutions

### Issue 1: Install Prompt Doesn't Appear (Android)
**Possible Causes:**
- App doesn't meet PWA criteria
- Service worker not registered
- Manifest.json has errors
- HTTPS not enabled

**Solutions:**
1. Check Chrome DevTools > Application > Manifest
2. Verify service worker is registered
3. Check for manifest errors
4. Ensure HTTPS is enabled
5. Try clearing browser cache

### Issue 2: "Add to Home Screen" Not Available (iOS)
**Possible Causes:**
- Manifest.json not linked
- Icons missing
- Service worker not registered

**Solutions:**
1. Check `<link rel="manifest" href="/manifest.json">` in HTML
2. Verify icons exist in `/public/`
3. Check service worker registration
4. Try force-refreshing the page (pull down)

### Issue 3: Splash Screen Doesn't Show
**Possible Causes:**
- Icons missing or wrong size
- Theme colors not set in manifest
- iOS caching issues

**Solutions:**
1. Verify 192x192 and 512x512 icons exist
2. Check `theme_color` and `background_color` in manifest
3. On iOS, delete and reinstall the app
4. Clear Safari cache

### Issue 4: App Opens in Browser Instead of Standalone
**Possible Causes:**
- `display: "standalone"` not set in manifest
- User opened from browser instead of home screen icon
- iOS Safari limitations

**Solutions:**
1. Verify `"display": "standalone"` in manifest.json
2. Ensure user launches from home screen icon, not browser
3. On iOS, check if app was added correctly

### Issue 5: Offline Pages Don't Load
**Possible Causes:**
- Service worker not caching pages
- Cache strategy incorrect
- Network-first strategy timing out

**Solutions:**
1. Check service worker cache strategies
2. Verify pages were visited while online
3. Check browser DevTools > Application > Cache Storage
4. Verify offline.html is precached

### Issue 6: Update Notification Doesn't Appear
**Possible Causes:**
- Service worker update detection not working
- Update check interval too long
- Browser caching old service worker

**Solutions:**
1. Check service worker update logic in `index.jsx`
2. Verify `registration.update()` is called
3. Try force-refreshing (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for errors

### Issue 7: App Shortcuts Don't Work (Android)
**Possible Causes:**
- Shortcuts not defined in manifest
- URLs incorrect
- Icons missing

**Solutions:**
1. Verify `shortcuts` array in manifest.json
2. Check URLs are correct and accessible
3. Verify icons exist for shortcuts
4. Reinstall the app

### Issue 8: Push Notifications Don't Work
**Possible Causes:**
- Notification permission not granted
- Service worker push listener not working
- Backend not sending notifications correctly

**Solutions:**
1. Check notification permission in browser settings
2. Verify push event listener in service-worker.js
3. Test with browser DevTools > Application > Service Workers
4. Check backend notification service

---

## 📸 Screenshot Requirements

For documentation and bug reports, capture screenshots of:

### Android
1. Install prompt banner
2. Chrome menu with "Add to Home screen"
3. Installation confirmation dialog
4. Home screen with app icon
5. App drawer with app icon
6. Splash screen
7. App in standalone mode (no browser UI)
8. App shortcuts menu
9. Offline fallback page
10. Update notification

### iOS
1. Safari share sheet
2. "Add to Home Screen" option
3. App name and icon preview
4. Home screen with app icon
5. Splash screen
6. App in standalone mode (no Safari UI)
7. App in app switcher
8. Offline fallback page
9. Update notification

---

## 🔗 Testing Tools

### Chrome DevTools (Android)
1. Connect Android device via USB
2. Enable USB debugging on device
3. Open Chrome on desktop
4. Navigate to `chrome://inspect`
5. Select your device
6. Inspect the PWA

**Useful Panels:**
- Application > Manifest (check manifest.json)
- Application > Service Workers (check registration)
- Application > Cache Storage (check cached files)
- Network (check offline behavior)
- Lighthouse (run PWA audit)

### Safari Web Inspector (iOS)
1. Connect iOS device via USB
2. Enable Web Inspector on device (Settings > Safari > Advanced)
3. Open Safari on Mac
4. Develop menu > [Your Device] > [Your Page]

**Useful Panels:**
- Storage (check cache)
- Console (check for errors)
- Network (check requests)

### Lighthouse PWA Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

**Target Scores:**
- PWA: 100/100
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

---

## ✅ Success Criteria

The PWA installation testing is considered successful when:

### Functional Requirements
- [ ] PWA installs successfully on Android Chrome
- [ ] PWA installs successfully on iOS Safari
- [ ] Install prompt appears on Android
- [ ] "Add to Home Screen" works on iOS
- [ ] Splash screen displays correctly on both platforms
- [ ] App runs in standalone mode (no browser UI)
- [ ] App icons display correctly
- [ ] App shortcuts work on Android
- [ ] Offline functionality works on both platforms
- [ ] Update notifications appear and work
- [ ] Uninstallation works cleanly

### Performance Requirements
- [ ] Lighthouse PWA score: 100/100
- [ ] Installation completes in < 5 seconds
- [ ] Splash screen displays in < 1 second
- [ ] App launches in < 2 seconds
- [ ] Offline pages load in < 1 second

### User Experience Requirements
- [ ] Installation process is intuitive
- [ ] App feels like a native app
- [ ] No browser UI visible in standalone mode
- [ ] Smooth transitions and animations
- [ ] Responsive design works on all screen sizes
- [ ] RTL layout works correctly for Arabic
- [ ] All languages work correctly

---

## 📝 Test Report Template

Use this template to document your testing results:

```markdown
# PWA Mobile Installation Test Report

**Date:** [Date]
**Tester:** [Name]
**App Version:** [Version]
**Environment:** [Production/Staging]

## Android Testing

**Device:** [Device Model]
**OS Version:** [Android Version]
**Browser:** Chrome [Version]

### Installation
- [ ] Install prompt appeared: Yes/No
- [ ] Installation successful: Yes/No
- [ ] Time to install: [X] seconds
- [ ] Issues: [Describe any issues]

### Standalone Mode
- [ ] No browser UI: Yes/No
- [ ] Splash screen displayed: Yes/No
- [ ] App shortcuts work: Yes/No
- [ ] Issues: [Describe any issues]

### Offline Functionality
- [ ] Cached pages load: Yes/No
- [ ] Offline fallback works: Yes/No
- [ ] Issues: [Describe any issues]

### Update Notification
- [ ] Notification appeared: Yes/No
- [ ] Reload worked: Yes/No
- [ ] Issues: [Describe any issues]

## iOS Testing

**Device:** [Device Model]
**OS Version:** [iOS Version]
**Browser:** Safari [Version]

### Installation
- [ ] "Add to Home Screen" available: Yes/No
- [ ] Installation successful: Yes/No
- [ ] Time to install: [X] seconds
- [ ] Issues: [Describe any issues]

### Standalone Mode
- [ ] No Safari UI: Yes/No
- [ ] Splash screen displayed: Yes/No
- [ ] Issues: [Describe any issues]

### Offline Functionality
- [ ] Cached pages load: Yes/No
- [ ] Offline fallback works: Yes/No
- [ ] Issues: [Describe any issues]

## Overall Assessment

**Pass/Fail:** [Pass/Fail]
**Notes:** [Additional notes]
**Screenshots:** [Attach screenshots]
```

---

## 🎓 Additional Resources

### Documentation
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google: PWA Checklist](https://web.dev/pwa-checklist/)
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

### Testing Services
- [BrowserStack](https://www.browserstack.com/) - Test on real devices
- [LambdaTest](https://www.lambdatest.com/) - Cross-browser testing
- [Sauce Labs](https://saucelabs.com/) - Mobile app testing

---

## 📞 Support

If you encounter issues during testing:

1. Check the "Common Issues and Solutions" section above
2. Review browser console for errors
3. Check service worker status in DevTools
4. Verify manifest.json is valid
5. Contact the development team with:
   - Device model and OS version
   - Browser version
   - Screenshots of the issue
   - Console error messages
   - Steps to reproduce

---

**Last Updated:** 2026-02-19  
**Version:** 1.0  
**Status:** ✅ Ready for Testing
