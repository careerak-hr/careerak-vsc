# PWA Installability with Custom Splash Screen

## Overview

Careerak is fully installable as a Progressive Web App (PWA) with a custom splash screen that provides a native app-like experience. This document describes the implementation and configuration.

## Implementation Status

✅ **COMPLETE** - PWA is fully installable with custom splash screen

**Date Completed**: 2026-02-22  
**Requirements**: FR-PWA-5, FR-PWA-4  
**Test Coverage**: 35 tests passing

## Features

### 1. PWA Installability
- ✅ Meets all PWA installability criteria
- ✅ Install prompt shown on mobile devices
- ✅ Standalone app experience
- ✅ Works offline with service worker
- ✅ Custom splash screen with brand colors

### 2. Custom Splash Screen
- ✅ Theme color: #304B60 (Primary - Dark Blue)
- ✅ Background color: #E3DAD1 (Secondary - Light Beige)
- ✅ High-quality icons (192x192, 512x512)
- ✅ Maskable icons for Android adaptive icons
- ✅ Proper contrast for visibility

### 3. Install Prompt
- ✅ Automatic install prompt on mobile
- ✅ User-friendly UI with benefits list
- ✅ Multi-language support (ar, en, fr)
- ✅ Dismissible with 7-day cooldown
- ✅ Remembers user preference

## Configuration

### Manifest.json

Location: `frontend/public/manifest.json`

```json
{
  "short_name": "Careerak",
  "name": "Careerak - The Future of HR",
  "description": "Comprehensive platform for HR, recruitment, and career development",
  "icons": [
    {
      "src": "icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    },
    {
      "src": "icon-192x192-maskable.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "icon-512x512-maskable.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    }
  ],
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#304B60",
  "background_color": "#E3DAD1",
  "lang": "ar",
  "dir": "rtl"
}
```

### Key Fields Explained

#### Required for Installability
- **name**: Full app name shown during install
- **short_name**: Name shown on home screen (max 12 chars)
- **start_url**: URL to open when app launches
- **display**: "standalone" for native app feel
- **icons**: At least 192x192 and 512x512 PNG icons

#### Splash Screen Configuration
- **theme_color**: Color of status bar and splash screen header
- **background_color**: Background color of splash screen
- **icons**: Largest icon (512x512) used for splash screen logo

#### Additional Features
- **orientation**: Preferred screen orientation
- **lang**: Primary language (ar for Arabic)
- **dir**: Text direction (rtl for Arabic)
- **shortcuts**: Quick actions from home screen icon
- **categories**: App store categories

## Icon Requirements

### Standard Icons
- **192x192**: Required for PWA installability
- **512x512**: Required for PWA installability and splash screen

### Maskable Icons
- **Purpose**: Adaptive icons for Android
- **Safe Zone**: 80% of icon area (40px margin on 192x192)
- **Format**: PNG with transparency
- **Content**: Logo centered in safe zone

### Icon Files
```
frontend/public/
├── icon-192x192.png          # Standard 192x192
├── icon-512x512.png          # Standard 512x512
├── icon-192x192-maskable.png # Maskable 192x192
├── icon-512x512-maskable.png # Maskable 512x512
└── favicon.ico               # Browser favicon
```

## Splash Screen Behavior

### Android
1. Shows immediately when app launches
2. Displays largest icon (512x512) centered
3. Background color fills screen
4. Theme color for status bar
5. App name shown below icon
6. Fades out when app is ready

### iOS
1. Uses apple-touch-icon for splash
2. Background color from manifest
3. Simpler splash screen (icon only)
4. Requires Add to Home Screen

### Desktop (Chrome/Edge)
1. Shows during app launch
2. Similar to Android behavior
3. Larger splash screen on bigger displays

## Install Prompt

### ServiceWorkerManager Component

Location: `frontend/src/components/ServiceWorkerManager.jsx`

The component handles:
- Detecting `beforeinstallprompt` event
- Showing custom install UI
- Handling user acceptance/dismissal
- Remembering user preference
- Multi-language support

### Install Prompt UI

Features:
- **Title**: "Install App" (localized)
- **Message**: Benefits of installing
- **Benefits List**:
  - Quick access from home screen
  - Works offline
  - Native app experience
- **Actions**: Install button, Later button
- **Styling**: Matches app theme

### User Flow

1. User visits site on mobile
2. Browser fires `beforeinstallprompt` event
3. App shows custom install prompt after 3 seconds
4. User can:
   - Click "Install" → Browser shows native prompt
   - Click "Later" → Prompt dismissed for 7 days
   - Close (X) → Prompt dismissed for 7 days
5. If installed, prompt never shows again

## Service Worker Integration

### Registration

Location: `frontend/src/index.jsx`

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered');
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

### Caching Strategy

The service worker caches:
- App shell (HTML, CSS, JS)
- Static assets (images, fonts)
- API responses (with NetworkFirst)
- Offline fallback page

This ensures the app works offline after first visit.

## Testing

### Automated Tests

Location: `frontend/tests/pwa-installability.test.js`

**35 tests covering**:
- Manifest configuration (7 tests)
- Icon requirements (7 tests)
- Service worker (2 tests)
- Splash screen configuration (4 tests)
- PWA metadata (4 tests)
- HTML configuration (4 tests)
- Installability criteria (3 tests)
- Splash screen visuals (2 tests)
- Offline support (2 tests)

Run tests:
```bash
cd frontend
npm test -- pwa-installability.test.js --run
```

### Manual Testing

#### Desktop (Chrome/Edge)
1. Open DevTools → Application → Manifest
2. Verify all fields are correct
3. Click "Add to Home Screen" in browser menu
4. Verify install prompt appears
5. Install and verify splash screen
6. Verify app opens in standalone window

#### Mobile (Android)
1. Open site in Chrome
2. Wait for install prompt (or use menu)
3. Tap "Install"
4. Verify splash screen shows with:
   - Correct background color
   - Correct icon
   - App name
5. Verify app opens in standalone mode
6. Verify icon on home screen

#### Mobile (iOS)
1. Open site in Safari
2. Tap Share → Add to Home Screen
3. Verify icon preview
4. Add to home screen
5. Tap icon to launch
6. Verify splash screen (simpler on iOS)
7. Verify standalone mode

### Lighthouse Audit

Run Lighthouse PWA audit:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://careerak.com --view --preset=pwa
```

**Expected Scores**:
- PWA: 100/100
- Installable: ✅
- Works offline: ✅
- Configured for custom splash screen: ✅

## Browser Support

### Full Support
- ✅ Chrome 73+ (Android, Desktop)
- ✅ Edge 79+ (Desktop)
- ✅ Samsung Internet 11+
- ✅ Opera 60+

### Partial Support
- ⚠️ Safari 11.1+ (iOS) - Requires Add to Home Screen
- ⚠️ Firefox 79+ - Install prompt not automatic

### Not Supported
- ❌ Internet Explorer
- ❌ Safari < 11.1

## Troubleshooting

### Install Prompt Not Showing

**Possible Causes**:
1. User already dismissed prompt
2. App already installed
3. Not on HTTPS (required)
4. Manifest not valid
5. Service worker not registered

**Solutions**:
1. Clear localStorage: `localStorage.removeItem('install-prompt-dismissed')`
2. Uninstall app and revisit
3. Ensure HTTPS in production
4. Validate manifest in DevTools
5. Check service worker registration

### Splash Screen Not Showing

**Possible Causes**:
1. Icons missing or wrong size
2. Theme/background colors not set
3. App not installed (just bookmarked)
4. Browser doesn't support splash screens

**Solutions**:
1. Verify all icon files exist
2. Check manifest theme_color and background_color
3. Ensure app is installed, not bookmarked
4. Test on supported browser

### Wrong Colors on Splash Screen

**Issue**: Splash screen colors don't match design

**Solution**:
1. Update `theme_color` in manifest.json
2. Update `background_color` in manifest.json
3. Clear browser cache
4. Uninstall and reinstall app

### Icon Not Showing Correctly

**Issue**: Icon appears cropped or with wrong background

**Solution**:
1. Ensure maskable icons have proper safe zone
2. Check icon dimensions (exactly 192x192 or 512x512)
3. Verify PNG format with transparency
4. Test with different icon purposes (any vs maskable)

## Best Practices

### Icon Design
1. Use simple, recognizable logo
2. Ensure visibility on both light and dark backgrounds
3. Center important content in safe zone (80%)
4. Test on different devices and themes
5. Provide both standard and maskable versions

### Color Selection
1. Use brand colors for consistency
2. Ensure good contrast (theme vs background)
3. Test on different screen brightnesses
4. Consider dark mode users
5. Match app's primary colors

### User Experience
1. Don't show install prompt immediately
2. Explain benefits of installing
3. Allow easy dismissal
4. Remember user preference
5. Don't nag users repeatedly

### Performance
1. Optimize icon file sizes
2. Use WebP for icons if supported
3. Lazy load service worker registration
4. Cache splash screen assets
5. Minimize splash screen duration

## Maintenance

### Updating Icons
1. Replace icon files in `frontend/public/`
2. Keep same filenames and sizes
3. Clear browser cache
4. Test on all devices
5. Update manifest if needed

### Changing Colors
1. Update `theme_color` in manifest.json
2. Update `background_color` in manifest.json
3. Update theme-color meta tag in index.html
4. Test splash screen appearance
5. Verify contrast ratios

### Adding Shortcuts
1. Add to `shortcuts` array in manifest.json
2. Provide name, url, and icons
3. Test on Android (long-press icon)
4. Limit to 4-5 most important actions
5. Use descriptive names

## Resources

### Documentation
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)

### Tools
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Maskable Icon Editor](https://maskable.app/editor)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Testing
- Chrome DevTools → Application → Manifest
- Chrome DevTools → Application → Service Workers
- Lighthouse PWA Audit
- [PWA Testing Tool](https://www.pwabuilder.com/test)

## Acceptance Criteria

✅ **All criteria met**:

1. ✅ PWA is installable on mobile devices
2. ✅ Install prompt is shown to users
3. ✅ Custom splash screen with brand colors
4. ✅ Splash screen shows app icon and name
5. ✅ App opens in standalone mode
6. ✅ Works offline after installation
7. ✅ Proper icons for all devices
8. ✅ Maskable icons for Android
9. ✅ Multi-language support
10. ✅ Remembers user preferences

## Related Documentation

- [PWA Support Implementation](./PWA_SUPPORT_IMPLEMENTATION.md)
- [Service Worker Guide](./SERVICE_WORKER_GUIDE.md)
- [Offline Functionality](./OFFLINE_FUNCTIONALITY.md)
- [Push Notifications](./PWA_PUSHER_INTEGRATION.md)

## Changelog

### 2026-02-22
- ✅ Verified PWA installability
- ✅ Confirmed splash screen configuration
- ✅ Added comprehensive tests (35 tests)
- ✅ Created documentation
- ✅ Validated on multiple devices

### Previous
- Manifest.json created with all required fields
- Icons generated (192x192, 512x512, maskable)
- Service worker implemented
- ServiceWorkerManager component created
- Install prompt UI implemented
