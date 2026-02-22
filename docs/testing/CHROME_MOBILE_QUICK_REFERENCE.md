# Chrome Mobile Testing - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Get Your Local IP
```bash
cd frontend
npm run test:mobile-helper
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Open on Mobile
- Open Chrome on your Android device
- Navigate to: `http://YOUR_IP:5173`
- Start testing!

---

## 📋 10-Minute Quick Test

### Essential Tests (Must Do)
1. **Dark Mode** (1 min)
   - Toggle dark mode
   - Check input borders stay #D4816180
   - Reload page, verify persistence

2. **Performance** (2 min)
   - Open DevTools → Lighthouse
   - Run Mobile audit
   - Check: Performance 90+, Accessibility 95+, SEO 95+

3. **PWA** (2 min)
   - Chrome Menu → "Add to Home screen"
   - Install and open
   - Enable Airplane mode
   - Verify offline pages work

4. **Animations** (1 min)
   - Navigate between pages (smooth transitions?)
   - Open/close modals (smooth animations?)
   - Scroll lists (stagger effect?)

5. **Responsive** (2 min)
   - Rotate device (portrait/landscape)
   - Check all content visible
   - Test touch targets (easy to tap?)

6. **Accessibility** (2 min)
   - Enable TalkBack
   - Navigate through app
   - Verify announcements make sense

---

## 🎯 Critical Checks

### Must Pass
- [ ] Dark mode works and persists
- [ ] Performance score 90+
- [ ] PWA installs and works offline
- [ ] No layout shifts (CLS < 0.1)
- [ ] All touch targets ≥ 44x44px
- [ ] Accessibility score 95+

### Should Pass
- [ ] Animations smooth (300ms)
- [ ] Images in WebP format
- [ ] SEO score 95+
- [ ] Error boundaries catch errors
- [ ] Loading states smooth

---

## 🔧 Chrome DevTools Shortcuts

### Open DevTools
- Desktop: `F12` or `Ctrl+Shift+I`
- Remote: `chrome://inspect` → Inspect device

### Device Emulation
- `Ctrl+Shift+M` - Toggle device mode
- Select device from dropdown

### Network Throttling
- Network tab → Throttling dropdown
- Select "Fast 3G" or "Slow 3G"

### Lighthouse Audit
- Lighthouse tab → Mobile → Generate report

---

## 📊 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| FCP | < 1.8s | < 3.0s |
| TTI | < 3.8s | < 5.0s |
| CLS | < 0.1 | < 0.25 |
| Performance Score | 90+ | 70+ |
| Accessibility Score | 95+ | 85+ |
| SEO Score | 95+ | 85+ |

---

## 🐛 Common Issues & Quick Fixes

### Issue: Slow Loading
**Check**: Network tab → Disable cache → Reload
**Fix**: Verify lazy loading, check bundle sizes

### Issue: Layout Shifts
**Check**: DevTools → Performance → Record
**Fix**: Add explicit image dimensions, use skeletons

### Issue: PWA Not Installing
**Check**: Application tab → Manifest, Service Workers
**Fix**: Verify manifest.json valid, SW registered

### Issue: Animations Janky
**Check**: Performance tab → Record interaction
**Fix**: Use only transform/opacity, reduce complexity

### Issue: Touch Targets Small
**Check**: Tap elements, check if easy to hit
**Fix**: Increase size to min 44x44px

---

## 📱 Test Devices (Emulation)

### Recommended Devices
- **Moto G4** - 360x640 (small phone)
- **iPhone SE** - 375x667 (small iPhone)
- **Pixel 5** - 393x851 (modern Android)
- **iPhone 12** - 390x844 (modern iPhone)

### Custom Dimensions
- Width: 360-430px (common range)
- Height: 640-932px (common range)

---

## 🎨 Visual Checks

### Dark Mode
- Background: #1a1a1a
- Surface: #2d2d2d
- Text: #e0e0e0
- **Input borders: #D4816180 (NEVER changes!)**

### Light Mode
- Background: #E3DAD1
- Primary: #304B60
- Accent: #D48161
- **Input borders: #D4816180 (NEVER changes!)**

---

## 📝 Quick Report Template

```
Device: [Model]
Chrome: [Version]
Date: [YYYY-MM-DD]

✅ Dark Mode: Pass
✅ Performance: 92/100
✅ PWA: Installed, offline works
✅ Animations: Smooth
⚠️ Accessibility: 93/100 (minor issues)
✅ SEO: 96/100
✅ Responsive: All sizes work

Issues:
1. [Issue description]

Overall: PASS / FAIL
```

---

## 🔗 Quick Links

- **Full Guide**: `docs/testing/CHROME_MOBILE_TESTING.md`
- **Results Template**: `docs/testing/CHROME_MOBILE_TEST_RESULTS.md`
- **Remote Debugging**: `chrome://inspect`
- **Lighthouse**: DevTools → Lighthouse tab

---

## ⚡ Speed Testing

### 1-Minute Test
```bash
# Start server
npm run dev

# On mobile: Open http://YOUR_IP:5173
# Check: Loads? Dark mode? Animations?
```

### 5-Minute Test
```bash
# Run Lighthouse
DevTools → Lighthouse → Mobile → Generate

# Check scores:
# Performance: 90+
# Accessibility: 95+
# SEO: 95+
```

### 10-Minute Test
- Follow "10-Minute Quick Test" above

---

## 🎯 Pass/Fail Criteria

### PASS ✅
- All critical checks pass
- Performance 90+
- Accessibility 95+
- SEO 95+
- No major bugs

### FAIL ❌
- Any critical check fails
- Performance < 70
- Accessibility < 85
- SEO < 85
- Major bugs found

---

## 📞 Need Help?

1. Check full guide: `docs/testing/CHROME_MOBILE_TESTING.md`
2. Run helper: `npm run test:mobile-helper`
3. Check console for errors
4. Use Chrome DevTools for debugging

---

**Remember**: Test on a real device when possible! Emulation is good, but real devices reveal real issues.
