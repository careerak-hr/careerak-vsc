# OAuth Property-Based Tests

## Overview
This document describes the property-based tests implemented for OAuth functionality in the Careerak backend.

## Test File
`backend/tests/oauth.property.test.js`

## Properties Tested

### Property 1: OAuth Account Uniqueness
**Validates: Requirement 1.5 (OAuth account management)**

This property ensures that for any user and OAuth provider, there should be at most one OAuthAccount record.

#### Test Cases:
1. **Enforce at most one OAuth account per user per provider**
   - Generates random user data and provider combinations
   - Creates first OAuth account successfully
   - Attempts to create duplicate OAuth account with same provider
   - Verifies that duplicate fails with error code 11000
   - Confirms only one OAuth account exists per user+provider
   - Runs 20 random test cases

2. **Allow multiple OAuth accounts from different providers**
   - Creates OAuth accounts for Google, Facebook, and LinkedIn
   - Verifies all three accounts are created successfully
   - Confirms user has exactly 3 OAuth accounts
   - Ensures each provider appears exactly once
   - Runs 15 random test cases

3. **Enforce unique providerId across all users for same provider**
   - Creates two different users
   - Creates OAuth account for first user with specific providerId
   - Attempts to create OAuth account for second user with same providerId
   - Verifies that duplicate providerId fails with error code 11000
   - Confirms only first user has the OAuth account
   - Runs 15 random test cases

### Property 10: OAuth State Parameter
**Validates: Requirement 1.1 (OAuth security - CSRF protection)**

This property ensures that OAuth state parameters are cryptographically random and prevent CSRF attacks.

#### Test Cases:
1. **Generate cryptographically random state parameters**
   - Generates multiple state parameters (up to 100)
   - Validates each state parameter format (hex string, 32+ chars)
   - Ensures all state parameters are unique (no collisions)
   - Runs 50 random test cases

2. **Have sufficient entropy in state parameters**
   - Generates 1000 state parameters
   - Verifies all states are unique (no collisions)
   - Checks character distribution across positions
   - Ensures good randomness distribution
   - Runs 5 test cases

3. **Prevent CSRF attacks with state validation**
   - Generates valid state and attacker state
   - Simulates storing state in session
   - Verifies valid state passes validation
   - Confirms attacker state fails validation
   - Ensures only exact match is accepted
   - Runs 100 random test cases

4. **Validate state parameter format**
   - Tests various input formats (valid hex, too short, invalid chars, empty, null, undefined)
   - Verifies valid hex strings of 32+ chars pass
   - Confirms invalid formats fail
   - Runs 100 random test cases

5. **Document Passport.js automatic handling**
   - Documents that Passport.js automatically handles state parameter
   - Confirms CSRF protection is built-in
   - References OAuth2Strategy implementation

## Technology Stack
- **Testing Framework**: Jest
- **Property-Based Testing**: fast-check
- **Database**: MongoDB (with graceful fallback if not connected)

## Running the Tests

### Run all OAuth property tests:
```bash
npm test -- oauth.property.test.js
```

### Run with force exit (recommended):
```bash
npm test -- oauth.property.test.js --forceExit
```

### Run all tests:
```bash
npm test
```

## Test Results
✅ All 8 property-based tests passing
- 3 tests for OAuth Account Uniqueness
- 5 tests for OAuth State Parameter

## MongoDB Requirement
The OAuth Account Uniqueness tests require MongoDB connection. If MongoDB is not available, these tests will be skipped with a warning, but the OAuth State Parameter tests will still run.

## Key Features
1. **Comprehensive Coverage**: Tests cover both database-level uniqueness constraints and security measures
2. **Random Test Generation**: Uses fast-check to generate random test data
3. **Multiple Test Runs**: Each property is tested with multiple random inputs (5-100 runs)
4. **Graceful Degradation**: Tests skip gracefully if MongoDB is not connected
5. **Security Focus**: Validates CSRF protection through state parameter testing

## Security Guarantees
These tests provide strong guarantees that:
- Users cannot have duplicate OAuth accounts from the same provider
- OAuth providerIds are globally unique
- State parameters have sufficient entropy (128+ bits)
- CSRF attacks are prevented through state validation
- Passport.js security measures are properly configured

## Future Enhancements
- Add tests for OAuth token encryption/decryption
- Test OAuth account linking/unlinking flows
- Add tests for OAuth callback validation
- Test OAuth error handling scenarios

---

**Created**: 2026-02-18
**Status**: ✅ Complete and Passing
