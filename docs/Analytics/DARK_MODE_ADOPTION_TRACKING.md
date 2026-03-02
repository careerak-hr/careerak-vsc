# Dark Mode Adoption Tracking - Comprehensive Guide

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Metrics](#metrics)
7. [Monitoring](#monitoring)
8. [Integration](#integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Dark Mode Adoption Tracking system provides comprehensive analytics for dark mode usage across the Careerak platform. It tracks user preferences, session durations, and adoption trends to help optimize the dark mode experience.

### Goals
- Track dark mode adoption rate (target: 30%+)
- Understand user preferences by platform and browser
- Identify trends and patterns in theme usage
- Provide data-driven insights for UX improvements

### Success Metrics
- **Adoption Rate**: Percentage of sessions using dark mode
- **Target**: 30%+ adoption rate
- **Tracking**: Real-time metrics with historical trends

---

## Features

### Core Features
- ✅ **Automatic Tracking**: Tracks theme changes and sessions automatically
- ✅ **Platform Breakdown**: Analyzes adoption by Android, iOS, Desktop
- ✅ **Browser Breakdown**: Analyzes adoption by Chrome, Safari, Firefox, Edge
- ✅ **Daily Trends**: Shows adoption trends over time
- ✅ **Session Tracking**: Tracks session duration in each mode
- ✅ **Theme Change Tracking**: Tracks user theme switches
- ✅ **localStorage Storage**: Stores metrics locally (no backend required)
- ✅ **Backend Integration**: Optional API integration for centralized analytics
- ✅ **Google Analytics**: Optional GA integration
- ✅ **Export Functionality**: Export metrics to JSON for analysis

### Tracked Events
1. **session_start**: User starts a session
2. **session_end**: User ends a session (page unload)
3. **theme_changed**: User changes theme (light ↔ dark ↔ system)

### Tracked Data Points
- Timestamp
- Theme mode (light, dark, system)
- isDark (boolean)
- Platform (Android, iOS, Desktop)
- Browser (Chrome, Safari, Firefox, Edge, Other)
- Session duration (for session_end events)

---

## Architecture

### File Structure
```
frontend/
├── src/
│   ├── context/
│   │   └── ThemeContext.jsx           # Theme management with tracking
│   └── utils/
│       └── darkModeTracking.js        # Tracking utility
├── scripts/
│   └── monitor-dark-mode-adoption.js  # Monitoring script
└── .dark-mode-metrics/
    ├── adoption-metrics.json          # Stored metrics
    └── adoption-report-*.json         # Exported reports
```

### Data Flow
```
User Action → ThemeContext → darkModeTracking.js → localStorage
                                                  ↓
                                            Backend API (optional)
                                                  ↓
                                            Google Analytics (optional)
```

### Storage
- **localStorage Key**: `careerak_dark_mode_metrics`
- **Max Events**: 1000 (automatically trimmed)
- **Size**: ~500KB typical
- **Retention**: Indefinite (until cleared)

---

## Installation

### Prerequisites
- React 18+
- ThemeContext already implemented
- localStorage available

### Setup Steps

**1. Files Already Created**:
- ✅ `frontend/src/utils/darkModeTracking.js`
- ✅ `frontend/scripts/monitor-dark-mode-adoption.js`
- ✅ ThemeContext updated with tracking

**2. Verify Integration**:
```javascript
// In ThemeContext.jsx
import { trackThemeChange, initDarkModeTracking } from '../utils/darkModeTracking';

// Tracking is initialized automatically
useEffect(() => {
  initDarkModeTracking();
}, []);
```

**3. Test Tracking**:
```bash
# Open browser console
localStorage.getItem('careerak_dark_mode_metrics')
# Should show array of events
```

---

## Usage

### For Developers

**Initialize Tracking** (already done in ThemeContext):
```javascript
import { initDarkModeTracking } from '../utils/darkModeTracking';

// Call once when app starts
useEffect(() => {
  initDarkModeTracking();
}, []);
```

**Track Theme Changes** (already done in ThemeContext):
```javascript
import { trackThemeChange } from '../utils/darkModeTracking';

const toggleTheme = () => {
  const prevMode = themeMode;
  const newMode = getNextMode(prevMode);
  const newIsDark = calculateIsDark(newMode);
  
  trackThemeChange(prevMode, newMode, newIsDark);
  setThemeMode(newMode);
};
```

**Get Metrics Programmatically**:
```javascript
import { getDarkModeMetrics } from '../utils/darkModeTracking';

// Get metrics for last 30 days
const metrics = getDarkModeMetrics(30);
console.log('Adoption Rate:', metrics.adoptionRate);
console.log('Dark Sessions:', metrics.darkSessions);
console.log('Total Sessions:', metrics.totalSessions);
```

**Export Metrics**:
```javascript
import { exportMetrics } from '../utils/darkModeTracking';

// Export last 30 days
const json = exportMetrics(30);
console.log(json);
```

**Clear Metrics**:
```javascript
import { clearMetrics } from '../utils/darkModeTracking';

clearMetrics();
```

---

## Metrics

### Overall Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Total Sessions** | Number of sessions tracked | Count of session_start events |
| **Dark Sessions** | Sessions using dark mode | Count where isDark = true |
| **Light Sessions** | Sessions using light mode | Count where isDark = false |
| **Adoption Rate** | Percentage using dark mode | (darkSessions / totalSessions) × 100 |
| **Theme Changes** | Number of theme switches | Count of theme_changed events |

### Platform Breakdown

Metrics broken down by platform:
- **Android**: Mobile Android devices
- **iOS**: iPhone and iPad
- **Desktop**: Desktop/laptop computers

For each platform:
- Total sessions
- Dark mode sessions
- Light mode sessions
- Adoption rate

### Browser Breakdown

Metrics broken down by browser:
- **Chrome**: Google Chrome
- **Safari**: Apple Safari
- **Firefox**: Mozilla Firefox
- **Edge**: Microsoft Edge
- **Other**: Other browsers

For each browser:
- Total sessions
- Dark mode sessions
- Light mode sessions
- Adoption rate

### Daily Trends

Shows adoption rate for each day over the last 7 days:
- Date
- Total sessions
- Dark sessions
- Adoption rate
- Visual bar chart

---

## Monitoring

### Command Line Monitoring

**Basic Monitoring** (last 30 days):
```bash
cd frontend
npm run monitor:darkmode
```

**Custom Period** (last 7 days):
```bash
npm run monitor:darkmode -- --period 7
```

**Custom Threshold** (25% instead of 30%):
```bash
npm run monitor:darkmode -- --threshold 0.25
```

**Filter by Platform**:
```bash
npm run monitor:darkmode -- --platform Android
npm run monitor:darkmode -- --platform iOS
npm run monitor:darkmode -- --platform Desktop
```

**Filter by Browser**:
```bash
npm run monitor:darkmode -- --browser Chrome
npm run monitor:darkmode -- --browser Safari
```

**Export to File**:
```bash
npm run monitor:darkmode:export
# Creates .dark-mode-metrics/adoption-report-{timestamp}.json
```

**Watch Mode** (continuous monitoring):
```bash
npm run monitor:darkmode:watch
# Updates every 5 minutes
# Press Ctrl+C to stop
```

**Combine Options**:
```bash
npm run monitor:darkmode -- --period 14 --platform Android --threshold 0.35
```

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║         Dark Mode Adoption Monitoring Report              ║
╚════════════════════════════════════════════════════════════╝

📅 Analysis Period: Last 30 days
📊 Report Generated: 2/23/2026, 10:30:00 AM

═══════════════════════════════════════════════════════════
Overall Metrics
═══════════════════════════════════════════════════════════
Total Sessions:           1250
Dark Mode Sessions:       425
Light Mode Sessions:      825
Theme Changes:            180

Dark Mode Adoption Rate:  34.0%
✅ Adoption Rate MEETS Threshold: 30.0%

═══════════════════════════════════════════════════════════
By Platform
═══════════════════════════════════════════════════════════

Android:
  Sessions:     650
  Dark:         260
  Light:        390
  Adoption:     40.0%

iOS:
  Sessions:     350
  Dark:         105
  Light:        245
  Adoption:     30.0%

Desktop:
  Sessions:     250
  Dark:         60
  Light:        190
  Adoption:     24.0%

═══════════════════════════════════════════════════════════
By Browser
═══════════════════════════════════════════════════════════

Chrome:
  Sessions:     700
  Dark:         280
  Light:        420
  Adoption:     40.0%

Safari:
  Sessions:     350
  Dark:         105
  Light:        245
  Adoption:     30.0%

Firefox:
  Sessions:     150
  Dark:         30
  Light:        120
  Adoption:     20.0%

Edge:
  Sessions:     50
  Dark:         10
  Light:        40
  Adoption:     20.0%

═══════════════════════════════════════════════════════════
Daily Trends (Last 7 Days)
═══════════════════════════════════════════════════════════
2026-02-17  ████████████████████████████████░░░░░░░░  32.0% (64/200)
2026-02-18  ██████████████████████████████████░░░░░░  34.5% (69/200)
2026-02-19  ████████████████████████████████░░░░░░░░  33.0% (66/200)
2026-02-20  ██████████████████████████████████░░░░░░  35.0% (70/200)
2026-02-21  ████████████████████████████████████░░░░  36.0% (72/200)
2026-02-22  ██████████████████████████████████░░░░░░  34.0% (68/200)
2026-02-23  ████████████████████████████████████░░░░  37.0% (74/200)
```

---

## Integration

### Backend API Integration

**Endpoint**: `POST /api/analytics/dark-mode`

**Request Body**:
```json
{
  "type": "theme_changed",
  "timestamp": "2026-02-23T10:30:00.000Z",
  "platform": "Android",
  "browser": "Chrome",
  "themeMode": "dark",
  "fromMode": "light",
  "toMode": "dark",
  "isDark": true
}
```

**Implementation** (backend):
```javascript
// backend/src/routes/analyticsRoutes.js
router.post('/dark-mode', async (req, res) => {
  try {
    const event = req.body;
    
    // Store in database
    await DarkModeMetric.create(event);
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Failed to store dark mode metric:', error);
    res.status(500).json({ error: 'Failed to store metric' });
  }
});
```

### Google Analytics Integration

**Automatic Tracking**:
```javascript
// Already implemented in darkModeTracking.js
window.gtag('event', 'dark_mode_tracking', {
  event_category: 'Theme',
  event_label: 'theme_changed',
  theme_mode: 'dark',
  from_mode: 'light',
  to_mode: 'dark',
  platform: 'Android',
  browser: 'Chrome',
});
```

**View in GA**:
1. Go to Google Analytics
2. Events → All Events
3. Filter by `dark_mode_tracking`
4. View by dimensions: platform, browser, theme_mode

### CI/CD Integration

**GitHub Actions** (`.github/workflows/dark-mode-monitoring.yml`):
```yaml
name: Dark Mode Adoption Monitoring
on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Monitor adoption
        run: cd frontend && npm run monitor:darkmode:export
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: dark-mode-report
          path: frontend/.dark-mode-metrics/adoption-report-*.json
```

---

## Best Practices

### For Product Managers

**1. Set Realistic Targets**:
- Industry average: 20-40% dark mode adoption
- Mobile typically higher than desktop
- Younger users prefer dark mode more

**2. Monitor Regularly**:
- Weekly reports for trends
- Monthly deep dives
- Compare across platforms and browsers

**3. Act on Insights**:
- Low adoption? Improve visibility of toggle
- High adoption? Ensure dark mode quality
- Platform differences? Optimize per platform

### For Developers

**1. Don't Block the Main Thread**:
```javascript
// ✅ Good - async tracking
trackThemeChange(from, to, isDark);

// ❌ Bad - synchronous heavy operation
const metrics = calculateComplexMetrics();
```

**2. Handle Errors Gracefully**:
```javascript
// Already implemented in darkModeTracking.js
try {
  trackDarkModeEvent(type, data);
} catch (error) {
  // Silently fail - don't break the app
  console.debug('Tracking failed:', error);
}
```

**3. Respect Privacy**:
```javascript
// ✅ Good - no PII
trackThemeChange('light', 'dark', true);

// ❌ Bad - includes PII
trackThemeChange('light', 'dark', true, { userId: '12345', email: 'user@example.com' });
```

### For Designers

**1. Analyze by Platform**:
- Android users may prefer dark mode more
- iOS users follow system preference more
- Desktop users may prefer light mode for work

**2. Consider Context**:
- Time of day (dark mode more popular at night)
- Use case (reading vs. data entry)
- User demographics

**3. Optimize Based on Data**:
- If adoption is low, make toggle more visible
- If adoption is high, ensure dark mode quality
- A/B test different toggle placements

---

## Troubleshooting

### No Data Collected

**Problem**: `localStorage.getItem('careerak_dark_mode_metrics')` returns null

**Solutions**:
1. Check if tracking is initialized:
   ```javascript
   // Should be in ThemeContext
   useEffect(() => {
     initDarkModeTracking();
   }, []);
   ```

2. Check browser console for errors

3. Verify localStorage is enabled:
   ```javascript
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage works');
   } catch (e) {
     console.error('localStorage blocked');
   }
   ```

### Monitoring Script Shows No Data

**Problem**: `npm run monitor:darkmode` shows "No metrics data found"

**Solutions**:
1. Data is in localStorage, not file system by default
2. To export from browser:
   ```javascript
   // In browser console
   const data = localStorage.getItem('careerak_dark_mode_metrics');
   console.log(data);
   // Copy and save to .dark-mode-metrics/adoption-metrics.json
   ```

3. Or use backend API to collect data centrally

### Adoption Rate Seems Wrong

**Problem**: Adoption rate doesn't match expectations

**Solutions**:
1. Check time period:
   ```bash
   npm run monitor:darkmode -- --period 7  # Last 7 days
   npm run monitor:darkmode -- --period 30 # Last 30 days
   ```

2. Check filters:
   ```bash
   # Remove platform/browser filters
   npm run monitor:darkmode
   ```

3. Verify data quality:
   ```javascript
   const metrics = JSON.parse(localStorage.getItem('careerak_dark_mode_metrics'));
   console.log('Total events:', metrics.length);
   console.log('Session starts:', metrics.filter(e => e.type === 'session_start').length);
   ```

### Backend API Not Receiving Events

**Problem**: Events not sent to backend

**Solutions**:
1. Check API URL is set:
   ```bash
   # In .env
   VITE_API_URL=https://your-api.com
   ```

2. Check network tab for failed requests

3. Verify backend endpoint exists:
   ```bash
   curl -X POST https://your-api.com/api/analytics/dark-mode \
     -H "Content-Type: application/json" \
     -d '{"type":"test","timestamp":"2026-02-23T10:00:00Z"}'
   ```

4. Check CORS configuration

### localStorage Full

**Problem**: "QuotaExceededError" in console

**Solutions**:
1. Metrics are automatically trimmed to 1000 events
2. Manually clear old data:
   ```javascript
   import { clearMetrics } from '../utils/darkModeTracking';
   clearMetrics();
   ```

3. Export and archive old data:
   ```bash
   npm run monitor:darkmode:export
   # Then clear localStorage
   ```

---

## Advanced Topics

### Custom Event Tracking

```javascript
import { trackDarkModeEvent } from '../utils/darkModeTracking';

// Track custom event
trackDarkModeEvent('custom_event', {
  customField: 'value',
  anotherField: 123,
});
```

### Programmatic Analysis

```javascript
import { getDarkModeMetrics } from '../utils/darkModeTracking';

// Get metrics
const metrics = getDarkModeMetrics(30);

// Calculate custom metrics
const avgSessionsPerDay = metrics.totalSessions / 30;
const darkModeGrowth = calculateGrowth(metrics.dailyTrends);

// Export for external analysis
const csv = convertToCSV(metrics);
fs.writeFileSync('metrics.csv', csv);
```

### A/B Testing Integration

```javascript
// Track which variant user sees
trackDarkModeEvent('ab_test_variant', {
  variant: 'A', // or 'B'
  feature: 'dark_mode_toggle_placement',
});

// Later, analyze by variant
const metricsA = getMetricsByVariant('A');
const metricsB = getMetricsByVariant('B');
```

---

## Appendix

### Metric Definitions

- **Session**: Period from page load to page unload
- **Adoption Rate**: Percentage of sessions using dark mode
- **Theme Change**: User manually switching theme
- **Platform**: Device type (Android, iOS, Desktop)
- **Browser**: Web browser used

### Related Documentation

- [Dark Mode Implementation](./DARK_MODE_IMPLEMENTATION.md)
- [ThemeContext API](./THEME_CONTEXT_API.md)
- [PWA Install Rate Monitoring](./PWA_INSTALL_RATE_MONITORING.md)
- [Analytics Integration](./ANALYTICS_INTEGRATION.md)

### Support

For issues or questions:
- GitHub Issues: [careerak/issues](https://github.com/careerak/issues)
- Email: careerak.hr@gmail.com
- Documentation: [docs/](../docs/)

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0  
**Status**: ✅ Complete and Production-Ready
