# PWA Testing Quick Start Guide

## 🚀 5-Minute Testing Checklist

Quick guide to test PWA installation on mobile devices.

---

## 📱 Android (Chrome) - 2 Minutes

### Step 1: Open App
1. Open **Chrome** on Android
2. Go to: `https://your-careerak-domain.com`

### Step 2: Install
1. Look for install banner at bottom
2. OR tap **⋮** menu → **"Add to Home screen"**
3. Tap **"Add"**

### Step 3: Verify
- [ ] Icon appears on home screen
- [ ] Tap icon → app opens without browser UI
- [ ] Splash screen shows (beige background)
- [ ] App feels like native app

### Step 4: Test Offline
1. Visit a few pages
2. Enable **Airplane Mode**
3. Navigate to visited pages
- [ ] Pages load from cache

---

## 🍎 iOS (Safari) - 2 Minutes

### Step 1: Open App
1. Open **Safari** on iOS
2. Go to: `https://your-careerak-domain.com`

### Step 2: Install
1. Tap **Share** button (⬆️)
2. Scroll down → tap **"Add to Home Screen"**
3. Tap **"Add"**

### Step 3: Verify
- [ ] Icon appears on home screen
- [ ] Tap icon → app opens without Safari UI
- [ ] Splash screen shows (beige background)
- [ ] App feels like native app

### Step 4: Test Offline
1. Visit a few pages
2. Enable **Airplane Mode**
3. Navigate to visited pages
- [ ] Pages load from cache

---

## ✅ Pass Criteria

**Installation:**
- ✅ App installs in < 5 seconds
- ✅ Icon appears on home screen
- ✅ No errors during installation

**Standalone Mode:**
- ✅ No browser UI visible
- ✅ Splash screen displays
- ✅ App feels native

**Offline:**
- ✅ Visited pages load offline
- ✅ Images display correctly
- ✅ Navigation works

---

## 🐛 Quick Troubleshooting

### Install Prompt Doesn't Appear (Android)
- Clear Chrome cache
- Check HTTPS is enabled
- Try manual install from menu

### "Add to Home Screen" Missing (iOS)
- Force refresh page (pull down)
- Check manifest.json is accessible
- Verify icons exist

### App Opens in Browser
- Launch from home screen icon, not browser
- Check `display: "standalone"` in manifest

### Offline Doesn't Work
- Visit pages while online first
- Check service worker is registered
- Verify cache strategies are correct

---

## 📸 Screenshot Checklist

Capture these for documentation:

**Android:**
1. Install prompt
2. Home screen with icon
3. Splash screen
4. App in standalone mode

**iOS:**
1. Share sheet with "Add to Home Screen"
2. Home screen with icon
3. Splash screen
4. App in standalone mode

---

## 🔗 Full Testing Guide

For comprehensive testing, see: `docs/PWA_MOBILE_TESTING_GUIDE.md`

---

**Quick Test Time:** ~5 minutes (2 min Android + 2 min iOS + 1 min verification)  
**Status:** ✅ Ready for Testing
