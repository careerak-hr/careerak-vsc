# Property-Based Testing Guide: Apply Page Enhancements

## Overview

This document provides a comprehensive guide for implementing all 25 property-based tests for the Apply Page Enhancements feature using fast-check library with 100+ iterations per test.

## Test Configuration

```javascript
// jest.config.js or vitest.config.js
export default {
  testMatch: ['**/*.property.test.js'],
  testTimeout: 30000, // 30 seconds for property tests
};
```

## Fast-Check Setup

```bash
npm install --save-dev fast-check
```

## Property Tests Checklist

### Data Transfer Properties (3 tests)

- [ ] **Property 1: Auto-fill completeness** (Task 8.2)
  - File: `backend/tests/auto-fill-completeness.property.test.js`
  - Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
  - Iterations: 100+

- [ ] **Property 3: User modifications persistence** (Task 8.3)
  - File: `backend/tests/user-modifications-persistence.property.test.js`
  - Validates: Requirements 1.6, 7.7
  - Iterations: 100+

- [ ] **Property 21: Empty profile field handling** (Task 8.4)
  - File: `backend/tests/empty-profile-handling.property.test.js`
  - Validates: Requirements 1.7
  - Iterations: 100+

### Persistence Properties (5 tests)

- [ ] **Property 2: Draft round-trip preservation** (Task 2.2)
  - File: `backend/tests/draft-round-trip.property.test.js`
  - Validates: Requirements 2.3, 2.4, 4.10
  - Iterations: 100+

- [ ] **Property 5: Draft deletion after submission** (Task 3.2)
  - File: `backend/tests/draft-deletion.property.test.js`
  - Validates: Requirements 2.7
  - Iterations: 100+

- [ ] **Property 17: Local storage synchronization** (Task 7.6)
  - File: `frontend/tests/local-storage-sync.property.test.js`
  - Validates: Requirements 11.3, 11.4
  - Iterations: 100+

- [ ] **Property 24: Backend persistence** (Implicit in Task 2.2)
  - File: `backend/tests/backend-persistence.property.test.js`
  - Validates: Requirements 11.1
  - Iterations: 100+

- [ ] **Property 25: Dual source checking** (Implicit in Task 7.2)
  - File: `frontend/tests/dual-source-checking.property.test.js`
  - Validates: Requirements 11.5
  - Iterations: 100+

### Validation Properties (4 tests)

- [ ] **Property 4: File validation correctness** (Task 4.2)
  - File: `backend/tests/file-validation.property.test.js`
  - Validates: Requirements 4.3, 4.4, 4.5
  - Iterations: 100+

- [ ] **Property 7: Step validation enforcement** (Task 10.5)
  - File: `frontend/tests/step-validation.property.test.js`
  - Validates: Requirements 7.4, 7.5
  - Iterations: 100+

- [ ] **Property 13: Custom question validation** (Task 11.3)
  - File: `frontend/tests/custom-question-validation.property.test.js`
  - Validates: Requirements 8.3
  - Iterations: 100+

- [ ] **Property 22: Validation feedback consistency** (Task 17.3)
  - File: `frontend/tests/validation-feedback.property.test.js`
  - Validates: Requirements 9.2, 9.3
  - Iterations: 100+

### Navigation Properties (3 tests)

- [ ] **Property 12: Navigation data preservation** (Task 6.2)
  - File: `frontend/tests/navigation-preservation.property.test.js`
  - Validates: Requirements 3.5, 7.7
  - Iterations: 100+

- [ ] **Property 18: Backward navigation without validation** (Task 10.6)
  - File: `frontend/tests/backward-navigation.property.test.js`
  - Validates: Requirements 7.6
  - Iterations: 100+

- [ ] **Property 19: Progress indicator accuracy** (Task 10.7)
  - File: `frontend/tests/progress-indicator.property.test.js`
  - Validates: Requirements 7.2
  - Iterations: 100+

### Status Management Properties (4 tests)

- [ ] **Property 8: Status change notifications** (Task 16.3)
  - File: `backend/tests/status-notifications.property.test.js`
  - Validates: Requirements 5.4, 5.5
  - Iterations: 100+

- [ ] **Property 9: Withdrawal restrictions** (Task 3.3)
  - File: `backend/tests/withdrawal-restrictions.property.test.js`
  - Validates: Requirements 6.1, 6.5
  - Iterations: 100+

- [ ] **Property 10: Withdrawal completeness** (Task 15.2)
  - File: `backend/tests/withdrawal-completeness.property.test.js`
  - Validates: Requirements 6.3, 6.4, 6.6
  - Iterations: 100+

- [ ] **Property 20: Status timeline accuracy** (Task 14.3)
  - File: `frontend/tests/status-timeline.property.test.js`
  - Validates: Requirements 5.2, 5.3
  - Iterations: 100+

### File Management Properties (1 test)

- [ ] **Property 15: File removal completeness** (Task 4.3)
  - File: `backend/tests/file-removal.property.test.js`
  - Validates: Requirements 4.9
  - Iterations: 100+

### Preview & Display Properties (2 tests)

- [ ] **Property 11: Preview data completeness** (Task 12.3)
  - File: `frontend/tests/preview-completeness.property.test.js`
  - Validates: Requirements 3.2, 3.3
  - Iterations: 100+

- [ ] **Property 14: Custom answer persistence** (Task 12.4)
  - File: `backend/tests/custom-answer-persistence.property.test.js`
  - Validates: Requirements 8.6
  - Iterations: 100+

### Conflict Resolution Properties (2 tests)

- [ ] **Property 6: Auto-save retry on failure** (Task 7.4)
  - File: `frontend/tests/auto-save-retry.property.test.js`
  - Validates: Requirements 2.6, 11.2, 11.3
  - Iterations: 100+

- [ ] **Property 16: Conflict resolution by timestamp** (Task 7.5)
  - File: `frontend/tests/conflict-resolution.property.test.js`
  - Validates: Requirements 11.6
  - Iterations: 100+

### Error Handling Properties (1 test)

- [ ] **Property 23: Error message clarity** (Task 17.4)
  - File: `frontend/tests/error-message-clarity.property.test.js`
  - Validates: Requirements 9.6
  - Iterations: 100+

## Test Template

```javascript
const fc = require('fast-check');
const { describe, it, expect } = require('@jest/globals');

describe('Property X: [Property Name]', () => {
  it('should [property description] for all valid inputs', () => {
    fc.assert(
      fc.property(
        // Arbitraries (data generators)
        fc.record({
          // Define your data structure
        }),
        // Test function
        async (data) => {
          // Arrange
          // Act
          // Assert
        }
      ),
      {
        numRuns: 100, // Minimum 100 iterations
        verbose: true,
        seed: Date.now(),
      }
    );
  });
});
```

## Common Arbitraries

```javascript
// User Profile
const userProfileArbitrary = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  education: fc.array(
    fc.record({
      level: fc.constantFrom('High School', 'Bachelor', 'Master', 'PhD'),
      degree: fc.string(),
      institution: fc.string(),
      year: fc.integer({ min: 1950, max: 2024 }),
    }),
    { maxLength: 10 }
  ),
  experience: fc.array(
    fc.record({
      company: fc.string(),
      position: fc.string(),
      from: fc.date(),
      to: fc.date(),
      current: fc.boolean(),
    }),
    { maxLength: 10 }
  ),
  computerSkills: fc.array(
    fc.record({
      skill: fc.string(),
      proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'),
    }),
    { maxLength: 20 }
  ),
  languages: fc.array(
    fc.record({
      language: fc.string(),
      proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native'),
    }),
    { maxLength: 10 }
  ),
});

// Draft Data
const draftDataArbitrary = fc.record({
  step: fc.integer({ min: 1, max: 5 }),
  formData: fc.record({
    fullName: fc.string(),
    email: fc.emailAddress(),
    phone: fc.string(),
    education: fc.array(fc.object(), { maxLength: 10 }),
    experience: fc.array(fc.object(), { maxLength: 10 }),
    skills: fc.array(fc.string(), { maxLength: 20 }),
  }),
  files: fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string(),
      size: fc.integer({ min: 1, max: 5000000 }),
      type: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),
      url: fc.webUrl(),
    }),
    { maxLength: 10 }
  ),
});

// File
const fileArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  size: fc.integer({ min: 1, max: 10000000 }),
  type: fc.constantFrom(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain', // invalid
    'video/mp4' // invalid
  ),
});

// Application Status
const applicationStatusArbitrary = fc.constantFrom(
  'Submitted',
  'Reviewed',
  'Shortlisted',
  'Interview Scheduled',
  'Accepted',
  'Rejected',
  'Withdrawn'
);
```

## Running Tests

```bash
# Run all property tests
npm test -- --testPathPattern=property.test.js

# Run specific property test
npm test -- auto-fill-completeness.property.test.js

# Run with coverage
npm test -- --coverage --testPathPattern=property.test.js

# Run with verbose output
npm test -- --verbose --testPathPattern=property.test.js
```

## Success Criteria

✅ All 25 property tests implemented
✅ Each test runs 100+ iterations
✅ All tests pass consistently
✅ Tests tagged with feature name and property number
✅ Tests cover all acceptance criteria
✅ Tests use appropriate arbitraries
✅ Tests have clear assertions
✅ Tests handle edge cases

## Tag Format

Each test should be tagged:
```javascript
// Tag format: Feature: apply-page-enhancements, Property {number}: {property_text}
```

Example:
```javascript
describe('Feature: apply-page-enhancements, Property 1: Auto-fill completeness', () => {
  // test implementation
});
```

## Next Steps

1. Review this guide
2. Set up fast-check in your project
3. Implement tests incrementally following the tasks.md order
4. Run tests after each implementation
5. Ensure all 25 tests pass before marking this task complete

## Notes

- Property tests are marked with `*` in tasks.md (optional for MVP but required for this task)
- Tests should be implemented alongside feature development
- Each property test validates universal correctness across all inputs
- Use appropriate arbitraries for data generation
- Tests should be deterministic (use seed for reproducibility)
- Tests should be fast (< 30 seconds per test)
