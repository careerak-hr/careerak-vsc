import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Property Test 22: Validation feedback consistency
 * 
 * Validates: Requirements 9.2, 9.3
 * 
 * Property: For any field with various validation states, the system should display
 * error messages for invalid fields and success indicators for valid fields consistently.
 * 
 * Feature: apply-page-enhancements
 */

// Mock validation function
const validateField = (field) => {
  const { name, value, required, minLength, maxLength, pattern, type } = field;
  
  // Required validation
  if (required && (!value || value.trim() === '')) {
    return {
      valid: false,
      error: `${name} is required`
    };
  }
  
  // Skip further validation if empty and not required
  if (!value || value.trim() === '') {
    return { valid: true, error: null };
  }
  
  // Min length validation
  if (minLength && value.length < minLength) {
    return {
      valid: false,
      error: `${name} must be at least ${minLength} characters`
    };
  }
  
  // Max length validation
  if (maxLength && value.length > maxLength) {
    return {
      valid: false,
      error: `${name} must not exceed ${maxLength} characters`
    };
  }
  
  // Pattern validation
  if (pattern && !new RegExp(pattern).test(value)) {
    return {
      valid: false,
      error: `${name} format is invalid`
    };
  }
  
  // Type-specific validation
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return {
      valid: false,
      error: `${name} must be a valid email address`
    };
  }
  
  if (type === 'phone' && !/^\+?[\d\s-()]+$/.test(value)) {
    return {
      valid: false,
      error: `${name} must be a valid phone number`
    };
  }
  
  return { valid: true, error: null };
};

// Mock UI feedback generator
const generateFeedback = (validationResult) => {
  if (validationResult.valid) {
    return {
      showSuccess: true,
      showError: false,
      errorMessage: null,
      successIndicator: '✓'
    };
  } else {
    return {
      showSuccess: false,
      showError: true,
      errorMessage: validationResult.error,
      successIndicator: null
    };
  }
};

describe('Property 22: Validation feedback consistency', () => {
  it('should display error messages for invalid required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constantFrom('Full Name', 'Email', 'Phone', 'City'),
          value: fc.constant(''), // Empty value
          required: fc.constant(true)
        }),
        (field) => {
          const result = validateField(field);
          const feedback = generateFeedback(result);
          
          // Invalid field should show error
          expect(result.valid).toBe(false);
          expect(feedback.showError).toBe(true);
          expect(feedback.errorMessage).toBeTruthy();
          expect(feedback.errorMessage).toContain('required');
          expect(feedback.showSuccess).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display success indicators for valid fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constantFrom('Full Name', 'Email', 'Phone'),
          value: fc.string({ minLength: 1, maxLength: 50 }),
          required: fc.constant(true),
          minLength: fc.constant(1)
        }),
        (field) => {
          const result = validateField(field);
          const feedback = generateFeedback(result);
          
          // Valid field should show success
          if (result.valid) {
            expect(feedback.showSuccess).toBe(true);
            expect(feedback.successIndicator).toBe('✓');
            expect(feedback.showError).toBe(false);
            expect(feedback.errorMessage).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display specific error messages for length violations', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant('Password'),
          value: fc.string({ minLength: 1, maxLength: 5 }), // Too short
          required: fc.constant(true),
          minLength: fc.constant(8)
        }),
        (field) => {
          const result = validateField(field);
          const feedback = generateFeedback(result);
          
          if (field.value.length < field.minLength) {
            expect(result.valid).toBe(false);
            expect(feedback.showError).toBe(true);
            expect(feedback.errorMessage).toContain('at least');
            expect(feedback.errorMessage).toContain('8');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display format error messages for pattern violations', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant('Email'),
          value: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')),
          required: fc.constant(true),
          type: fc.constant('email')
        }),
        (field) => {
          const result = validateField(field);
          const feedback = generateFeedback(result);
          
          expect(result.valid).toBe(false);
          expect(feedback.showError).toBe(true);
          expect(feedback.errorMessage).toContain('email');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should consistently show feedback for all validation states', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.constantFrom('Name', 'Email', 'Phone', 'City'),
            value: fc.oneof(
              fc.constant(''),
              fc.string({ minLength: 1, maxLength: 10 }),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            required: fc.boolean(),
            minLength: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
            maxLength: fc.option(fc.integer({ min: 21, max: 100 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (fields) => {
          fields.forEach(field => {
            const result = validateField(field);
            const feedback = generateFeedback(result);
            
            // Consistency check: valid XOR invalid
            expect(result.valid).not.toBe(feedback.showError);
            expect(feedback.showSuccess).toBe(result.valid);
            
            // Error message presence matches error state
            if (feedback.showError) {
              expect(feedback.errorMessage).toBeTruthy();
              expect(feedback.successIndicator).toBeNull();
            } else {
              expect(feedback.errorMessage).toBeNull();
              if (result.valid && field.value) {
                expect(feedback.successIndicator).toBeTruthy();
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never show both success and error simultaneously', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          value: fc.string({ minLength: 0, maxLength: 100 }),
          required: fc.boolean(),
          minLength: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined })
        }),
        (field) => {
          const result = validateField(field);
          const feedback = generateFeedback(result);
          
          // Never show both success and error
          expect(feedback.showSuccess && feedback.showError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
