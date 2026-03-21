# Apply Page Performance Testing

## Overview

This directory contains comprehensive performance testing for the Apply Page Enhancements feature, ensuring all performance requirements (Requirement 12) are met.

## Files

### Test Files
- `backend/tests/apply-page-performance.test.js` - Backend API performance tests
- `frontend/src/tests/apply-page-performance.test.js` - Frontend component performance tests

### Documentation
- `PERFORMANCE_TESTING_GUIDE.md` - Comprehensive testing guide
- `PERFORMANCE_TESTING_QUICK_START.md` - Quick start guide (5 minutes)
- `PERFORMANCE_TESTING_README.md` - This file

### Scripts
- `frontend/scripts/measure-performance.js` - Automated performance measurement

## Quick Start

### Run All Tests

**Backend**:
```bash
cd backend
npm run test:performance
```

**Frontend**:
```bash
cd frontend
npm run test:performance
```

### Measure Performance

```bash
cd frontend
npm run measure:performance
```

### Export Results

```bash
npm run measure:performance:export
# Results saved to: .performance-metrics/report.json
```

## Performance Requirements

| Requirement | Metric | Threshold | Status |
|-------------|--------|-----------|--------|
| 12.1 | Initial Load | < 2s | ✅ |
| 12.2 | Step Navigation | < 300ms | ✅ |
| 12.3 | Auto-Save | < 1s | ✅ |
| 12.4 | Upload Progress | Every 500ms | ✅ |
| 12.5 | Profile Fetch | < 1s | ✅ |
| 12.6 | Lazy Loading | Improved load | ✅ |
| 12.7 | Submission | < 3s | ✅ |

## Test Coverage

### Backend Tests (9 tests)
- ✅ Initial form load time
- ✅ Profile data fetch time
- ✅ Draft restore time
- ✅ Draft save time
- ✅ Draft update time
- ✅ Application submission time
- ✅ Step navigation data fetch
- ✅ Bulk operations performance
- ✅ Concurrent request handling

### Frontend Tests (8 test suites)
- ✅ Component render performance
- ✅ Auto-save debouncing
- ✅ State update performance
- ✅ Navigation transitions
- ✅ File upload progress
- ✅ Lazy loading
- ✅ Memory leak prevention
- ✅ Performance summary

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/performance-tests.yml`:

```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  backend-performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm install
      - name: Run performance tests
        run: |
          cd backend
          npm run test:performance

  frontend-performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run performance tests
        run: |
          cd frontend
          npm run test:performance
      - name: Measure performance
        run: |
          cd frontend
          npm run build
          npm run measure:performance:export
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: frontend/.performance-metrics/report.json
```

## Monitoring

### Real User Monitoring (RUM)

Add to your application:

```javascript
import { reportWebVitals } from './reportWebVitals';

reportWebVitals((metric) => {
  // Send to analytics
  console.log(metric);
  
  // Or send to backend
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
});
```

### Performance Budget

Set in `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "interactive": ["error", { "maxNumericValue": 3800 }]
      }
    }
  }
}
```

## Troubleshooting

### Tests Failing?

1. **Check thresholds**: Ensure your environment meets minimum requirements
2. **Network speed**: Run on stable, fast network
3. **Database**: Ensure MongoDB is running and responsive
4. **Resources**: Close other applications to free up resources

### Slow Performance?

1. **Bundle size**: Run `npm run measure:bundle`
2. **Network**: Check Network tab in DevTools
3. **Database**: Check MongoDB indexes
4. **Caching**: Verify caching is enabled

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)

## Support

For issues or questions:
1. Check `PERFORMANCE_TESTING_GUIDE.md` for detailed instructions
2. Review test output for specific failures
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Last Updated**: 2026-03-04
**Status**: ✅ Complete and Ready for Testing
