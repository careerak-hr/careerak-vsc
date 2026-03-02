# PWA Install Prompt - Quick Test Guide

## 🚀 Quick Test (5 minutes)

### Prerequisites
- ✅ Service worker registered
- ✅ Manifest.json valid
- ✅ HTTPS enabled (or localhost)

### Test on Android Chrome

1. **Open Careerak on Android Chrome**
   ```
   https://your-careerak-domain.com
   ```

2. **Wait 3 seconds**
   - Install prompt should appear at bottom center
   - Shows "تثبيت التطبيق" (Arabic) or "Install App" (English)

3. **Verify Prompt Content**
   - ✅ Download icon visible
   - ✅ Title in correct language
   - ✅ Description message
   - ✅ Features list (3 items with checkmarks)
   - ✅ "Install" button (accent color)
   - ✅ "Later" button (outlined)
   - ✅ Close button (X)

4. **Test Install Button**
   - Click "تثبيت" / "Install"
   - Native install dialog should appear
   - Shows app name "Careerak"
   - Shows app icon
   - Click "Install" in native dialog
   - App installs to home screen

5. **Verify Installation**
   - Open app from home screen
   - Runs in standalone mode (no browser UI)
   - Splash screen appears
   - App loads normally

### Test Dismissal

1. **Refresh page** (clear localStorage first)
   ```javascript
   localStorage.removeItem('install-prompt-dismissed');
   localStorage.removeItem('pwa-installed');
   ```

2. **Wait 3 seconds**
   - Prompt appears

3. **Click "Later" or X**
   - Prompt disappears
   - Refresh page
   - Prompt should NOT appear (dismissed for 7 days)

### Test Already Installed

1. **Install the app** (if not already)

2. **Refresh page**
   - Prompt should NOT appear
   - Check localStorage: `pwa-installed` should be 'true'

### Test on Desktop Chrome

1. **Open Careerak on Chrome desktop**

2. **Look for install icon**
   - Install icon (+) in address bar (right side)
   - OR custom prompt at bottom (same as mobile)

3. **Click install icon**
   - Install dialog appears
   - Install app
   - App opens in standalone window

## 🐛 Quick Troubleshooting

### Prompt Doesn't Appear

**Check:**
```javascript
// In browser console
console.log('Dismissed:', localStorage.getItem('install-prompt-dismissed'));
console.log('Installed:', localStorage.getItem('pwa-installed'));
```

**Fix:**
```javascript
// Clear flags
localStorage.removeItem('install-prompt-dismissed');
localStorage.removeItem('pwa-installed');
// Refresh page
```

### Install Button Doesn't Work

**Check DevTools Console:**
- Look for errors
- Check if `beforeinstallprompt` event fired

**Verify PWA Criteria:**
1. DevTools → Application → Manifest
2. Check "Installability" section
3. All criteria should be green ✅

### Wrong Language

**Check localStorage:**
```javascript
console.log('Language:', localStorage.getItem('language'));
```

**Set language:**
```javascript
localStorage.setItem('language', 'ar'); // or 'en', 'fr'
// Refresh page
```

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome Mobile (Android) | ✅ Full | Custom prompt + native dialog |
| Edge Mobile (Android) | ✅ Full | Same as Chrome |
| Samsung Internet | ✅ Full | Same as Chrome |
| Chrome Desktop | ✅ Full | Install icon in address bar |
| Safari iOS | ⚠️ Manual | No custom prompt, use Share → Add to Home Screen |
| Firefox Mobile | ❌ Limited | Limited PWA support |

## ✅ Success Checklist

- [ ] Prompt appears after 3 seconds on mobile
- [ ] Correct language displayed
- [ ] Features list shows 3 items
- [ ] Install button triggers native prompt
- [ ] Later button dismisses prompt
- [ ] Dismissal persists after refresh
- [ ] Prompt doesn't show after installation
- [ ] Standalone mode works after install
- [ ] Animations are smooth
- [ ] Responsive on all screen sizes

## 🎯 Expected Results

### First Visit
```
1. Page loads
2. Wait 3 seconds
3. ✅ Install prompt slides in from bottom
4. ✅ Shows branded UI with features
5. ✅ Buttons are clickable
```

### After Install
```
1. Click Install button
2. ✅ Native dialog appears
3. ✅ App installs to home screen
4. ✅ Prompt disappears
5. ✅ Refresh page → No prompt
```

### After Dismissal
```
1. Click Later button
2. ✅ Prompt disappears
3. ✅ Refresh page → No prompt
4. ✅ localStorage flag set
```

## 🔧 DevTools Simulation

Test without mobile device:

```javascript
// In browser console
const event = new Event('beforeinstallprompt');
event.prompt = () => {
  console.log('Install prompt triggered');
  return Promise.resolve();
};
event.userChoice = Promise.resolve({ outcome: 'accepted' });
window.dispatchEvent(event);
```

## 📊 Metrics to Track

- Install prompt impressions
- Install button clicks
- Install conversion rate
- Dismissal rate
- Time to install (from first visit)

## 🔗 Related Docs

- 📄 `PWA_INSTALL_PROMPT_IMPLEMENTATION.md` - Full implementation details
- 📄 `PWA_MOBILE_TESTING_GUIDE.md` - Comprehensive mobile testing
- 📄 `PWA_INSTALLATION_TESTING_GUIDE.md` - Installation testing guide

---

**Last Updated**: 2026-02-22  
**Status**: ✅ Ready for Testing
