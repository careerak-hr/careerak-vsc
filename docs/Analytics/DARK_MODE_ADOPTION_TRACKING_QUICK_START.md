# Dark Mode Adoption Tracking - Quick Start Guide

## 5-Minute Setup

### What You Get
- ✅ Automatic dark mode usage tracking
- ✅ Adoption rate monitoring (target: 30%+)
- ✅ Platform and browser breakdown
- ✅ Daily trends and insights

---

## Step 1: Verify Setup (30 seconds)

**Check if tracking is already enabled**:

```bash
# Open your app in browser
# Open browser console (F12)
localStorage.getItem('careerak_dark_mode_metrics')
# Should show array of events (or null if no data yet)
```

✅ **Already working!** Tracking is automatically initialized in ThemeContext.

---

## Step 2: Generate Some Data (1 minute)

**Toggle dark mode a few times**:

1. Find the dark mode toggle in your app
2. Click it 3-5 times (light → dark → system → light)
3. Refresh the page a few times
4. Check localStorage again - should have events now

---

## Step 3: View Metrics (1 minute)

**Run the monitoring script**:

```bash
cd frontend
npm run monitor:darkmode
```

**Expected output**:
```
╔════════════════════════════════════════════════════════════╗
║         Dark Mode Adoption Monitoring Report              ║
╚════════════════════════════════════════════════════════════╝

📅 Analysis Period: Last 30 days
📊 Report Generated: 2/23/2026, 10:30:00 AM

═══════════════════════════════════════════════════════════
Overall Metrics
═══════════════════════════════════════════════════════════
Total Sessions:           5
Dark Mode Sessions:       2
Light Mode Sessions:      3
Theme Changes:            4

Dark Mode Adoption Rate:  40.0%
✅ Adoption Rate MEETS Threshold: 30.0%
```

---

## Step 4: Explore Options (2 minutes)

### View Last 7 Days
```bash
npm run monitor:darkmode -- --period 7
```

### Filter by Platform
```bash
npm run monitor:darkmode -- --platform Android
npm run monitor:darkmode -- --platform iOS
npm run monitor:darkmode -- --platform Desktop
```

### Export to File
```bash
npm run monitor:darkmode:export
# Creates .dark-mode-metrics/adoption-report-{timestamp}.json
```

### Watch Mode (continuous monitoring)
```bash
npm run monitor:darkmode:watch
# Updates every 5 minutes
# Press Ctrl+C to stop
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run monitor:darkmode` | View adoption metrics (last 30 days) |
| `npm run monitor:darkmode -- --period 7` | Last 7 days |
| `npm run monitor:darkmode -- --threshold 0.25` | Custom threshold (25%) |
| `npm run monitor:darkmode:export` | Export to JSON file |
| `npm run monitor:darkmode:watch` | Continuous monitoring |

---

## Understanding the Metrics

### Adoption Rate
- **< 20%**: 🔴 Low - needs improvement
- **20-30%**: 🟡 Average - room for growth
- **30-40%**: 🟢 Good - meets target
- **> 40%**: 🟢 Excellent - exceeds target

### What to Track
1. **Overall adoption rate** - main KPI
2. **Platform breakdown** - which devices prefer dark mode
3. **Browser breakdown** - which browsers have better support
4. **Daily trends** - is adoption growing or declining

---

## Programmatic Access

### Get Metrics in Code

```javascript
import { getDarkModeMetrics } from '../utils/darkModeTracking';

// Get metrics for last 30 days
const metrics = getDarkModeMetrics(30);

console.log('Adoption Rate:', metrics.adoptionRate);
console.log('Dark Sessions:', metrics.darkSessions);
console.log('Total Sessions:', metrics.totalSessions);
console.log('By Platform:', metrics.byPlatform);
console.log('By Browser:', metrics.byBrowser);
console.log('Daily Trends:', metrics.dailyTrends);
```

### Export Metrics

```javascript
import { exportMetrics } from '../utils/darkModeTracking';

// Export last 30 days as JSON string
const json = exportMetrics(30);
console.log(json);

// Or save to file
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dark-mode-metrics.json';
a.click();
```

---

## Troubleshooting

### No Data Showing?

**Check localStorage**:
```javascript
// In browser console
const data = localStorage.getItem('careerak_dark_mode_metrics');
console.log(data ? JSON.parse(data).length + ' events' : 'No data');
```

**Generate test data**:
1. Toggle dark mode 5 times
2. Refresh page 3 times
3. Run monitoring script again

### "No metrics data found" Error?

The monitoring script reads from a file, but data is in localStorage by default.

**Option 1: Export from browser**:
```javascript
// In browser console
const data = localStorage.getItem('careerak_dark_mode_metrics');
// Copy the output
// Save to frontend/.dark-mode-metrics/adoption-metrics.json
```

**Option 2: Use backend API** (see full documentation)

---

## Next Steps

### For Product Managers
1. Set up weekly monitoring: `npm run monitor:darkmode`
2. Track adoption rate over time
3. Compare across platforms and browsers
4. Make data-driven UX decisions

### For Developers
1. Integrate with backend API (optional)
2. Add to CI/CD pipeline
3. Set up alerts for low adoption
4. Export data for analysis

### For Designers
1. Analyze adoption by platform
2. Identify pain points (low adoption areas)
3. A/B test toggle placements
4. Optimize dark mode quality

---

## Full Documentation

For detailed information, see:
- [Dark Mode Adoption Tracking - Comprehensive Guide](./DARK_MODE_ADOPTION_TRACKING.md)
- [ThemeContext API](./THEME_CONTEXT_API.md)
- [Analytics Integration](./ANALYTICS_INTEGRATION.md)

---

## Support

Questions? Issues?
- Email: careerak.hr@gmail.com
- GitHub: [careerak/issues](https://github.com/careerak/issues)

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use
