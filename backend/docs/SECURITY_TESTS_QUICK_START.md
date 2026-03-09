# Security Tests Quick Start Guide

## Overview

Quick guide to run and understand the security tests for Settings Page Enhancements.

## Prerequisites

```bash
# Ensure you're in the backend directory
cd backend

# Install dependencies
npm install

# Set up test environment variables
cp .env.example .env.test
```

## Running Tests

### Run All Security Tests (35 tests)
```bash
npm test -- settings-security.test.js
```

### Run Specific Test Suites

**CSRF Protection (6 tests)**:
```bash
npm test -- settings-security.test.js -t "CSRF Protection"
```

**Rate Limiting (4 tests)**:
```bash
npm test -- settings-security.test.js -t "Rate Limiting"
```

**XSS Prevention (5 tests)**:
```bash
npm test -- settings-security.test.js -t "XSS Prevention"
```

**SQL Injection Prevention (4 tests)**:
```bash
npm test -- settings-security.test.js -t "SQL Injection Prevention"
```

**Session Hijacking Prevention (5 tests)**:
```bash
npm test -- settings-security.test.js -t "Session Hijacking Prevention"
```

**Brute Force Protection (6 tests)**:
```bash
npm test -- settings-security.test.js -t "Brute Force Protection"
```

**Additional Security (5 tests)**:
```bash
npm test -- settings-security.test.js -t "Additional Security Measures"
```

### Run with Coverage
```bash
npm test -- settings-security.test.js --coverage
```

### Run in Watch Mode
```bash
npm test -- settings-security.test.js --watch
```

## Expected Output

```
PASS  src/__tests__/security/settings-security.test.js
  Security Tests - Settings Page Enhancements
    CSRF Protection
      ✓ should reject POST request without CSRF token (50ms)
      ✓ should reject POST request with invalid CSRF token (45ms)
      ✓ should accept POST request with valid CSRF token (60ms)
      ✓ should reject PUT request without CSRF token (40ms)
      ✓ should reject DELETE request without CSRF token (38ms)
      ✓ should allow GET requests without CSRF token (35ms)
    Rate Limiting
      ✓ should allow requests within rate limit (200ms)
      ✓ should block requests exceeding rate limit (10 req/min) (500ms)
      ✓ should include rate limit headers (40ms)
      ✓ should have stricter limits for sensitive operations (450ms)
    XSS Prevention
      ✓ should sanitize script tags in profile name (55ms)
      ✓ should sanitize HTML entities in input (52ms)
      ✓ should sanitize JavaScript event handlers (48ms)
      ✓ should sanitize iframe injection (50ms)
      ✓ should allow safe HTML entities (45ms)
    SQL Injection Prevention
      ✓ should prevent SQL injection in email field (60ms)
      ✓ should prevent NoSQL injection in query parameters (55ms)
      ✓ should prevent NoSQL injection in request body (58ms)
      ✓ should sanitize special MongoDB operators (52ms)
    Session Hijacking Prevention
      ✓ should reject expired JWT token (45ms)
      ✓ should reject tampered JWT token (42ms)
      ✓ should reject token with invalid signature (48ms)
      ✓ should invalidate sessions after password change (120ms)
      ✓ should include security headers (40ms)
    Brute Force Protection
      ✓ should allow valid login attempts (80ms)
      ✓ should track failed login attempts (250ms)
      ✓ should lock account after 5 failed attempts (400ms)
      ✓ should unlock account after 30 minutes (50ms)
      ✓ should detect suspicious activity patterns (600ms)
      ✓ should log security events (70ms)
    Additional Security Measures
      ✓ should validate input length limits (55ms)
      ✓ should validate email format (52ms)
      ✓ should validate password strength (58ms)
      ✓ should prevent parameter pollution (48ms)
      ✓ should have secure cookie settings (65ms)

Test Suites: 1 passed, 1 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        4.5s
```

## What Each Test Validates

### ✅ CSRF Protection (Requirement 14.1)
- All POST/PUT/DELETE requests require valid CSRF token
- Invalid tokens are rejected with 403
- GET requests don't require CSRF token

### ✅ Rate Limiting (Requirement 14.2)
- Maximum 10 requests per minute for sensitive operations
- Exceeding limit returns 429 Too Many Requests
- Rate limit headers included in responses

### ✅ XSS Prevention (Requirement 14.4)
- All HTML tags are stripped or escaped
- JavaScript code is removed
- Event handlers (onclick, onerror) are removed
- Iframes are blocked

### ✅ SQL Injection Prevention (Requirement 14.3)
- SQL injection attempts are rejected
- NoSQL operators ($ne, $gt, $where) are sanitized
- Invalid input formats return 400/422

### ✅ Session Hijacking Prevention (Requirement 14.5)
- Expired tokens return 401 Unauthorized
- Tampered tokens are rejected
- Password changes invalidate all other sessions
- Security headers are present

### ✅ Brute Force Protection (Requirement 14.6)
- Failed login attempts are tracked
- Account locks after 5 failed attempts
- Locked accounts unlock after 30 minutes
- Suspicious patterns are detected

## Troubleshooting

### "Cannot find module" Error
```bash
# Install missing dependencies
npm install
```

### "MongoDB connection failed" Error
```bash
# Ensure MongoDB is running
# Or update MONGODB_URI_TEST in .env.test
```

### "JWT_SECRET not defined" Error
```bash
# Add to .env.test
echo "JWT_SECRET=test_jwt_secret_key" >> .env.test
```

### Tests Timing Out
```bash
# Increase timeout in jest.config.js
testTimeout: 30000
```

### Rate Limiting Tests Failing
```bash
# Clear rate limit cache between test runs
# Or increase wait time between requests
```

## Quick Verification

Run this command to verify all security measures are working:

```bash
npm test -- settings-security.test.js --verbose
```

Expected: **35 tests passed** ✅

## Next Steps

1. ✅ Run all security tests
2. ✅ Verify all tests pass
3. ✅ Review test coverage report
4. ✅ Fix any failing tests
5. ✅ Add to CI/CD pipeline
6. ✅ Schedule regular security audits

## CI/CD Integration

Add to `.github/workflows/security-tests.yml`:

```yaml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security-tests:
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
      
      - name: Run security tests
        run: |
          cd backend
          npm test -- settings-security.test.js
        env:
          MONGODB_URI_TEST: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Documentation

For detailed information, see:
- 📄 `SETTINGS_SECURITY_TESTS.md` - Complete documentation
- 📄 `settings-security.test.js` - Test implementation

## Support

For questions or issues:
- Email: careerak.hr@gmail.com
- Security Team: security@careerak.com

---

**Last Updated**: 2026-03-09  
**Version**: 1.0.0
