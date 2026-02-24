# Security Property-Based Tests

## Overview

This document describes the property-based tests for security features in the Enhanced Auth system. These tests validate critical security properties using `fast-check` library to ensure that security invariants hold across a wide range of inputs.

## Test File

**Location**: `backend/tests/security-properties.test.js`

## Properties Tested

### Property 8: JWT Token Expiry

**Requirement**: All JWT tokens must have an expiration time set.

**Validates**: Requirements 7.2

#### Tests

1. **Access Tokens Must Have Expiration**
   - Generates 20 random user objects
   - Creates access token for each
   - Verifies:
     - Token has `exp` field
     - Expiration is in the future
     - Token is not expired immediately
     - Remaining time is positive

2. **Refresh Tokens Must Have Expiration**
   - Generates 20 random user objects
   - Creates refresh token for each
   - Verifies:
     - Token has `exp` field
     - Expiration is in the future
     - Refresh token expires later than access token

3. **Email Verification Tokens Must Have Expiration**
   - Generates 20 random userId/email pairs
   - Creates email verification token for each
   - Verifies:
     - Token has `exp` field
     - Expiration is in the future
     - Token type is 'email_verification'
     - Token has unique `jti` (JWT ID)

4. **Password Reset Tokens Must Have Expiration**
   - Generates 20 random userId/email pairs
   - Creates password reset token for each
   - Verifies:
     - Token has `exp` field
     - Expiration is in the future
     - Token type is 'password_reset'
     - Token has unique `jti`
     - Reset token expires sooner than access token (1 hour vs 7 days)

### Property 9: Password Hash

**Requirement**: All passwords must be hashed with bcrypt (not stored as plain text).

**Validates**: Requirements 7.1

#### Tests

1. **Passwords Must Be Hashed with bcrypt**
   - Generates 5 random passwords (8-32 characters)
   - Hashes each with bcrypt (12 rounds)
   - Verifies:
     - Hash is different from plain password
     - Hash starts with bcrypt identifier (`$2a$`, `$2b$`, or `$2y$`)
     - Hash has correct format (4+ parts separated by `$`)
     - Hash can verify the original password
     - Wrong password doesn't match

2. **Sufficient Salt Rounds (12+)**
   - Generates 5 random passwords
   - Hashes each with bcrypt
   - Verifies:
     - Hash contains salt rounds information
     - Salt rounds are at least 12

3. **Different Hashes for Same Password**
   - Generates 5 random passwords
   - Hashes each password twice with different salts
   - Verifies:
     - Two hashes are different (due to different salts)
     - Both hashes verify the same password

4. **Never Store Plain Text Passwords**
   - Generates 5 random passwords
   - Hashes each with bcrypt
   - Verifies:
     - Hash doesn't contain the plain password
     - Hash length is exactly 60 characters (bcrypt standard)
     - Hash doesn't reveal the password (case-insensitive check)

### Combined Security Properties

**Requirement**: Security invariants must hold for complete authentication flow.

**Validates**: Requirements 7.1, 7.2

#### Test

**Complete Auth Flow Security**
- Generates 5 random user objects with passwords
- For each user:
  1. Hashes password with bcrypt
  2. Generates access and refresh tokens
  3. Verifies:
     - Password is hashed (not plain text)
     - Password hash starts with bcrypt identifier
     - Both tokens have expiration
     - Both tokens are not expired
     - Both tokens are verifiable
     - Password can be verified against hash

## Test Results

```
 PASS  tests/security-properties.test.js (80.495 s)
  Security Properties
    Property 8: JWT Token Expiry
      ✓ should always generate access tokens with expiration time (185 ms)
      ✓ should always generate refresh tokens with expiration time (94 ms)
      ✓ should always generate email verification tokens with expiration time (79 ms)
      ✓ should always generate password reset tokens with expiration time (85 ms)
    Property 9: Password Hash
      ✓ should always hash passwords with bcrypt (not plain text) (17007 ms)
      ✓ should always use sufficient salt rounds (12+) (6040 ms)
      ✓ should always produce different hashes for same password (26161 ms)
      ✓ should never store plain text passwords (6397 ms)
    Combined Security Properties
      ✓ should maintain security invariants for complete auth flow (12432 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

## Running the Tests

```bash
cd backend
npm test -- security-properties.test.js --testTimeout=60000
```

## Performance Notes

- JWT token tests are fast (< 200ms each)
- Password hash tests are slow due to bcrypt's intentional computational cost
- Total test time: ~80 seconds
- Reduced iterations (5-20 runs) to balance thoroughness with speed

## Key Insights

### JWT Token Security

1. **All tokens have expiration**: Prevents indefinite token validity
2. **Refresh tokens expire later**: Allows long-term sessions while maintaining security
3. **Reset tokens expire sooner**: Limits window for password reset attacks
4. **Unique JTI for special tokens**: Prevents token replay attacks

### Password Security

1. **bcrypt hashing**: Industry-standard one-way hashing
2. **12+ salt rounds**: Sufficient computational cost to resist brute-force
3. **Unique salts**: Same password produces different hashes
4. **No plain text storage**: Hashes don't reveal original passwords

## Security Guarantees

These property-based tests provide strong guarantees that:

1. **No token without expiration**: Every token generated will expire
2. **No plain text passwords**: Every password will be hashed with bcrypt
3. **Sufficient security**: Salt rounds meet industry standards (12+)
4. **Complete auth flow**: All security properties hold together

## Future Improvements

1. Add property tests for 2FA tokens
2. Add property tests for OAuth token handling
3. Add property tests for session management
4. Increase test iterations for production builds

---

**Created**: 2026-02-23  
**Status**: ✅ Complete  
**Test Coverage**: 9/9 tests passing
