# Bundle Size Monitoring - Quick Start Guide

**⏱️ Time to Complete**: 5 minutes  
**📋 Prerequisites**: Node.js 18+, Built project

---

## 🚀 Quick Start (3 Steps)

### Step 1: Build the Project (1 minute)

```bash
cd frontend
npm run build
```

### Step 2: Run Monitoring (30 seconds)

```bash
npm run monitor:bundle
```

### Step 3: Review Results (1 minute)

```
📊 Bundle Size Monitoring Report

=== Current Build ===

Total JS:      892 KB (gzip: 312 KB)
Total CSS:     98 KB (gzip: 24 KB)
Largest chunk: 187 KB (index-abc123.js)

=== Threshold Checks ===

✓ Chunk size limit (200 KB): 187 KB
✓ Total JS limit (1 MB): 892 KB
✓ Total CSS limit (150 KB): 98 KB

✓ No alerts - all thresholds met!
```

**✅ Done!** Your bundle sizes are being monitored.

---

## 📊 Understanding the Output

### Key Metrics

**Total JS**: All JavaScript files combined
- **Target**: < 1 MB
- **Current**: 892 KB ✅

**Largest Chunk**: Biggest single file
- **Target**: < 200 KB
- **Current**: 187 KB ✅

**Total CSS**: All CSS files combined
- **Target**: < 150 KB
- **Current**: 98 KB ✅

### Status Indicators

- ✅ **Green checkmark**: Within limits
- ⚠️ **Yellow warning**: Approaching limit
- ❌ **Red X**: Exceeds limit

---

## 🔍 Common Scenarios

### Scenario 1: All Checks Pass ✅

```
✓ No alerts - all thresholds met!
```

**Action**: Nothing needed. Keep up the good work!

---

### Scenario 2: Size Increased ⚠️

```
⚠️ Total JS size changed: +12%
```

**Action**: Review recent changes
```bash
git log --oneline -5
git diff HEAD~1 -- package.json
```

---

### Scenario 3: Chunk Too Large ❌

```
✗ Largest chunk exceeds limit: 215 KB > 200 KB
```

**Action**: Split the chunk
```javascript
// Use dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

## 🔄 Continuous Monitoring

### Automatic Checks

Monitoring runs automatically on:
- ✅ Every push to `main`/`develop`
- ✅ Every pull request
- ✅ Weekly schedule (Monday 9 AM)

### PR Comments

You'll get automatic reports on PRs:

```markdown
## 📊 Bundle Size Monitoring Report

✅ All checks passed!
Bundle size reduced by 64.3% from baseline.
```

---

## 📈 View History

```bash
# View last 10 builds
cat frontend/.bundle-history/bundle-sizes.json | jq '.[-10:]'

# See trend
npm run monitor:bundle
# Look for "Trend Analysis" section
```

---

## 🛠️ Troubleshooting

### Issue: "Build directory not found"

**Solution**:
```bash
npm run build  # Build first!
npm run monitor:bundle
```

### Issue: Chunk size too large

**Solutions**:
1. **Code splitting**: Use `React.lazy()`
2. **Dynamic imports**: Load on demand
3. **Remove unused code**: Check imports
4. **Optimize dependencies**: Use lighter alternatives

---

## 📚 Next Steps

1. **Read full documentation**: [BUNDLE_SIZE_MONITORING.md](./BUNDLE_SIZE_MONITORING.md)
2. **Set up CI/CD**: Already configured in `.github/workflows/`
3. **Review thresholds**: Customize in `monitor-bundle-sizes.js`
4. **Optimize bundles**: See [optimization strategies](./BUNDLE_SIZE_MONITORING.md#optimization-strategies)

---

## 🎯 Quick Reference

### Commands

```bash
# Build project
npm run build

# Measure bundle size (one-time)
npm run measure:bundle

# Monitor bundle size (with history)
npm run monitor:bundle

# View history
cat frontend/.bundle-history/bundle-sizes.json
```

### Thresholds

| Metric | Limit | Level |
|--------|-------|-------|
| Chunk | 200 KB | Error |
| Total JS | 1 MB | Warning |
| Total CSS | 150 KB | Warning |
| Increase | +20% | Error |
| Increase | +10% | Warning |

### Files

- **Script**: `frontend/scripts/monitor-bundle-sizes.js`
- **History**: `frontend/.bundle-history/bundle-sizes.json`
- **Workflow**: `.github/workflows/bundle-size-monitoring.yml`
- **Docs**: `docs/BUNDLE_SIZE_MONITORING.md`

---

## ✅ Success Checklist

- [ ] Built project successfully
- [ ] Ran monitoring script
- [ ] All checks passed
- [ ] Reviewed output
- [ ] Understood metrics
- [ ] Know how to troubleshoot

**All checked?** You're ready to go! 🎉

---

## 💡 Pro Tips

1. **Run before committing**: Catch issues early
2. **Review PR comments**: Stay informed
3. **Monitor trends**: Watch for gradual increases
4. **Optimize proactively**: Don't wait for alerts

---

## 🆘 Need Help?

- **Full docs**: [BUNDLE_SIZE_MONITORING.md](./BUNDLE_SIZE_MONITORING.md)
- **Troubleshooting**: See [Common Issues](./BUNDLE_SIZE_MONITORING.md#troubleshooting)
- **Support**: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0
