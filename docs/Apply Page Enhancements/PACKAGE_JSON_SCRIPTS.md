# Package.json Scripts for Cross-Browser Testing

Add these scripts to your `frontend/package.json` file:

```json
{
  "scripts": {
    "test:browsers": "playwright test cross-browser.spec.js",
    "test:chrome": "playwright test cross-browser.spec.js --project=chromium",
    "test:firefox": "playwright test cross-browser.spec.js --project=firefox",
    "test:safari": "playwright test cross-browser.spec.js --project=webkit",
    "test:mobile": "playwright test cross-browser.spec.js --project='Mobile Chrome' --project='Mobile Safari'",
    "test:browsers:ui": "playwright test cross-browser.spec.js --ui",
    "test:browsers:debug": "playwright test cross-browser.spec.js --debug",
    "test:browsers:headed": "playwright test cross-browser.spec.js --headed",
    "test:browsers:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

## Installation

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

## Usage

```bash
# Run all browser tests
npm run test:browsers

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run mobile tests
npm run test:mobile

# Run with UI mode (interactive)
npm run test:browsers:ui

# Run in debug mode
npm run test:browsers:debug

# Run in headed mode (see browser)
npm run test:browsers:headed

# View test report
npm run test:browsers:report
```

## CI/CD Integration

Add to `.github/workflows/cross-browser-tests.yml`:

```yaml
name: Cross-Browser Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
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
          npm ci
          
      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps
          
      - name: Run cross-browser tests
        run: |
          cd frontend
          npm run test:browsers
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

## Environment Variables

Create `frontend/.env.test`:

```env
TEST_URL=http://localhost:3000
TEST_JOB_ID=test-job-123
```

## Test Fixtures

Create test files in `frontend/tests/fixtures/`:

```
frontend/tests/fixtures/
├── test-resume.pdf
├── test-cover-letter.pdf
├── test-certificate.jpg
└── test-portfolio.png
```

---

**Note**: Make sure to run `npm run dev` before running tests locally, or the tests will start the dev server automatically.
