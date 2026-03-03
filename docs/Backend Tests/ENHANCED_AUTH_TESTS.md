# Enhanced Auth Integration Tests

This directory contains comprehensive integration tests for the Enhanced Auth feature.

## Test Files

1. **enhanced-auth-registration.integration.test.js** - Full registration flow (4 steps)
2. **enhanced-auth-oauth.integration.test.js** - OAuth flow (Google, Facebook, LinkedIn)
3. **enhanced-auth-password-reset.integration.test.js** - Forgot Password flow
4. **enhanced-auth-email-verification.integration.test.js** - Email Verification flow

## Running Tests

\\\ash
# Run all enhanced-auth tests
npm test -- enhanced-auth

# Run specific test file
npm test -- enhanced-auth-registration

# Run with coverage
npm test -- --coverage enhanced-auth
\\\

## Requirements Covered

All requirements from .kiro/specs/enhanced-auth/requirements.md

