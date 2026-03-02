# Edge Browser Testing - Quick Start Guide

## Prerequisites

1. **Install Microsoft Edge** (if not already installed)
   - Download from: https://www.microsoft.com/edge
   - Or update existing Edge: `edge://settings/help`

2. **Check Edge Version**
   - Open Edge
   - Go to `edge://version`
   - Verify you have version 130.x or 131.x

3. **Start Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

## Quick Testing Steps (5 minutes)

### 1. Basic Functionality (2 min)
1. Open Edge and navigate to `http://localhost:5173`
2. Test language selection
3. Test login/registration
4. Navigate through main pages
5. Check console for errors (F12)

### 2. Dark Mode (1 min)
1. Toggle dark mode from settings/navigation
2. Verify smooth transition (300ms)
3. Reload page - verify persistence
4. Check input borders are #D4816180

### 3. Performance (1 min)
1. Open DevTools (F12) > Network tab
2. Reload page
3. Verify:
   - WebP images loading
   - Code chunks split
   - Resources cached
4. Check Performance tab - no long tasks

### 4. PWA (1 min)
1. Open DevTools > Application tab
2. Check Service Workers section
3. Verify SW registered and active
4. Test offline: Network tab > Offline > Reload
5. Verify cached page loads

## Detailed Testing (15 minutes)

### Test All Pages
```
✓ Language selection
✓ Entry page
✓ Login page
✓ Registration (AuthPage)
✓ Profile page
✓ Job postings
✓ Courses
✓ Settings
✓ Admin dashboard
```

### Test All Features
```
✓ Dark mode toggle
✓ Page transitions
✓ Modal animations
✓ Form submissions
✓ Image lazy loading
✓ Error boundaries
✓ Loading states
✓ Keyboard navigation
```

### Run Lighthouse Audit
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select:
   - ✓ Performance
   - ✓ Accessibility
   - ✓ Best Practices
   - ✓ SEO
   - ✓ Progressive Web App
4. Click "Analyze page load"
5. Verify scores:
   - Performance: 90+
   - Accessibility: 95+
   - SEO: 95+
   - PWA: Installable

## Edge-Specific Tests

### 1. Service Worker
```
edge://serviceworker-internals
```
- Verify SW registered
- Check status: Active

### 2. PWA Install
```
edge://apps
```
- Check if app is installable
- Test install process
- Verify standalone mode

### 3. Notifications
1. Allow notifications when prompted
2. Test push notifications
3. Verify notification actions work

### 4. Narrator (Screen Reader)
1. Press `Win + Ctrl + Enter` to start Narrator
2. Navigate with Tab key
3. Verify ARIA labels read correctly
4. Test focus management

## Common Issues & Solutions

### Issue: Service Worker not registering
**Solution**: 
- Check console for errors
- Verify HTTPS or localhost
- Clear cache and reload

### Issue: WebP images not loading
**Solution**:
- Edge supports WebP natively
- Check Network tab for 404s
- Verify Cloudinary URLs

### Issue: Dark mode not persisting
**Solution**:
- Check localStorage in DevTools
- Verify key: 'careerak-theme'
- Check for console errors

### Issue: Animations stuttering
**Solution**:
- Check Performance tab
- Verify GPU acceleration
- Test with reduced motion

## Testing Checklist

### Must Test
- [ ] Dark mode works
- [ ] Page loads under 3s
- [ ] Service Worker active
- [ ] No console errors
- [ ] Keyboard navigation works
- [ ] Forms submit correctly
- [ ] Images load properly
- [ ] Offline mode works

### Should Test
- [ ] All pages render correctly
- [ ] All animations smooth
- [ ] PWA installable
- [ ] Lighthouse scores good
- [ ] Responsive on different sizes
- [ ] RTL layout works

### Nice to Test
- [ ] Narrator compatibility
- [ ] Touch events (if touch device)
- [ ] Print styles
- [ ] Copy/paste functionality

## Quick Commands

### Open DevTools
```
F12 or Ctrl+Shift+I
```

### Reload (Clear Cache)
```
Ctrl+Shift+R or Ctrl+F5
```

### Open Console
```
Ctrl+Shift+J
```

### Inspect Element
```
Ctrl+Shift+C
```

### Toggle Device Toolbar
```
Ctrl+Shift+M
```

## Expected Results

### ✅ All Should Work
- Dark mode toggle
- Page transitions
- Lazy loading
- Service Worker
- PWA install
- Offline mode
- Keyboard navigation
- Screen reader
- All animations
- All forms

### ⚠️ Known Differences
- Install experience slightly different from Chrome
- Notification UI may look different
- Some Windows-specific features

## Reporting Issues

If you find any issues:

1. **Document**:
   - Edge version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors
   - Screenshots

2. **Check**:
   - Does it work in Chrome?
   - Is it Edge-specific?
   - Is it a known issue?

3. **Report**:
   - Add to EDGE_BROWSER_TESTING.md
   - Create issue if critical
   - Document workaround if found

## Success Criteria

✅ **Testing Complete When**:
- All pages load without errors
- Dark mode works correctly
- Performance is good (Lighthouse 90+)
- PWA features work
- Accessibility features work
- No critical bugs found

## Time Estimate

- Quick test: 5 minutes
- Detailed test: 15 minutes
- Full test with Lighthouse: 30 minutes

## Next Steps

After Edge testing:
1. Mark task 9.2.4 complete
2. Continue with Chrome Mobile (9.2.5)
3. Continue with iOS Safari (9.2.6)

---

**Quick Start Guide**  
**Last Updated**: 2026-02-21
