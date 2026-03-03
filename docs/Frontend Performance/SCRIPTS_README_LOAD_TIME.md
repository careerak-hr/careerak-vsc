# Load Time Measurement Script

## Quick Start

```bash
# 1. Build production bundle
npm run build

# 2. Measure load time improvement
npm run measure:load-time
```

## What It Measures

- **FCP** (First Contentful Paint) - Time to first content
- **TTI** (Time to Interactive) - Time until fully interactive
- **LCP** (Largest Contentful Paint) - Time to largest content
- **TBT** (Total Blocking Time) - Main thread blocking time
- **Speed Index** - Visual display speed

## Target

- **40-60% improvement** from baseline
- Tested on **Fast 3G** network (realistic mobile scenario)

## Output

The script will:
1. Start a local server on port 3002
2. Run Lighthouse on each page with Fast 3G throttling
3. Calculate improvements vs baseline
4. Generate a detailed JSON report
5. Show pass/fail for each metric

## Example Output

```
✅ SUCCESS: All load time targets met!
Average improvement: 53.41%

📉 Improvements:
✓ FCP: 52.00% improvement (3.5s → 1.68s)
✓ TTI: 49.86% improvement (7.0s → 3.51s)
✓ LCP: 50.44% improvement (4.5s → 2.23s)
✓ TBT: 67.75% improvement (800ms → 258ms)
✓ Speed Index: 47.00% improvement (6.0s → 3.18s)
```

## Report Location

Reports are saved to: `build/load-time-report-<timestamp>.json`

## Troubleshooting

### Build folder not found
```bash
npm run build
```

### Port 3002 in use
```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Takes too long
- This is normal - Lighthouse needs time to run
- Expect 2-5 minutes for all pages
- Each page takes 30-60 seconds

## Full Documentation

See `docs/LOAD_TIME_MEASUREMENT.md` for complete documentation.
