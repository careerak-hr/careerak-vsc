# Integration Tests - Apply Page Enhancements

This directory contains comprehensive integration tests for the Apply Page Enhancements feature.

## Test Files

### 1. application-flow.integration.test.js
**Tests Task 21.1: Complete Application Flow End-to-End**

Covers:
- ✅ Auto-fill from profile data
- ✅ Draft save and restore
- ✅ File upload and removal
- ✅ Multi-step navigation
- ✅ Preview and submission
- ✅ Status updates
- ✅ Withdrawal

**Test Count**: 20+ tests

### 2. application-error-scenarios.integration.test.js
**Tests Task 21.2: Error Scenarios**

Covers:
- ✅ Network failures during save
- ✅ Network failures during submission
- ✅ File upload failures
- ✅ Validation errors
- ✅ Concurrent draft updates
- ✅ Authentication and authorization errors

**Test Count**: 25+ tests

### 3. application-edge-cases.integration.test.js
**Tests Task 21.3: Edge Cases**

Covers:
- ✅ Empty profile handling
- ✅ Maximum files (10)
- ✅ Maximum custom questions (5)
- ✅ Very long text inputs
- ✅ Special characters (Unicode, SQL injection, XSS)
- ✅ Boundary values

**Test Count**: 30+ tests

## Running Tests

### Run All Integration Tests
```bash
cd backend
npm test -- tests/integration/
```

### Run Specific Test File
```bash
# Application flow tests
npm test -- tests/integration/application-flow.integration.test.js

# Error scenario tests
npm test -- tests/integration/application-error-scenarios.integration.test.js

# Edge case tests
npm test -- tests/integration/application-edge-cases.integration.test.js
```

### Run with Coverage
```bash
npm test -- tests/integration/ --coverage
```

### Run in Watch Mode
```bash
npm test -- tests/integration/ --watch
```

## Test Environment

All integration tests use:
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **Supertest**: HTTP assertions
- **Jest**: Test framework

## Test Data

Each test file creates its own test data:
- Test users (applicant, HR, company)
- Test job postings
- Test applications and drafts

All data is cleaned up after each test.

## Requirements Coverage

| Requirement | Test File | Status |
|-------------|-----------|--------|
| 1.1-1.7 (Auto-fill) | application-flow.integration.test.js | ✅ |
| 2.1-2.7 (Draft Management) | application-flow.integration.test.js | ✅ |
| 2.6, 11.2, 11.3 (Error Handling) | application-error-scenarios.integration.test.js | ✅ |
| 3.1-3.6 (Preview & Submit) | application-flow.integration.test.js | ✅ |
| 4.1-4.10 (File Upload) | application-flow.integration.test.js | ✅ |
| 4.6, 4.8 (File Validation) | application-error-scenarios.integration.test.js | ✅ |
| 5.1-5.7 (Status Tracking) | application-flow.integration.test.js | ✅ |
| 6.1-6.6 (Withdrawal) | application-flow.integration.test.js | ✅ |
| 7.1-7.8 (Multi-step Form) | application-flow.integration.test.js | ✅ |
| 8.1-8.7 (Custom Questions) | application-edge-cases.integration.test.js | ✅ |
| 9.1-9.10 (UX) | application-error-scenarios.integration.test.js | ✅ |

## Expected Results

All tests should pass:
```
PASS  tests/integration/application-flow.integration.test.js
PASS  tests/integration/application-error-scenarios.integration.test.js
PASS  tests/integration/application-edge-cases.integration.test.js

Test Suites: 3 passed, 3 total
Tests:       75+ passed, 75+ total
```

## Troubleshooting

### MongoDB Memory Server Issues
If you encounter MongoDB Memory Server errors:
```bash
npm install --save-dev mongodb-memory-server
```

### Timeout Issues
If tests timeout, increase Jest timeout:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### Port Conflicts
If you get port conflicts, ensure no other instances are running:
```bash
# Kill any running Node processes
pkill -f node
```

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: |
    cd backend
    npm test -- tests/integration/ --ci --coverage
```

## Next Steps

After all integration tests pass:
1. ✅ Run performance tests (Task 22)
2. ✅ Run accessibility tests (Task 23)
3. ✅ Prepare for deployment (Task 24)
4. ✅ Final checkpoint (Task 25)
