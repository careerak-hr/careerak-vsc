# Error Conditions Testing - Quick Start Guide
## Apply Page Enhancements

**Last Updated**: 2026-03-04  
**Estimated Time**: 10 minutes

---

## Prerequisites

### Backend
```bash
cd backend
npm install
```

Required packages:
- `jest` - Testing framework
- `supertest` - HTTP assertions
- `mongodb-memory-server` - In-memory MongoDB for testing

### Frontend
```bash
cd frontend
npm install
```

Required packages:
- `@testing-library/react` - React testing utilities
- `@testing-library/user-event` - User interaction simulation
- `msw` - Mock Service Worker for API mocking
- `jest` - Testing framework

---

## Running Tests

### Backend Tests (24 tests)

```bash
cd backend

# Run all error condition tests
npm test -- apply-page-error-conditions.test.js

# Run with coverage
npm test -- apply-page-error-conditions.test.js --coverage

# Run specific test suite
npm test -- apply-page-error-conditions.test.js -t "Network Failure"

# Run in watch mode
npm test -- apply-page-error-conditions.test.js --watch
```

**Expected Duration**: ~30 seconds

### Frontend Tests (26 tests)

```bash
cd frontend

# Run all error condition tests
npm test -- apply-page-error-conditions.test.jsx

# Run with coverage
npm test -- apply-page-error-conditions.test.jsx --coverage

# Run specific test suite
npm test -- apply-page-error-conditions.test.jsx -t "Validation Error"

# Run in watch mode
npm test -- apply-page-error-conditions.test.jsx --watch
```

**Expected Duration**: ~45 seconds

### Run All Tests

```bash
# From project root
npm run test:error-conditions
```

---

## Test Categories

### 1. Network Failures (10 tests)
Tests network timeouts, connection failures, and offline scenarios.

```bash
# Backend
npm test -- apply-page-error-conditions.test.js -t "Network Failure"

# Frontend
npm test -- apply-page-error-conditions.test.jsx -t "Network Failure"
```

### 2. Validation Errors (13 tests)
Tests form validation, required fields, and format validation.

```bash
# Backend
npm test -- apply-page-error-conditions.test.js -t "Validation Error"

# Frontend
npm test -- apply-page-error-conditions.test.jsx -t "Validation Error"
```

### 3. File Upload Errors (10 tests)
Tests file type, size, and count validation.

```bash
# Backend
npm test -- apply-page-error-conditions.test.js -t "File Upload"

# Frontend
npm test -- apply-page-error-conditions.test.jsx -t "File Upload"
```

### 4. Concurrent Updates (2 tests)
Tests concurrent draft updates and duplicate submissions.

```bash
# Backend only
npm test -- apply-page-error-conditions.test.js -t "Concurrent Update"
```

### 5. Authentication Errors (3 tests)
Tests authentication and authorization failures.

```bash
# Backend only
npm test -- apply-page-error-conditions.test.js -t "Authentication"
```

### 6. Error Messages (5 tests)
Tests error message clarity and user-friendliness.

```bash
# Backend
npm test -- apply-page-error-conditions.test.js -t "Error Message"

# Frontend
npm test -- apply-page-error-conditions.test.jsx -t "Error Message"
```

### 7. Recovery Scenarios (4 tests)
Tests error recovery and retry mechanisms.

```bash
# Backend
npm test -- apply-page-error-conditions.test.js -t "Recovery"

# Frontend
npm test -- apply-page-error-conditions.test.jsx -t "Auto-Save Error Recovery"
```

### 8. Edge Cases (3 tests)
Tests edge cases like empty data and special characters.

```bash
# Frontend only
npm test -- apply-page-error-conditions.test.jsx -t "Edge Case"
```

---

## Expected Results

### All Tests Passing

```
PASS  backend/tests/apply-page-error-conditions.test.js
  Apply Page - Error Conditions
    Network Failure Scenarios
      ✓ should handle network timeout during draft save (150ms)
      ✓ should handle network failure during application submission (120ms)
      ✓ should handle database connection failure during draft save (200ms)
    Validation Error Scenarios
      ✓ should reject draft with missing required fields (80ms)
      ✓ should reject application with invalid email format (75ms)
      ✓ should reject application with invalid phone format (70ms)
      ✓ should reject draft with invalid step number (65ms)
      ✓ should reject application with missing required custom question answer (90ms)
    File Upload Error Scenarios
      ✓ should reject file with invalid type (60ms)
      ✓ should reject file exceeding size limit (65ms)
      ✓ should reject more than 10 files (70ms)
      ✓ should handle Cloudinary upload failure gracefully (85ms)
    Concurrent Update Scenarios
      ✓ should handle concurrent draft updates correctly (180ms)
      ✓ should prevent duplicate application submission (95ms)
    Authentication and Authorization Errors
      ✓ should reject draft save without authentication (55ms)
      ✓ should reject application submission with invalid token (60ms)
      ✓ should reject accessing another user's draft (75ms)
    Error Message Quality
      ✓ should provide clear error message for validation failure (70ms)
      ✓ should provide helpful error message for network timeout (80ms)
    Recovery and Retry Scenarios
      ✓ should successfully save draft after previous failure (120ms)
      ✓ should handle retry after database reconnection (150ms)

Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
Time:        2.5s
```

```
PASS  frontend/src/tests/apply-page-error-conditions.test.jsx
  Frontend Error Conditions
    Network Failure Handling
      ✓ should display error message when draft save fails (250ms)
      ✓ should fallback to local storage when network fails (180ms)
      ✓ should retry save when connection is restored (200ms)
      ✓ should display offline indicator when network is unavailable (150ms)
      ✓ should handle submission failure gracefully (220ms)
    Validation Error Display
      ✓ should display inline validation errors for empty required fields (180ms)
      ✓ should display validation error for invalid email format (160ms)
      ✓ should display validation error for invalid phone format (155ms)
      ✓ should prevent navigation to next step with validation errors (170ms)
      ✓ should clear validation errors when field is corrected (190ms)
      ✓ should display validation error for required custom question (200ms)
    File Upload Error Handling
      ✓ should display error for invalid file type (140ms)
      ✓ should display error for file exceeding size limit (150ms)
      ✓ should display error when maximum file count is reached (145ms)
      ✓ should handle Cloudinary upload failure (180ms)
      ✓ should allow retry after upload failure (210ms)
    Error Message Quality
      ✓ should display user-friendly error messages (160ms)
      ✓ should provide corrective action suggestions in error messages (155ms)
      ✓ should display specific error for each validation failure (175ms)
    Auto-Save Error Recovery
      ✓ should continue auto-saving after error (5200ms)
      ✓ should show last saved timestamp after successful save (3500ms)
    Edge Case Error Handling
      ✓ should handle empty profile data gracefully (180ms)
      ✓ should handle very long text inputs (200ms)
      ✓ should handle special characters in input (170ms)

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Time:        12.8s
```

---

## Troubleshooting

### Backend Tests Failing

**Issue**: MongoDB connection error
```
Solution: Ensure MongoDB is running or use mongodb-memory-server
npm install --save-dev mongodb-memory-server
```

**Issue**: Timeout errors
```
Solution: Increase Jest timeout in test file
jest.setTimeout(10000); // 10 seconds
```

**Issue**: Authentication errors
```
Solution: Check JWT_SECRET is set in .env.test
JWT_SECRET=test-secret-key-for-testing
```

### Frontend Tests Failing

**Issue**: MSW not intercepting requests
```
Solution: Ensure MSW server is set up correctly
Check server.listen(), server.resetHandlers(), server.close() in test setup
```

**Issue**: Component not rendering
```
Solution: Ensure all providers are wrapped correctly
Use renderWithProviders helper function
```

**Issue**: User events not working
```
Solution: Use @testing-library/user-event instead of fireEvent
await userEvent.type(input, 'text');
```

---

## Coverage Report

Generate coverage report:

```bash
# Backend
cd backend
npm test -- apply-page-error-conditions.test.js --coverage

# Frontend
cd frontend
npm test -- apply-page-error-conditions.test.jsx --coverage
```

**Expected Coverage**:
- Statements: 85%+
- Branches: 80%+
- Functions: 85%+
- Lines: 85%+

---

## Next Steps

After all tests pass:

1. ✅ Mark task 21.2 as complete in tasks.md
2. ✅ Update design.md testing checklist
3. ✅ Review error messages for consistency
4. ✅ Test error scenarios manually in development
5. ⏭️ Proceed to cross-browser testing
6. ⏭️ Proceed to mobile responsive testing

---

## Additional Resources

- **Full Test Report**: `ERROR_CONDITIONS_TEST_REPORT.md`
- **Design Document**: `design.md`
- **Requirements Document**: `requirements.md`
- **Tasks Document**: `tasks.md`

---

## Quick Commands Reference

```bash
# Backend - All tests
npm test -- apply-page-error-conditions.test.js

# Backend - Network failures only
npm test -- apply-page-error-conditions.test.js -t "Network"

# Backend - With coverage
npm test -- apply-page-error-conditions.test.js --coverage

# Frontend - All tests
npm test -- apply-page-error-conditions.test.jsx

# Frontend - Validation errors only
npm test -- apply-page-error-conditions.test.jsx -t "Validation"

# Frontend - With coverage
npm test -- apply-page-error-conditions.test.jsx --coverage

# Watch mode (auto-rerun on changes)
npm test -- apply-page-error-conditions.test.js --watch
```

---

**Total Test Execution Time**: ~1 minute  
**Total Tests**: 50 (24 backend + 26 frontend)  
**Expected Pass Rate**: 100%
