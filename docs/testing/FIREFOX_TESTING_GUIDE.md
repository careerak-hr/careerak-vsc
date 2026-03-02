# Firefox Testing Guide - Quick Reference

## Prerequisites
- Firefox 133.x (Latest) installed
- Firefox 132.x (Previous) installed
- Platform running locally or on staging

## Quick Test (15 minutes)

### 1. Dark Mode (2 min)
```
✓ Toggle dark mode in settings
✓ Verify colors change within 300ms
✓ Refresh page - theme persists
✓ Check input borders remain #D4816180
```

### 2. Performance (3 min)
```
✓ Open DevTools > Network tab
✓ Hard refresh (Ctrl+Shift+R)
✓ Verify routes lazy load
✓ Check bundle sizes < 200KB
✓ Verify WebP images load
```

### 3. PWA (2 min)
```
✓ Open DevTools > Application > Service Workers
✓ Verify service worker registered
✓ Toggle offline mode
✓ Navigate to visited page - works offline
✓ Navigate to new page - offline fallback shown
```

### 4. Animations (2 min)
```
✓ Navigate between pages - smooth transitions
✓ Open modal - scale and fade animation
✓ Hover over buttons - scale effect
✓ Check list items - stagger animation
```

### 5. Accessibility (3 min)
```
✓ Press Tab - focus indicators visible
✓ Navigate with keyboard only
✓ Open modal - press Escape to close
✓ Check ARIA labels in inspector
✓ Test with screen reader (optional)
```

### 6. SEO (2 min)
```
✓ View page source
✓ Verify unique title tag
✓ Verify meta description
✓ Check Open Graph tags
✓ Verify JSON-LD structured data
```

### 7. Error Handling (1 min)
```
✓ Navigate to /nonexistent - 404 page shown
✓ Trigger error (if test available)
✓ Verify error boundary catches it
✓ Click Retry button - works
```

## Comprehensive Test (1 hour)

### Setup
1. Install Firefox 133 and 132
2. Open both browsers side by side
3. Navigate to platform in both
4. Open DevTools in both

### Test Matrix

#### Dark Mode
- [ ] Toggle in settings
- [ ] Verify 300ms transition
- [ ] Check localStorage persistence
- [ ] Test system preference detection
- [ ] Verify all colors correct
- [ ] Check input borders constant
- [ ] Test on all pages

#### Performance
- [ ] Measure FCP < 1.8s
- [ ] Measure TTI < 3.8s
- [ ] Verify CLS < 0.1
- [ ] Check lazy loading
- [ ] Verify code splitting
- [ ] Test image optimization
- [ ] Check caching (30 days)
- [ ] Test preloading

#### PWA
- [ ] Service worker registers
- [ ] Offline pages work
- [ ] Offline fallback shown
- [ ] Update notification works
- [ ] Cache strategies correct
- [ ] Request queuing works
- [ ] Push notifications work

#### Animations
- [ ] Page transitions smooth
- [ ] Modal animations 200-300ms
- [ ] List stagger 50ms delay
- [ ] Hover effects work
- [ ] Loading animations smooth
- [ ] prefers-reduced-motion respected
- [ ] No jank or stuttering

#### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Focus trap in modals
- [ ] Escape closes modals
- [ ] Semantic HTML used
- [ ] Skip links work
- [ ] Color contrast 4.5:1
- [ ] Alt text on images
- [ ] Screen reader compatible

#### SEO
- [ ] Unique titles (50-60 chars)
- [ ] Unique descriptions (150-160 chars)
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] JSON-LD structured data
- [ ] sitemap.xml valid
- [ ] robots.txt correct
- [ ] Canonical URLs set
- [ ] Heading hierarchy proper

#### Error Boundaries
- [ ] Component errors caught
- [ ] Error messages shown
- [ ] Errors logged
- [ ] Retry button works
- [ ] Go Home button works
- [ ] Route-level errors
- [ ] Component-level errors
- [ ] Network errors
- [ ] 404 page shown

#### Loading States
- [ ] Skeleton loaders match
- [ ] Progress bar shown
- [ ] Button spinners work
- [ ] Overlay spinners work
- [ ] List skeletons shown
- [ ] Image placeholders shown
- [ ] Smooth transitions
- [ ] No layout shifts

#### Responsive Design
- [ ] 320px (Mobile)
- [ ] 375px (Mobile)
- [ ] 768px (Tablet)
- [ ] 1024px (Desktop)
- [ ] 1920px (Desktop)

#### RTL/LTR
- [ ] Arabic (RTL)
- [ ] English (LTR)
- [ ] French (LTR)
- [ ] Language switching

## Lighthouse Audit

### Run Audit
1. Open DevTools
2. Go to Lighthouse tab
3. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
   - PWA
4. Click "Analyze page load"

### Target Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+
- PWA: 80+ (Firefox limitation)

## Common Issues & Solutions

### Issue: Service Worker Not Registering
**Solution**: Check HTTPS, clear cache, hard refresh

### Issue: Dark Mode Not Persisting
**Solution**: Check localStorage, verify ThemeContext

### Issue: Animations Stuttering
**Solution**: Check GPU acceleration, reduce motion complexity

### Issue: Images Not Lazy Loading
**Solution**: Verify IntersectionObserver support, check LazyImage component

### Issue: PWA Not Installable
**Solution**: Firefox mobile has limited PWA support - this is expected

## Firefox DevTools Tips

### Performance Tab
- Record page load
- Check FCP, TTI, CLS
- Identify bottlenecks

### Network Tab
- Filter by type (JS, CSS, Images)
- Check cache headers
- Verify lazy loading

### Application Tab
- Check Service Workers
- Inspect localStorage
- View Cache Storage

### Console Tab
- Check for errors
- Verify logging
- Test error boundaries

## Reporting Issues

### Issue Template
```
**Browser**: Firefox 133.x / 132.x
**OS**: Windows / macOS / Linux
**Feature**: [Dark Mode / Performance / etc.]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3
**Screenshots**: [If applicable]
**Console Errors**: [If any]
```

## Automated Testing

### Run Tests
```bash
cd frontend
npm test -- --run
```

### Run Lighthouse CI
```bash
npm run audit:seo
```

### Check Contrast
```bash
npm run check:contrast
```

## Sign-Off Checklist

- [ ] All critical features tested on Firefox 133
- [ ] All critical features tested on Firefox 132
- [ ] Lighthouse scores meet targets
- [ ] No console errors
- [ ] Responsive design works
- [ ] RTL/LTR works
- [ ] Accessibility verified
- [ ] Performance verified
- [ ] PWA functionality verified
- [ ] Documentation updated

## Next Steps

1. Complete testing on both Firefox versions
2. Document any issues found
3. Create bug reports if needed
4. Update FIREFOX_TESTING_REPORT.md
5. Mark task as complete
6. Move to next browser (Safari)

---

**Last Updated**: 2026-02-21  
**Maintained By**: Development Team
