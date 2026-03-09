# Integration Tests for Settings Page Enhancements

## Overview

This directory contains comprehensive integration tests for the Settings Page Enhancements feature. These tests validate complete end-to-end user journeys and ensure multiple services work together correctly.

## Test Files

### settings-flows.integration.test.js

Complete integration tests for all major settings flows:

1. **Email Change Flow** - Complete email change from start to finish
2. **2FA Activation Flow** - Complete 2FA setup and usage
3. **Account Deletion Flow** - Complete deletion with grace period
4. **Data Export Flow** - Complete data export and download

## Test Coverage

### 1. Email Change Flow Tests

**Complete Flow Test:**
- Request email change
- Verify old email with OTP
- Verify new email with OTP
- Confirm with password
- Email updated successfully
- All other sessions invalidated
- Notifications sent to both emails

**Edge Cases:**
- Reject if new email already exists
- Expire request after 15 minutes
- Validate OTP correctness

### 2. 2FA Activation Flow Tests

**Complete Flow Test:**
- Request 2FA activation
- Receive QR code and secret
- Verify OTP to confirm setup
- Receive 10 backup codes
- 2FA enabled in user profile
- Login requires OTP
- Backup codes work as alternative

**Additional Tests:**
- Disable 2FA with password and OTP
- Regenerate backup codes
- Mark backup codes as used

### 3. Account Deletion Flow Tests

**Complete Flow Test:**
- Request scheduled deletion (30-day grace period)
- Account marked for deletion
- User can still access during grace period
- User can cancel deletion
- Reminder sent 7 days before deletion
- After grace period, account permanently deleted
- All user data removed
- Legal data anonymized

**Additional Tests:**
- Immediate deletion
- Require 2FA OTP if enabled
- Send deletion reminders
- Cleanup all related data

### 4. Data Export Flow Tests

**Complete Flow Test:**
- Request data export with options
- Export request created (pending)
- Background job processes export
- Export completed with download link
- User can download data
- Download link expires after 7 days
- Export completes within 48 hours

**Additional Tests:**
- Support multiple formats (JSON, CSV, PDF)
- Support multiple data types
- Reject expired download tokens
- Prevent unauthorized access
- Cleanup expired exports
- Handle processing errors

### 5. Cross-Flow Integration Tests

**Tests:**
- Email change during pending deletion (should reject)
- 2FA operations during pending deletion (should reject)
- Data export during pending deletion (should allow)

## Running the Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Specific Test File
```bash
npm test -- settings-flows.integration.test.js
```

### Run with Coverage
```bash
npm run test:integration:coverage
```

### Run in Watch Mode
```bash
npm test -- settings-flows.integration.test.js --watch
```

## Test Environment

### Database
- Uses MongoDB Memory Server for isolated testing
- Each test gets a fresh database
- All collections cleared between tests

### Authentication
- JWT tokens generated for test users
- Tokens valid for 7 days
- Each test creates its own test user

### Services
- All services are real implementations
- No mocking of core business logic
- External services (email, SMS) may be mocked

## Test Data

### Test User
```javascript
{
  email: 'test@example.com',
  password: 'Test123!@#',
  role: 'Employee',
  phone: '+201234567890',
  country: 'Egypt',
  firstName: 'Test',
  lastName: 'User'
}
```

### Helper Functions
- `createTestUser(overrides)` - Create test user with custom data
- `generateAuthToken(userId)` - Generate JWT token for user

## Models Used

### EmailChangeRequest
- Tracks email change requests
- Stores OTP verification status
- Auto-expires after 15 minutes

### AccountDeletionRequest
- Tracks deletion requests
- Supports immediate and scheduled deletion
- Manages 30-day grace period

### DataExportRequest
- Tracks export requests
- Stores download tokens
- Auto-expires after 7 days

### ActiveSession
- Tracks user sessions
- Stores device and location info
- Auto-expires after 30 days of inactivity

## Assertions

### Common Assertions
- Response status codes (200, 400, 403, 409, 410)
- Response body structure
- Database state changes
- Timestamps and dates
- Token validity
- Data consistency

### Security Assertions
- Authentication required
- Authorization checks
- Password verification
- OTP validation
- Token expiration

## Best Practices

### Test Structure
1. **Arrange** - Set up test data and state
2. **Act** - Execute the operation
3. **Assert** - Verify the results

### Test Isolation
- Each test is independent
- No shared state between tests
- Database cleared between tests
- Fresh test user for each test

### Test Naming
- Descriptive test names
- Use "should" prefix
- Describe expected behavior
- Include context when needed

### Error Handling
- Test both success and failure cases
- Verify error codes and messages
- Test edge cases and boundaries
- Test invalid inputs

## Maintenance

### Adding New Tests
1. Follow existing test structure
2. Use helper functions
3. Clean up after test
4. Document test purpose

### Updating Tests
1. Keep tests in sync with requirements
2. Update when API changes
3. Maintain test coverage
4. Review test failures

### Debugging Tests
1. Run single test in isolation
2. Check database state
3. Verify request/response
4. Review error messages

## CI/CD Integration

### GitHub Actions
- Tests run on every push
- Tests run on every pull request
- Coverage reports generated
- Failures block merge

### Test Timeouts
- Default: 5 seconds per test
- Long-running tests: 30 seconds
- Background jobs: 60 seconds

## Performance

### Test Execution Time
- All tests: ~30-60 seconds
- Single flow: ~5-10 seconds
- Database setup: ~2-3 seconds

### Optimization
- Use MongoDB Memory Server
- Parallel test execution
- Efficient database queries
- Minimal test data

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Ensure MongoDB Memory Server is installed
npm install --save-dev mongodb-memory-server
```

**JWT Secret Missing:**
```bash
# Set JWT_SECRET in .env or use default
JWT_SECRET=test-secret npm test
```

**Tests Timeout:**
```bash
# Increase timeout in jest.config.js
testTimeout: 30000
```

**Port Already in Use:**
```bash
# Kill process using the port
lsof -ti:3000 | xargs kill -9
```

## Related Documentation

- [Requirements Document](../../../.kiro/specs/settings-page-enhancements/requirements.md)
- [Design Document](../../../.kiro/specs/settings-page-enhancements/design.md)
- [Tasks Document](../../../.kiro/specs/settings-page-enhancements/tasks.md)

## Contact

For questions or issues with these tests, please refer to the project documentation or contact the development team.
