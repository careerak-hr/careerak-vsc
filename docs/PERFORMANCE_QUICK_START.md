# Performance Measurement - Quick Start

## 🚀 Quick Commands

### View Performance Report
```javascript
printPerformanceReport()
```

### Save Baseline
```javascript
savePerformanceBaseline()
```

### Get Raw Data
```javascript
getPerformanceReport()
```

## 📊 Metrics Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **FCP** | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTI** | < 3.8s | 3.8s - 7.3s | > 7.3s |
| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **TTFB** | < 800ms | 800ms - 1800ms | > 1800ms |

## 🎯 Measuring Improvements

### Step 1: Before Optimizations
```javascript
// Save baseline
savePerformanceBaseline()
```

### Step 2: After Optimizations
```javascript
// View improvements
printPerformanceReport()
```

## 📈 Expected Results

After implementing tasks 2.1-2.5:

- **FCP**: 40-50% improvement (2000ms → 1200-1500ms)
- **TTI**: 40-50% improvement (4500ms → 2500-3500ms)
- **Bundle Size**: 40-60% reduction (1.5MB → 600-900KB)

## 🔧 Testing

### Local Testing
```bash
npm run build
npm run preview
# Open console: printPerformanceReport()
```

### Network Throttling
1. Chrome DevTools → Network tab
2. Select "Slow 3G" or "Fast 3G"
3. Reload page
4. Check metrics

### Lighthouse
```bash
lighthouse http://localhost:3000 --view
```

## 💡 Tips

- ✅ Test in production mode
- ✅ Clear cache between tests
- ✅ Take 3-5 measurements
- ✅ Use median values
- ✅ Test on real devices

## 🐛 Troubleshooting

**No metrics showing?**
- Refresh the page
- Check console for errors
- Ensure web-vitals is installed

**Metrics vary?**
- Normal behavior
- Take multiple measurements
- Use median value

**TTI shows "estimated"?**
- Normal fallback
- Long Tasks API not available
- Still accurate

## 📚 Full Documentation

See [PERFORMANCE_MEASUREMENT_GUIDE.md](./PERFORMANCE_MEASUREMENT_GUIDE.md) for complete documentation.

---

**Quick Reference**: Open console → `printPerformanceReport()` → Done! 🎉
