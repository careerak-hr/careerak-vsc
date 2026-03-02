# Error Rate Tracking - Quick Start Guide

**5-Minute Setup** | Get started with error rate tracking in minutes

---

## Prerequisites

- ✅ Backend server running
- ✅ MongoDB connected
- ✅ Error logging system active
- ✅ Node.js 14+ installed

---

## Quick Start (3 Steps)

### Step 1: Navigate to Backend (10 seconds)

```bash
cd backend
```

### Step 2: Run the Script (5 seconds)

```bash
node scripts/track-error-rates.js
```

### Step 3: Review the Report (2 minutes)

You'll see a comprehensive report with:
- Total errors and error rate
- Errors by level, component, environment
- Hourly distribution
- Top 10 most frequent errors
- Recovery rate

**Done!** 🎉

---

## Common Use Cases

### 1. Daily Production Check (30 seconds)

```bash
node scripts/track-error-rates.js --environment production
```

**What it does**: Shows errors in production for last 24 hours

**When to use**: Every morning to check overnight errors

---

### 2. Watch Mode (Continuous Monitoring)

```bash
node scripts/track-error-rates.js --watch --interval 60
```

**What it does**: Updates every 60 seconds with latest error rates

**When to use**: During deployments or incident response

**Stop**: Press `Ctrl+C`

---

### 3. Component-Specific Analysis (1 minute)

```bash
node scripts/track-error-rates.js --component ProfilePage
```

**What it does**: Shows errors only for ProfilePage component

**When to use**: Debugging specific component issues

---

### 4. Alert on High Error Rate (30 seconds)

```bash
node scripts/track-error-rates.js --threshold 5
```

**What it does**: Alerts if error rate exceeds 5 errors/hour

**When to use**: Automated monitoring with alerts

---

### 5. Export to JSON (30 seconds)

```bash
node scripts/track-error-rates.js --export json > error-report.json
```

**What it does**: Saves report as JSON file

**When to use**: Integrating with dashboards or CI/CD

---

## Understanding the Output

### Summary Section

```
Summary:
  Total Errors: 45              ← Unique error instances
  Total Occurrences: 127        ← Total times errors occurred
  Error Rate: 1.88 errors/hour  ← Errors per hour
  Occurrence Rate: 5.29/hour    ← Occurrences per hour
  Recovery Rate: 82.22%         ← % of resolved errors
  ✓ Error rate is within threshold (10)
```

**Key Metrics**:
- **Error Rate**: Should be < 10 errors/hour (default threshold)
- **Recovery Rate**: Should be > 95% (target: NFR-REL-1)
- **Alert**: Shows ⚠️ if threshold exceeded

### Errors by Level

```
Errors by Level:
  error      ████████████████████████████████████ 32 (98 occurrences)
  warning    ████████████ 10 (24 occurrences)
  info       ███ 3 (5 occurrences)
```

**Interpretation**:
- **error**: Critical issues (fix immediately)
- **warning**: Non-critical issues (fix soon)
- **info**: Informational (review periodically)

### Top Components

```
Top 10 Components by Error Count:
   1. ProfilePage                     ████████████████ 12
   2. JobPostingsPage                 ████████████ 9
   3. AuthPage                        ██████████ 8
```

**Action**: Focus on top 3 components for maximum impact

### Hourly Distribution

```
Hourly Distribution:
  2026-02-21 10:00 ████ 2
  2026-02-21 11:00 ██████ 3
  2026-02-21 12:00 ████████ 4
```

**Insights**:
- Identify peak error times
- Correlate with traffic patterns
- Detect deployment issues

### Top Errors

```
Top 10 Errors:
   1. [ProfilePage] Cannot read property 'name' of undefined...
      Count: 8, Occurrences: 24, Last: 2/22/2026, 9:45:23 AM
```

**Action**: Fix errors with highest occurrence count first

---

## Quick Troubleshooting

### "MongoDB connection failed"

**Fix**:
```bash
# Check .env file
cat .env | grep MONGODB_URI

# Should see something like:
# MONGODB_URI=mongodb://localhost:27017/careerak
```

### "No errors found"

**Fix**: Increase time period
```bash
node scripts/track-error-rates.js --period 48
```

### "Permission denied"

**Fix** (Linux/Mac):
```bash
chmod +x scripts/track-error-rates.js
```

---

## Next Steps

### Set Up Automated Monitoring

**Option 1: Cron Job** (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line (runs every hour)
0 * * * * cd /path/to/backend && node scripts/track-error-rates.js --environment production >> /var/log/error-rates.log 2>&1
```

**Option 2: GitHub Actions**
```yaml
# .github/workflows/error-monitoring.yml
name: Error Monitoring
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Track errors
        run: |
          cd backend
          npm install
          node scripts/track-error-rates.js --environment production
```

### Integrate with Dashboard

**Export to JSON**:
```bash
node scripts/track-error-rates.js --export json > /var/www/monitoring/error-rates.json
```

**Serve via API**:
```javascript
// Add to backend routes
app.get('/api/monitoring/error-rates', (req, res) => {
  const { exec } = require('child_process');
  exec('node scripts/track-error-rates.js --export json', (error, stdout) => {
    res.json(JSON.parse(stdout));
  });
});
```

### Set Up Alerts

**Email Alert** (using nodemailer):
```javascript
// scripts/alert-on-high-errors.js
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

exec('node scripts/track-error-rates.js --export json', (error, stdout) => {
  const data = JSON.parse(stdout);
  
  if (data.summary.alert) {
    // Send email alert
    const transporter = nodemailer.createTransport({...});
    transporter.sendMail({
      to: 'admin@careerak.com',
      subject: '⚠️ High Error Rate Alert',
      text: `Error rate: ${data.summary.errorRate} errors/hour`,
    });
  }
});
```

---

## Command Reference

### Basic Commands

| Command | Description |
|---------|-------------|
| `node scripts/track-error-rates.js` | Track last 24 hours |
| `--period 48` | Track last 48 hours |
| `--environment production` | Filter by environment |
| `--component ProfilePage` | Filter by component |
| `--level error` | Filter by error level |
| `--threshold 5` | Set alert threshold |
| `--watch` | Continuous monitoring |
| `--interval 30` | Update every 30 seconds |
| `--export json` | Export as JSON |
| `--export csv` | Export as CSV |
| `--help` | Show help message |

### Example Combinations

```bash
# Production errors in last 48 hours with alert
node scripts/track-error-rates.js --period 48 --environment production --threshold 5

# Watch specific component with 30s updates
node scripts/track-error-rates.js --watch --interval 30 --component ProfilePage

# Export production errors to JSON
node scripts/track-error-rates.js --environment production --export json > report.json

# Critical errors only in last week
node scripts/track-error-rates.js --period 168 --level error
```

---

## Tips & Best Practices

### Daily Routine

**Morning Check** (1 minute):
```bash
node scripts/track-error-rates.js --environment production
```

**Review**:
- ✅ Error rate < 10/hour?
- ✅ Recovery rate > 95%?
- ✅ Any new top errors?

### During Deployment

**Before Deploy**:
```bash
# Get baseline
node scripts/track-error-rates.js --period 1 --export json > pre-deploy.json
```

**After Deploy** (watch for 10 minutes):
```bash
# Monitor in real-time
node scripts/track-error-rates.js --watch --interval 30 --threshold 5
```

**Compare**:
```bash
# Get post-deploy stats
node scripts/track-error-rates.js --period 1 --export json > post-deploy.json

# Compare error rates
diff pre-deploy.json post-deploy.json
```

### Incident Response

**When alert triggered**:

1. **Check current state** (10 seconds):
   ```bash
   node scripts/track-error-rates.js --period 1
   ```

2. **Identify spike** (30 seconds):
   - Review top errors
   - Check affected components
   - Note error rate

3. **Investigate** (5 minutes):
   ```bash
   # Component-specific
   node scripts/track-error-rates.js --component [TopComponent] --period 2
   ```

4. **Monitor fix** (continuous):
   ```bash
   # Watch mode
   node scripts/track-error-rates.js --watch --interval 30
   ```

---

## Full Documentation

For comprehensive documentation, see:
- 📄 `docs/ERROR_RATE_TRACKING.md` - Complete guide (50+ pages)

---

## Support

**Issues?**
- Check `backend/logs/error.log`
- Review MongoDB connection
- Verify error logging is active

**Questions?**
- Email: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use
