# PWA Installation Testing Guide

## Overview
This guide provides comprehensive instructions for testing PWA (Progressive Web App) installation on mobile devices for the Careerak platform.

**Requirements Tested:**
- FR-PWA-4: Install prompt shown on mobile
- FR-PWA-5: Standalone app experience with custom splash screen
- Property PWA-5: PWA installability

**Date Created:** 2026-02-22

---

## Prerequisites

### Required Setup
1. ✅ Service worker registered (`/service-worker.js`)
2. ✅ Manifest file configured (`/manifest.json`)
3. ✅ HTTPS enabled (required for PWA)
4. ✅ Icons generated (192x192, 512x512, maskable)
5. ✅ App deployed to production or staging environment

### Test Devices
- **Android**: Chrome Mobile 90+, Samsung Internet
- **iOS**: Safari 14+ (requires iOS 14.3+)
- **Desktop**: Chrome, Edge (for comparison)

---

## Test Cases

### Test Case 1: Verify PWA Installability Criteria

**Objective:** Ensure all PWA installation requirements are met

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to **Application** tab
3. Click **Manifest** in left sidebar
4. Verify the following:
   - ✅ Manifest URL loads successfully
   - ✅ `name`: "Careerak - The Future of HR"
   - ✅ `short_name`: "Careerak"
   - ✅ `start_url`: "/"
   - ✅ `display`: "standalone"
   - ✅ `theme_color`: "#304B60"
   - ✅ `background_color`: "#E3DAD1"
   - ✅ Icons present: 192x192, 512x512 (both regular and maskable)

5. Click **Service Workers** in left sidebar
6. Verify:
   - ✅ Service worker status: "activated and is running"
   - ✅ Source: `/service-worker.js`

**Expected Result:**
- All manifest properties correctly configured
- Service worker active and running
- No errors in console

**Pass Criteria:**
- ✅ Manifest valid
- ✅ Service worker active
- ✅ All required icons present

---

### Test Case 2: Android Chrome - Install Prompt

**Objective:** Test PWA installation on Android Chrome

**Device:** Android phone with Chrome 90+

**Steps:**
1. Open Chrome on Android
2. Navigate to the Careerak website (production URL)
3. Wait 30 seconds for engagement heuristics
4. Look for install prompt:
   - **Option A:** Banner at bottom of screen
   - **Option B:** "Add to Home Screen" in Chrome menu (⋮)

5. Tap the install prompt or "Add to Home Screen"
6. Verify install dialog shows:
   - ✅ App name: "Careerak"
   - ✅ App icon (192x192)
   - ✅ "Install" button
   - ✅ "Cancel" button

7. Tap **Install**
8. Wait for installation to complete

**Expected Result:**
- Install prompt appears automatically or in menu
- Install dialog shows correct app information
- Installation completes successfully
- App icon appears on home screen

**Pass Criteria:**
- ✅ Install prompt shown
- ✅ Correct app name and icon
- ✅ Installation successful
- ✅ Icon on home screen

---

### Test Case 3: Android Chrome - Standalone App Experience

**Objective:** Verify standalone app experience after installation

**Device:** Android phone with installed PWA

**Steps:**
1. Tap the Careerak icon on home screen
2. Observe the launch sequence:
   - ✅ Splash screen appears
   - ✅ Splash screen shows:
     - App icon (512x512)
     - App name: "Careerak"
     - Background color: #E3DAD1
     - Theme color: #304B60

3. After splash screen, verify:
   - ✅ App opens in standalone mode (no browser UI)
   - ✅ No address bar visible
   - ✅ No browser tabs
   - ✅ Full-screen app experience
   - ✅ Status bar color matches theme_color (#304B60)

4. Test navigation:
   - Navigate to different pages (Jobs, Courses, Profile)
   - ✅ Navigation stays within app (no browser opening)
   - ✅ Back button works correctly
   - ✅ No external browser launches

5. Test app switcher:
   - Open recent apps (square button)
   - ✅ Careerak appears as separate app
   - ✅ App name and icon shown correctly
   - ✅ Screenshot preview visible

**Expected Result:**
- Splash screen displays correctly
- App runs in standalone mode
- No browser UI visible
- Navigation stays within app
- App appears in app switcher

**Pass Criteria:**
- ✅ Splash screen shown
- ✅ Standalone mode active
- ✅ No browser UI
- ✅ Navigation contained
- ✅ App switcher shows app

---

### Test Case 4: iOS Safari - Add to Home Screen

**Objective:** Test PWA installation on iOS Safari

**Device:** iPhone with iOS 14.3+ and Safari

**Steps:**
1. Open Safari on iPhone
2. Navigate to the Careerak website
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Verify the preview shows:
   - ✅ App icon (192x192 or 512x512)
   - ✅ App name: "Careerak"
   - ✅ Editable name field

6. Tap **Add** in top-right corner
7. Return to home screen
8. Verify:
   - ✅ Careerak icon appears on home screen
   - ✅ Icon has correct appearance

**Expected Result:**
- "Add to Home Screen" option available
- Preview shows correct app information
- Icon added to home screen successfully

**Pass Criteria:**
- ✅ Add to Home Screen available
- ✅ Correct app name and icon
- ✅ Icon on home screen

**Note:** iOS does not show automatic install prompts. Users must manually add to home screen.

---

### Test Case 5: iOS Safari - Standalone App Experience

**Objective:** Verify standalone app experience on iOS

**Device:** iPhone with installed PWA

**Steps:**
1. Tap the Careerak icon on home screen
2. Observe the launch:
   - ✅ Splash screen appears (iOS generates automatically)
   - ✅ Shows app icon and background color

3. After launch, verify:
   - ✅ App opens in standalone mode
   - ✅ No Safari UI visible
   - ✅ Status bar visible at top
   - ✅ Full-screen app experience

4. Test navigation:
   - Navigate to different pages
   - ✅ Navigation stays within app
   - ✅ No Safari opening
   - ✅ Back navigation works

5. Test app switcher:
   - Swipe up from bottom (or double-click home)
   - ✅ Careerak appears as separate app
   - ✅ App name shown
   - ✅ Screenshot preview visible

**Expected Result:**
- Splash screen displays
- App runs in standalone mode
- No Safari UI visible
- Navigation contained within app
- App appears in app switcher

**Pass Criteria:**
- ✅ Splash screen shown
- ✅ Standalone mode active
- ✅ No Safari UI
- ✅ Navigation contained
- ✅ App switcher shows app

---

### Test Case 6: Desktop Chrome - Install Prompt

**Objective:** Test PWA installation on desktop Chrome

**Device:** Desktop/laptop with Chrome

**Steps:**
1. Open Chrome on desktop
2. Navigate to the Careerak website
3. Look for install indicator:
   - ✅ Install icon (+) in address bar (right side)
   - OR
   - ✅ Install prompt banner

4. Click the install icon or prompt
5. Verify install dialog shows:
   - ✅ App name: "Careerak - The Future of HR"
   - ✅ App icon
   - ✅ "Install" button
   - ✅ "Cancel" button

6. Click **Install**
7. Wait for installation

**Expected Result:**
- Install icon appears in address bar
- Install dialog shows correct information
- Installation completes successfully
- App opens in new window

**Pass Criteria:**
- ✅ Install icon visible
- ✅ Correct app information
- ✅ Installation successful
- ✅ App opens in window

---

### Test Case 7: Desktop Chrome - App Window Experience

**Objective:** Verify app window experience on desktop

**Device:** Desktop with installed PWA

**Steps:**
1. Open installed Careerak app from:
   - Chrome Apps (chrome://apps)
   - Desktop shortcut
   - Start menu (Windows) or Applications (Mac)

2. Verify app window:
   - ✅ Opens in separate window (not browser tab)
   - ✅ Custom title bar with app name
   - ✅ No browser address bar
   - ✅ No browser tabs
   - ✅ Window has app icon

3. Test navigation:
   - Navigate to different pages
   - ✅ Navigation stays in app window
   - ✅ No new browser tabs open
   - ✅ Back/forward buttons work

4. Test window management:
   - Minimize, maximize, resize window
   - ✅ Window behaves like native app
   - ✅ App icon in taskbar (Windows) or dock (Mac)

**Expected Result:**
- App opens in dedicated window
- No browser UI visible
- Navigation contained
- Window behaves like native app

**Pass Criteria:**
- ✅ Separate app window
- ✅ No browser UI
- ✅ Navigation contained
- ✅ Native-like behavior

---

### Test Case 8: Offline Functionality After Installation

**Objective:** Verify offline functionality works after PWA installation

**Device:** Any device with installed PWA

**Steps:**
1. Open installed Careerak app
2. Navigate to several pages (Jobs, Courses, Profile)
3. Enable airplane mode or disconnect from internet
4. Close and reopen the app
5. Verify:
   - ✅ App opens successfully
   - ✅ Previously visited pages load from cache
   - ✅ Offline indicator shown (if implemented)

6. Try to visit a new page (not previously cached)
7. Verify:
   - ✅ Custom offline page shown (`/offline.html`)
   - ✅ Offline message displayed
   - ✅ Navigation options available

8. Reconnect to internet
9. Verify:
   - ✅ App reconnects automatically
   - ✅ Content updates
   - ✅ Online functionality restored

**Expected Result:**
- App works offline for cached pages
- Offline page shown for uncached content
- Reconnection works smoothly

**Pass Criteria:**
- ✅ Cached pages load offline
- ✅ Offline page shown
- ✅ Reconnection successful

---

### Test Case 9: App Shortcuts (Android)

**Objective:** Test app shortcuts functionality on Android

**Device:** Android phone with installed PWA

**Steps:**
1. Long-press the Careerak icon on home screen
2. Verify shortcuts menu appears with:
   - ✅ "Jobs" shortcut
   - ✅ "Courses" shortcut
   - ✅ "Profile" shortcut

3. Tap "Jobs" shortcut
4. Verify:
   - ✅ App opens directly to Jobs page
   - ✅ Correct page loads

5. Close app and repeat for other shortcuts

**Expected Result:**
- Shortcuts menu appears on long-press
- All shortcuts listed correctly
- Shortcuts navigate to correct pages

**Pass Criteria:**
- ✅ Shortcuts menu shown
- ✅ All shortcuts present
- ✅ Navigation works correctly

---

### Test Case 10: Uninstallation

**Objective:** Test PWA uninstallation process

**Android Steps:**
1. Long-press Careerak icon
2. Tap "Uninstall" or drag to "Remove"
3. Confirm uninstallation
4. Verify:
   - ✅ Icon removed from home screen
   - ✅ App data cleared (optional)

**iOS Steps:**
1. Long-press Careerak icon
2. Tap "Remove App"
3. Select "Delete App"
4. Confirm deletion
5. Verify:
   - ✅ Icon removed from home screen

**Desktop Steps:**
1. Right-click app icon in Chrome Apps
2. Select "Remove from Chrome"
3. Confirm removal
4. Verify:
   - ✅ App removed from Chrome Apps
   - ✅ Shortcuts removed

**Expected Result:**
- Uninstallation completes successfully
- Icon removed from home screen/apps
- No residual shortcuts

**Pass Criteria:**
- ✅ Uninstallation successful
- ✅ Icon removed
- ✅ Clean removal

---

## Automated Testing Checklist

### Lighthouse PWA Audit

**Steps:**
1. Open Chrome DevTools
2. Navigate to **Lighthouse** tab
3. Select:
   - ✅ Progressive Web App
   - ✅ Mobile device
4. Click **Generate report**

**Expected Scores:**
- ✅ PWA score: 100% or near 100%
- ✅ Installable: Pass
- ✅ PWA Optimized: Pass

**Key Checks:**
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a `<meta name="viewport">` tag
- ✅ Contains content when JavaScript is unavailable
- ✅ Provides a valid `apple-touch-icon`
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="theme-color">` tag
- ✅ Manifest has maskable icon

---

## Common Issues and Troubleshooting

### Issue 1: Install Prompt Not Showing (Android)

**Possible Causes:**
- Service worker not registered
- Manifest missing or invalid
- Not on HTTPS
- User already dismissed prompt
- Engagement heuristics not met

**Solutions:**
1. Check service worker status in DevTools
2. Validate manifest in DevTools → Application → Manifest
3. Ensure HTTPS is enabled
4. Clear browser data and revisit
5. Wait 30 seconds for engagement

### Issue 2: Splash Screen Not Showing

**Possible Causes:**
- Icons missing or wrong size
- Background color not set
- Theme color not set

**Solutions:**
1. Verify icons in manifest (192x192, 512x512)
2. Check `background_color` in manifest
3. Check `theme_color` in manifest
4. Ensure icons are accessible (not 404)

### Issue 3: App Opens in Browser Instead of Standalone

**Possible Causes:**
- `display` not set to "standalone"
- `start_url` incorrect
- User opened from browser bookmark

**Solutions:**
1. Check `display: "standalone"` in manifest
2. Verify `start_url: "/"` in manifest
3. Ensure user opens from home screen icon, not browser

### Issue 4: iOS Not Showing Add to Home Screen

**Possible Causes:**
- Using Chrome instead of Safari
- iOS version too old (<14.3)
- Already added to home screen

**Solutions:**
1. Use Safari (required for iOS PWA)
2. Update iOS to 14.3 or later
3. Check if already installed

### Issue 5: Offline Pages Not Loading

**Possible Causes:**
- Service worker not caching pages
- Cache strategy incorrect
- Service worker not active

**Solutions:**
1. Check service worker caching in DevTools → Application → Cache Storage
2. Verify cache strategies in service-worker.js
3. Ensure service worker is active and running

---

## Test Results Template

### Device Information
- **Device:** [e.g., Samsung Galaxy S21]
- **OS:** [e.g., Android 12]
- **Browser:** [e.g., Chrome 110]
- **Date:** [YYYY-MM-DD]
- **Tester:** [Name]

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Installability Criteria | ✅ Pass / ❌ Fail | |
| 2. Android Install Prompt | ✅ Pass / ❌ Fail | |
| 3. Android Standalone | ✅ Pass / ❌ Fail | |
| 4. iOS Add to Home Screen | ✅ Pass / ❌ Fail | |
| 5. iOS Standalone | ✅ Pass / ❌ Fail | |
| 6. Desktop Install | ✅ Pass / ❌ Fail | |
| 7. Desktop App Window | ✅ Pass / ❌ Fail | |
| 8. Offline Functionality | ✅ Pass / ❌ Fail | |
| 9. App Shortcuts | ✅ Pass / ❌ Fail | |
| 10. Uninstallation | ✅ Pass / ❌ Fail | |

### Lighthouse PWA Score
- **Score:** [0-100]
- **Installable:** ✅ Pass / ❌ Fail
- **PWA Optimized:** ✅ Pass / ❌ Fail

### Overall Result
- ✅ **PASS** - All critical tests passed
- ⚠️ **PARTIAL** - Some tests failed (specify)
- ❌ **FAIL** - Critical tests failed

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
- [Attach screenshots of install prompt, splash screen, standalone mode, etc.]

---

## Success Criteria

### Must Pass (Critical)
- ✅ PWA installability criteria met
- ✅ Install prompt shown on mobile (Android) or Add to Home Screen available (iOS)
- ✅ Standalone app experience (no browser UI)
- ✅ Splash screen displays correctly
- ✅ Offline functionality works
- ✅ Lighthouse PWA score ≥ 90%

### Should Pass (Important)
- ✅ App shortcuts work (Android)
- ✅ Desktop installation works
- ✅ Uninstallation clean
- ✅ Theme color applied correctly

### Nice to Have
- ✅ Maskable icons display correctly
- ✅ App appears in app switcher with correct info
- ✅ Status bar color matches theme

---

## References

- **Requirements:** `.kiro/specs/general-platform-enhancements/requirements.md`
- **Design:** `.kiro/specs/general-platform-enhancements/design.md`
- **Manifest:** `frontend/public/manifest.json`
- **Service Worker:** `frontend/public/service-worker.js`
- **PWA Checklist:** https://web.dev/pwa-checklist/
- **Install Criteria:** https://web.dev/install-criteria/

---

## Next Steps

After completing testing:

1. ✅ Fill out test results template
2. ✅ Document any issues found
3. ✅ Take screenshots for evidence
4. ✅ Update task status in tasks.md
5. ✅ Report results to team
6. ✅ Fix any critical issues found
7. ✅ Retest after fixes

---

**Testing Status:** Ready for execution
**Last Updated:** 2026-02-22
**Version:** 1.0
