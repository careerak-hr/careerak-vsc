# Layout Shift Verification - Quick Reference Card

## 🎯 Target: CLS < 0.1

---

## 🚀 Quick Start (Browser Console)

```javascript
// 1. Initialize
window.initVerification();

// 2. Run full verification
window.verifyLayoutShifts();

// 3. Generate report
window.generateVerificationReport();
```

---

## 📊 Quick Tests

### Test Current Page
```javascript
window.testPageCLS('CurrentPage');
```

### Test Specific Component
```javascript
window.testComponentCLS('ComponentName', async () => {
  // Trigger component loading
  document.querySelector('.load-button').click();
});
```

### Check Skeleton Match
```javascript
window.checkSkeletonMatch('.skeleton-card', '.actual-card');
```

### Measure Operation
```javascript
window.measureOperation('DataFetch', async () => {
  await fetchData();
});
```

---

## 🔍 Chrome DevTools Method

1. **F12** → Performance tab
2. Enable **"Screenshots"** and **"Web Vitals"**
3. Click **Record** → Reload page → **Stop**
4. Look for red **"Layout Shift"** markers
5. Verify **CLS < 0.1** in Experience section

---

## 🏃 Lighthouse Quick Audit

1. **F12** → Lighthouse tab
2. Select **"Performance"** only
3. Click **"Analyze page load"**
4. Check **CLS score** (should be green)
5. Review **"Avoid large layout shifts"**

---

## ✅ Quick Checklist

### Page Load
- [ ] CLS < 0.1 ✅
- [ ] No visible jumps ✅
- [ ] Skeleton matches content ✅
- [ ] Images use placeholders ✅

### Loading States
- [ ] Skeleton dimensions correct ✅
- [ ] Reserved space with min-height ✅
- [ ] Smooth transitions (200ms) ✅
- [ ] No shifts during data fetch ✅

### Components
- [ ] Buttons maintain size when loading ✅
- [ ] Modals don't shift background ✅
- [ ] Lists load without shifts ✅
- [ ] Forms stable during submission ✅

---

## 🐛 Common Issues

### Issue: Skeleton doesn't match
```css
.skeleton-card {
  min-height: 200px; /* Match actual height */
}
```

### Issue: Images cause shifts
```jsx
<div style={{ aspectRatio: '16/9' }}>
  <img src={src} alt={alt} />
</div>
```

### Issue: Dynamic content shifts
```css
.container {
  min-height: 500px; /* Reserve space */
}
```

### Issue: Animations shift layout
```css
/* ✅ Use transform, not position */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 📈 CLS Ratings

| Rating | CLS Value | Status |
|--------|-----------|--------|
| ✅ Good | < 0.1 | PASS |
| ⚠️ Needs Improvement | 0.1 - 0.25 | WARNING |
| ❌ Poor | ≥ 0.25 | FAIL |

---

## 🛠️ Testing Tools

1. **Web Vitals Extension** - Real-time CLS
2. **Chrome DevTools** - Detailed shift analysis
3. **Lighthouse** - Overall performance audit
4. **Custom Utility** - `window.verifyLayoutShifts()`

---

## 📝 Report Template

```markdown
## CLS Verification - [Page Name]

**Date:** [Date]
**CLS Score:** 0.XXX
**Status:** ✅ PASSED / ❌ FAILED

### Issues Found:
1. [Issue description]
   - CLS Impact: 0.XXX
   - Fix: [Solution]

### Recommendations:
- [Recommendation 1]
- [Recommendation 2]
```

---

## 🎓 Best Practices

1. ✅ Reserve space with `min-height`
2. ✅ Match skeleton to content dimensions
3. ✅ Use `aspect-ratio` for images
4. ✅ Coordinate multiple loading states
5. ✅ Use `transform` and `opacity` for animations
6. ✅ Set explicit dimensions on images
7. ✅ Test on slow networks (3G)
8. ✅ Monitor CLS in production

---

## 🔗 Quick Links

- [Full Verification Guide](./LAYOUT_SHIFT_VERIFICATION_GUIDE.md)
- [CLS Measurement Utility](../utils/clsLoadingMeasurement.js)
- [Verification Script](../utils/layoutShiftVerification.js)
- [Web Vitals - CLS](https://web.dev/cls/)

---

## 💡 Pro Tips

- Test on **slow 3G** network
- Check **mobile devices** separately
- Verify **RTL layout** for Arabic
- Test **error states** and **empty states**
- Monitor **real user CLS** in production

---

**Last Updated:** 2026-02-21  
**Task:** 8.6.7 - Verify no layout shifts occur
