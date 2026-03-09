# Email Change Property-Based Tests

## Overview

This document describes the property-based tests for the Email Change Service, implementing **Property 3** and **Property 4** from the Settings Page Enhancements specification.

## Test File

`backend/tests/email-change.property.test.js`

## Properties Tested

### Property 3: Unique Identifier Enforcement

**Statement**: For any email or phone number that is already registered, attempting to change to that identifier should be rejected with an "already in use" error.

**Validates**: Requirements 3.1, 4.1

**Test Cases**:

1. **Should always reject email change to an already registered email**
   - Creates two users with different emails
   - Attempts to change user1's email to user2's email
   - Verifies the request is rejected
   - Verifies no request is created in the database
   - Verifies the original email remains unchanged

2. **Should always reject email change to the same current email**
   - Creates a user
   - Attempts to change email to the same current email
   - Verifies the request is rejected
   - Verifies no request is created

3. **Should always succeed when changing to a unique email**
   - Creates a user
   - Attempts to change to a unique, unregistered email
   - Verifies the request succeeds
   - Verifies a request is created in the database with correct data

### Property 4: Email Change Verification Flow

**Statement**: For any valid email change request, the system should require verification of both old and new emails plus password confirmation before updating.

**Validates**: Requirements 3.2, 3.3, 3.4, 3.5

**Test Cases**:

1. **Should always require old email verification before new email verification**
   - Creates a user and initiates email change
   - Attempts to send OTP to new email without verifying old email
   - Verifies the request is rejected
   - Verifies the request status remains unchanged

2. **Should always require password confirmation before final update**
   - Creates a user and completes full verification flow
   - Attempts to update with incorrect password
   - Verifies the request is rejected
   - Verifies the email remains unchanged
   - Verifies the request remains pending

3. **Should always succeed with complete verification flow and correct password**
   - Creates a user
   - Completes full verification flow (old email → new email)
   - Updates with correct password
   - Verifies the email is updated in the database
   - Verifies the request is marked as completed

4. **Should always invalidate other sessions when email is changed**
   - Creates a user with multiple active sessions
   - Completes email change flow
   - Verifies all sessions except the current one are invalidated
   - Verifies only one session remains

5. **Should complete full email change flow step by step** (Unit Test)
   - Tests the complete flow from initiation to completion
   - Verifies each step succeeds
   - Verifies final state is correct

## Test Configuration

- **Framework**: Jest + fast-check
- **Runs per property**: 15-20 (reduced from 100 for faster execution)
- **Timeout**: 120 seconds per test
- **Database**: MongoDB (via connectDB)

## Arbitraries (Data Generators)

- `validEmailArbitrary()`: Generates valid email addresses
- `validPasswordArbitrary()`: Generates valid passwords (8-20 chars with complexity)
- `validPhoneArbitrary()`: Generates valid Egyptian phone numbers
- `userDataArbitrary()`: Generates complete user data objects

## Helper Functions

- `createTestUser(userData)`: Creates a test user in the database
- `createTestSession(userId, token)`: Creates a test session
- `cleanup(userIds)`: Cleans up test data after each test
- `completeVerificationFlow(userId)`: Completes the full OTP verification flow

## Running the Tests

```bash
# Run all email change property tests
npm test -- email-change.property.test.js

# Run with verbose output
npm test -- email-change.property.test.js --verbose

# Run specific test suite
npm test -- email-change.property.test.js -t "Property 3"
npm test -- email-change.property.test.js -t "Property 4"
```

## Expected Results

All tests should pass, validating that:

✅ Email uniqueness is enforced (Requirement 3.1)
✅ Old email verification is required before new email (Requirement 3.2, 3.3)
✅ Password confirmation is required (Requirement 3.4)
✅ All sessions are invalidated except current (Requirement 3.5)
✅ The complete flow works end-to-end

## Integration with Existing Tests

These property-based tests complement the existing unit tests in `emailChangeService.test.js`:

- **Unit tests**: Test specific scenarios and edge cases
- **Property tests**: Test general properties across thousands of random inputs

Both test suites should pass for complete coverage.

## Notes

- Tests use MongoDB in-memory or local test database
- All test data is cleaned up after each test
- Tests are isolated and can run in any order
- Fast-check generates random but reproducible test cases
- Shrinking is enabled to find minimal failing examples

## Troubleshooting

If tests fail:

1. **Check MongoDB connection**: Ensure MongoDB is running
2. **Check test timeout**: Property tests may need more time
3. **Check data cleanup**: Ensure beforeEach clears all collections
4. **Check arbitraries**: Ensure generated data is valid
5. **Check shrinking output**: Fast-check shows minimal failing example

## References

- Spec: `.kiro/specs/settings-page-enhancements/`
- Requirements: `requirements.md` (3.1-3.5, 4.1)
- Design: `design.md` (EmailChangeService section)
- Tasks: `tasks.md` (Task 3.2, 3.3)
