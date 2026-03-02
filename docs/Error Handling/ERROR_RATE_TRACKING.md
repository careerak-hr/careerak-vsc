# Error Rate Tracking System

## Overview

The Error Rate Tracking System provides comprehensive monitoring and analysis of frontend errors logged to the backend. It helps identify trends, detect anomalies, and ensure the platform maintains high reliability standards.

**Status**: ✅ Complete and Active  
**Date Added**: 2026-02-22  
**Requirements**: Task 10.4.3, FR-ERR-3, NFR-REL-1

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Metrics](#metrics)
6. [Alerting](#alerting)
7. [Integration](#integration)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Features

### Core Features
- ✅ **Real-time error rate calculation** - Errors per hour tracking
- ✅ **Historical trend analysis** - Hourly distribution over time
- ✅ **Multi-dimensional breakdown** - By component, environment, level
- ✅ **Recovery rate tracking** - Measures error resolution success
- ✅ **Alerting system** - Configurable thresholds
- ✅ **Watch mode** - Continuous monitoring
- ✅ **Export capabilities** - JSON, CSV, console formats
- ✅ **Top errors identification** - Most frequent issues
- ✅ **Filtering** - By environment, component, level, time period

### Metrics Tracked
- Total errors (unique error instances)
- Total occurrences (sum of all error counts)
- Error rate (errors per hour)
- Occurrence rate (occurrences per hour)
- Recovery rate (resolved errors percentage)
- Errors by level (error, warning, info)
- Errors by component
- Errors by environment
- Hourly distribution
- Top 10 most frequent errors

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Error Boundaries (Route & Component Level)          │  │
│  │  - Catch errors                                       │  │
│  │  - Log to backend via API                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/errors
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Error Log Controller                                 │  │
│  │  - Receive error logs                                 │  │
│  │  - Parse user agent                                   │  │
│  │  - Group similar errors                               │  │
│  │  - Store in MongoDB                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Store
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ErrorLog Collection                                  │  │
│  │  - message, stack, component                          │  │
│  │  - userId, environment, level                         │  │
│  │  - count, timestamps                                  │  │
│  │  - browser, OS, device info                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Query & Analyze
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Error Rate Tracking Script                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Calculate error rates                              │  │
│  │  - Analyze trends                                     │  │
│  │  - Generate reports                                   │  │
│  │  - Send alerts                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Error Occurs** - Frontend component throws error
2. **Error Caught** - Error boundary catches the error
3. **Error Logged** - POST request to `/api/errors`
4. **Error Stored** - Backend stores in MongoDB (groups similar errors)
5. **Error Tracked** - Script queries and analyzes error data
6. **Report Generated** - Metrics calculated and formatted
7. **Alert Sent** - If threshold exceeded (optional)

---

## Installation

### Prerequisites
- Node.js 14+
- MongoDB connection
- Backend server running
- Error logging system active

### Setup

1. **Ensure MongoDB is connected**:
```bash
# Check .env file
cat backend/.env | grep MONGODB_URI
```

2. **Make script executable** (Linux/Mac):
```bash
chmod +x backend/scripts/track-error-rates.js
```

3. **Test the script**:
```bash
cd backend
node scripts/track-error-rates.js --help
```

---

## Usage

### Basic Usage

**Track errors in last 24 hours**:
```bash
node scripts/track-error-rates.js
```

**Track errors in last 48 hours**:
```bash
node scripts/track-error-rates.js --period 48
```

### Filtering

**Filter by environment**:
```bash
node scripts/track-error-rates.js --environment production
```

**Filter by component**:
```bash
node scripts/track-error-rates.js --component ProfilePage
```

**Filter by error level**:
```bash
node scripts/track-error-rates.js --level error
```

**Combine filters**:
```bash
node scripts/track-error-rates.js --period 72 --environment production --level error
```

### Watch Mode

**Continuous monitoring (60s interval)**:
```bash
node scripts/track-error-rates.js --watch
```

**Custom interval (30s)**:
```bash
node scripts/track-error-rates.js --watch --interval 30
```

**Watch with filters**:
```bash
node scripts/track-error-rates.js --watch --interval 60 --environment production --threshold 5
```

### Export Formats

**Export to JSON**:
```bash
node scripts/track-error-rates.js --export json > error-rates.json
```

**Export to CSV**:
```bash
node scripts/track-error-rates.js --export csv > error-rates.csv
```

**Append to CSV (for time series)**:
```bash
node scripts/track-error-rates.js --export csv >> error-rates-history.csv
```

### Alerting

**Set custom threshold (5 errors/hour)**:
```bash
node scripts/track-error-rates.js --threshold 5
```

**Watch with alert threshold**:
```bash
node scripts/track-error-rates.js --watch --threshold 10
```

---

## Metrics

### Summary Metrics

**Total Errors**:
- Count of unique error instances
- Each unique error (message + component + action) counted once
- Grouped within 24-hour windows

**Total Occurrences**:
- Sum of all error counts
- Same error happening multiple times
- Reflects actual user impact

**Error Rate**:
- Errors per hour
- Formula: `totalErrors / periodHours`
- Used for threshold alerting

**Occurrence Rate**:
- Occurrences per hour
- Formula: `totalOccurrences / periodHours`
- Reflects actual error frequency

**Recovery Rate**:
- Percentage of resolved errors
- Formula: `(resolvedErrors / totalErrors) * 100`
- Target: 95%+ (NFR-REL-1)

### Breakdown Metrics

**By Level**:
- error: Critical errors
- warning: Non-critical issues
- info: Informational logs

**By Component**:
- Top 10 components with most errors
- Helps identify problematic areas

**By Environment**:
- production: Live environment
- staging: Pre-production testing
- development: Local development

**Hourly Distribution**:
- Errors per hour over the period
- Identifies peak error times
- Useful for trend analysis

**Top Errors**:
- Top 10 most frequent error messages
- Includes component, count, occurrences
- Shows last occurrence timestamp

---

## Alerting

### Alert Conditions

An alert is triggered when:
```
errorRate > threshold
```

Default threshold: **10 errors/hour**

### Alert Output

**Console**:
```
⚠️  ALERT: Error rate (12.5) exceeds threshold (10)
```

**JSON**:
```json
{
  "summary": {
    "alert": true,
    "errorRate": 12.5,
    "threshold": 10
  }
}
```

### Recommended Thresholds

| Environment | Threshold | Rationale |
|-------------|-----------|-----------|
| Production | 5-10 | Low tolerance for production errors |
| Staging | 20-30 | Higher tolerance for testing |
| Development | 50+ | Very high tolerance for dev |

### Alert Actions

When an alert is triggered:

1. **Investigate immediately**:
   - Check top errors
   - Identify affected components
   - Review recent deployments

2. **Analyze trends**:
   - Is this a spike or sustained increase?
   - Which components are affected?
   - Are errors user-facing?

3. **Take action**:
   - Fix critical bugs
   - Roll back if necessary
   - Update error boundaries
   - Improve error handling

---

## Integration

### CI/CD Integration

**GitHub Actions** (`.github/workflows/error-monitoring.yml`):
```yaml
name: Error Rate Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  monitor:
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
      
      - name: Track error rates
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: |
          cd backend
          node scripts/track-error-rates.js --period 6 --environment production --threshold 5 --export json > error-report.json
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: error-report
          path: backend/error-report.json
      
      - name: Check threshold
        run: |
          cd backend
          ALERT=$(cat error-report.json | jq -r '.summary.alert')
          if [ "$ALERT" = "true" ]; then
            echo "⚠️ Error rate threshold exceeded!"
            exit 1
          fi
```

### Cron Job (Linux/Mac)

**Setup**:
```bash
# Edit crontab
crontab -e

# Add entry (runs every hour)
0 * * * * cd /path/to/backend && node scripts/track-error-rates.js --environment production --threshold 10 >> /var/log/error-rates.log 2>&1
```

### Monitoring Dashboard

**Integration with monitoring tools**:

1. **Export to JSON**:
```bash
node scripts/track-error-rates.js --export json > /var/www/monitoring/error-rates.json
```

2. **Serve via API**:
```javascript
// backend/src/routes/monitoringRoutes.js
router.get('/error-rates', async (req, res) => {
  const { exec } = require('child_process');
  exec('node scripts/track-error-rates.js --export json', (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(JSON.parse(stdout));
  });
});
```

3. **Display in dashboard**:
```javascript
// Fetch and display
fetch('/api/monitoring/error-rates')
  .then(res => res.json())
  .then(data => {
    // Update dashboard UI
    updateErrorRateChart(data.hourlyDistribution);
    updateTopErrors(data.topErrors);
    updateRecoveryRate(data.summary.recoveryRate);
  });
```

---

## Examples

### Example 1: Daily Production Report

**Command**:
```bash
node scripts/track-error-rates.js --period 24 --environment production
```

**Output**:
```
╔════════════════════════════════════════════════════════════╗
║         Error Rate Tracking Report                        ║
╚════════════════════════════════════════════════════════════╝

Period:
  24 hours (2026-02-21T10:00:00.000Z to 2026-02-22T10:00:00.000Z)

Filters:
  Environment: production
  Component: all
  Level: all

Summary:
  Total Errors: 45
  Total Occurrences: 127
  Error Rate: 1.88 errors/hour
  Occurrence Rate: 5.29 occurrences/hour
  Recovery Rate: 82.22%
  ✓ Error rate is within threshold (10)

Errors by Level:
  error      ████████████████████████████████████ 32 (98 occurrences)
  warning    ████████████ 10 (24 occurrences)
  info       ███ 3 (5 occurrences)

Top 10 Components by Error Count:
   1. ProfilePage                     ████████████████ 12
   2. JobPostingsPage                 ████████████ 9
   3. AuthPage                        ██████████ 8
   4. CoursesPage                     ████████ 6
   5. SettingsPage                    ██████ 5
   6. Navbar                          ████ 3
   7. Footer                          ██ 2

Errors by Environment:
  production      ████████████████████████████████████████████████ 45

Hourly Distribution:
  2026-02-21 10:00 ████ 2
  2026-02-21 11:00 ██████ 3
  2026-02-21 12:00 ████████ 4
  2026-02-21 13:00 ██████ 3
  2026-02-21 14:00 ████ 2
  2026-02-21 15:00 ██████ 3
  2026-02-21 16:00 ████████ 4
  2026-02-21 17:00 ██████████ 5
  2026-02-21 18:00 ████████ 4
  2026-02-21 19:00 ██████ 3
  2026-02-21 20:00 ████ 2
  2026-02-21 21:00 ██████ 3
  2026-02-21 22:00 ████ 2
  2026-02-21 23:00 ██ 1
  2026-02-22 00:00 ████ 2
  2026-02-22 01:00 ██ 1
  2026-02-22 02:00 ██ 1
  2026-02-22 03:00 ██ 1
  2026-02-22 04:00 ████ 2
  2026-02-22 05:00 ██████ 3
  2026-02-22 06:00 ████████ 4
  2026-02-22 07:00 ██████ 3
  2026-02-22 08:00 ████ 2
  2026-02-22 09:00 ██████ 3

Top 10 Errors:
   1. [ProfilePage] Cannot read property 'name' of undefined...
      Count: 8, Occurrences: 24, Last: 2/22/2026, 9:45:23 AM
   2. [JobPostingsPage] Network request failed...
      Count: 6, Occurrences: 18, Last: 2/22/2026, 9:30:15 AM
   3. [AuthPage] Invalid credentials...
      Count: 5, Occurrences: 15, Last: 2/22/2026, 9:15:42 AM

═══════════════════════════════════════════════════════════
Report generated at: 2/22/2026, 10:00:00 AM
═══════════════════════════════════════════════════════════
```

### Example 2: Watch Mode with Alerts

**Command**:
```bash
node scripts/track-error-rates.js --watch --interval 30 --threshold 5 --environment production
```

**Output** (updates every 30 seconds):
```
🔍 Starting error rate monitoring (interval: 30s)...

Press Ctrl+C to stop

[First report at 10:00:00]
Summary:
  Error Rate: 4.2 errors/hour
  ✓ Error rate is within threshold (5)

[Update at 10:00:30]
Summary:
  Error Rate: 5.8 errors/hour
  ⚠️  ALERT: Error rate (5.8) exceeds threshold (5)

[Update at 10:01:00]
Summary:
  Error Rate: 6.1 errors/hour
  ⚠️  ALERT: Error rate (6.1) exceeds threshold (5)
```

### Example 3: Component-Specific Analysis

**Command**:
```bash
node scripts/track-error-rates.js --component ProfilePage --period 48
```

**Output**:
```
Summary:
  Total Errors: 18
  Total Occurrences: 52
  Error Rate: 0.38 errors/hour
  Occurrence Rate: 1.08 occurrences/hour
  Recovery Rate: 88.89%

Top 10 Errors:
   1. [ProfilePage] Cannot read property 'name' of undefined...
      Count: 8, Occurrences: 24
   2. [ProfilePage] Failed to fetch user data...
      Count: 5, Occurrences: 15
   3. [ProfilePage] Image upload failed...
      Count: 3, Occurrences: 9
```

### Example 4: Export to JSON for Analysis

**Command**:
```bash
node scripts/track-error-rates.js --export json > error-rates.json
```

**Output** (`error-rates.json`):
```json
{
  "period": {
    "hours": 24,
    "startDate": "2026-02-21T10:00:00.000Z",
    "endDate": "2026-02-22T10:00:00.000Z"
  },
  "filters": {
    "environment": "all",
    "component": "all",
    "level": "all"
  },
  "summary": {
    "totalErrors": 45,
    "totalOccurrences": 127,
    "errorRate": 1.88,
    "occurrenceRate": 5.29,
    "recoveryRate": 82.22,
    "alert": false,
    "threshold": 10
  },
  "breakdown": {
    "byLevel": [
      { "_id": "error", "count": 32, "occurrences": 98 },
      { "_id": "warning", "count": 10, "occurrences": 24 },
      { "_id": "info", "count": 3, "occurrences": 5 }
    ],
    "byComponent": [
      { "_id": "ProfilePage", "count": 12, "occurrences": 36 },
      { "_id": "JobPostingsPage", "count": 9, "occurrences": 27 }
    ],
    "byEnvironment": [
      { "_id": "production", "count": 45, "occurrences": 127 }
    ]
  },
  "hourlyDistribution": [
    { "_id": "2026-02-21 10:00", "count": 2, "occurrences": 6 },
    { "_id": "2026-02-21 11:00", "count": 3, "occurrences": 9 }
  ],
  "topErrors": [
    {
      "_id": {
        "message": "Cannot read property 'name' of undefined",
        "component": "ProfilePage"
      },
      "count": 8,
      "occurrences": 24,
      "lastOccurrence": "2026-02-22T09:45:23.000Z"
    }
  ],
  "timestamp": "2026-02-22T10:00:00.000Z"
}
```

---

## Troubleshooting

### Common Issues

**1. "MongoDB connection failed"**

**Cause**: Invalid or missing `MONGODB_URI` in `.env`

**Solution**:
```bash
# Check .env file
cat backend/.env | grep MONGODB_URI

# Ensure it's set correctly
MONGODB_URI=mongodb://localhost:27017/careerak
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/careerak
```

**2. "No errors found"**

**Cause**: No errors logged in the specified period/filters

**Solution**:
- Increase period: `--period 48` or `--period 168` (1 week)
- Remove filters: Don't use `--environment`, `--component`, etc.
- Check if error logging is working:
  ```bash
  # Check ErrorLog collection
  mongo careerak --eval "db.errorlogs.count()"
  ```

**3. "Script hangs in watch mode"**

**Cause**: MongoDB connection issue or long-running query

**Solution**:
- Press Ctrl+C to stop
- Check MongoDB connection
- Reduce period: `--period 24` instead of `--period 168`
- Add indexes to ErrorLog collection (should already exist)

**4. "Permission denied"**

**Cause**: Script not executable (Linux/Mac)

**Solution**:
```bash
chmod +x backend/scripts/track-error-rates.js
```

**5. "Module not found"**

**Cause**: Missing dependencies

**Solution**:
```bash
cd backend
npm install
```

---

## Best Practices

### Monitoring Strategy

**1. Regular Monitoring**:
- Run daily reports for production
- Run weekly reports for staging
- Set up automated monitoring (cron/CI)

**2. Alert Thresholds**:
- Start conservative (low threshold)
- Adjust based on baseline
- Different thresholds per environment

**3. Response Plan**:
- Define alert response procedures
- Assign on-call responsibilities
- Document common issues and fixes

### Analysis Workflow

**1. Daily Review**:
```bash
# Morning check
node scripts/track-error-rates.js --period 24 --environment production

# Review top errors
# Check recovery rate
# Identify trends
```

**2. Weekly Analysis**:
```bash
# Weekly report
node scripts/track-error-rates.js --period 168 --environment production --export json > weekly-report.json

# Compare with previous week
# Identify patterns
# Plan improvements
```

**3. Incident Investigation**:
```bash
# When alert triggered
node scripts/track-error-rates.js --period 1 --environment production

# Identify spike
# Check affected components
# Review recent deployments
```

### Data Retention

**1. Export Historical Data**:
```bash
# Daily export
node scripts/track-error-rates.js --export csv >> error-rates-history.csv

# Weekly backup
node scripts/track-error-rates.js --period 168 --export json > weekly-$(date +%Y-%m-%d).json
```

**2. Archive Old Errors**:
```javascript
// Archive errors older than 90 days
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
await ErrorLog.updateMany(
  { createdAt: { $lt: ninetyDaysAgo }, status: 'resolved' },
  { $set: { archived: true } }
);
```

### Performance Optimization

**1. Use Indexes**:
- ErrorLog model already has indexes
- Verify indexes exist:
  ```bash
  mongo careerak --eval "db.errorlogs.getIndexes()"
  ```

**2. Limit Period**:
- Don't query more than 7 days at once
- Use filters to reduce dataset

**3. Batch Processing**:
- For large datasets, process in batches
- Use aggregation pipeline efficiently

---

## Related Documentation

- 📄 `backend/src/models/ErrorLog.js` - ErrorLog model
- 📄 `backend/src/controllers/errorLogController.js` - Error logging API
- 📄 `docs/ERROR_BOUNDARY_IMPLEMENTATION.md` - Error boundary setup
- 📄 `.kiro/specs/general-platform-enhancements/requirements.md` - Requirements
- 📄 `.kiro/specs/general-platform-enhancements/design.md` - Design document

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review error logs: `backend/logs/error.log`
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
