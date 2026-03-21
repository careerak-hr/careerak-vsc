# Performance Testing Installation Guide

## Prerequisites

Before running performance tests, ensure you have the following installed:

### Required Dependencies

**Backend**:
- Node.js 18+
- MongoDB running
- All backend dependencies: `npm install`

**Frontend**:
- Node.js 18+
- All frontend dependencies: `npm install`

### Optional Dependencies for Measurement Script

The performance measurement script (`measure-performance.js`) requires Puppeteer for automated browser testing.

**Install Puppeteer** (optional, only if using measurement script):
```bash
cd frontend
npm install --save-dev puppeteer
```

**Note**: Puppeteer is ~300MB and includes Chromium. Only install if you need automated browser testing.

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Verify MongoDB is running
# MongoDB should be accessible at the URI in .env

# Run performance tests
npm run test:performance
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run performance tests (no Puppeteer needed)
npm run test:performance
```

### 3. Measurement Script Setup (Optional)

If you want to use the automated measurement script:

```bash
cd frontend

# Install Puppeteer
npm install --save-dev puppeteer

# Build the project
npm run build

# Run measurement
npm run measure:performance
```

## Verification

### Verify Backend Tests
```bash
cd backend
npm run test:performance
```

**Expected Output**:
```
Apply Page Performance Tests
  ✓ Initial form load should be < 2 seconds
  ✓ Profile data fetch should be < 1 second
  ✓ Draft restore should be < 2 seconds
  ...

✅ All performance tests passed!
```

### Verify Frontend Tests
```bash
cd frontend
npm run test:performance
```

**Expected Output**:
```
Frontend Performance Tests
  ✓ MultiStepForm should render quickly
  ✓ Auto-save should debounce correctly
  ✓ Step navigation should be smooth
  ...

✅ All frontend performance tests passed!
```

### Verify Measurement Script (Optional)
```bash
cd frontend
npm run measure:performance
```

**Expected Output**:
```
╔════════════════════════════════════════════════════════════╗
║         Apply Page Performance Measurement                ║
╚════════════════════════════════════════════════════════════╝

Performance Report
═══════════════════════════════════════════════════════════
✓ Page Load Time              1200ms (threshold: 2000ms)
✓ FCP                         720ms (threshold: 1800ms)
...

✅ All performance metrics meet thresholds!
```

## Troubleshooting

### "Cannot find module 'puppeteer'"

**Solution**: Install Puppeteer (only needed for measurement script)
```bash
cd frontend
npm install --save-dev puppeteer
```

### "MongoDB connection failed"

**Solution**: Ensure MongoDB is running
```bash
# Check MongoDB status
mongosh

# Or start MongoDB service
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod
```

### "Tests timeout"

**Solution**: Increase timeout or check network speed
```bash
# Run with increased timeout
npm run test:performance -- --testTimeout=10000
```

### "Port already in use"

**Solution**: Change port or kill existing process
```bash
# Find process using port 3000
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Kill process
# Windows: taskkill /PID <PID> /F
# Linux/Mac: kill -9 <PID>
```

## Alternative: Without Puppeteer

If you don't want to install Puppeteer, you can still:

1. **Run automated tests** (no Puppeteer needed):
   ```bash
   npm run test:performance
   ```

2. **Manual testing** using Chrome DevTools:
   - Open application in browser
   - Open DevTools (F12)
   - Go to Performance tab
   - Record and analyze

3. **Lighthouse** (built into Chrome):
   ```bash
   # If you have Lighthouse CLI installed
   lighthouse http://localhost:3000/apply --view
   ```

## Dependencies Summary

### Required (Always)
- Node.js 18+
- npm or yarn
- MongoDB
- Backend dependencies (package.json)
- Frontend dependencies (package.json)

### Optional (For Measurement Script)
- Puppeteer (~300MB)
- Chromium (included with Puppeteer)

### Optional (For Enhanced Testing)
- Lighthouse CLI
- Chrome DevTools Protocol

## Next Steps

After installation:

1. ✅ Run backend tests: `npm run test:performance`
2. ✅ Run frontend tests: `npm run test:performance`
3. ✅ Review documentation: `PERFORMANCE_TESTING_GUIDE.md`
4. ✅ Try manual testing: Follow quick start guide
5. ✅ Set up CI/CD: Use GitHub Actions example

---

**Last Updated**: 2026-03-04
