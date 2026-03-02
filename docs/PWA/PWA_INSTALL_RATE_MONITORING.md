# PWA Install Rate Monitoring

## Overview

**Date Added**: 2026-02-23  
**Status**: ✅ Complete and Active  
**Requirements**: Task 10.4.4, FR-PWA-4, FR-PWA-5

This document provides comprehensive guidance on monitoring PWA (Progressive Web App) install rates for the Careerak platform.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Metrics Tracked](#metrics-tracked)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Data Storage](#data-storage)
7. [Analysis & Reporting](#analysis--reporting)
8. [Integration](#integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)

---

## Introduction

PWA install rate monitoring helps you understand how effectively your Progressive Web App is converting visitors into installed users. This is crucial for:

- **User Engagement**: Installed PWAs have higher engagement rates
- **Retention**: Users who install are more likely to return
- **Performance**: Identify which platforms/browsers have best install rates
- **Optimization**: Data-driven decisions for improving install prompts

### Key Metrics

- **Install Rate**: Percentage of users who install after seeing the prompt
- **Dismiss Rate**: Percentage of users who dismiss the install prompt
- **Platform Breakdown**: Install rates by platform (Android, iOS, Desktop)
- **Browser Breakdown**: Install rates by browser (Chrome, Safari, Firefox, Edge)
- **Trends**: Daily, weekly, and monthly install rate trends

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client-Side Tracking                     │
│  (frontend/src/utils/pwaInstallTracking.js)                 │
│                                                              │
│  • beforeinstallprompt event listener                       │
│  • appinstalled event listener                              │
│  • User action tracking (accept/dismiss)                    │
│  • Platform & browser detection                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─────────────────┬─────────────────┬───────────────
                   │                 │                 │
                   ▼                 ▼                 ▼
         ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
         │   localStorage   │ │ Backend API  │ │ Google Analytics │
         │   (Primary)      │ │  (Optional)  │ │    (Optional)    │
         └─────────────────┘ └──────────────┘ └──────────────────┘
                   │
                   ▼
         ┌─────────────────────────────────────────────────────┐
         │          Monitoring Script                          │
         │  (frontend/scripts/monitor-pwa-install-rate.js)     │
         │                                                      │
         │  • Load metrics from storage                        │
         │  • Calculate install rates                          │
         │  • Generate reports                                 │
         │  • Export data (JSON/CSV)                           │
         └─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Event Capture**: Browser fires PWA events (beforeinstallprompt, appinstalled)
2. **Tracking**: Client-side utility captures events with context (platform, browser, timestamp)
3. **Storage**: Metrics stored in localStorage (primary) and optionally sent to backend/analytics
4. **Analysis**: Monitoring script reads stored metrics and calculates rates
5. **Reporting**: Generate console, JSON, or CSV reports with insights

---

## Metrics Tracked

### Event Types

| Event | Description | When Fired |
|-------|-------------|------------|
| `prompt_shown` | Install prompt displayed to user | beforeinstallprompt event |
| `prompt_accepted` | User clicked "Install" | After prompt().userChoice === 'accepted' |
| `prompt_dismissed` | User clicked "Cancel" | After prompt().userChoice === 'dismissed' |
| `install_completed` | PWA successfully installed | appinstalled event |
| `standalone_launch` | App launched in standalone mode | On app start in standalone mode |

### Metadata Captured

For each event, the following metadata is captured:

```javascript
{
  event: 'prompt_shown',           // Event type
  timestamp: '2026-02-23T10:30:00Z', // ISO 8601 timestamp
  platform: 'Android',             // Android, iOS, Desktop-Windows, etc.
  browser: 'Chrome',               // Chrome, Safari, Firefox, Edge, etc.
  userAgent: '...',                // Full user agent string
  screenWidth: 1920,               // Screen width in pixels
  screenHeight: 1080,              // Screen height in pixels
  isStandalone: false              // Whether already in standalone mode
}
```

### Calculated Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **Install Rate** | installs / prompts | > 10% (Good: 15-25%) |
| **Dismiss Rate** | dismissed / prompts | < 50% |
| **Accept Rate** | accepted / prompts | > 10% |
| **Conversion Rate** | installs / accepted | > 80% |

---

## Installation

### Prerequisites

- Node.js 14+ installed
- Frontend project set up
- PWA manifest.json configured
- Service worker registered

### Setup Steps

**1. Install Dependencies** (Already included in package.json):

```bash
cd frontend
npm install
```

**2. Initialize Tracking in Your App**:

```javascript
// In frontend/src/App.jsx or index.jsx
import { initPwaInstallTracking } from './utils/pwaInstallTracking';

// Initialize on app start
useEffect(() => {
  initPwaInstallTracking();
}, []);
```

**3. Add Install Button (Optional)**:

```jsx
// In your component
<button 
  id="pwa-install-button" 
  style={{ display: 'none' }}
  className="install-button"
>
  Install App
</button>
```

**4. Verify Setup**:

```bash
# Check if tracking is working
npm run dev

# Open browser console and look for:
# [PWA Tracking] Initialized successfully
# [PWA Tracking] Platform: Android
# [PWA Tracking] Browser: Chrome
```

---

## Usage

### Running the Monitoring Script

**Basic Usage** (Last 30 days):

```bash
cd frontend
npm run monitor:pwa
```

**Custom Period** (Last 7 days):

```bash
npm run monitor:pwa -- --period 7
```

**JSON Output**:

```bash
npm run monitor:pwa -- --format json
```

**CSV Output**:

```bash
npm run monitor:pwa -- --format csv
```

**Export to File**:

```bash
npm run monitor:pwa:export
# Creates: pwa-install-metrics.json
```

**Custom Export**:

```bash
npm run monitor:pwa -- --export my-report.json
```

**Set Alert Threshold** (15% install rate):

```bash
npm run monitor:pwa -- --threshold 0.15
```

**Continuous Monitoring** (Updates every 5 minutes):

```bash
npm run monitor:pwa:watch
```

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║         PWA Install Rate Monitoring Report                ║
╚════════════════════════════════════════════════════════════╝

📅 Analysis Period: Last 30 days
📊 Report Generated: 2/23/2026, 10:30:00 AM

═══════════════════════════════════════════════════════════
Overall Metrics
═══════════════════════════════════════════════════════════
Total Install Prompts Shown:  450
Total Installs Completed:     85
Total Prompts Dismissed:      220
Install Rate:                 18.89%
Dismiss Rate:                 48.89%

✅ Install Rate MEETS Threshold: 10%

═══════════════════════════════════════════════════════════
By Platform
═══════════════════════════════════════════════════════════

Android:
  Prompts:      280
  Installs:     60
  Dismissed:    140
  Install Rate: 21.43%

iOS:
  Prompts:      100
  Installs:     15
  Dismissed:    50
  Install Rate: 15.00%

Desktop-Windows:
  Prompts:      70
  Installs:     10
  Dismissed:    30
  Install Rate: 14.29%

═══════════════════════════════════════════════════════════
By Browser
═══════════════════════════════════════════════════════════

Chrome:
  Prompts:      350
  Installs:     70
  Dismissed:    180
  Install Rate: 20.00%

Safari:
  Prompts:      100
  Installs:     15
  Dismissed:    40
  Install Rate: 15.00%

═══════════════════════════════════════════════════════════
Daily Trends (Last 7 Days)
═══════════════════════════════════════════════════════════
2026-02-17  ████████████████████████████████░░░░░░░░  20.0% (10/50)
2026-02-18  ██████████████████████████████████░░░░░░  21.5% (11/51)
2026-02-19  ████████████████████████████░░░░░░░░░░░░  17.5% (9/51)
2026-02-20  ██████████████████████████████████░░░░░░  21.2% (11/52)
2026-02-21  ████████████████████████████████░░░░░░░░  20.0% (10/50)
2026-02-22  ██████████████████████████████░░░░░░░░░░  18.8% (9/48)
2026-02-23  ████████████████████████████████████░░░░  22.0% (11/50)

═══════════════════════════════════════════════════════════
Recommendations
═══════════════════════════════════════════════════════════
✅ Install rate is acceptable (10-20%)
💡 Potential improvements:
   • A/B test prompt timing
   • Highlight offline capabilities
```

---

## Data Storage

### localStorage Structure

Metrics are stored in localStorage under the key `careerak_pwa_install_metrics`:

```javascript
[
  {
    event: 'prompt_shown',
    timestamp: '2026-02-23T10:30:00.000Z',
    platform: 'Android',
    browser: 'Chrome',
    userAgent: 'Mozilla/5.0...',
    screenWidth: 1920,
    screenHeight: 1080,
    isStandalone: false
  },
  {
    event: 'install_completed',
    timestamp: '2026-02-23T10:30:15.000Z',
    platform: 'Android',
    browser: 'Chrome',
    userAgent: 'Mozilla/5.0...',
    screenWidth: 1920,
    screenHeight: 1080,
    isStandalone: false
  },
  // ... more metrics
]
```

### Storage Limits

- **Max Metrics**: 1000 events (oldest removed when limit reached)
- **Storage Size**: ~500KB (typical)
- **Retention**: Indefinite (until user clears browser data)

### File System Storage

Monitoring script stores aggregated metrics in:

```
frontend/.pwa-metrics/
└── install-metrics.json
```

This file contains:
- All raw metrics
- Metadata (version, created date)
- Used by monitoring script for analysis

---

## Analysis & Reporting

### Report Formats

**1. Console (Default)**:
- Human-readable formatted output
- Color-coded metrics
- Visual trend charts
- Recommendations

**2. JSON**:
- Machine-readable format
- Complete data structure
- Easy integration with other tools

```json
{
  "reportDate": "2026-02-23T10:30:00.000Z",
  "period": 30,
  "threshold": 0.1,
  "overall": {
    "totalPrompts": 450,
    "totalInstalls": 85,
    "totalDismissed": 220,
    "installRate": 0.1889,
    "dismissRate": 0.4889
  },
  "byPlatform": { ... },
  "byBrowser": { ... },
  "dailyTrends": { ... }
}
```

**3. CSV**:
- Spreadsheet-compatible format
- Daily metrics
- Easy import to Excel/Google Sheets

```csv
Date,Prompts,Installs,Dismissed,Install Rate,Dismiss Rate
2026-02-17,50,10,25,0.2000,0.5000
2026-02-18,51,11,26,0.2157,0.5098
...
```

### Metrics Interpretation

**Install Rate**:
- **< 10%**: Poor - Needs improvement
- **10-15%**: Acceptable - Room for optimization
- **15-25%**: Good - Meeting industry standards
- **> 25%**: Excellent - Best in class

**Dismiss Rate**:
- **< 30%**: Excellent - Users are interested
- **30-50%**: Acceptable - Normal range
- **50-70%**: High - Consider prompt timing
- **> 70%**: Very High - Prompt may be intrusive

### Trend Analysis

Monitor trends over time to identify:

- **Improving**: Install rate increasing → Current strategy working
- **Declining**: Install rate decreasing → Investigate changes
- **Stable**: Install rate consistent → Maintain current approach
- **Volatile**: Large fluctuations → External factors or A/B testing

---

## Integration

### Backend API Integration

**Optional**: Send metrics to backend for centralized tracking.

**1. Create Backend Endpoint**:

```javascript
// backend/src/routes/analyticsRoutes.js
router.post('/analytics/pwa-install', async (req, res) => {
  try {
    const metric = req.body;
    
    // Store in database
    await PwaMetric.create(metric);
    
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**2. Configure Frontend**:

```javascript
// In .env
REACT_APP_API_URL=https://api.careerak.com
# or
VITE_API_URL=https://api.careerak.com
```

The tracking utility will automatically send metrics to the backend if the API URL is configured.

### Google Analytics Integration

**Optional**: Send metrics to Google Analytics for unified reporting.

**1. Install Google Analytics**:

```html
<!-- In public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**2. Metrics Automatically Sent**:

The tracking utility will automatically send events to Google Analytics if `window.gtag` or `window.dataLayer` is available.

**Events Sent**:
- Event Category: `PWA`
- Event Label: `prompt_shown`, `install_completed`, etc.
- Custom Dimensions: `platform`, `browser`

---

## Best Practices

### 1. Prompt Timing

**Don't**:
- Show prompt immediately on first visit
- Show prompt on every page load
- Interrupt critical user flows

**Do**:
- Wait for user engagement (e.g., 30 seconds, 3 page views)
- Show after positive interactions (e.g., successful action)
- Respect user's previous dismissal (wait 7-30 days)

**Example**:

```javascript
// Wait for user engagement before showing prompt
let pageViews = 0;
let timeOnSite = 0;

// Track page views
window.addEventListener('popstate', () => {
  pageViews++;
});

// Track time on site
setInterval(() => {
  timeOnSite += 10;
}, 10000);

// Show prompt after 3 page views OR 30 seconds
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  
  if (pageViews >= 3 || timeOnSite >= 30) {
    // Show custom install UI
    showInstallPrompt(event);
  }
});
```

### 2. Value Proposition

**Communicate Benefits**:
- Offline access
- Faster loading
- Home screen icon
- Push notifications
- No app store required

**Example UI**:

```jsx
<div className="install-prompt">
  <h3>Install Careerak</h3>
  <ul>
    <li>✅ Access offline</li>
    <li>⚡ Faster loading</li>
    <li>🔔 Get notifications</li>
    <li>📱 Add to home screen</li>
  </ul>
  <button onClick={handleInstall}>Install Now</button>
  <button onClick={handleDismiss}>Maybe Later</button>
</div>
```

### 3. A/B Testing

Test different approaches:

- **Timing**: Immediate vs. delayed vs. after action
- **Message**: Feature-focused vs. benefit-focused
- **Design**: Modal vs. banner vs. inline
- **Frequency**: Once vs. periodic reminders

Track install rates for each variant to find the best approach.

### 4. Platform-Specific Strategies

**Android (Chrome)**:
- Best install rates (typically 20-30%)
- Show prompt after engagement
- Highlight offline capabilities

**iOS (Safari)**:
- Lower install rates (typically 5-15%)
- Requires manual "Add to Home Screen"
- Provide clear instructions with screenshots

**Desktop**:
- Moderate install rates (typically 10-20%)
- Emphasize productivity benefits
- Show prompt in context (e.g., during work tasks)

### 5. Monitoring Frequency

- **Daily**: During launch or major changes
- **Weekly**: For ongoing optimization
- **Monthly**: For stable products
- **Quarterly**: For mature products

### 6. Alert Thresholds

Set up alerts for:

- **Install rate drops below 10%**: Investigate immediately
- **Dismiss rate exceeds 70%**: Prompt may be too aggressive
- **Platform-specific issues**: One platform significantly underperforming

---

## Troubleshooting

### No Metrics Collected

**Symptoms**:
- Monitoring script shows "No metrics found"
- localStorage is empty

**Solutions**:

1. **Check if tracking is initialized**:
   ```javascript
   // In browser console
   localStorage.getItem('careerak_pwa_install_metrics')
   ```

2. **Verify PWA requirements**:
   - HTTPS enabled (required for PWA)
   - manifest.json present and valid
   - Service worker registered
   - Icons configured (192x192, 512x512)

3. **Check browser support**:
   - Chrome/Edge: Full support
   - Safari: Limited support (iOS requires manual install)
   - Firefox: Full support

4. **Test manually**:
   ```javascript
   // In browser console
   import { trackPromptShown } from './utils/pwaInstallTracking';
   trackPromptShown();
   ```

### Install Prompt Not Showing

**Symptoms**:
- `beforeinstallprompt` event not firing
- No install button appears

**Solutions**:

1. **Check PWA criteria**:
   - HTTPS enabled
   - Valid manifest.json
   - Service worker registered
   - Icons present
   - Not already installed

2. **Check browser**:
   - Chrome/Edge: Automatic prompt
   - Safari iOS: Manual only (no beforeinstallprompt)
   - Firefox: Automatic prompt

3. **Check if already installed**:
   ```javascript
   // In browser console
   window.matchMedia('(display-mode: standalone)').matches
   // true = already installed
   ```

4. **Clear browser data and retry**:
   - Uninstall PWA if installed
   - Clear site data
   - Reload page

### Low Install Rate

**Symptoms**:
- Install rate < 10%
- High dismiss rate (> 70%)

**Solutions**:

1. **Improve prompt timing**:
   - Delay prompt until user is engaged
   - Show after positive interactions
   - Avoid interrupting critical flows

2. **Enhance value proposition**:
   - Clearly communicate benefits
   - Show screenshots/demo
   - Highlight offline capabilities

3. **Optimize UI/UX**:
   - Make install button prominent
   - Use clear, action-oriented copy
   - Reduce friction (fewer steps)

4. **Platform-specific optimization**:
   - Android: Focus on offline and speed
   - iOS: Provide manual install instructions
   - Desktop: Emphasize productivity

### Metrics Not Syncing to Backend

**Symptoms**:
- localStorage has metrics
- Backend not receiving data

**Solutions**:

1. **Check API URL**:
   ```bash
   # In .env
   REACT_APP_API_URL=https://api.careerak.com
   # or
   VITE_API_URL=https://api.careerak.com
   ```

2. **Check backend endpoint**:
   ```bash
   curl -X POST https://api.careerak.com/analytics/pwa-install \
     -H "Content-Type: application/json" \
     -d '{"event":"test"}'
   ```

3. **Check CORS**:
   - Backend must allow frontend origin
   - Check CORS headers in response

4. **Check network tab**:
   - Open browser DevTools → Network
   - Look for POST requests to `/analytics/pwa-install`
   - Check for errors (401, 403, 500)

---

## API Reference

### Client-Side Functions

#### `initPwaInstallTracking()`

Initialize PWA install tracking. Call once on app start.

```javascript
import { initPwaInstallTracking } from './utils/pwaInstallTracking';

// In App.jsx or index.jsx
useEffect(() => {
  initPwaInstallTracking();
}, []);
```

**Returns**: `void`

---

#### `getPwaInstallStats(periodDays)`

Get install rate statistics for a specific period.

```javascript
import { getPwaInstallStats } from './utils/pwaInstallTracking';

const stats = getPwaInstallStats(30); // Last 30 days
console.log(stats);
```

**Parameters**:
- `periodDays` (number, optional): Number of days to analyze (default: 30)

**Returns**:
```javascript
{
  period: 30,
  totalPrompts: 450,
  totalInstalls: 85,
  totalDismissed: 220,
  totalAccepted: 85,
  installRate: 0.1889,
  dismissRate: 0.4889,
  acceptRate: 0.1889,
  metrics: [ ... ] // Raw metrics array
}
```

---

#### `exportPwaMetrics()`

Export all metrics for analysis.

```javascript
import { exportPwaMetrics } from './utils/pwaInstallTracking';

const data = exportPwaMetrics();
console.log(JSON.stringify(data, null, 2));
```

**Returns**:
```javascript
{
  exportDate: '2026-02-23T10:30:00.000Z',
  totalMetrics: 1000,
  stats: { ... }, // Stats for last 30 days
  metrics: [ ... ] // All raw metrics
}
```

---

#### `clearPwaMetrics()`

Clear all stored metrics.

```javascript
import { clearPwaMetrics } from './utils/pwaInstallTracking';

clearPwaMetrics();
```

**Returns**: `void`

---

#### `trackPromptShown(event)`

Manually track install prompt shown event.

```javascript
import { trackPromptShown } from './utils/pwaInstallTracking';

window.addEventListener('beforeinstallprompt', (event) => {
  trackPromptShown(event);
});
```

**Parameters**:
- `event` (Event): beforeinstallprompt event object

**Returns**: `void`

---

#### `trackInstallCompleted()`

Manually track install completed event.

```javascript
import { trackInstallCompleted } from './utils/pwaInstallTracking';

window.addEventListener('appinstalled', () => {
  trackInstallCompleted();
});
```

**Returns**: `void`

---

#### `detectPlatform()`

Detect user's platform.

```javascript
import { detectPlatform } from './utils/pwaInstallTracking';

const platform = detectPlatform();
console.log(platform); // 'Android', 'iOS', 'Desktop-Windows', etc.
```

**Returns**: `string` - Platform name

---

#### `detectBrowser()`

Detect user's browser.

```javascript
import { detectBrowser } from './utils/pwaInstallTracking';

const browser = detectBrowser();
console.log(browser); // 'Chrome', 'Safari', 'Firefox', etc.
```

**Returns**: `string` - Browser name

---

### Monitoring Script Options

```bash
node scripts/monitor-pwa-install-rate.js [options]
```

**Options**:

| Option | Description | Default |
|--------|-------------|---------|
| `--period <days>` | Analysis period in days | 30 |
| `--format <type>` | Output format: console, json, csv | console |
| `--export <file>` | Export results to file | null |
| `--threshold <rate>` | Alert threshold (0.0-1.0) | 0.1 (10%) |
| `--watch` | Continuous monitoring mode | false |

**Examples**:

```bash
# Last 7 days, console output
npm run monitor:pwa -- --period 7

# JSON format
npm run monitor:pwa -- --format json

# Export to file
npm run monitor:pwa -- --export report.json

# Custom threshold (15%)
npm run monitor:pwa -- --threshold 0.15

# Continuous monitoring
npm run monitor:pwa:watch
```

---

## Conclusion

PWA install rate monitoring is essential for understanding and optimizing your Progressive Web App's adoption. By tracking install events, analyzing trends, and implementing best practices, you can significantly improve your install rate and user engagement.

### Key Takeaways

1. **Track Everything**: Capture all install-related events
2. **Analyze Regularly**: Monitor trends weekly or monthly
3. **Optimize Timing**: Show prompts when users are engaged
4. **Communicate Value**: Clearly explain benefits of installing
5. **Test & Iterate**: A/B test different approaches
6. **Platform-Specific**: Tailor strategies for each platform

### Next Steps

1. ✅ Initialize tracking in your app
2. ✅ Run monitoring script to establish baseline
3. ✅ Set up regular monitoring (weekly/monthly)
4. ✅ Implement prompt timing optimization
5. ✅ A/B test different approaches
6. ✅ Monitor and iterate based on data

### Resources

- [PWA Install Tracking Utility](../frontend/src/utils/pwaInstallTracking.js)
- [Monitoring Script](../frontend/scripts/monitor-pwa-install-rate.js)
- [Quick Start Guide](./PWA_INSTALL_RATE_MONITORING_QUICK_START.md)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0  
**Maintainer**: Careerak Development Team
