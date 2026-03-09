# EmailChangeService Tests

## Overview

Comprehensive test suite for the EmailChangeService with 32 tests covering all requirements.

## Test Structure

### Test Categories

1. **initiateEmailChange** (8 tests)
   - ✅ Successfully initiate with valid data
   - ✅ Reject duplicate email (Requirement 3.1)
   - ✅ Reject same email
   - ✅ Reject invalid format
   - ✅ Reject non-existent user
   - ✅ Reject missing parameters
   - ✅ Normalize email to lowercase
   - ✅ Delete existing pending requests

2. **sendOTPToOldEmail** (3 tests)
   - ✅ Successfully send OTP (Requirement 3.2)
   - ✅ Reject if no pending request
   - ✅ Reject if request expired

3. **verifyOldEmail** (4 tests)
   - ✅ Successfully verify with correct OTP
   - ✅ Reject incorrect OTP
   - ✅ Reject if no pending request
   - ✅ Reject if request expired

4. **sendOTPToNewEmail** (3 tests)
   - ✅ Successfully send after old email verified (Requirement 3.3)
   - ✅ Reject if old email not verified (Requirement 3.3)
   - ✅ Reject if no pending request

5. **verifyNewEmail** (3 tests)
   - ✅ Successfully verify with correct OTP
   - ✅ Reject incorrect OTP
   - ✅ Reject if old email not verified

6. **verifyAndUpdate** (6 tests)
   - ✅ Successfully update after full verification (Requirements 3.4, 3.5)
   - ✅ Invalidate all other sessions (Requirement 3.5)
   - ✅ Reject incorrect password (Requirement 3.4)
   - ✅ Reject if both emails not verified (Requirement 3.4)
   - ✅ Reject if no pending request
   - ✅ Reject if request expired

7. **getRequestStatus** (2 tests)
   - ✅ Return status if exists
   - ✅ Return null if no pending request

8. **cancelRequest** (2 tests)
   - ✅ Successfully cancel pending request
   - ✅ Return error if no pending request

9. **OTP expiration** (1 test)
   - ✅ OTP expires after 15 minutes

## Requirements Coverage

| Requirement | Description | Tests |
|-------------|-------------|-------|
| 3.1 | Check new email not already registered | ✅ 1 test |
| 3.2 | Send OTP to old email | ✅ 3 tests |
| 3.3 | Send OTP to new email after old verified | ✅ 3 tests |
| 3.4 | Require password confirmation | ✅ 3 tests |
| 3.5 | Update email and invalidate sessions | ✅ 2 tests |
| 3.6 | Send notifications | ✅ Covered in service |

## Running Tests

### Prerequisites

The tests require MongoDB Memory Server. If you encounter timeout issues:

```bash
# Option 1: Increase timeout
npm test -- emailChangeService.test.js --testTimeout=60000

# Option 2: Use real MongoDB (update test file)
# Replace MongoMemoryServer with real MongoDB connection

# Option 3: Download MongoDB binary manually
# The first run downloads the MongoDB binary which may take time
```

### Expected Output

```
Test Suites: 1 passed, 1 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        ~15s
```

## Test Environment

- **Framework**: Jest
- **Database**: MongoDB Memory Server (in-memory)
- **Mocks**: Logger, NotificationService
- **Timeout**: 60 seconds (for MongoDB setup)

## Test Data

### Sample User
```javascript
{
  email: 'test@example.com',
  password: 'Password123!',
  role: 'Employee',
  phone: '+201234567890',
  country: 'Egypt',
  firstName: 'Test',
  lastName: 'User'
}
```

### Sample Session
```javascript
{
  userId: ObjectId,
  token: 'test-token-hash',
  device: {
    type: 'desktop',
    os: 'Windows 10',
    browser: 'Chrome',
    fingerprint: 'test-fingerprint'
  },
  location: {
    ipAddress: '192.168.1.1',
    country: 'Egypt',
    city: 'Cairo'
  },
  expiresAt: Date (30 days from now)
}
```

## Troubleshooting

### MongoDB Memory Server Timeout

If you see "Instance failed to start within 10000ms":

1. **First run**: The binary download may take time. Wait for completion.
2. **Network issues**: Check internet connection for binary download.
3. **Increase timeout**: Already set to 60s in test file.
4. **Use real MongoDB**: For CI/CD, consider using real MongoDB instance.

### Test Failures

1. **Check MongoDB connection**: Ensure MongoDB Memory Server started successfully.
2. **Check mocks**: Verify logger and notificationService mocks are working.
3. **Check models**: Ensure EmailChangeRequest, User, ActiveSession models are correct.

## Integration with CI/CD

For CI/CD pipelines, consider:

1. **Pre-download MongoDB binary**: Cache the binary to speed up tests.
2. **Use Docker MongoDB**: Run real MongoDB in Docker container.
3. **Increase timeout**: Set `--testTimeout=120000` for slower environments.

## Code Coverage

Expected coverage:
- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: 100%
- **Lines**: > 95%

## Next Steps

After tests pass:
1. Create EmailChangeController (Task 3.2)
2. Create EmailChangeRoutes (Task 3.3)
3. Integrate with frontend (Task 3.4)
