# Performance Testing Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Run Automated Tests

**Backend Tests**:
```bash
cd backend
npm test -- apply-page-performance.test.js
```

**Frontend Tests**:
```bash
cd frontend
npm test -- apply-page-performance.test.js
```

**Expected**: ✅ All tests pass

### 2. Manual Quick Check

**Open Application Form**:
1. Navigate to any job posting
2. Click "Apply Now"
3. Open Chrome DevTools (F12)
4. Go to Network tab

**Check Load Time**:
```javascript
// In browser console
performance.timing.loadEventEnd - performance.timing.navigationStart
// Should be < 2000ms
```

**Check Auto-Save**:
1. Type in any field
2. Wait 3 seconds
3. Check Network tab for POST to `/api/applications/drafts`
4. Duration should be < 1000ms

**Check Navigation**:
1. Click "Next" button
2. Transition should be < 300ms
3. No layout shifts

### 3. Run Lighthouse

```bash
lighthouse http://localhost:3000/apply --view
```

**Target Scores**:
- Performance: 90+
- Accessibility: 95+

## 📊 Performance Thresholds

| Metric | Threshold | Requirement |
|--------|-----------|-------------|
| Initial Load | < 2s | 12.1 |
| Step Navigation | < 300ms | 12.2 |
| Auto-Save | < 1s | 12.3 |
| Upload Progress | Every 500ms | 12.4 |
| Profile Fetch | < 1s | 12.5 |
| Submission | < 3s | 12.7 |

## ✅ Success Criteria

- All automated tests pass
- All manual checks meet thresholds
- Lighthouse score > 90
- No console errors

## 🔧 Quick Fixes

**Slow Load?**
- Check bundle size: `npm run measure:bundle`
- Enable lazy loading
- Optimize images

**Slow Save?**
- Check network throttling
- Verify debounce (3 seconds)
- Check database indexes

**Slow Navigation?**
- Reduce animation duration
- Use CSS transforms only
- Check for layout shifts

## 📚 Full Documentation

See `PERFORMANCE_TESTING_GUIDE.md` for comprehensive testing instructions.

---

**Last Updated**: 2026-03-04
