# Offline Indicator - Quick Test Guide

## 🚀 Quick Start

The offline indicator is now live and automatically shows when you lose internet connection!

## 📋 How to Test (5 minutes)

### Method 1: Chrome DevTools (Recommended)

1. **Open the app** in Chrome
2. **Press F12** to open DevTools
3. **Go to Network tab**
4. **Click "Online" dropdown** → Select "Offline"
5. **See the red banner** appear at the top! 🔴
6. **Click "Online" dropdown** → Select "Online"
7. **See the green banner** appear! 🟢
8. **Wait 5 seconds** - banner auto-hides

### Method 2: Airplane Mode (Mobile)

1. **Open the app** on your phone
2. **Enable Airplane Mode**
3. **See the red banner** appear! 🔴
4. **Disable Airplane Mode**
5. **See the green banner** appear! 🟢

### Method 3: Disconnect WiFi (Desktop)

1. **Open the app**
2. **Disconnect WiFi** from system tray
3. **See the red banner** appear! 🔴
4. **Reconnect WiFi**
5. **See the green banner** appear! 🟢

## 🎨 What You'll See

### When Offline (Red Banner)
```
┌─────────────────────────────────────────────┐
│ 🔴 أنت غير متصل بالإنترنت                   │
│    بعض الميزات قد لا تكون متاحة             │
└─────────────────────────────────────────────┘
```

### When Reconnected (Green Banner)
```
┌─────────────────────────────────────────────┐
│ ✅ تم استعادة الاتصال              [X]     │
│    أنت الآن متصل بالإنترنت                  │
└─────────────────────────────────────────────┘
```

## 🌍 Test All Languages

1. **Arabic** (default):
   - "أنت غير متصل بالإنترنت"
   - "تم استعادة الاتصال"

2. **English**:
   - Change language to English
   - Go offline: "You are offline"
   - Go online: "Connection restored"

3. **French**:
   - Change language to French
   - Go offline: "Vous êtes hors ligne"
   - Go online: "Connexion rétablie"

## 📱 Test Responsive Design

### Desktop (1920px)
- Banner spans full width
- Text is 16px/14px
- Icon is 24px

### Tablet (768px)
- Banner spans full width
- Text is 16px/14px
- Icon is 24px

### Mobile (375px)
- Banner spans full width
- Text is 14px/12px
- Icon is 20px

### Small Mobile (320px)
- Banner spans full width
- Text is 13px/11px
- Icon is 20px

## ♿ Test Accessibility

### Screen Reader Test
1. **Enable screen reader** (NVDA/VoiceOver)
2. **Go offline**
3. **Hear**: "Alert: You are offline. Some features may not be available."
4. **Go online**
5. **Hear**: "Status: Connection restored. You are now online."

### Keyboard Navigation Test
1. **Go offline then online** (green banner appears)
2. **Press Tab** until close button is focused
3. **Press Enter or Space** to close
4. **Verify** banner closes

### High Contrast Test
1. **Enable high contrast mode** (Windows: Alt+Shift+PrtScn)
2. **Go offline**
3. **Verify** text is readable with high contrast
4. **Verify** borders are visible

## 🎯 Expected Behavior

### ✅ Correct Behavior
- Red banner appears immediately when offline
- Green banner appears immediately when reconnected
- Green banner auto-hides after 5 seconds
- Close button (X) closes green banner immediately
- Banner stays at top when scrolling
- Banner shows in all languages
- Banner works on all screen sizes
- Banner is accessible with keyboard
- Banner announces to screen readers

### ❌ Incorrect Behavior
- Banner doesn't appear when offline
- Banner doesn't disappear when online
- Banner blocks content permanently
- Banner doesn't support RTL
- Banner has low contrast
- Banner is not keyboard accessible

## 🐛 Troubleshooting

### Banner not showing?
1. Check browser console for errors
2. Verify OfflineProvider is in ApplicationShell
3. Clear browser cache and reload
4. Try different browser

### Banner showing when online?
1. Check actual internet connection
2. Try accessing a website
3. Restart browser
4. Check VPN/proxy settings

### Translations not working?
1. Check localStorage for 'selectedLanguage'
2. Clear localStorage and reload
3. Manually set language in settings

## 📊 Test Checklist

- [ ] Red banner appears when offline
- [ ] Green banner appears when reconnected
- [ ] Green banner auto-hides after 5 seconds
- [ ] Close button works
- [ ] Works in Arabic
- [ ] Works in English
- [ ] Works in French
- [ ] Works on desktop (1920px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Works on small mobile (320px)
- [ ] RTL works in Arabic
- [ ] LTR works in English/French
- [ ] Screen reader announces status
- [ ] Keyboard navigation works
- [ ] High contrast mode works
- [ ] Dark mode works
- [ ] Banner stays at top when scrolling
- [ ] Banner doesn't block content
- [ ] Banner has smooth animation
- [ ] Banner respects reduced motion

## 🎉 Success Criteria

All checkboxes above should be checked! ✅

## 📞 Need Help?

If you encounter any issues:
1. Check `docs/OFFLINE_INDICATOR.md` for detailed documentation
2. Check browser console for errors
3. Verify all files are in place:
   - `frontend/src/components/OfflineIndicator.jsx`
   - `frontend/src/components/OfflineIndicator.css`
   - `frontend/src/components/ApplicationShell.jsx` (updated)
   - `frontend/src/context/OfflineContext.jsx`

## 🚀 Next Steps

After testing, you can:
1. Implement task 3.4.3: Queue failed API requests when offline
2. Implement task 3.4.4: Retry queued requests when online
3. Implement task 3.4.5: Test offline functionality for key features

---

**Happy Testing!** 🎊
